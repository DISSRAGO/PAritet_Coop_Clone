"""
Seed: системная тханка-корень.
Запуск: cd /srv/clone && python -m backend.modules.homonet.migrations.seed_system_admin
"""
import os
from pathlib import Path
from dotenv import load_dotenv
import psycopg
from psycopg.rows import dict_row
from backend.shared.security import hash_password

ROOT_DIR = Path(__file__).resolve().parents[4]
load_dotenv(dotenv_path=ROOT_DIR / ".env")

DATABASE_URL = os.getenv("DATABASE_URL")

ADMIN_LOGIN    = "ADMIN"
ADMIN_PASSWORD = "REMOVED_ADMIN_PASSWORD"
ADMIN_EMAIL    = "admin@system.local"
ADMIN_DISPLAY  = "Системный администратор"
THANKA_ID      = "00000000-0000-0000-0000-000000000010"

pw_hash = hash_password(ADMIN_PASSWORD)

with psycopg.connect(DATABASE_URL, row_factory=dict_row) as conn:
    with conn.cursor() as cur:
        cur.execute("SET search_path TO homonet, public;")

        # Ищем существующего ADMIN
        cur.execute("""
            SELECT u.user_id, u.author_id, u.subject_id, u.person_id
            FROM homonet.auth_user u
            WHERE u.login = %s
        """, (ADMIN_LOGIN,))
        existing = cur.fetchone()

        if existing:
            author_id = existing["author_id"]
            print(f"ℹ️  Пользователь {ADMIN_LOGIN} уже существует, author_id={author_id}")
        else:
            # Создаём всю цепочку с нуля
            cur.execute("""
                INSERT INTO homonet.person (display_name, status)
                VALUES (%s, 'active') RETURNING person_id
            """, (ADMIN_DISPLAY,))
            person_id = cur.fetchone()["person_id"]

            cur.execute("SELECT klon_id FROM homonet.klon LIMIT 1")
            klon_row = cur.fetchone()
            if not klon_row:
                print("❌ Таблица klon пуста.")
                raise SystemExit(1)

            cur.execute("""
                INSERT INTO homonet.community
                    (home_klon_id, community_type, name, status)
                VALUES (%s, 'INFO', 'Системная инфоша', 'active')
                RETURNING community_id
            """, (klon_row["klon_id"],))
            community_id = cur.fetchone()["community_id"]

            cur.execute("""
                INSERT INTO homonet.subject
                    (subject_kind, community_id, display_name, status)
                VALUES ('collective', %s, %s, 'active')
                RETURNING subject_id
            """, (community_id, ADMIN_DISPLAY))
            subject_id = cur.fetchone()["subject_id"]

            cur.execute("""
                INSERT INTO homonet.author (subject_id, display_name)
                VALUES (%s, %s) RETURNING author_id
            """, (subject_id, ADMIN_DISPLAY))
            author_id = cur.fetchone()["author_id"]

            cur.execute("""
                INSERT INTO homonet.auth_user
                    (person_id, subject_id, author_id,
                     login, email, password_hash,
                     is_active, is_superuser, is_verified, is_confirmed)
                VALUES (%s, %s, %s, %s, %s, %s, true, true, true, true)
            """, (person_id, subject_id, author_id,
                  ADMIN_LOGIN, ADMIN_EMAIL, pw_hash))
            print(f"✅ auth_user создан: {ADMIN_LOGIN}")

        # Системная тханка — используем реальный author_id
        cur.execute("""
            INSERT INTO homonet.thanka
                (thanka_id, author_id, title, status, is_system, parent_id, sort_order)
            VALUES (%s::uuid, %s, 'Главная страница', 'active', true, NULL, 0)
            ON CONFLICT (thanka_id) DO NOTHING
        """, (THANKA_ID, author_id))

        conn.commit()

print(f"✅ Готово.")
print(f"   Логин:    {ADMIN_LOGIN}")
print(f"   Пароль:   {ADMIN_PASSWORD}")
print(f"   ThankaId: {THANKA_ID}")
