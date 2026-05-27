import hashlib
import os
import secrets
import time

import jwt
from passlib.context import CryptContext


pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")

JWT_SECRET = os.getenv("JWT_SECRET", "dev-very-secret-change-me")
JWT_ALGORITHM = "HS256"
ACCESS_TTL_SECONDS = int(os.getenv("ACCESS_TTL_SECONDS", "43200"))
REFRESH_TTL_SECONDS = int(os.getenv("REFRESH_TTL_SECONDS", str(30 * 24 * 3600)))


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(password: str, password_hash: str) -> bool:
    return pwd_context.verify(password, password_hash)


def make_refresh_token() -> str:
    return secrets.token_urlsafe(48)


def hash_refresh_token(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def make_access_token(
    *,
    user_id: str,
    session_id: str,
    subject_id: str | None,
    roles: list[str],
    is_superuser: bool,
) -> str:
    now = int(time.time())
    payload = {
        "sub": user_id,
        "sid": session_id,
        "subject_id": subject_id,
        "roles": roles,
        "is_superuser": is_superuser,
        "iat": now,
        "exp": now + ACCESS_TTL_SECONDS,
        "type": "access",
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def decode_token(token: str) -> dict:
    return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])