from __future__ import annotations

import os
from pathlib import Path

from dotenv import load_dotenv

REPOSITORY_ROOT = Path(__file__).resolve().parents[3]


def load_repository_env() -> None:
    load_dotenv(REPOSITORY_ROOT / ".env", override=False)


def get_database_url(explicit_url: str | None = None) -> str:
    load_repository_env()
    database_url = explicit_url or os.getenv("DATABASE_DDL_URL", "").strip()
    if not database_url:
        raise RuntimeError(
            "DATABASE_DDL_URL is required and must use the schema-owner role."
        )
    return database_url
