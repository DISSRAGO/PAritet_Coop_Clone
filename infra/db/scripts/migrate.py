from __future__ import annotations

import argparse
import hashlib
import os
import sys
from pathlib import Path

import psycopg

from db_env import get_database_url


MIGRATIONS_DIR = Path(__file__).resolve().parents[1] / "migrations"
LOCK_KEY = 415_978_211


def sha256_file(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def migration_files() -> list[Path]:
    return sorted(
        path
        for path in MIGRATIONS_DIR.iterdir()
        if path.is_file() and path.suffix.lower() == ".sql"
    )


def get_git_revision() -> str | None:
    return os.getenv("GIT_COMMIT_SHA") or os.getenv("GITHUB_SHA")


def ensure_migration_table(cur: psycopg.Cursor) -> None:
    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS homonet.schema_migrations (
            version text PRIMARY KEY,
            checksum text NOT NULL,
            applied_at timestamptz NOT NULL DEFAULT now(),
            git_revision text,
            applied_by text NOT NULL DEFAULT current_user
        )
        """
    )


def read_applied(cur: psycopg.Cursor) -> dict[str, str]:
    cur.execute(
        """
        SELECT version, checksum
        FROM homonet.schema_migrations
        ORDER BY version
        """
    )
    return dict(cur.fetchall())


def find_pending(
    migrations: list[Path],
    applied: dict[str, str],
) -> list[tuple[Path, str]]:
    pending: list[tuple[Path, str]] = []

    for path in migrations:
        checksum = sha256_file(path)
        recorded = applied.get(path.name)

        if recorded is None:
            pending.append((path, checksum))
        elif recorded != checksum:
            raise RuntimeError(
                f"Checksum mismatch for applied migration: {path.name}"
            )

    return pending


def apply_one(
    cur: psycopg.Cursor,
    path: Path,
    checksum: str,
    git_revision: str | None,
) -> None:
    sql = path.read_text(encoding="utf-8")
    if sql.strip():
        cur.execute(sql)

    cur.execute(
        """
        INSERT INTO homonet.schema_migrations (
            version,
            checksum,
            git_revision
        )
        VALUES (%s, %s, %s)
        """,
        (path.name, checksum, git_revision),
    )


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Apply append-only HomoNet PostgreSQL migrations."
    )
    parser.add_argument(
        "--database-url",
        help="Explicit DDL PostgreSQL URL. Defaults to DATABASE_DDL_URL.",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Show pending migrations without changing the database.",
    )
    args = parser.parse_args()

    migrations = migration_files()
    if not migrations:
        print("No SQL migrations found.", file=sys.stderr)
        return 1

    database_url = get_database_url(args.database_url)

    with psycopg.connect(database_url, autocommit=False) as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT pg_advisory_xact_lock(%s)", (LOCK_KEY,))

            if args.dry_run:
                cur.execute(
                    """
                    SELECT to_regclass('homonet.schema_migrations') IS NOT NULL
                    """
                )
                table_exists = bool(cur.fetchone()[0])

                if table_exists:
                    applied = read_applied(cur)
                else:
                    applied = {}

                pending = find_pending(migrations, applied)

                for path, _ in pending:
                    print(f"PENDING {path.name}")

                print(
                    f"Applied: {len(applied)}; "
                    f"pending: {len(pending)}"
                )
                conn.rollback()
                return 0

            ensure_migration_table(cur)
            applied = read_applied(cur)
            pending = find_pending(migrations, applied)

            for path, checksum in pending:
                apply_one(cur, path, checksum, get_git_revision())
                print(f"APPLIED {path.name}")

        conn.commit()

    print("Migration run completed.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())