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
        "postgresql://homonet_app_auth:73prKjwu952@127.0.0.1:5432/homonet_v051_test",
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

        thanka_id = str(params.get("Id") or params.get("id") or "").strip()
        login = str(params.get("Login") or params.get("login") or "").strip()

        address = str(
            params.get("Address")
            or params.get("address")
            or ""
        ).strip()

        if not thanka_id and address:
            parts = [p for p in address.split("/") if p]
            if len(parts) >= 2 and parts[0] in {"navigator", "sitepage"}:
                thanka_id = parts[1].strip()
        avatar_list = self._avatar_list_for(login=login)
        author_id = avatar_list[0]["ID"] if avatar_list else ""

        viewer_subject_id = ""
        if login:
            _vs = _q(
                "SELECT subject_id::text AS sid FROM auth_user WHERE login = %s LIMIT 1",
                (login,),
            )
            if _vs and _vs[0].get("sid"):
                viewer_subject_id = str(_vs[0]["sid"])

        # Fallback-резолвер subject_id по логину.
        def _resolve_subject_id_by_login(user_login: str) -> str:
            if not user_login:
                return ""
            rows = _q(
                """
                SELECT au.subject_id::text AS sid
                FROM auth_user au
                WHERE au.login = %s
                LIMIT 1
                """,
                (user_login,),
            )
            if rows and rows[0].get("sid"):
                return str(rows[0]["sid"])
            return ""

        row = None
        if thanka_id:
            import re as _re
            uuid_pattern = _re.compile(r"^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$")
            
            if uuid_pattern.match(thanka_id):
                rows = _q(
                    """
                    SELECT t.thanka_id::text AS id,
                           t.title            AS name,
                           t.status           AS status,
                           t.author_id::text  AS author_id,
                           a.subject_id::text AS author_subject_id,
                           COALESCE(co.current_content, '{}'::jsonb) AS content
                    FROM thanka t
                    LEFT JOIN author a ON a.author_id = t.author_id
                    LEFT JOIN cogobject co ON co.thanka_id = t.thanka_id
                    WHERE t.thanka_id::text = %s
                    LIMIT 1
                    """,
                    (thanka_id,),
                )
                if rows:
                    row = rows[0]
            # Fallback: ищем по custom_url.
            if row is None:
                rows = _q(
                    """
                    SELECT t.thanka_id::text AS id,
                           t.title            AS name,
                           t.status           AS status,
                           t.author_id::text  AS author_id,
                           a.subject_id::text AS author_subject_id,
                           COALESCE(co.current_content, '{}'::jsonb) AS content
                    FROM thanka t
                    LEFT JOIN author a ON a.author_id = t.author_id
                    LEFT JOIN cogobject co ON co.thanka_id = t.thanka_id
                    WHERE co.current_content->>'legacy_id' = %s
                        OR co.current_content->>'id' = %s
                        OR t.title = %s
                    LIMIT 1
                    """,
                    (thanka_id, thanka_id, thanka_id),
                )
                if rows:
                    row = rows[0]
                    thanka_id = row["id"]

        content = (row["content"] if row else {}) or {}
        if isinstance(content, str):
            import json as _json
            try:
                content = _json.loads(content)
            except Exception:
                content = {}

        is_cabinet = bool(content.get("is_cabinet"))
        obj_type = content.get("type") or ("avatar" if is_cabinet else "article")
        custom_url = content.get("custom_url") or ""

        author_subject_id = ""
        if row and row.get("author_subject_id"):
            author_subject_id = str(row["author_subject_id"])

        if not author_subject_id and login:
            author_subject_id = _resolve_subject_id_by_login(login)

        if not viewer_subject_id and author_subject_id and obj_type == "avatar":
            viewer_subject_id = author_subject_id

        parent_id = "" if is_cabinet else str(content.get("parent_id") or "").strip()
        parent_name = ""
        parent_custom_url = ""
        if parent_id:
            # JOIN cogobject для custom_url родителя — он живёт в jsonb.
            prows = _q(
                """
                SELECT t.title,
                       COALESCE(c.current_content->>'custom_url', '') AS custom_url
                FROM thanka t
                LEFT JOIN cogobject c ON c.thanka_id = t.thanka_id
                WHERE t.thanka_id::text = %s
                LIMIT 1
                """,
                (parent_id,),
            )
            if prows:
                parent_name = prows[0]["title"] or ""
                parent_custom_url = prows[0]["custom_url"] or ""
            else:
                # родитель исчез (удалён) — обнуляем, чтобы не вести на битую ссылку
                parent_id = ""

        thanka_obj = {
            "Id": (row["id"] if row else thanka_id) or "",
            "Name": (row["name"] if row else (login or "КОГИТЕКА")),
            "Annotation": content.get("annotation") or "",
            "Privacy": int(content.get("privacy") or 1),
            "Comments": False,
            "MainPage": False,
            "ParentId": parent_id,
            "ParentName": parent_name,
            "ParentCustomUrl": parent_custom_url,
            "Author": (row["author_id"] if row else author_id) or author_id,
            "AuthorSubjectId": author_subject_id,
            "AuthorName": login,
            "CustomURL": custom_url,
        }

        is_owner_by_subject = bool(
            viewer_subject_id
            and author_subject_id
            and str(author_subject_id) == str(viewer_subject_id)
        )
        is_owner_by_author = bool(
            author_id
            and row
            and row.get("author_id")
            and str(row["author_id"]) == str(author_id)
        )
        is_owner = is_owner_by_subject or is_owner_by_author or (is_cabinet or obj_type == "avatar")
        privacy_level = 6 if is_owner else 1

        my_thanka_list: list[dict] = []
        children: list[dict] = []

        if is_cabinet or obj_type == "avatar":
            # На кабинете показываем только корневые тханки владельца,
            # чтобы дочки не дублировались в круге кабинета и в кругах родителей.
            my_thanka_list = self._my_thanka_rows(login=login, only_roots=True)
            children = my_thanka_list

        elif row:
            children = self._children_for(parent_thanka_id=row["id"])

            if is_owner:
                my_thanka_list = self._my_thanka_rows(login=login, only_roots=False)

        children_image = self._children_image_map(children)
        type_name_map = {
            "avatar":     ("Аватар", "аватар", "аватара"),
            "article":    ("Статья", "статью", "статьи"),
            "site":       ("Страница сайта", "сайт", "сайта"),
            "catalog":    ("Каталог", "каталог", "каталога"),
            "collection": ("Коллекция", "коллекцию", "коллекции"),
            "document":   ("Документ", "документ", "документа"),
            "cabinet":    ("Кабинет", "кабинет", "кабинета"),
            "request":    ("Сервис", "сервис", "сервиса"),
            "link":       ("Ссылка", "ссылку", "ссылки"),
            "repost":     ("Репост", "репост", "репоста"),
            "product":    ("Товар", "товар", "товара"),
        }
        type_name, accus, genit = type_name_map.get(obj_type, ("Статья", "статью", "статьи"))

        try:
            circles_num = int(content.get("circles_num") or 0)
        except (TypeError, ValueError):
            circles_num = 0

        try:
            sectors_num = int(content.get("sectors_num") or 0)
        except (TypeError, ValueError):
            sectors_num = 0

        try:
            visible_elements = int(content.get("visible_elements") or 0)
        except (TypeError, ValueError):
            visible_elements = 0

        thanka_obj["CirclesNum"] = circles_num or 1
        thanka_obj["SectorsNum"] = max(sectors_num or 12, len(children))
        thanka_obj["VisibleElements"] = visible_elements
        thanka_obj["DocumentPart"] = False

        top_main_page: dict | bool = False
        top_hash = ""
        if obj_type == "site":
            top_main_page = {"ID": thanka_obj["Id"], "Url": ""}
            top_hash = str(content.get("hash") or "")

        object_payload: dict = {
            "Type": obj_type,
            "Description": content.get("description") or "",
            "Name": thanka_obj["Name"],
            "Filename": content.get("filename") or "",
        }

        if author_subject_id:
            object_payload["AuthorSubjectId"] = author_subject_id
        if obj_type == "avatar" and author_subject_id:
            object_payload["SubjectId"] = author_subject_id

        # Cogi.Article
        if content.get("date_event") is not None:
            object_payload["DateEvent"] = content.get("date_event") or ""
        if content.get("real_author") is not None:
            object_payload["RealAuthor"] = content.get("real_author") or ""
        if content.get("url") is not None:
            object_payload["URL"] = content.get("url") or ""

        # Cogi.Avatar
        if content.get("birth_date") is not None:
            object_payload["BirthDate"] = content.get("birth_date") or ""
        if content.get("telephone_number") is not None:
            object_payload["TelephoneNumber"] = content.get("telephone_number") or ""
        if content.get("email") is not None:
            object_payload["Email"] = content.get("email") or ""

        if obj_type == "avatar" and content.get("avatar_name"):
            object_payload["Name"] = content.get("avatar_name") or thanka_obj["Name"]

        # product
        if content.get("product_id") is not None:
            object_payload["ProductId"] = content.get("product_id") or ""
        if content.get("category_id") is not None:
            object_payload["CategoryId"] = content.get("category_id") or ""
        if content.get("category_name") is not None:
            object_payload["CategoryName"] = content.get("category_name") or ""

        # Thanka.ThankaLink — для link/repost фронт ждёт его в Thanka.
        if content.get("thanka_link"):
            thanka_obj["ThankaLink"] = content.get("thanka_link") or ""

        loc_stored = content.get("location_event")
        loc_out: list = [{"Name": ""}, {"Name": ""}, {"Name": ""}]
        if isinstance(loc_stored, list):
            for i in range(min(3, len(loc_stored))):
                item = loc_stored[i]
                if isinstance(item, dict):
                    loc_out[i] = {"Name": str(item.get("Name") or "")}
                else:
                    loc_out[i] = {"Name": str(item or "")}

        request_payload = _default_request()
        req_stored = content.get("request") if isinstance(content.get("request"), dict) else None
        if req_stored:
            for src_key, dst_key in (
                ("fields", "Fields"),
                ("picture", "Picture"),
                ("categories", "Categories"),
                ("sort_order", "SortOrder"),
                ("sort_field", "SortField"),
                ("start_date", "StartDate"),
                ("end_date", "EndDate"),
                ("query_name", "QueryName"),
                ("special_props", "SpecialProps"),
                ("search_string", "SearchString"),
            ):
                if req_stored.get(src_key) is not None:
                    request_payload[dst_key] = req_stored.get(src_key)

        return {
            "Id": thanka_obj["Id"],
            "CabinetId": 0,
            "IsAdmin": True,
            "PrivacyLevel": privacy_level,
            "subjectId": author_subject_id or viewer_subject_id or "",
            "Thanka": thanka_obj,
            "Object": object_payload,
            "MainPage": top_main_page,
            "Hash": top_hash,
            "Removed": False,
            "AvatarList": _reg(avatar_list),
            "Content": _reg([]),
            "Children": _reg(children),
            "MyThankaList": _reg(my_thanka_list),
            "MySubscribeList": _reg([]),
            "DocumentsParts": _reg([]),
            "LinksTo": _reg([]),
            "LinksFrom": _reg([]),
            "LinksSectors": _reg([]),
            "Elements": _reg(self._corner_elements_for(row["id"]) if row else []),
            "LocationEvent": loc_out,
            "Notifications": _reg([]),
            "SiteList": _reg([]),
            "Style": "",
            "ChildrenImage": children_image,
            "DocImage": {},
            "Request": request_payload,
            "TypeName": type_name,
            "Accusativus": accus,
            "Genitivus": genit,
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
                "ParentCustomUrl": "",
                "Author": author_id,
                "AuthorName": login,
            },
            "Object": {"Type": "site", "Description": "", "Name": "КОГИТЕКА"},
            "MainPage": {"ID": site_id, "Url": ""},
            "Removed": False,
            "AvatarList": _reg(avatar_list),
            "Content": _reg([]),
            "Children": _reg([]),
            "MyThankaList": _reg([]),
            "MySubscribeList": _reg([]),
            "DocumentsParts": _reg([]),
            "LinksTo": _reg([]),
            "LinksFrom": _reg([]),
            "LinksSectors": _reg([]),
            "Elements": _reg([]),
            "LocationEvent": [{"Name": ""}, {"Name": ""}, {"Name": ""}],
            "Notifications": _reg([]),
            "SiteList": _reg([]),
            "Style": "",
            "ChildrenImage": {},
            "DocImage": {},
            "Request": _default_request(),
            "TypeName": "Сайт",
            "Accusativus": "сайт",
            "Genitivus": "сайта",
        }

    def _h_create_thanka(self, params: dict) -> dict:
        """
        UC-create-thanka: создаём минимальную тханку для текущего пользователя.
        Источник данных: data['Thanka'], data['Object'].
        Сохраняем CustomURL/annotation/privacy в cogobject.current_content.

        Stage 3 PR 4: если фронт прислал SubjectId — предпочитаем его
        login'у: subject_id является каноническим владельцом (выше любого
        фронта), login — это лишь один из входов (auth_user.login).
        """
        thanka = params.get("Thanka") or {}
        obj = params.get("Object") or {}
        user_login = str(params.get("UserLogin") or params.get("Login") or "")
        subject_id_param = str(params.get("SubjectId") or "").strip()

        # CustomURL используем как fallback только в крайнем случае (кабинетные
        # тханки и прочие служебные, где Name осознанно равен ''),
        # но НЕ в обычном create от пользователя.
        custom_url_fallback = ""
        if isinstance(thanka, dict):
            custom_url_fallback = str(thanka.get("CustomURL") or "").strip()
        if not custom_url_fallback and isinstance(obj, dict):
            custom_url_fallback = str(obj.get("CustomURL") or "").strip()

        # Явный Name из формы — единственный источник правды для title.
        raw_name = (thanka.get("Name") if isinstance(thanka, dict) else None) \
                   or (obj.get("Name") if isinstance(obj, dict) else None) \
                   or ""
        raw_name = str(raw_name).strip()

        is_cabinet = bool(isinstance(thanka, dict) and thanka.get("IsCabinet"))

        # Отказываемся создавать пользовательскую тханку без явного Name.
        # Это ключевая защита от зомби-тханок «Новая тханка», которые плодились при
        # каждом клике «Сохранить» с пустым именем. Кабинетные тханки и системные
        # вызовы с IsCabinet=true проходят через fallback.
        if not raw_name and not is_cabinet:
            raise ValueError("Thanka.Name is required")

        title = raw_name or custom_url_fallback or "Новая тханка"

        # ParentId прилетает из фронта при создании дочки из сектора
        # родительской тханки. Сохраняем в cogobject.current_content->>'parent_id'
        # в соответствии с канонической моделью KOGI.Metody:
        # Cogi.Thanka.Parent (Родитель в дереве) / Cogi.XMLThanka.ParentId.
        parent_id = str(params.get("ParentId") or params.get("ThankaParentId") or "").strip()
        # parent в виде author_id (приходит от кабинета в режиме add) — это не thanka_id,
        # игнорируем такой вариант (пусть подхватится cabinet-fallback ниже).
        if parent_id:
            exists = _q("SELECT 1 FROM thanka WHERE thanka_id::text = %s", (parent_id,))
            if not exists:
                parent_id = ""

        # Найдём author_id для пользователя.
        # Приоритет — SubjectId (канон V0.51); fallback на login для совместимости с
        # фронтами, которые ещё не перевелись на subject_id.
        # PR #41: SubjectId валидируется через _resolve_owner_subject_id
        # (должен принадлежать залогиненному login’у). Иначе используем login-ветку.
        verified_subject_id = self._resolve_owner_subject_id(
            subject_id_param=subject_id_param,
            user_login=user_login,
        )
        if verified_subject_id:
            author_id = self._ensure_author_by_subject(subject_id=verified_subject_id)
        else:
            author_id = self._ensure_author_for(login=user_login)

        # Канон KOGI.Metody / PERVYI-RELIZ: «Первые тханки — потомки аватара».
        # Если ParentId не был задан — корневая тханка становится
        # потомком кабинета пользователя. Сам кабинет исключён из выравнивания
        # (он и есть корень).
        if not parent_id and not (isinstance(thanka, dict) and thanka.get("IsCabinet")):
            if verified_subject_id:
                cabinet_id = self._cabinet_id_by_subject(subject_id=verified_subject_id)
            else:
                cabinet_id = self._cabinet_id_for(login=user_login)
            if cabinet_id:
                parent_id = cabinet_id

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

        # PR P0: LocationEvent лежит на верхнем уровне payload, а не в Object
        # (см. submitThanka.js, dataToEditor.LocationEvent = selectedLocation).
        # Пробрасываем в _build_content через defaults.
        location_event = params.get("LocationEvent")
        request_block = params.get("Request")
        content = self._build_content(
            thanka=thanka,
            obj=obj,
            defaults={
                "title": title,
                "parent_id": parent_id,
                "location_event": location_event,
            },
            request=request_block,
        )
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
                "CustomURL": content.get("custom_url") or "",
            },
            "Object": {"Name": title, "Type": content["type"]},
        }

    def _h_set_thanka(self, params: dict) -> dict:
        """
        Редактирование существующей тханки: меняем title и snapshot,
        сохраняем CustomURL.
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

        # подмешиваем существующий контент, чтобы не потерять флаги (is_cabinet)
        existing_rows = _q(
            "SELECT current_content FROM cogobject WHERE thanka_id::text = %s",
            (thanka_id,),
        )
        existing = (existing_rows[0]["current_content"] if existing_rows else {}) or {}
        if isinstance(existing, str):
            import json as _json
            try:
                existing = _json.loads(existing)
            except Exception:
                existing = {}

        # PR P0: также пробрасываем LocationEvent (верхний уровень)
        # и блок Request (Для Бота).
        location_event = params.get("LocationEvent")
        request_block = params.get("Request")
        content = self._build_content(
            thanka=thanka,
            obj=obj,
            defaults={"title": title, "location_event": location_event},
            base=existing,
            request=request_block,
        )
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

        # Отдаём фронту свежий CustomURL из базы — submitThanka.js использует
        # его для redirect после сабмита. Без этого фронт падал в
        # fallback /navigator/{uuid}, даже если в БД custom_url остался прежним.
        custom_url = str(content.get("custom_url") or "").strip()
        return {
            "Id": thanka_id,
            "CustomURL": custom_url,
            "Thanka": {"Id": thanka_id, "CustomURL": custom_url},
        }

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
              AND t.status <> 'deleted'
            ORDER BY t.created_at DESC
            LIMIT 200
            """,
            (login,),
        )
        # normalize_list_response в роутере пропускает List через registered(),
        # которая ожидает SOAP-формат.
        return {"List": _reg(rows)}

    def _h_remove_thanka(self, params: dict) -> dict:
        thanka_id = str(params.get("Id") or "")
        if thanka_id:
            _q("UPDATE thanka SET status = 'deleted' WHERE thanka_id::text = %s", (thanka_id,))
        return {"Id": thanka_id}

    def _h_check_custom_url(self, params: dict) -> dict:
        # Проверяем, занят ли адрес. Семантика (как на cogi.teka.ru):
        #   true  → адрес ЗАНЯТ
        #   false → адрес СВОБОДЕН
        # Фронт читает result.data.result (lowercase), но на всякий
        # случай отдаём оба регистра, чтобы PHP-эра и новый код вели себя одинаково.
        url = str(params.get("url") or "").strip()
        if not url:
            return {"result": False, "Result": False}
        # Аватары идут с ведущим '@' — ищем по custom_url без префикса.
        lookup = url.lstrip("@")
        if not lookup:
            return {"result": False, "Result": False}

        # При редактировании тханка сама себе «занимает» свой custom_url —
        # без этого жест «Проверить» на неизменном адресе всегда
        # выдаёт «адрес занят». excludeId / ExcludeId / Id — UUID текущей
        # тханки, её исключаем из проверки.
        exclude_id = str(
            params.get("excludeId")
            or params.get("ExcludeId")
            or params.get("Id")
            or ""
        ).strip()

        # custom_url хранится в cogobject.current_content (jsonb), а не в
        # колонке thanka — иначе бы SELECT падал 500-кой при каждой проверке
        # адреса в форме создания тханки. status фильтруем по таблице thanka.
        if exclude_id:
            rows = _q(
                """
                SELECT 1
                  FROM cogobject co
                  JOIN thanka t ON t.thanka_id = co.thanka_id
                 WHERE LOWER(co.current_content->>'custom_url') = LOWER(%s)
                   AND t.status <> 'deleted'
                   AND t.thanka_id::text <> %s
                 LIMIT 1
                """,
                (lookup, exclude_id),
            )
        else:
            rows = _q(
                """
                SELECT 1
                  FROM cogobject co
                  JOIN thanka t ON t.thanka_id = co.thanka_id
                 WHERE LOWER(co.current_content->>'custom_url') = LOWER(%s)
                   AND t.status <> 'deleted'
                 LIMIT 1
                """,
                (lookup,),
            )
        taken = bool(rows)
        return {"result": taken, "Result": taken}

    def _h_get_cabinet_by_user(self, params: dict) -> dict:
        login = str(params.get("Login") or "").strip()
        subject_id = str(params.get("SubjectId") or "").strip()

        if not login and not subject_id:
            return {"Id": ""}

        # 0. Канонический путь: сначала ищем именно cabinet-thanka по current_content.is_cabinet
        thanka_id = ""
        if subject_id:
            thanka_id = self._cabinet_id_by_subject(subject_id=subject_id)
        if not thanka_id and login:
            thanka_id = self._cabinet_id_for(login=login)
        if thanka_id:
            return {"Id": thanka_id}

        # 1. Legacy-fallback
        cabinet_rows: list[dict] = []

        if subject_id:
            cabinet_rows = _q(
                """
                SELECT t.thanka_id::text AS id
                FROM thanka t
                JOIN author a ON a.author_id = t.author_id
                LEFT JOIN cogobject co ON co.thanka_id = t.thanka_id
                WHERE a.subject_id::text = %s
                AND t.status <> 'deleted'
                AND COALESCE((co.current_content->>'is_cabinet')::boolean, false) IS TRUE
                ORDER BY t.created_at
                LIMIT 1
                """,
                (subject_id,),
            )

        if not cabinet_rows and login:
            cabinet_rows = _q(
                """
                SELECT t.thanka_id::text AS id
                FROM thanka t
                JOIN author a ON a.author_id = t.author_id
                JOIN avatar av ON av.author_id = a.author_id
                LEFT JOIN cogobject co ON co.thanka_id = t.thanka_id
                WHERE av.login = %s
                AND t.status <> 'deleted'
                AND COALESCE((co.current_content->>'is_cabinet')::boolean, false) IS TRUE
                ORDER BY t.created_at
                LIMIT 1
                """,
                (login,),
            )

        if cabinet_rows:
            thanka_id = str(cabinet_rows[0].get("id") or "").strip()
            if thanka_id:
                return {"Id": thanka_id}

        # 2. Lazy-bootstrap
        verified_subject_id = self._resolve_owner_subject_id(
            subject_id_param=subject_id,
            user_login=login,
        )

        if verified_subject_id:
            author_id = self._ensure_author_by_subject(subject_id=verified_subject_id)
        else:
            author_id = self._ensure_author_for(login=login)

        if not author_id:
            return {"Id": ""}

        display_name = login or "Личный кабинет"

        rows = _q(
            """
            INSERT INTO thanka (title, author_id, status, is_system)
            VALUES (%s, %s, 'active', false)
            RETURNING thanka_id::text AS id
            """,
            (display_name, author_id),
        )
        if not rows:
            return {"Id": ""}

        thanka_id = str(rows[0]["id"])

        content = {
            "title": display_name,
            "type": "avatar",
            "privacy": 1,
            "custom_url": "",
            "annotation": "",
            "description": "",
            "is_cabinet": True,
            "avatar_name": display_name,
            "circles_num": 1,
            "sectors_num": 12,
            "visible_elements": 0,
        }

        if verified_subject_id:
            content["author_subject_id"] = verified_subject_id

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

    def _h_get_id_by_custom_url(self, params: dict) -> dict:
        """
        Ищет тханку/сайт по custom_url. Возвращает {Id, Type} где
        Type ∈ {'navigator','sitepage'} (для MVP всегда 'navigator').
        """
        url = str(params.get("url") or "").strip()
        if not url:
            return {"Id": "", "Type": ""}
        # Допускаем как ведущий слэш, так и без него
        candidates = {url, "/" + url.lstrip("/")}
        for candidate in list(candidates):
            if candidate.startswith("/"):
                candidates.add(candidate[1:])
        candidates_list = list(candidates)
        rows = _q(
            """
            SELECT t.thanka_id::text AS id
            FROM cogobject co
            JOIN thanka t ON t.thanka_id = co.thanka_id
            WHERE co.current_content->>'custom_url' = ANY(%s)
            ORDER BY t.created_at DESC
            LIMIT 1
            """,
            (candidates_list,),
        )
        if rows:
            return {"Id": rows[0]["id"], "Type": "navigator"}
        return {"Id": "", "Type": ""}

    def _h_is_document_part(self, params: dict) -> dict:
        # MVP: не часть документа
        return False

    # --- helpers --------------------------------------------------------------

    def _build_content(
        self,
        thanka: Any,
        obj: Any,
        defaults: dict,
        base: dict | None = None,
        request: Any = None,
    ) -> dict:
        """Собирает payload для cogobject.current_content из Thanka/Object/Request.

        PR P0 (аудит типов тханки): расширили перечень сохраняемых типовых
        полей. До этого в current_content попадало только title/description/
        type/filename/custom_url/annotation/privacy/parent_id и круги — то есть
        фронт честно слал DateEvent/LocationEvent/RealAuthor/URL/BirthDate/
        Telephone/Email/ProductId/ThankaLink/Request.*, а бэк их молча
        выбрасывал. После edit-формы все типовые поля терялись.

        Канон названий по KOGI.Metody / Cogi.Article / Cogi.Document /
        Cogi.Avatar — пишем их в snake_case в jsonb. _h_get_thanka читает
        обратно зеркально.
        """
        content = dict(base or {})
        title = defaults.get("title") or content.get("title") or ""
        content["title"] = title
        if isinstance(obj, dict):
            if obj.get("Description") is not None:
                content["description"] = obj.get("Description")
            if obj.get("Type"):
                content["type"] = obj.get("Type")
            # Object.Filename — имя PDF, загруженного через pdfDownloader.
            # Без сохранения в current_content PDF осиротевает:
            # файл лежит в PDF_DIR, но тханка о нём не знает и
            # CogObject.jsx не рисует iframe.
            # Пустая строка — явное удаление файла (сбрасываем).
            if obj.get("Filename") is not None:
                content["filename"] = str(obj.get("Filename") or "")

            # --- Cogi.Article ---
            # DateEvent (дата события), LocationEvent (массив до 3 элементов
            # из LocationEditor), RealAuthor (текст автора-источника),
            # URL (Object.URL — ссылка на источник). Cogi.Article в
            # KOGI.Metody включает все эти поля. Cogi.Document по доке —
            # только Description/URL/RealAuthor, но мы храним по тем же
            # ключам: фронт сам не шлёт DateEvent/LocationEvent для
            # document (submitThanka.js различает ветки).
            if obj.get("DateEvent") is not None:
                content["date_event"] = str(obj.get("DateEvent") or "")
            if obj.get("RealAuthor") is not None:
                content["real_author"] = str(obj.get("RealAuthor") or "")
            if obj.get("URL") is not None:
                content["url"] = str(obj.get("URL") or "")

            # --- Cogi.Avatar ---
            # AvatarName/BirthDate/TelephoneNumber/Email. Object.Name для
            # avatar — это отображаемое имя кабинета (поле avatarName в
            # форме), его кладём отдельно от заголовка тханки.
            if obj.get("BirthDate") is not None:
                content["birth_date"] = str(obj.get("BirthDate") or "")
            if obj.get("TelephoneNumber") is not None:
                content["telephone_number"] = str(obj.get("TelephoneNumber") or "")
            if obj.get("Email") is not None:
                content["email"] = str(obj.get("Email") or "")
            # Object.Name для avatar отличается от Thanka.Name: первый — это
            # человекочитаемое имя в кабинете, второй — title тханки. Чтобы
            # не путаться с title, сохраняем отдельно.
            if str(content.get("type") or "") == "avatar" and obj.get("Name") is not None:
                content["avatar_name"] = str(obj.get("Name") or "")

            # --- product ---
            # ProductId / CategoryId / CategoryName. Источник правды —
            # ProductEditor, который выбирает товар из каталога товаров.
            if obj.get("ProductId") is not None:
                content["product_id"] = str(obj.get("ProductId") or "")
            if obj.get("CategoryId") is not None:
                content["category_id"] = str(obj.get("CategoryId") or "")
            if obj.get("CategoryName") is not None:
                content["category_name"] = str(obj.get("CategoryName") or "")

        content.setdefault("description", "")
        content.setdefault("type", "article")

        if isinstance(thanka, dict):
            if "CustomURL" in thanka and thanka.get("CustomURL") is not None:
                content["custom_url"] = str(thanka.get("CustomURL") or "").strip()
            if thanka.get("Annotation") is not None:
                content["annotation"] = thanka.get("Annotation")
            if thanka.get("Privacy") is not None:
                try:
                    content["privacy"] = int(thanka.get("Privacy"))
                except (TypeError, ValueError):
                    pass
            # --- link / repost ---
            # Cogi.Thanka.ThankaLink — UUID целевой тханки. Фронт шлёт
            # его в Thanka.ThankaLink (см. submitThanka.js, ветка
            # selectedType == 'link' || 'repost').
            if thanka.get("ThankaLink") is not None:
                content["thanka_link"] = str(thanka.get("ThankaLink") or "")

        # --- LocationEvent ---
        # LocationEvent лежит не в Object, а на верхнем уровне payload —
        # submitThanka.js шлёт dataToEditor.LocationEvent (массив строк или
        # массив объектов {Name}). Принимаем оба формата, нормализуем
        # к массиву строк (до 3 элементов — координаты location-уровней).
        loc_raw = None
        if isinstance(obj, dict) and obj.get("LocationEvent") is not None:
            loc_raw = obj.get("LocationEvent")
        # верхний уровень params на самом деле передаётся через kwargs ниже;
        # _build_content не видит params напрямую, поэтому location пробрасывается
        # через defaults['location_event'] из _h_create_thanka / _h_set_thanka.
        if loc_raw is None:
            loc_raw = defaults.get("location_event")
        if loc_raw is not None:
            if isinstance(loc_raw, list):
                norm = []
                for item in loc_raw:
                    if isinstance(item, dict):
                        norm.append(str(item.get("Name") or ""))
                    else:
                        norm.append(str(item or ""))
                content["location_event"] = norm
            elif isinstance(loc_raw, str):
                content["location_event"] = [loc_raw]

        # --- request (Бот, KOGI:219 Request.Service) ---
        # Сохраняем весь блок Request под ключом 'request' (dict) — это
        # настройки сервиса: Fields (CSV), Picture, Categories, SortOrder,
        # SortField, StartDate, EndDate, QueryName, SpecialProps, SearchString.
        if isinstance(request, dict) and request:
            req_norm: dict = {}
            for src_key, dst_key in (
                ("Fields",       "fields"),
                ("Picture",      "picture"),
                ("Categories",   "categories"),
                ("SortOrder",    "sort_order"),
                ("SortField",    "sort_field"),
                ("StartDate",    "start_date"),
                ("EndDate",      "end_date"),
                ("QueryName",    "query_name"),
                ("SpecialProps", "special_props"),
                ("SearchString", "search_string"),
            ):
                if request.get(src_key) is not None:
                    req_norm[dst_key] = request.get(src_key)
            if req_norm:
                # мердж с тем, что уже было — на случай частичных апдейтов
                existing_req = content.get("request") if isinstance(content.get("request"), dict) else {}
                merged = dict(existing_req or {})
                merged.update(req_norm)
                content["request"] = merged

        # parent_id — идентификатор родительской тханки. Берём из defaults
        # (пробрасывается из _h_create_thanka), если был — оставляем в base.
        parent_id = defaults.get("parent_id") or content.get("parent_id") or ""
        if parent_id:
            content["parent_id"] = str(parent_id)

        # Конфиг круга — CirclesNum/SectorsNum/VisibleElements фронт шлёт в Thanka.
        if isinstance(thanka, dict):
            for src_key, dst_key in (
                ("CirclesNum",      "circles_num"),
                ("SectorsNum",      "sectors_num"),
                ("VisibleElements", "visible_elements"),
            ):
                if thanka.get(src_key) is not None:
                    try:
                        content[dst_key] = int(thanka.get(src_key))
                    except (TypeError, ValueError):
                        pass
        return content

    def _my_thanka_rows(self, login: str, only_roots: bool = False) -> list[dict]:
        """Список тханок пользователя для MyThankaList (исключая cabinet).

        При only_roots=True — возвращаем «первых потомков аватара» по канону
        KOGI.Metody / PERVYI-RELIZ — это тханки, у которых parent_id = thanka_id кабинета.
        Старые тханки без parent_id (созданные до канон-фикса) тоже выводятся в кабинете,
        чтобы экран кабинета ничего не терял.
        """
        if not login:
            return []
        parent_filter = ""
        if only_roots:
            cabinet_id = self._cabinet_id_for(login=login)
            if cabinet_id:
                parent_filter = (
                    " AND ("
                    "  COALESCE(NULLIF(co.current_content->>'parent_id', ''), NULL) IS NULL"
                    f"  OR co.current_content->>'parent_id' = '{cabinet_id}'"
                    " )"
                )
            else:
                # fallback — кабинета нет (свежий пользователь), берём безparentы
                parent_filter = (
                    " AND COALESCE(NULLIF(co.current_content->>'parent_id', ''), NULL) IS NULL"
                )
        rows = _q(
            f"""
            SELECT t.thanka_id::text AS "ID",
                   COALESCE(
                       NULLIF(co.current_content->>'title', ''),
                       NULLIF(NULLIF(t.title, ''), 'Новая тханка'),
                       NULLIF(co.current_content->>'custom_url', ''),
                       'Новая тханка'
                   ) AS "Name",
                   COALESCE(co.current_content->>'annotation', '') AS "Annotation",
                   COALESCE(co.current_content->>'type', 'article') AS "Type",
                   COALESCE(NULLIF(co.current_content->>'custom_url', ''),
                            t.thanka_id::text) AS "DocumentPath",
                   ('image' || t.thanka_id::text || '.jpg') AS "Image"
            FROM thanka t
            JOIN author a ON a.author_id = t.author_id
            JOIN avatar av ON av.author_id = a.author_id
            LEFT JOIN cogobject co ON co.thanka_id = t.thanka_id
            WHERE av.login = %s
              AND t.status <> 'deleted'
              AND COALESCE((co.current_content->>'is_cabinet')::boolean, false) IS FALSE
              {parent_filter}
            ORDER BY t.created_at DESC
            LIMIT 200
            """,
            (login,),
        )
        return rows

    def _cabinet_id_for(self, login: str) -> str:
        """thanka_id кабинета (аватара) по login.

        Канон KOGI.Metody: кабинет — корень дерева тханок пользователя.
        """
        if not login:
            return ""
        rows = _q(
            """
            SELECT t.thanka_id::text AS id
            FROM thanka t
            JOIN author a ON a.author_id = t.author_id
            JOIN avatar av ON av.author_id = a.author_id
            JOIN cogobject co ON co.thanka_id = t.thanka_id
            WHERE av.login = %s
              AND (co.current_content->>'is_cabinet')::boolean IS TRUE
            ORDER BY t.created_at
            LIMIT 1
            """,
            (login,),
        )
        return rows[0]["id"] if rows else ""

    def _cabinet_id_by_subject(self, subject_id: str) -> str:
        """thanka_id кабинета по subject_id (Stage 3 PR 4).

        Канон V0.51: кабинет — это тханка author'а, который привязан к
        subject_id. Аватары/login из цепи выпадают — это важно для будущих
        фронтов, у которых login может отсутствовать (например collective subject).
        """
        if not subject_id:
            return ""
        rows = _q(
            """
            SELECT t.thanka_id::text AS id
            FROM thanka t
            JOIN author a ON a.author_id = t.author_id
            JOIN cogobject co ON co.thanka_id = t.thanka_id
            WHERE a.subject_id::text = %s
              AND (co.current_content->>'is_cabinet')::boolean IS TRUE
            ORDER BY t.created_at
            LIMIT 1
            """,
            (subject_id,),
        )
        return rows[0]["id"] if rows else ""

    def _children_for(self, parent_thanka_id: str) -> list[dict]:
        """Дочерние тханки по cogobject.current_content->>'parent_id'.

        Не фильтрует по владельцу — владелец определяется в _h_get_thanka,
        а дочки могут быть и от других авторов (в будущем для коллаборации).
        """
        if not parent_thanka_id:
            return []
        rows = _q(
            """
            SELECT t.thanka_id::text AS "ID",
                   -- Канонический Name (тултип сектора):
                   -- 1) cogobject.current_content.title (актуально для тханок, у которых редактировали)
                   -- 2) thanka.title из БД, если он не пустой и не дефолт 'Новая тханка'
                   -- 3) custom_url (CustomURL) — fallback, как при создании
                   -- 4) 'Новая тханка' — последний fallback
                   COALESCE(
                       NULLIF(co.current_content->>'title', ''),
                       NULLIF(NULLIF(t.title, ''), 'Новая тханка'),
                       NULLIF(co.current_content->>'custom_url', ''),
                       'Новая тханка'
                   ) AS "Name",
                   COALESCE(co.current_content->>'annotation', '') AS "Annotation",
                   COALESCE(co.current_content->>'type', 'article') AS "Type",
                   COALESCE(NULLIF(co.current_content->>'custom_url', ''),
                            t.thanka_id::text) AS "DocumentPath",
                   ('image' || t.thanka_id::text || '.jpg') AS "Image"
            FROM thanka t
            LEFT JOIN cogobject co ON co.thanka_id = t.thanka_id
            WHERE t.status <> 'deleted'
              AND co.current_content->>'parent_id' = %s
            ORDER BY t.created_at ASC
            LIMIT 200
            """,
            (parent_thanka_id,),
        )
        return rows

    def _children_image_map(self, children: list[dict]) -> dict:
        """
        Возвращает SOAP-совместимую карту ChildrenImage:
        индекс_ребёнка -> 1/0, где 1 означает «для сектора есть картинка».

        Фронт Canvas использует этот объект, чтобы решить — рисовать
        image{ID}.jpg или показывать заглушку "изображение недоступно".
        """
        out: dict[str, int] = {}
        for idx, child in enumerate(children or []):
            image_val = child.get("Image", 0) if isinstance(child, dict) else 0
            try:
                out[str(idx)] = 1 if int(image_val) else 0
            except (TypeError, ValueError):
                out[str(idx)] = 0
        return out
    # --- corners (Elements) ---------------------------------------------------

    # Канонический порядок углов (Область SOC, Cogi; PERVYI-RELIZ §«углы»):
    # LeftUp, RightUp, LeftBottom, RightBottom — совпадает с coord[]
    # в Canvas.jsx:42-45. Фронт рисует углы строго в этом порядке,
    # поэтому бэк ВСЕГДА возвращает массив длины 4 (пустые — заглушки
    # с ID="", чтобы позиции LeftUp/RightUp/LeftBottom/RightBottom
    # держались стабильно даже когда часть углов не настроена).
    _CORNER_CODES: tuple[str, ...] = (
        "corner_left_up",
        "corner_right_up",
        "corner_left_bottom",
        "corner_right_bottom",
    )

    def _corner_elements_for(self, parent_thanka_id: str) -> list[dict]:
        """Собирает «углы» (Elements) тханки строго по канону V0.51.

        Источник правды — `homonet.thanka_link` (left_thanka_id=parent,
        right_thanka_id=угловая тханка, link_type_id ссылается на один
        из 4 corner-кодов в `homonet.link_type`). Структура подтверждена
        в 260423-DDL-V051-14.txt:893-907 и описана в KOGI.Metody_V1-10
        (Get/SetElements, VisibleElements).

        Возвращает РОВНО 4 элемента (LeftUp, RightUp, LeftBottom,
        RightBottom) — пустые позиции это `{ID:"", Name:"", Annotation:"",
        Image:0}`. Фронт читает 4 позиции напрямую по индексу coord[i]
        (Canvas.jsx:42-45), сворачивание массива при пропуске угла
        ломало бы соответствие «позиция ↔ угол».
        """
        empty = lambda: {"ID": "", "Name": "", "Annotation": "", "Image": 0}
        if not parent_thanka_id:
            return [empty() for _ in range(4)]

        rows = _q(
            """
            SELECT lt.code AS code,
                   t.thanka_id::text AS "ID",
                   COALESCE(
                       NULLIF(co.current_content->>'title', ''),
                       NULLIF(NULLIF(t.title, ''), 'Новая тханка'),
                       NULLIF(co.current_content->>'custom_url', ''),
                       'Новая тханка'
                   ) AS "Name",
                   COALESCE(co.current_content->>'annotation', '') AS "Annotation"
            FROM thanka_link tl
            JOIN link_type lt ON lt.link_type_id = tl.link_type_id
            JOIN thanka t ON t.thanka_id = tl.right_thanka_id
            LEFT JOIN cogobject co ON co.thanka_id = t.thanka_id
            WHERE tl.left_thanka_id::text = %s
              AND lt.code = ANY(%s::text[])
              AND t.status <> 'deleted'
            """,
            (parent_thanka_id, list(self._CORNER_CODES)),
        )
        by_code = {r["code"]: r for r in rows}
        out: list[dict] = []
        for code in self._CORNER_CODES:
            r = by_code.get(code)
            if not r:
                out.append(empty())
                continue
            out.append({
                "ID":         r["ID"],
                "Name":       r["Name"],
                "Annotation": r["Annotation"],
                # Image: 1 если у угловой тханки есть картинка в snapshot/файле.
                # Здесь возвращаем 1 как по канону PHP-флоу (картинка лежит
                # как image{ID}.jpg). Реальная проверка существования файла
                # делается фронтом по 404 на загрузке — DIRPATH+/image{ID}.jpg.
                "Image":      1,
            })
        return out

    def _h_set_elements(self, params: dict) -> dict:
        """SetElements — устанавливает «углы» тханки.

        Канон KOGI.Metody:669: SetElements(Elements, Id). На вход
        ожидается родительская тханка (Id) и массив Elements длиной 4
        в порядке LeftUp/RightUp/LeftBottom/RightBottom. Каждый элемент:
          { "ID": <thanka_uuid|""> }
        Пустой ID = угол очищен (привязка удаляется).

        Транзакция: для каждого из 4 кодов сначала DELETE существующих
        ссылок (по парe parent+code), затем INSERT свежей при непустом ID.
        Идемпотентно — повторный вызов с теми же Elements даёт тот же
        результат.
        """
        parent_id = str(params.get("Id") or "").strip()
        if not parent_id:
            raise ValueError("Id is required for SetElements")

        elements = params.get("Elements") or []
        # На случай SOAP-обёртки {"RegisteredObject": [...]}
        if isinstance(elements, dict):
            elements = elements.get("RegisteredObject") or []
        if not isinstance(elements, list):
            elements = []
        # Дополняем до 4 пустыми, обрезаем до 4 — порядок важен.
        elements = (list(elements) + [{}] * 4)[:4]

        # link_type_id по коду — одним запросом.
        code_rows = _q(
            "SELECT code, link_type_id::text AS id FROM link_type "
            "WHERE code = ANY(%s::text[])",
            (list(self._CORNER_CODES),),
        )
        code_to_id = {r["code"]: r["id"] for r in code_rows}
        # Если миграция не накатана — отчётливо ругаемся.
        missing = [c for c in self._CORNER_CODES if c not in code_to_id]
        if missing:
            raise RuntimeError(
                f"link_type missing codes: {missing}. "
                "Apply migration 2026_06_10_corners_link_type.sql."
            )

        for code, el in zip(self._CORNER_CODES, elements):
            right_id = ""
            if isinstance(el, dict):
                right_id = str(el.get("ID") or el.get("Id") or "").strip()

            # Сначала чистим старую привязку по (parent, code).
            _q(
                """
                DELETE FROM thanka_link
                WHERE left_thanka_id::text = %s
                  AND link_type_id::text = %s
                """,
                (parent_id, code_to_id[code]),
            )
            if not right_id:
                continue
            # Защита от привязки тханки самой к себе (CHECK в DDL это и так не
            # даст — но даём осмысленное сообщение раньше).
            if right_id == parent_id:
                raise ValueError("corner cannot reference the same thanka")
            _q(
                """
                INSERT INTO thanka_link
                    (left_thanka_id, right_thanka_id, link_type_id)
                VALUES (%s::uuid, %s::uuid, %s::uuid)
                """,
                (parent_id, right_id, code_to_id[code]),
            )

        return {
            "Id": parent_id,
            "Elements": _reg(self._corner_elements_for(parent_id)),
        }

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

        Канон V0.51: person → subject(kind='personal', person_id) →
        author(subject_id) → avatar(author_id, login).

        Идемпотентен по всей цепочке: переиспользует уже существующие
        звенья и создаёт лишь недостающие. Это важно потому что
        homonet.subject имеет UNIQUE на person_id, и повторный INSERT
        для пользователя, у которого уже есть personal subject
        (напр. после backfill_personal_subjects), упал бы на 23505.
        """
        if not login:
            return ""

        # 1. Самый быстрый путь: avatar+author уже есть для этого логина
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

        # 2. Ищем auth_user — уже со связями person_id / subject_id
        au = _q(
            """
            SELECT
                user_id::text   AS uid,
                person_id::text  AS person_id,
                subject_id::text AS subject_id
            FROM auth_user
            WHERE login = %s
            """,
            (login,),
        )
        if not au:
            return ""
        person_id = au[0]["person_id"]
        subject_id = au[0]["subject_id"]
        user_id = au[0]["uid"]

        # 3. Переиспользуем существующий personal subject для person,
        #    если auth_user.subject_id оказался пустым, но subject уже был создан
        #    (рассинхрон после ранних миграций).
        if subject_id is None and person_id is not None:
            existing_subj = _q(
                """
                SELECT subject_id::text AS sid
                FROM subject
                WHERE person_id = %s AND subject_kind = 'personal'
                """,
                (person_id,),
            )
            if existing_subj:
                subject_id = existing_subj[0]["sid"]
                _q(
                    "UPDATE auth_user SET subject_id = %s, updated_at = now() WHERE user_id = %s",
                    (subject_id, user_id),
                )

        # 4. Создаём недостающие person и/или subject
        if person_id is None:
            person = _q(
                """
                INSERT INTO person (display_name, status)
                VALUES (%s, 'active')
                RETURNING person_id::text AS pid
                """,
                (login,),
            )
            person_id = person[0]["pid"] if person else None
            if person_id is not None:
                _q(
                    "UPDATE auth_user SET person_id = %s, updated_at = now() WHERE user_id = %s",
                    (person_id, user_id),
                )

        if subject_id is None:
            subj = _q(
                """
                INSERT INTO subject (subject_kind, person_id, display_name)
                VALUES ('personal', %s, %s)
                RETURNING subject_id::text AS sid
                """,
                (person_id, login),
            )
            subject_id = subj[0]["sid"] if subj else None
            if subject_id is not None:
                _q(
                    "UPDATE auth_user SET subject_id = %s, updated_at = now() WHERE user_id = %s",
                    (subject_id, user_id),
                )

        # 5. Переиспользуем или создаём author для этого subject
        author_rows = _q(
            "SELECT author_id::text AS aid FROM author WHERE subject_id = %s LIMIT 1",
            (subject_id,),
        )
        if author_rows:
            author_id = author_rows[0]["aid"]
        else:
            new_author = _q(
                """
                INSERT INTO author (subject_id, display_name)
                VALUES (%s, %s)
                RETURNING author_id::text AS aid
                """,
                (subject_id, login),
            )
            author_id = new_author[0]["aid"]

        # 6. avatar — на login UNIQUE, ON CONFLICT DO NOTHING
        _q(
            """
            INSERT INTO avatar (author_id, login, status)
            VALUES (%s, %s, 'active')
            ON CONFLICT (login) DO NOTHING
            """,
            (author_id, login),
        )
        return author_id

    def _resolve_owner_subject_id(
        self,
        subject_id_param: str,
        user_login: str,
    ) -> str:
        """Валидирует что переданный фронтом SubjectId принадлежит залогиненному
        пользователю. Если не принадлежит — возвращает пустую строку, чтобы
        вызывающий код пошёл по login-ветке.

        Корень бага (PR #39 + #40): фронт мог прислать произвольный SubjectId,
        бэк ему доверялся, и _ensure_author_by_subject создавал нового author
        под чужой/сиротский subject. В итоге у одного login оказывалось два
        разных subject в БД, и часть тханок (созданных с подделанным SubjectId)
        выпадала из _my_thanka_rows, который джойнит через avatar.login.

        Правила валидации:
        1. Пустой SubjectId → пустая строка (это сигнал использовать login-ветку).
        2. SubjectId == auth_user.subject_id для данного login → разрешён.
        3. SubjectId соответствует other-subject (org/community) к которому
           login имеет принадлежность через будущую таблицу subject_member
           (TODO) → пока разрешён, валидируется только существование subject.
           Это нужно потому что collective/organizational subject'ы должны
           уметь создавать тханки от своего имени.
        4. Всё остальное → пустая строка + предупреждение в stderr.
        """
        sid = (subject_id_param or "").strip()
        if not sid:
            return ""

        # 1. Subject вообще существует?
        subj = _q(
            "SELECT subject_kind::text AS kind, person_id::text AS pid FROM subject WHERE subject_id::text = %s",
            (sid,),
        )
        if not subj:
            import sys
            print(
                f"[security] _resolve_owner_subject_id: SubjectId {sid!r} "
                f"не существует, fallback на login={user_login!r}",
                file=sys.stderr,
            )
            return ""

        kind = (subj[0]["kind"] or "").lower()

        # 2. Personal subject — должен совпадать с auth_user.subject_id
        if kind == "personal":
            if not user_login:
                # Невозможно проверить принадлежность без login → отвергаем.
                import sys
                print(
                    f"[security] _resolve_owner_subject_id: personal SubjectId "
                    f"{sid!r} без login — отказ",
                    file=sys.stderr,
                )
                return ""
            au = _q(
                "SELECT subject_id::text AS sid FROM auth_user WHERE login = %s",
                (user_login,),
            )
            if not au:
                return ""
            owner_sid = au[0]["sid"]
            if owner_sid and owner_sid == sid:
                return sid
            import sys
            print(
                f"[security] _resolve_owner_subject_id: personal SubjectId {sid!r} "
                f"не принадлежит login={user_login!r} (его subject_id={owner_sid!r}), "
                f"fallback на login-ветку",
                file=sys.stderr,
            )
            return ""

        # 3. Org/community subject — пока разрешён по факту существования.
        # TODO: проверять membership через subject_member когда таблица появится.
        return sid

    def _ensure_author_by_subject(self, subject_id: str) -> str:
        """Обратный путь к _ensure_author_for: идём от subject_id (Stage 3 PR 4).

        Канон V0.51: subject → author. Никакого login/avatar в обязательной
        цепи нет — это важно для collective/organizational subject'ов, у которых
        нет auth_user (и соответственно нет логина).

        Идемпотентность: если author для subject уже есть — возвращает его id;
        иначе создаёт с display_name = subject.display_name.

        Для обратной совместимости с легаси-кодом, который ждёт и avatar (фронты
        с login в профиле), дополнительно вписываем avatar по auth_user.login
        если таковой найдётся.
        """
        if not subject_id:
            return ""

        # 1. Самый быстрый путь: author для этого subject уже существует.
        rows = _q(
            "SELECT author_id::text AS aid FROM author WHERE subject_id::text = %s LIMIT 1",
            (subject_id,),
        )
        if rows:
            return rows[0]["aid"]

        # 2. Проверяем что subject существует (иначе INSERT в author сломает FK).
        subj_rows = _q(
            "SELECT display_name FROM homonet.subject WHERE subject_id::text = %s",
            (subject_id,),
        )
        if not subj_rows:
            return ""
        display_name = subj_rows[0]["display_name"] or ""

        # 2.5. Lazy-нормализация legacy author'ов.
        #
        # Перед созданием нового author ищем legacy author без subject_id
        # для того же пользователя через цепочку subject → auth_user.login →
        # avatar.login → avatar.author_id → author. Если находим — вписываем
        # в него этот subject_id и возвращаем, вместо того чтобы плодить второй
        # author-ряд на тот же subject. Без этого старые тханки оставались
        # на legacy-author, новые шли на свежесозданный — и ломались
        # права (баг PR #25-fix: исчезла кнопка "Редактировать"
        # у новых тханок).
        legacy_author = _q(
            """
            SELECT a.author_id::text AS aid
            FROM author a
            JOIN avatar av ON av.author_id = a.author_id
            JOIN auth_user au ON au.login = av.login
            WHERE au.subject_id::text = %s
              AND a.subject_id IS NULL
            LIMIT 1
            """,
            (subject_id,),
        )
        if legacy_author:
            _q(
                "UPDATE author SET subject_id = %s WHERE author_id::text = %s",
                (subject_id, legacy_author[0]["aid"]),
            )
            return legacy_author[0]["aid"]

        # 3. Создаём author.
        new_author = _q(
            """
            INSERT INTO author (subject_id, display_name)
            VALUES (%s, %s)
            RETURNING author_id::text AS aid
            """,
            (subject_id, display_name),
        )
        if not new_author:
            return ""
        author_id = new_author[0]["aid"]

        # 4. Опционально: если у subject'а есть связанный auth_user — пропишем
        # avatar.login (легаси-узел: фронты с login всё ещё ищут через avatar).
        au_rows = _q(
            "SELECT login FROM auth_user WHERE subject_id::text = %s",
            (subject_id,),
        )
        if au_rows and au_rows[0]["login"]:
            _q(
                """
                INSERT INTO avatar (author_id, login, status)
                VALUES (%s, %s, 'active')
                ON CONFLICT (login) DO NOTHING
                """,
                (author_id, au_rows[0]["login"]),
            )

        return author_id


# --- community stubs ---------------------------------------------------------
# Community / Notifications пока не реализованы в локальном бэкенде, но фронт
# дёргает getThemes / getComments при монтировании <Comment>. Чтобы не словить
# "Произошла ошибка" на каждом навигаторе — отдаём явные null'ы (фронт проверяет
# `!== null` перед обращением к [0]).

def _h_get_themes(self, params: dict) -> dict:  # noqa: ARG001
    return {"ThemeList": None}


def _h_get_comments(self, params: dict) -> dict:  # noqa: ARG001
    return {"CommentList": None}


def _h_get_all_comments(self, params: dict) -> dict:  # noqa: ARG001
    return {"CommentList": None}


def _h_community_noop(self, params: dict) -> dict:  # noqa: ARG001
    return {}


LocalCogiAdapter._h_get_themes = _h_get_themes  # type: ignore[attr-defined]
LocalCogiAdapter._h_get_comments = _h_get_comments  # type: ignore[attr-defined]
LocalCogiAdapter._h_get_all_comments = _h_get_all_comments  # type: ignore[attr-defined]
LocalCogiAdapter._h_community_noop = _h_community_noop  # type: ignore[attr-defined]


# Регистрируем диспетчер методов в виде словаря {method_name -> handler}
LocalCogiAdapter._dispatch = {  # type: ignore[attr-defined]
    "GetThanka": LocalCogiAdapter._h_get_thanka,
    "GetSitePage": LocalCogiAdapter._h_get_site_page,
    "CreateThanka": LocalCogiAdapter._h_create_thanka,
    "SetThanka": LocalCogiAdapter._h_set_thanka,
    # SetElements — канон KOGI.Metody:669, устанавливает «углы» тханки.
    "SetElements": LocalCogiAdapter._h_set_elements,
    "GetMyThanka": LocalCogiAdapter._h_get_my_thanka,
    "RemoveThanka": LocalCogiAdapter._h_remove_thanka,
    "CheckCustomURL": LocalCogiAdapter._h_check_custom_url,
    "GetCabinetByUser": LocalCogiAdapter._h_get_cabinet_by_user,
    "GetIdByCustomURL": LocalCogiAdapter._h_get_id_by_custom_url,
    "IsDocumentPart": LocalCogiAdapter._h_is_document_part,
    # community / notifications stubs
    "GetThemes": LocalCogiAdapter._h_get_themes,
    "GetComments": LocalCogiAdapter._h_get_comments,
    "GetAllComments": LocalCogiAdapter._h_get_all_comments,
    "GetMyAnswers": LocalCogiAdapter._h_get_all_comments,
    "CreateComment": LocalCogiAdapter._h_community_noop,
    "CreateTheme": LocalCogiAdapter._h_community_noop,
    "DeleteComment": LocalCogiAdapter._h_community_noop,
    "RemoveTheme": LocalCogiAdapter._h_community_noop,
    "EditComment": LocalCogiAdapter._h_community_noop,
    "SetNotificationSeen": LocalCogiAdapter._h_community_noop,
    "CreateSystemNotifications": LocalCogiAdapter._h_community_noop,
    "SendMessageForAdmin": LocalCogiAdapter._h_community_noop,
}


def _json_dumps(obj: Any) -> str:
    import json

    return json.dumps(obj, ensure_ascii=False)


def _reg(items: list) -> dict:
    """Оборачивает список в SOAP-формат {"RegisteredObject": [...]}.

    Этого формата ожидает backend.shared.utils.utils.registered(), через
    которую проходят все коллекции в normalize_get_thanka_result.
    Без оборачивания любой список превращается в [].
    """
    return {"RegisteredObject": items or []}


def _default_request() -> dict:
    """Дефолтный Request-объект по легаси-схеме setThanka-6.php (строки 46-57).

    Фронт (CogRequest.jsx::RequestViewer) на старте делает
    `request.Fields.split(",")`. Если бэк отдаст `Request: {}` или
    отсутствие поля Fields — крашится весь рендер тханки типа `request`/Бот.
    Поэтому возвращаем все поля с пустыми строками — ровно как PHP-легаси,
    где `$_POST['Request_*']` всегда были строками (пустыми по умолчанию).
    """
    return {
        "Fields": "",
        "StartDate": "",
        "EndDate": "",
        "Picture": "",
        "SortOrder": "",
        "SortField": "",
        "QueryName": "",
        "Categories": "",
        "SearchStrings": "",
        "SpecialProps": "",
    }
