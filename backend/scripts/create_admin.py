# backend/scripts/create_admin.py
"""
Идемпотентный скрипт создания системного администратора клона.

Запуск:
    cd /srv/clone
    python -m backend.scripts.create_admin
"""
from __future__ import annotations

import asyncio
import os
from backend.shared.db import init_db_pool, close_db_pool, get_conn
from backend.shared.security import hash_password

# ── реквизиты системного администратора ──────────────────────────────────────
SYSTEM_ADMIN_LOGIN = "ADMIN"
SYSTEM_ADMIN_PASSWORD = os.getenv("SYSTEM_ADMIN_PASSWORD", "").strip()
SYSTEM_ADMIN_DISPLAY_NAME = "Системный администратор"

SYSTEM_ROOT_THANKA_ID = "00000000-0000-0000-0000-000000000010"
# ─────────────────────────────────────────────────────────────────────────────


async def main() -> None:
    if not SYSTEM_ADMIN_PASSWORD:
        raise RuntimeError("SYSTEM_ADMIN_PASSWORD is not configured")
    # Инициализируем пул соединений
    await init_db_pool()

    try:
        async with get_conn() as conn:
            async with conn.cursor() as cur:
                # ── 1. Проверяем: уже есть админ? ───────────────────────────
                await cur.execute(
                    "SELECT user_id FROM auth_user WHERE login = %s",
                    (SYSTEM_ADMIN_LOGIN,),
                )
                existing = await cur.fetchone()
                if existing:
                    print(f"[create_admin] Admin already exists: {SYSTEM_ADMIN_LOGIN}")
                    print(f"[create_admin] user_id = {existing['user_id']}")
                    return

                # ── 2. person (без phone/email) ─────────────────────────────
                await cur.execute(
                    """
                    INSERT INTO person (display_name, status)
                    VALUES (%s, 'active')
                    RETURNING person_id
                    """,
                    (SYSTEM_ADMIN_DISPLAY_NAME,),
                )
                person_row = await cur.fetchone()
                person_id = person_row["person_id"]

                # ── 3. subject ───────────────────────────────────────────────
                await cur.execute(
                    """
                    INSERT INTO subject (subject_kind, person_id, display_name, status)
                    VALUES ('personal', %s, %s, 'active')
                    RETURNING subject_id
                    """,
                    (person_id, SYSTEM_ADMIN_DISPLAY_NAME),
                )
                subject_row = await cur.fetchone()
                subject_id = subject_row["subject_id"]

                # ── 4. author ────────────────────────────────────────────────
                await cur.execute(
                    """
                    INSERT INTO author (subject_id, display_name)
                    VALUES (%s, %s)
                    RETURNING author_id
                    """,
                    (subject_id, SYSTEM_ADMIN_DISPLAY_NAME),
                )
                author_row = await cur.fetchone()
                author_id = author_row["author_id"]

                # ── 5. auth_user (is_superuser=true, is_verified=true) ──────
                await cur.execute(
                    """
                    INSERT INTO auth_user (
                        person_id, subject_id, author_id,
                        login,
                        email, phone,
                        password_hash,
                        is_active, is_superuser, is_verified, is_confirmed
                    )
                    VALUES (%s, %s, %s, %s, NULL, NULL, %s, TRUE, TRUE, TRUE, TRUE)
                    RETURNING user_id
                    """,
                    (
                        person_id,
                        subject_id,
                        author_id,
                        SYSTEM_ADMIN_LOGIN,
                        hash_password(SYSTEM_ADMIN_PASSWORD),
                    ),
                )
                user_row = await cur.fetchone()
                user_id = user_row["user_id"]

                # ── 6. Привязываем автора к системной корневой тханке ───────
                await cur.execute(
                    """
                    UPDATE thanka
                    SET author_id = %s
                    WHERE thanka_id = %s::uuid
                      AND (author_id IS NULL)
                    """,
                    (author_id, SYSTEM_ROOT_THANKA_ID),
                )

        print(f"[create_admin] Created: login={SYSTEM_ADMIN_LOGIN}")
        print(f"[create_admin] user_id={user_id}  subject_id={subject_id}")
        print(f"[create_admin] Bound to system root thanka {SYSTEM_ROOT_THANKA_ID}")

    finally:
        await close_db_pool()


if __name__ == "__main__":
    asyncio.run(main())