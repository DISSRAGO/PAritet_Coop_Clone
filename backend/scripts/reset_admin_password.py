# backend/scripts/reset_admin_password.py
"""
Жёсткий сброс пароля и флагов для существующего администратора ADMIN.

Запуск:
    cd /srv/clone
    python -m backend.scripts.reset_admin_password
"""
from __future__ import annotations

import asyncio
import os
from backend.shared.db import init_db_pool, close_db_pool, get_conn
from backend.shared.security import hash_password

SYSTEM_ADMIN_LOGIN = "ADMIN"
NEW_PASSWORD = os.getenv("SYSTEM_ADMIN_PASSWORD", "").strip()


async def main() -> None:
    if not NEW_PASSWORD:
        raise RuntimeError("SYSTEM_ADMIN_PASSWORD is not configured")

    await init_db_pool()
    try:
        async with get_conn() as conn:
            async with conn.cursor() as cur:
                # показать текущие значения
                await cur.execute(
                    """
                    SELECT
                      user_id,
                      login,
                      is_active,
                      is_superuser,
                      is_verified,
                      is_confirmed,
                      password_hash
                    FROM auth_user
                    WHERE LOWER(login) = LOWER(%s)
                    """,
                    (SYSTEM_ADMIN_LOGIN,),
                )
                row = await cur.fetchone()
                if not row:
                    print(f"[reset_admin] Admin {SYSTEM_ADMIN_LOGIN} not found")
                    return

                print("[reset_admin] BEFORE:")
                print(row)

                # обновить пароль и флаги
                await cur.execute(
                    """
                    UPDATE auth_user
                    SET
                      password_hash = %s,
                      is_active = TRUE,
                      is_superuser = TRUE,
                      is_verified = TRUE,
                      is_confirmed = TRUE,
                      updated_at = now()
                    WHERE LOWER(login) = LOWER(%s)
                    RETURNING user_id, login, is_active, is_superuser, is_verified, is_confirmed
                    """,
                    (hash_password(NEW_PASSWORD), SYSTEM_ADMIN_LOGIN),
                )
                new_row = await cur.fetchone()
                print("[reset_admin] AFTER:")
                print(new_row)

        print(f"[reset_admin] Password reset for {SYSTEM_ADMIN_LOGIN}")

    finally:
        await close_db_pool()


if __name__ == "__main__":
    asyncio.run(main())