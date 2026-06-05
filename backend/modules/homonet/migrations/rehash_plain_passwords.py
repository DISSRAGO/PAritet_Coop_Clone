"""Rehash legacy plain-text passwords in homonet.auth_user.

Исторически auth_service.signup записывал пароль в password_hash как plain-text,
а login сравнивал строки через `!=`. После PR fix/auth-password-hashing signup
сразу хеширует через passlib (pbkdf2_sha256), а login поддерживает обе формы
с автоматическим перехешированием при успешном входе.

Этот миграционный скрипт принудительно перехешировывает все легаси-пароли,
чтобы не ждать пока каждый пользователь войдёт. Идемпотентен: пропускает уже
хешированные значения (определяются по префиксу `$pbkdf2-sha256$`).

ВНИМАНИЕ: pbkdf2 — однонаправленная функция, поэтому исходный plain-пароль
после миграции восстановить нельзя. Это нормально — мы храним hash именно
чтобы plain-пароль было невозможно прочитать.

Запуск:
    python -m backend.modules.homonet.migrations.rehash_plain_passwords
    python -m backend.modules.homonet.migrations.rehash_plain_passwords --apply
"""

from __future__ import annotations

import argparse
import asyncio
import sys

from backend.shared.db import close_db_pool, get_conn, init_db_pool
from backend.shared.security import hash_password

_HASH_PREFIX = "$pbkdf2-sha256$"


async def _candidates(conn) -> list[dict]:
    """Пользователи с password_hash, который не похож на passlib-hash."""
    async with conn.cursor() as cur:
        await cur.execute(
            """
            SELECT user_id, login, password_hash
            FROM homonet.auth_user
            WHERE password_hash IS NOT NULL
              AND password_hash <> ''
              AND position(%s in password_hash) <> 1
            ORDER BY login
            """,
            (_HASH_PREFIX,),
        )
        return await cur.fetchall()


async def _rehash_one(conn, user_id, new_hash: str) -> None:
    async with conn.cursor() as cur:
        await cur.execute(
            "UPDATE homonet.auth_user "
            "SET password_hash = %s, updated_at = now() "
            "WHERE user_id = %s",
            (new_hash, user_id),
        )


async def run(apply: bool) -> int:
    await init_db_pool()
    try:
        async with get_conn() as conn:
            rows = await _candidates(conn)

            if not rows:
                print("Found 0 user(s) with legacy plain password")
                print("\nNothing to do.")
                return 0

            print(f"Found {len(rows)} user(s) with legacy plain password:")
            for r in rows:
                print(f"  - {r['login']} (user_id={r['user_id']})")

            if not apply:
                print("\nDRY-RUN. Pass --apply to rehash these passwords.")
                return 0

            print("\nApplying rehash...")
            for r in rows:
                new_hash = hash_password(r["password_hash"])
                await _rehash_one(conn, r["user_id"], new_hash)
                print(f"  ✓ {r['login']} rehashed")

            print(f"\nDone. Rehashed {len(rows)} password(s).")
            return 0
    finally:
        await close_db_pool()


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Rehash legacy plain-text passwords in homonet.auth_user"
    )
    parser.add_argument(
        "--apply",
        action="store_true",
        help="Actually update rows. Without this flag prints a dry-run report.",
    )
    args = parser.parse_args()
    return asyncio.run(run(apply=args.apply))


if __name__ == "__main__":
    sys.exit(main())
