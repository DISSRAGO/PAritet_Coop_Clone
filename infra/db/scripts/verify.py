from __future__ import annotations

import argparse
import sys

import psycopg

from db_env import get_database_url


REQUIRED_TABLES = {
    "auth_user",
    "author",
    "avatar",
    "community",
    "klon",
    "person",
    "platform",
    "subject",
    "thanka",
}


def scalar(cur: psycopg.Cursor, sql: str, params: tuple = ()) -> object:
    cur.execute(sql, params)
    row = cur.fetchone()
    return row[0] if row else None


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Verify essential HomoNet database structure."
    )
    parser.add_argument(
        "--database-url",
        help="Explicit PostgreSQL URL. Defaults to DATABASE_DDL_URL.",
    )
    parser.add_argument(
        "--require-system-state",
        action="store_true",
        help="Fail when platform, klon, system ADMIN, or root thanka is absent.",
    )
    args = parser.parse_args()

    database_url = get_database_url(args.database_url)
    failures: list[str] = []

    with psycopg.connect(database_url, autocommit=True) as conn:
        with conn.cursor() as cur:
            schema_exists = scalar(
                cur,
                """
                SELECT EXISTS (
                    SELECT 1
                    FROM information_schema.schemata
                    WHERE schema_name = 'homonet'
                )
                """,
            )
            if not schema_exists:
                failures.append("Schema homonet is missing.")
            else:
                cur.execute(
                    """
                    SELECT table_name
                    FROM information_schema.tables
                    WHERE table_schema = 'homonet'
                      AND table_type = 'BASE TABLE'
                    """
                )
                tables = {row[0] for row in cur.fetchall()}
                missing = sorted(REQUIRED_TABLES - tables)
                if missing:
                    failures.append("Missing tables: " + ", ".join(missing))

                print(f"homonet base tables: {len(tables)}")

                app_usage = scalar(
                    cur,
                    """
                    SELECT has_schema_privilege(
                        'homonet_app_auth', 'homonet', 'USAGE'
                    )
                    """,
                )
                if not app_usage:
                    failures.append(
                        "homonet_app_auth has no USAGE privilege on homonet."
                    )

                if "auth_user" in tables:
                    app_select = scalar(
                        cur,
                        """
                        SELECT has_table_privilege(
                            'homonet_app_auth',
                            'homonet.auth_user',
                            'SELECT'
                        )
                        """,
                    )
                    if not app_select:
                        failures.append(
                            "homonet_app_auth has no SELECT on auth_user."
                        )

                if args.require_system_state:
                    checks = {
                        "platform": "SELECT count(*) FROM homonet.platform",
                        "klon": "SELECT count(*) FROM homonet.klon",
                        "system ADMIN": """
                            SELECT count(*)
                            FROM homonet.auth_user
                            WHERE lower(login::text) = 'admin'
                              AND is_superuser
                        """,
                        "root thanka": """
                            SELECT count(*)
                            FROM homonet.thanka
                            WHERE thanka_id =
                              '00000000-0000-0000-0000-000000000010'::uuid
                        """,
                    }
                    for name, query in checks.items():
                        if int(scalar(cur, query) or 0) < 1:
                            failures.append(
                                f"Required system state is absent: {name}"
                            )

    if failures:
        for failure in failures:
            print(f"FAIL: {failure}", file=sys.stderr)
        return 1

    print("OK: HomoNet database verification passed.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
