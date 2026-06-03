"""Backfill: создаёт person + personal subject для auth_user без них.

HomoNet V0.51 канон требует, чтобы каждый аутентифицированный пользователь
имел соответствующий person и personal subject. Исторически часть
auth_user-записей появилась раньше subject-слоя и осталась без них.

Скрипт идемпотентен:
  * пропускает auth_user, у которых subject_id уже выставлен;
  * если у auth_user есть person_id, но нет subject_id — создаёт subject
    для существующего person;
  * если нет ни того, ни другого — создаёт оба.

displayName по умолчанию = login. Это draft-статус person/subject;
пользователь обновит ФИО через UI (UC-03 endpoint
POST /api/app/subjects/create-personal-subject будет возвращать 409, но
обновление display_name делается отдельным PATCH-эндпоинтом — это вне
скоупа текущего PR; пока обновление идёт прямым SQL или через админку).

Запуск:
    python -m backend.modules.homonet.migrations.backfill_personal_subjects

По умолчанию выводит план (dry-run). Чтобы применить — флаг --apply:
    python -m backend.modules.homonet.migrations.backfill_personal_subjects --apply

Канон:
  * 260423-DDL-V051-3 — DDL person / subject
  * 260424-Runnable-Slice1-V051-15 §6.1 — Subject services
"""

from __future__ import annotations

import argparse
import asyncio
import sys
from typing import Optional

from backend.shared.db import close_db_pool, get_conn, init_db_pool


async def _candidates(conn) -> list[dict]:
    """Возвращает auth_user, которым требуется backfill (subject_id IS NULL)."""
    async with conn.cursor() as cur:
        await cur.execute(
            """
            SELECT
                au.user_id,
                au.login,
                au.email,
                au.person_id,
                au.subject_id,
                au.is_active,
                au.is_verified
            FROM homonet.auth_user au
            WHERE au.subject_id IS NULL
            ORDER BY au.login
            """,
        )
        return list(await cur.fetchall())


async def _existing_subject_for_person(conn, person_id) -> Optional[str]:
    """Если у person уже есть subject — возвращает его id, иначе None.

    Используется для случая, когда auth_user.person_id заполнен,
    а auth_user.subject_id — нет, но subject уже существует
    (рассинхрон, который надо просто переподключить).
    """
    async with conn.cursor() as cur:
        await cur.execute(
            "SELECT subject_id FROM homonet.subject WHERE person_id = %s",
            (person_id,),
        )
        row = await cur.fetchone()
        return row["subject_id"] if row else None


async def _create_person(conn, display_name: str) -> str:
    async with conn.cursor() as cur:
        await cur.execute(
            """
            INSERT INTO homonet.person (display_name, status)
            VALUES (%s, 'draft')
            RETURNING person_id
            """,
            (display_name,),
        )
        row = await cur.fetchone()
        return row["person_id"]


async def _create_subject(conn, person_id: str, display_name: str) -> str:
    async with conn.cursor() as cur:
        await cur.execute(
            """
            INSERT INTO homonet.subject (subject_kind, person_id, display_name, status)
            VALUES ('personal', %s, %s, 'active')
            RETURNING subject_id
            """,
            (person_id, display_name),
        )
        row = await cur.fetchone()
        return row["subject_id"]


async def _link_auth_user(conn, user_id: str, person_id: str, subject_id: str) -> None:
    async with conn.cursor() as cur:
        await cur.execute(
            """
            UPDATE homonet.auth_user
            SET
                person_id  = %s,
                subject_id = %s,
                updated_at = now()
            WHERE user_id = %s
            """,
            (person_id, subject_id, user_id),
        )


async def _process_one(conn, au: dict, *, apply: bool) -> dict:
    """Идемпотентная обработка одного auth_user.

    Возвращает summary-словарь: что сделано (или что было бы сделано в dry-run).
    """
    login = au["login"]
    display_name = login  # draft, обновится позже через UI

    result = {
        "login": login,
        "user_id": str(au["user_id"]),
        "before": {
            "person_id": str(au["person_id"]) if au["person_id"] else None,
            "subject_id": None,
        },
        "actions": [],
        "after": {},
    }

    person_id = au["person_id"]

    if person_id is None:
        if apply:
            person_id = await _create_person(conn, display_name)
            result["actions"].append(f"created person {person_id}")
        else:
            result["actions"].append("WOULD create person")
    else:
        # есть person, проверим — нет ли уже subject для него
        existing_subj = await _existing_subject_for_person(conn, person_id)
        if existing_subj is not None:
            # рассинхрон: subject есть, но auth_user.subject_id не выставлен
            if apply:
                await _link_auth_user(conn, au["user_id"], person_id, existing_subj)
                result["actions"].append(
                    f"relinked auth_user → existing subject {existing_subj}"
                )
            else:
                result["actions"].append(
                    f"WOULD relink auth_user → existing subject {existing_subj}"
                )
            result["after"] = {
                "person_id": str(person_id),
                "subject_id": str(existing_subj),
            }
            return result

    # Создаём subject и связываем
    if apply:
        subject_id = await _create_subject(conn, person_id, display_name)
        await _link_auth_user(conn, au["user_id"], person_id, subject_id)
        result["actions"].append(f"created subject {subject_id}")
        result["actions"].append("linked auth_user")
        result["after"] = {
            "person_id": str(person_id),
            "subject_id": str(subject_id),
        }
    else:
        result["actions"].append("WOULD create subject + link auth_user")
        result["after"] = {
            "person_id": str(person_id) if person_id else "WOULD-BE-NEW",
            "subject_id": "WOULD-BE-NEW",
        }

    return result


async def run(*, apply: bool) -> int:
    await init_db_pool()
    try:
        async with get_conn() as conn:
            candidates = await _candidates(conn)
            print(f"Found {len(candidates)} auth_user(s) without subject_id\n")

            if not candidates:
                print("Nothing to do.")
                return 0

            for au in candidates:
                summary = await _process_one(conn, au, apply=apply)
                print(f"login={summary['login']}  user_id={summary['user_id']}")
                print(
                    "  before:"
                    f" person_id={summary['before']['person_id']}"
                    f" subject_id={summary['before']['subject_id']}"
                )
                for a in summary["actions"]:
                    print(f"  - {a}")
                print(
                    "  after:"
                    f" person_id={summary['after'].get('person_id')}"
                    f" subject_id={summary['after'].get('subject_id')}"
                )
                print()

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
