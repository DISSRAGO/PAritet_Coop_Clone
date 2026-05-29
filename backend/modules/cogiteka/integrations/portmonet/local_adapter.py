"""
LocalCogiAdapter — синхронный заменитель SoapAdapter.

Цель: на этапе MVP V0.51 работать с локальной PostgreSQL вместо внешнего
SOAP-стенда (stend.portmonet.ru). Интерфейс совместим с SoapAdapter:
тот же .execute(method, params) -> AdapterResponse, чтобы вызовы в
thanka.py / site.py / others не нужно было переписывать.

Поддерживаются методы, нужные для базового сценария «зайти и создать
тханку» тестовым пользователем. Прочие методы возвращают пустой
AdapterResponse (без Error), что не ломает фронт.

Когда понадобится внешний сервис (другой портмонет, маркет и т.п.) —
включается флаг COGI_USE_PORTMONET=1, и PortmonetApi отдаёт SoapAdapter,
как раньше.
"""

from __future__ import annotations

import os
import threading
from typing import Any

import psycopg
from psycopg.rows import dict_row

from backend.modules.cogiteka.integrations.portmonet.soap_adapter import (
    AdapterResponse,
    RequestStatus,
)


# --- conn singleton (sync) ----------------------------------------------------

_conn_lock = threading.Lock()
_conn: psycopg.Connection | None = None


def _get_database_url() -> str:
    return os.getenv(
        "DATABASE_URL",
        "postgresql://homonet_app_auth:CHANGE_ME_APP_STRONG@127.0.0.1:5432/homonet_v051_test",
    )


def _get_conn() -> psycopg.Connection:
    """
    Возвращает живой sync-коннект. Открывает при первом вызове, переоткрывает
    при разрыве.
    """
    global _conn
    with _conn_lock:
        if _conn is None or _conn.closed:
            _conn = psycopg.connect(
                _get_database_url(),
                autocommit=True,
                row_factory=dict_row,
            )
            with _conn.cursor() as cur:
                cur.execute("SET search_path TO homonet, public;")
        return _conn


def _q(sql: str, params: tuple = ()) -> list[dict]:
    conn = _get_conn()
    try:
        with conn.cursor() as cur:
            cur.execute(sql, params)
            try:
                return cur.fetchall()
            except psycopg.ProgrammingError:
                # не SELECT (INSERT/UPDATE без RETURNING)
                return []
    except psycopg.OperationalError:
        # пересоздать коннект и повторить один раз
        global _conn
        with _conn_lock:
            try:
                if _conn is not None:
                    _conn.close()
            finally:
                _conn = None
        conn = _get_conn()
        with conn.cursor() as cur:
            cur.execute(sql, params)
            try:
                return cur.fetchall()
            except psycopg.ProgrammingError:
                return []


# --- адаптер ------------------------------------------------------------------


class LocalCogiAdapter:
    """
    Совместим по интерфейсу с SoapAdapter, но ходит в локальную БД.
    """

    def __init__(self) -> None:
        # эти поля держим для совместимости с кодом, который их трогает
        self.host = "local"
        self.path = ""
        self.service = ""
        self.access_token = ""
        self.debug = False

    # --- public ---------------------------------------------------------------

    def execute(self, method: str, data: Any = None) -> AdapterResponse:
        params = data or {}
        handler = self._dispatch.get(method)
        if handler is None:
            # неизвестный метод — отвечаем пустотой, без Error, чтобы
            # не рушить флоу. Можно расширить таблицу позднее.
            return AdapterResponse(
                Result={},
                Error=False,
                Status=RequestStatus(Code=1, Text=f"local_adapter: {method} not implemented"),
            )

        try:
            result = handler(self, params)
            return AdapterResponse(
                Result=result,
                Error=False,
                Status=RequestStatus(Code=1, Text="ok"),
            )
        except Exception as exc:  # noqa: BLE001
            return AdapterResponse(
                Result={},
                Error=True,
                Status=RequestStatus(Code=0, Text=f"local_adapter: {exc}"),
                ex=exc,
            )

    # --- handlers -------------------------------------------------------------

    def _h_get_thanka(self, params: dict) -> dict:
        """
        Минимальный ответ для редактора. Если у пользователя нет ни одной
        тханки/аватара — возвращаем skeleton с одним аватаром (сам юзер),
        чтобы EditorSite не падал на AvatarList[0].
        """
        thanka_id = str(params.get("Id") or "")
        login = str(params.get("Login") or "")
        user_id = str(params.get("UserId") or "")

        avatar_list = self._avatar_list_for(login=login)
        author_id = avatar_list[0]["ID"] if avatar_list else ""

        row = None
        if thanka_id:
            rows = _q(
                """
                SELECT t.thanka_id::text AS id,
                       t.title           AS name,
                       t.status          AS status,
                       COALESCE(co.current_content, '{}'::jsonb) AS content
                FROM thanka t
                LEFT JOIN cogobject co ON co.thanka_id = t.thanka_id
                WHERE t.thanka_id::text = %s
                LIMIT 1
                """,
                (thanka_id,),
            )
            if rows:
                row = rows[0]

        thanka_obj = {
            "Id": (row["id"] if row else thanka_id) or "",
            "Name": (row["name"] if row else "КОГИТЕКА"),
            "Annotation": "",
            "Privacy": 1,
            "Comments": False,
            "MainPage": False,
            "ParentId": "",
            "ParentName": "",
            "Author": author_id,
            "AuthorName": login,
        }

        return {
            "Id": thanka_obj["Id"],
            "CabinetId": 0,
            "IsAdmin": True,
            "PrivacyLevel": 1,
            "Thanka": thanka_obj,
            "Object": {
                "Type": "article",
                "Description": "",
                "Name": thanka_obj["Name"],
            },
            "Removed": False,
            "AvatarList": avatar_list,
            "Content": [],
            "Children": [],
            "MyThankaList": [],
            "MySubscribeList": [],
            "DocumentsParts": [],
            "LinksTo": [],
            "LinksFrom": [],
            "LinksSectors": [],
            "Elements": [],
            "LocationEvent": [{"Name": ""}, {"Name": ""}, {"Name": ""}],
            "Notifications": [],
            "SiteList": [],
            "Style": "",
            "ChildrenImage": {},
            "DocImage": {},
            "Request": {},
            "TypeName": "Статья",
            "Accusativus": "статью",
            "Genitivus": "статьи",
        }

    def _h_get_site_page(self, params: dict) -> dict:
        site_id = str(params.get("SiteId") or params.get("Id") or "")
        login = str(params.get("Login") or "")
        avatar_list = self._avatar_list_for(login=login)
        author_id = avatar_list[0]["ID"] if avatar_list else ""

        return {
            "Id": site_id,
            "CabinetId": 0,
            "IsAdmin": True,
            "PrivacyLevel": 1,
            "Thanka": {
                "Id": site_id,
                "Name": "КОГИТЕКА",
                "Annotation": "",
                "Privacy": 1,
                "Comments": False,
                "MainPage": True,
                "ParentId": "",
                "ParentName": "",
                "Author": author_id,
                "AuthorName": login,
            },
            "Object": {"Type": "site", "Description": "", "Name": "КОГИТЕКА"},
            "MainPage": {"ID": site_id, "Url": ""},
            "Removed": False,
            "AvatarList": avatar_list,
            "Content": [],
            "Children": [],
            "MyThankaList": [],
            "MySubscribeList": [],
            "DocumentsParts": [],
            "LinksTo": [],
            "LinksFrom": [],
            "LinksSectors": [],
            "Elements": [],
            "LocationEvent": [{"Name": ""}, {"Name": ""}, {"Name": ""}],
            "Notifications": [],
            "SiteList": [],
            "Style": "",
            "ChildrenImage": {},
            "DocImage": {},
            "Request": {},
            "TypeName": "Сайт",
            "Accusativus": "сайт",
            "Genitivus": "сайта",
        }

    def _h_create_thanka(self, params: dict) -> dict:
        """
        UC-create-thanka: создаём минимальную тханку для текущего пользователя.
        Источник данных: data['Thanka'], data['Object'].
        """
        thanka = params.get("Thanka") or {}
        obj = params.get("Object") or {}
        user_login = str(params.get("UserLogin") or "")
        user_id = str(params.get("UserId") or "")

        title = (
            (thanka.get("Name") if isinstance(thanka, dict) else None)
            or (obj.get("Name") if isinstance(obj, dict) else None)
            or "Новая тханка"
        )
        title = str(title).strip() or "Новая тханка"

        # Найдём author_id для пользователя (login = avatar.login)
        author_id = self._ensure_author_for(login=user_login)

        # Создаём тханку
        rows = _q(
            """
            INSERT INTO thanka (title, author_id, status)
            VALUES (%s, %s, 'draft')
            RETURNING thanka_id::text AS id, title, status
            """,
            (title, author_id),
        )
        if not rows:
            raise RuntimeError("failed to insert thanka")
        new_thanka_id = rows[0]["id"]

        # Создаём cogobject со снимком контента
        content = {
            "title": title,
            "description": obj.get("Description") if isinstance(obj, dict) else "",
            "type": obj.get("Type") if isinstance(obj, dict) else "article",
        }
        _q(
            """
            INSERT INTO cogobject (thanka_id, current_content)
            VALUES (%s, %s::jsonb)
            ON CONFLICT (thanka_id) DO UPDATE
                SET current_content = EXCLUDED.current_content,
                    updated_at = now()
            """,
            (new_thanka_id, _json_dumps(content)),
        )

        return {
            "Id": new_thanka_id,
            "Thanka": {
                "Id": new_thanka_id,
                "Name": title,
                "Author": author_id or "",
                "AuthorName": user_login,
            },
            "Object": {"Name": title, "Type": content["type"]},
        }

    def _h_set_thanka(self, params: dict) -> dict:
        """
        Редактирование существующей тханки: меняем title и snapshot.
        """
        thanka = params.get("Thanka") or {}
        obj = params.get("Object") or {}
        thanka_id = str(params.get("Id") or (thanka.get("Id") if isinstance(thanka, dict) else "") or "")
        if not thanka_id:
            raise ValueError("Id is required for SetThanka")

        title = (
            (thanka.get("Name") if isinstance(thanka, dict) else None)
            or (obj.get("Name") if isinstance(obj, dict) else None)
            or ""
        )
        title = str(title).strip()

        if title:
            _q("UPDATE thanka SET title = %s WHERE thanka_id::text = %s", (title, thanka_id))

        content = {
            "title": title,
            "description": obj.get("Description") if isinstance(obj, dict) else "",
            "type": obj.get("Type") if isinstance(obj, dict) else "article",
        }
        _q(
            """
            INSERT INTO cogobject (thanka_id, current_content)
            VALUES (%s, %s::jsonb)
            ON CONFLICT (thanka_id) DO UPDATE
                SET current_content = EXCLUDED.current_content,
                    updated_at = now()
            """,
            (thanka_id, _json_dumps(content)),
        )

        return {"Id": thanka_id}

    def _h_get_my_thanka(self, params: dict) -> dict:
        login = str(params.get("Login") or "")
        rows = _q(
            """
            SELECT t.thanka_id::text AS "ID",
                   t.title           AS "Name",
                   t.status          AS "Status"
            FROM thanka t
            LEFT JOIN author a ON a.author_id = t.author_id
            LEFT JOIN avatar av ON av.author_id = a.author_id
            WHERE av.login = %s
            ORDER BY t.created_at DESC
            LIMIT 200
            """,
            (login,),
        )
        return {"List": rows}

    def _h_remove_thanka(self, params: dict) -> dict:
        thanka_id = str(params.get("Id") or "")
        if thanka_id:
            _q("UPDATE thanka SET status = 'deleted' WHERE thanka_id::text = %s", (thanka_id,))
        return {"Id": thanka_id}

    def _h_check_custom_url(self, params: dict) -> dict:
        # MVP: всегда свободно
        return {"Result": True}

    # --- utils ----------------------------------------------------------------

    def _avatar_list_for(self, login: str) -> list[dict]:
        if not login:
            return []
        rows = _q(
            """
            SELECT a.author_id::text AS "ID",
                   a.display_name    AS "Name",
                   av.login          AS "Login"
            FROM avatar av
            JOIN author a ON a.author_id = av.author_id
            WHERE av.login = %s AND av.status = 'active'
            ORDER BY av.created_at
            """,
            (login,),
        )
        if rows:
            return rows
        # авто-создание: пользователь есть в auth_user, но subject/author/avatar нет
        author_id = self._ensure_author_for(login=login)
        if not author_id:
            return []
        return [{"ID": author_id, "Name": login, "Login": login}]

    def _ensure_author_for(self, login: str) -> str:
        """
        Гарантирует наличие subject/author/avatar для логина из auth_user.
        Возвращает author_id (uuid::text) либо пустую строку.
        """
        if not login:
            return ""

        # уже есть?
        rows = _q(
            """
            SELECT a.author_id::text AS author_id
            FROM avatar av
            JOIN author a ON a.author_id = av.author_id
            WHERE av.login = %s
            LIMIT 1
            """,
            (login,),
        )
        if rows:
            return rows[0]["author_id"]

        # ищем auth_user
        au = _q(
            "SELECT user_id::text AS uid FROM auth_user WHERE login = %s",
            (login,),
        )
        if not au:
            return ""

        # Каноническая схема V0.51: person -> subject(kind='personal', person_id) -> author -> avatar
        person = _q(
            """
            INSERT INTO person (display_name, status)
            VALUES (%s, 'active')
            RETURNING person_id::text AS pid
            """,
            (login,),
        )
        person_id = person[0]["pid"] if person else None

        subj = _q(
            """
            INSERT INTO subject (subject_kind, person_id, display_name)
            VALUES ('personal', %s, %s)
            RETURNING subject_id::text AS sid
            """,
            (person_id, login),
        )
        subject_id = subj[0]["sid"] if subj else None

        auth_rows = _q(
            """
            INSERT INTO author (subject_id, display_name)
            VALUES (%s, %s)
            RETURNING author_id::text AS aid
            """,
            (subject_id, login),
        )
        author_id = auth_rows[0]["aid"]

        _q(
            """
            INSERT INTO avatar (author_id, login, status)
            VALUES (%s, %s, 'active')
            ON CONFLICT (login) DO NOTHING
            """,
            (author_id, login),
        )
        return author_id


# Регистрируем диспетчер методов в виде словаря {method_name -> handler}
LocalCogiAdapter._dispatch = {  # type: ignore[attr-defined]
    "GetThanka": LocalCogiAdapter._h_get_thanka,
    "GetSitePage": LocalCogiAdapter._h_get_site_page,
    "CreateThanka": LocalCogiAdapter._h_create_thanka,
    "SetThanka": LocalCogiAdapter._h_set_thanka,
    "GetMyThanka": LocalCogiAdapter._h_get_my_thanka,
    "RemoveThanka": LocalCogiAdapter._h_remove_thanka,
    "CheckCustomURL": LocalCogiAdapter._h_check_custom_url,
}


def _json_dumps(obj: Any) -> str:
    import json

    return json.dumps(obj, ensure_ascii=False)
