"""Backfill: гарантирует author.subject_id у всех существующих авторов.

Канон V0.51: author.subject_id → subject(person/community/organization).
Это и есть связка Thanka↔Subject (через author_id в thanka).

Часть авторов в БД могла быть создана до того, как Cogiteka стала
заполнять subject_id (легаси-данные). Скрипт идемпотентно проставляет
subject_id для таких авторов:

  1. Найти всех author, у которых subject_id IS NULL.
  2. Через avatar.login найти соответствующий auth_user.
  3. Из auth_user.subject_id (создан PR C / backfill_personal_subjects) —
     поставить в author.subject_id.
  4. Если у auth_user нет subject_id — пропустить (PR C должен был
     создать; повторный запуск backfill_personal_subjects это пофиксит).

Запуск:
    python -m backend.modules.homonet.migrations.backfill_author_subject_id
    python -m backend.modules.homonet.migrations.backfill_author_subject_id --apply

Канон:
  * 260423-DDL-V051-3 — author(subject_id REFERENCES subject)
  * 260424-Runnable-Slice1-V051-15 §6.1
"""

from __future__ import annotations

import argparse
import asyncio
import sys

from backend.shared.db import close_db_pool, get_conn, init_db_pool


async def _candidates(conn) -> list[dict]:
    """Авторы без subject_id вместе с возможной login-привязкой."""
    async with conn.cursor() as cur:
        await cur.execute(
            """
            SELECT
                a.author_id,
                a.display_name,
                av.login          AS avatar_login,
                au.user_id        AS auth_user_id,
                au.subject_id     AS auth_user_subject_id
            FROM homonet.author a
            LEFT JOIN homonet.avatar    av ON av.author_id = a.author_id
            LEFT JOIN homonet.auth_user au ON au.login     = av.login
            WHERE a.subject_id IS NULL
            ORDER BY a.created_at
            """,
        )
        return list(await cur.fetchall())


async def _set_author_subject(conn, author_id, subject_id) -> None:
    async with conn.cursor() as cur:
        await cur.execute(
            "UPDATE homonet.author SET subject_id = %s WHERE author_id = %s",
            (subject_id, author_id),
        )


async def run(*, apply: bool) -> int:
    await init_db_pool()
    try:
        async with get_conn() as conn:
            candidates = await _candidates(conn)
            print(f"Found {len(candidates)} author(s) without subject_id\n")

            if not candidates:
                print("Nothing to do.")
                return 0

            filled = 0
            skipped = 0
            for c in candidates:
                author_id = c["author_id"]
                display_name = c["display_name"]
                login = c["avatar_login"]
                auth_subject_id = c["auth_user_subject_id"]

                print(f"author {author_id}  display_name={display_name}")
                print(f"  via avatar.login = {login}")

                if auth_subject_id is None:
                    print("  - SKIPPED: no auth_user.subject_id "
                          "(run backfill_personal_subjects first)")
                    skipped += 1
                    print()
                    continue

                if apply:
                    await _set_author_subject(conn, author_id, auth_subject_id)
                    print(f"  - set author.subject_id = {auth_subject_id}")
                else:
                    print(f"  - WOULD set author.subject_id = {auth_subject_id}")
                filled += 1
                print()

            print(f"Summary: filled={filled} skipped={skipped}")
            if not apply:
                print("Dry-run. Re-run with --apply to commit changes.")
            else:
                print("Backfill applied successfully.")
        return 0
    finally:
        await close_db_pool()


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--apply",
        action="store_true",
        help="Apply changes (default: dry-run, no DB writes)",
    )
    args = parser.parse_args()
    rc = asyncio.run(run(apply=args.apply))
    sys.exit(rc)


if __name__ == "__main__":
    main()
