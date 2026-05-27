from backend.shared.db import get_conn
from backend.shared.security import hash_password

LOGIN = "admin"
EMAIL = "admin@example.local"
PHONE = "+70000000000"
PASSWORD = "ChangeMe123!"
DISPLAY_NAME = "System Admin"


with get_conn() as conn, conn.cursor() as cur:
    cur.execute(
        "SELECT user_id FROM homonet.auth_user WHERE login = %s",
        (LOGIN,),
    )
    if cur.fetchone():
        print("Admin already exists:", LOGIN)
        raise SystemExit(0)

    cur.execute(
        """
        INSERT INTO homonet.person (display_name, status)
        VALUES (%s, 'active')
        RETURNING person_id
        """,
        (DISPLAY_NAME,),
    )
    person_id = cur.fetchone()[0]

    cur.execute(
        """
        INSERT INTO homonet.person_profile (person_id, phone, email)
        VALUES (%s, %s, %s)
        """,
        (person_id, PHONE, EMAIL),
    )

    cur.execute(
        """
        INSERT INTO homonet.subject (subject_kind, person_id, display_name, status)
        VALUES ('personal', %s, %s, 'active')
        RETURNING subject_id
        """,
        (person_id, DISPLAY_NAME),
    )
    subject_id = cur.fetchone()[0]

    cur.execute(
        """
        INSERT INTO homonet.author (subject_id, display_name)
        VALUES (%s, %s)
        RETURNING author_id
        """,
        (subject_id, DISPLAY_NAME),
    )
    author_id = cur.fetchone()[0]

    cur.execute(
        """
        INSERT INTO homonet.auth_user (
            person_id, subject_id, author_id,
            login, email, phone, password_hash,
            is_active, is_superuser, is_verified
        )
        VALUES (%s, %s, %s, %s, %s, %s, %s, true, true, true)
        RETURNING user_id
        """,
        (
            person_id,
            subject_id,
            author_id,
            LOGIN,
            EMAIL,
            PHONE,
            hash_password(PASSWORD),
        ),
    )
    user_id = cur.fetchone()[0]

    conn.commit()

print("Admin created:", LOGIN, "user_id=", user_id, "subject_id=", subject_id)