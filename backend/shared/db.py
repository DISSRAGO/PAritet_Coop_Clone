import os
from contextlib import asynccontextmanager
from pathlib import Path

from dotenv import load_dotenv
from psycopg.rows import dict_row
from psycopg_pool import AsyncConnectionPool

ROOT_DIR = Path(__file__).resolve().parents[2]
ENV_FILE = ROOT_DIR / ".env"
load_dotenv(dotenv_path=ENV_FILE)

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://homonet_app_auth:CHANGE_ME_APP_STRONG@127.0.0.1:5432/homonet_v051_test",
)

db_pool: AsyncConnectionPool | None = None


async def init_db_pool() -> None:
    global db_pool
    if db_pool is None:
        db_pool = AsyncConnectionPool(
            conninfo=DATABASE_URL,
            min_size=1,
            max_size=20,
            open=False,
            kwargs={
                "autocommit": False,
                "row_factory": dict_row,
            },
        )
        await db_pool.open()
        await db_pool.wait()


async def close_db_pool() -> None:
    global db_pool
    if db_pool is not None:
        await db_pool.close()
        db_pool = None


def get_pool() -> AsyncConnectionPool:
    if db_pool is None:
        raise RuntimeError("Database pool is not initialized")
    return db_pool


@asynccontextmanager
async def get_conn():
    pool = get_pool()
    async with pool.connection() as conn:
        async with conn.cursor() as cur:
            await cur.execute("SET search_path TO homonet, public;")
        try:
            yield conn
            await conn.commit()
        except Exception:
            await conn.rollback()
            raise