from __future__ import annotations

import re
from typing import Optional

from fastapi import HTTPException, status
from psycopg.rows import dict_row

from backend.shared.db import get_conn
from backend.shared.schemas.auth import (
    ConfirmRequest,
    LoginResponse,
    SignUpRequest,
    create_access_token,
    create_refresh_token,
    decode_refresh_token,
)

PHONE_CLEAN_RE = re.compile(r"[^\d+]")


def normalize_email(email: Optional[str]) -> Optional[str]:
    if email is None:
        return None
    value = email.strip().lower()
    return value or None


def normalize_phone(phone: Optional[str]) -> Optional[str]:
    if phone is None:
        return None

    value = PHONE_CLEAN_RE.sub("", phone.strip())
    if not value:
        return None

    if value.startswith("8") and len(value) == 11:
        value = "+7" + value[1:]
    elif value.startswith("7") and len(value) == 11:
        value = "+" + value
    elif value.startswith("+") and len(value) >= 8:
        pass

    return value or None


class AuthService:
    def _fetch_one(self, query: str, *args):
        with get_conn() as conn:
            with conn.cursor(row_factory=dict_row) as cur:
                cur.execute(query, args)
                return cur.fetchone()

    def _fetch_value(self, query: str, *args):
        with get_conn() as conn:
            with conn.cursor() as cur:
                cur.execute(query, args)
                row = cur.fetchone()
                return row[0] if row else None

    def _execute(self, query: str, *args):
        with get_conn() as conn:
            with conn.cursor() as cur:
                cur.execute(query, args)

    def _get_user_by_login(self, login: str):
        return self._fetch_one(
            """
            SELECT
                id,
                login,
                email,
                phone,
                password_hash,
                is_active,
                is_superuser,
                is_verified
            FROM homonet.auth_user
            WHERE login = %s
            """,
            login.strip(),
        )

    def _find_duplicate_identity(
        self,
        login: str,
        email: Optional[str],
        phone: Optional[str],
    ):
        return self._fetch_one(
            """
            SELECT id, login, email, phone
            FROM homonet.auth_user
            WHERE login = %s
               OR (%s IS NOT NULL AND email = %s)
               OR (%s IS NOT NULL AND phone = %s)
            LIMIT 1
            """,
            login.strip(),
            email,
            email,
            phone,
            phone,
        )

    async def login(self, login: str, password: str) -> LoginResponse:
        if not login or not password:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Login and password are required",
            )

        row = self._get_user_by_login(login)
        if not row:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials",
            )

        if not row["is_active"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User is inactive",
            )

        if not row["is_verified"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Registration is not confirmed",
            )

        if row["password_hash"] != password:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials",
            )

        access_token = create_access_token({"id": row["id"], "login": row["login"]})
        refresh_token = create_refresh_token({"id": row["id"], "login": row["login"]})

        return LoginResponse(accessToken=access_token, refreshToken=refresh_token)

    async def logout(self, token: str) -> dict:
        return {"status": "ok"}

    async def refresh(self, refresh_token: str) -> LoginResponse:
        payload = decode_refresh_token(refresh_token)
        access_token = create_access_token(
            {"id": payload.get("id"), "login": payload.get("login")}
        )
        new_refresh_token = create_refresh_token(
            {"id": payload.get("id"), "login": payload.get("login")}
        )
        return LoginResponse(
            accessToken=access_token,
            refreshToken=new_refresh_token,
        )

    async def signup(self, dto: SignUpRequest) -> dict:

        login = dto.login.strip()
        email = normalize_email(getattr(dto, "email", None))
        phone = normalize_phone(getattr(dto, "phone", None))

        if not login:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Login is required",
            )

        duplicate = self._find_duplicate_identity(login, email, phone)
        if duplicate:
            if duplicate["login"] == login:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Login already exists",
                )
            if email and duplicate["email"] == email:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Email already exists",
                )
            if phone and duplicate["phone"] == phone:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Phone already exists",
                )

        self._execute(
            """
            INSERT INTO homonet.auth_user
                (login, email, phone, password_hash, is_active, is_superuser, is_verified)
            VALUES
                (%s, %s, %s, %s, TRUE, FALSE, FALSE)
            """,
            login,
            email,
            phone,
            dto.password,
        )

        return {
            "message": f"Registration request accepted for {login}",
            "login": login,
            "email": email,
            "phone": phone,
        }

    async def signup_confirm(self, dto: ConfirmRequest) -> dict:
        login = getattr(dto, "Login", None) or getattr(dto, "login", None)
        if not login:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Login is required",
            )

        exists = self._fetch_value(
            """
            SELECT 1
            FROM homonet.auth_user
            WHERE login = %s
            """,
            login,
        )
        if not exists:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found",
            )

        self._execute(
            """
            UPDATE homonet.auth_user
            SET is_verified = TRUE
            WHERE login = %s
            """,
            login,
        )

        return {"message": f"Registration confirmed for {login}"}

    async def validate_login(self, login: str) -> dict:
        if not login:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Login is required",
            )

        exists = self._fetch_value(
            """
            SELECT 1
            FROM homonet.auth_user
            WHERE login = %s
            """,
            login.strip(),
        )

        return {"valid": not bool(exists), "message": "ok"}

    async def validate_email(self, email: str) -> dict:
        if not email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email is required",
            )

        normalized = normalize_email(email)
        exists = self._fetch_value(
            """
            SELECT 1
            FROM homonet.auth_user
            WHERE email = %s
            """,
            normalized,
        )

        return {"valid": not bool(exists), "message": "ok"}

    async def validate_phone(self, phone: str) -> dict:
        if not phone:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Phone is required",
            )

        normalized = normalize_phone(phone)
        exists = self._fetch_value(
            """
            SELECT 1
            FROM homonet.auth_user
            WHERE phone = %s
            """,
            normalized,
        )

        return {"valid": not bool(exists), "message": "ok"}