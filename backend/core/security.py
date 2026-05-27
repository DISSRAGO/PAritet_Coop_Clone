from datetime import datetime, timedelta, timezone
from typing import Any, Optional

import jwt
from fastapi import Header, HTTPException, status


ACCESS_SECRET = "access-secret"
REFRESH_SECRET = "refresh-secret"
ACCESS_EXPIRES_HOURS = 12
REFRESH_EXPIRES_DAYS = 30


def create_access_token(payload: dict[str, Any]) -> str:
    now = datetime.now(timezone.utc)
    data = {
        **payload,
        "iat": int(now.timestamp()),
        "exp": int((now + timedelta(hours=ACCESS_EXPIRES_HOURS)).timestamp()),
    }
    return jwt.encode(data, ACCESS_SECRET, algorithm="HS256")


def create_refresh_token(payload: dict[str, Any]) -> str:
    now = datetime.now(timezone.utc)
    data = {
        **payload,
        "iat": int(now.timestamp()),
        "exp": int((now + timedelta(days=REFRESH_EXPIRES_DAYS)).timestamp()),
    }
    return jwt.encode(data, REFRESH_SECRET, algorithm="HS256")


def decode_access_token(token: str) -> dict[str, Any]:
    try:
        return jwt.decode(token, ACCESS_SECRET, algorithms=["HS256"])
    except jwt.PyJWTError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid access token",
        ) from exc


def decode_refresh_token(token: str) -> dict[str, Any]:
    try:
        return jwt.decode(token, REFRESH_SECRET, algorithms=["HS256"])
    except jwt.PyJWTError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
        ) from exc


def extract_bearer_token(authorization: Optional[str]) -> str:
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization header required",
        )
    if not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authorization scheme",
        )
    return authorization[7:]


def bearer_token_dependency(
    authorization: Optional[str] = Header(default=None, alias="Authorization"),
) -> str:
    return extract_bearer_token(authorization)


def legacy_access_token(jwt_token: str) -> str:
    if len(jwt_token) < 148:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token too short for legacy access token extraction",
        )
    return jwt_token[105:148]