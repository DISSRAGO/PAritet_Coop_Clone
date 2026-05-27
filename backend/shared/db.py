import os
from contextlib import contextmanager

import psycopg

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres:postgres@127.0.0.1:5432/homonet_v051_test",
)


@contextmanager
def get_conn():
    with psycopg.connect(DATABASE_URL, autocommit=False) as conn:
        with conn.cursor() as cur:
            cur.execute("SET search_path TO homonet, public;")
        yield conn