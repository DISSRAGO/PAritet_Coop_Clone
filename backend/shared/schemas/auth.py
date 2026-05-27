from datetime import datetime, timedelta, timezone
from typing import Optional

import jwt
from fastapi import HTTPException, status
from pydantic import BaseModel

JWT_SECRET = "dev-secret-key"
JWT_ALGORITHM = "HS256"
ACCESS_TTL_SECONDS = 60 * 60 * 12
REFRESH_TTL_SECONDS = 60 * 60 * 24 * 30


class LoginRequest(BaseModel):
    login: str
    password: str


class LoginResponse(BaseModel):
    accessToken: str
    refreshToken: str


class RefreshRequest(BaseModel):
    refreshToken: str


class ValidateLoginRequest(BaseModel):
    login: str


class ValidateEmailRequest(BaseModel):
    email: str


class ValidatePhoneRequest(BaseModel):
    phone: str


class SignUpRequest(BaseModel):
    surname: str
    firstName: str
    secondName: Optional[str] = ""
    login: str
    phone: str
    addressId: int
    password: str
    restorePassword: str
    email: str


class ConfirmRequest(BaseModel):
    Login: str
    Password: str
    Surname: str
    FirstName: str
    SecondName: Optional[str] = ""
    Phone: str
    Email: str
    address: str
    ActivationRequestId: str
    ActivationCode: str


def _make_token(payload: dict, ttl_seconds: int, token_type: str) -> str:
    now = datetime.now(timezone.utc)
    data = payload.copy()
    data.update(
        {
            "iat": int(now.timestamp()),
            "exp": int((now + timedelta(seconds=ttl_seconds)).timestamp()),
            "type": token_type,
        }
    )
    return jwt.encode(data, JWT_SECRET, algorithm=JWT_ALGORITHM)


def create_access_token(payload: dict) -> str:
    return _make_token(payload, ACCESS_TTL_SECONDS, "access")


def create_refresh_token(payload: dict) -> str:
    return _make_token(payload, REFRESH_TTL_SECONDS, "refresh")


def decode_refresh_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
        )

    if payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token type",
        )

    return payload