from __future__ import annotations

from typing import Optional, List, Dict

from backend.shared.db import get_conn


class ThankaService:
    """
    Сервис работы с тханками HomoNet.

    Все методы делают минимально необходимые SQL‑запросы к каноническим
    таблицам `thanka`, `thanka_type`, `thanka_link` из DDL V0.51.
    """

    # --------- базовые утилиты ---------

    async def _fetch_one(self, query: str, *args) -> Optional[Dict]:
        async with get_conn() as conn:
            async with conn.cursor() as cur:
                await cur.execute(query, args)
                return await cur.fetchone()

    async def _fetch_all(self, query: str, *args) -> List[Dict]:
        async with get_conn() as conn:
            async with conn.cursor() as cur:
                await cur.execute(query, args)
                return await cur.fetchall()

    # --------- системная тханка (если нужно через сервис) ---------

    async def get_system_root_thanka(self, thanka_id: str) -> Optional[Dict]:
        """
        Получить системную корневую тханку по её UUID.

        Используется в варианте, когда роутер решит ходить в сервис,
        а не напрямую в БД.
        """
        return await self._fetch_one(
            """
            SELECT
                t.thanka_id::text AS thanka_id,
                t.title,
                t.status::text AS status
            FROM homonet.thanka t
            WHERE t.thanka_id = %s::uuid
            """,
            thanka_id,
        )

    # --------- сектора типов для SystemThankaPage ---------

    async def get_type_sectors(self) -> List[Dict]:
        """
        Сектора системной тханки — типы содержимого.

        Берём все записи из homonet.thanka_type и считаем,
        сколько тханок каждого типа (по статусу берём только active/draft
        по умолчанию — можно ужесточить до active, если нужно).
        """
        return await self._fetch_all(
            """
            SELECT
                tt.thanka_type_id::text AS type_id,
                tt.code,
                tt.name,
                COUNT(t.thanka_id) AS cnt
            FROM homonet.thanka_type tt
            LEFT JOIN homonet.thanka t
                ON t.thanka_type_id = tt.thanka_type_id
                AND t.status IN ('active', 'draft')  -- минимальный фильтр
            GROUP BY tt.thanka_type_id, tt.code, tt.name
            ORDER BY tt.name
            """
        )

    # --------- список тханок по типу ---------

    async def get_thankas_by_type(self, type_code: str) -> List[Dict]:
        """
        Список тханок заданного типа.

        Возвращает:
        - thanka_id
        - title
        - status
        - code (код типа)
        - name (человеческое название типа)
        - created_at
        """
        return await self._fetch_all(
            """
            SELECT
                t.thanka_id::text AS thanka_id,
                t.title,
                t.status::text AS status,
                tt.code,
                tt.name,
                t.created_at
            FROM homonet.thanka t
            JOIN homonet.thanka_type tt
                ON tt.thanka_type_id = t.thanka_type_id
            WHERE tt.code = %s
            ORDER BY t.created_at DESC
            """,
            type_code,
        )

    # --------- дерево дочерних тханок ---------

    async def get_thanka_children(self, thanka_id: str) -> List[Dict]:
        """
        Дочерние тханки для заданной тханки.

        Базовая реализация: считаем, что в таблице homonet.thanka_link
        поле left_thanka_id указывает на «родителя», а right_thanka_id — на «дочернюю»
        (узел / материал / связанную страницу).

        Возвращаем:
        - thanka_id
        - title
        - status
        - type_code
        - type_name
        """
        return await self._fetch_all(
            """
            SELECT
                t.thanka_id::text AS thanka_id,
                t.title,
                t.status::text AS status,
                tt.code AS type_code,
                tt.name AS type_name
            FROM homonet.thanka_link tl
            JOIN homonet.thanka t
                ON t.thanka_id = tl.right_thanka_id
            LEFT JOIN homonet.thanka_type tt
                ON tt.thanka_type_id = t.thanka_type_id
            WHERE tl.left_thanka_id = %s::uuid
            ORDER BY t.created_at ASC
            """,
            thanka_id,
        )