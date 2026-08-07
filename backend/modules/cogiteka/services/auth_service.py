from __future__ import annotations

import os
import re
from typing import Optional

from fastapi import HTTPException, status

from backend.modules.homonet.domains.subject.schemas import CreatePersonalSubjectRequest
from backend.modules.homonet.domains.subject.service import SubjectService
from backend.shared.db import get_conn
from backend.shared.schemas.auth import (
    ConfirmRequest,
    LoginResponse,
    SignUpRequest,
    create_access_token,
    create_refresh_token,
    decode_refresh_token,
)
from backend.shared.security import hash_password, verify_password


PHONE_CLEAN_RE = re.compile(r"[^\d+]")
_HASH_PREFIX = "$pbkdf2-sha256$"
REQUIRE_EMAIL_VERIFICATION = os.getenv("HOMONET_REQUIRE_EMAIL_VERIFICATION", "0").strip() == "1"


def _is_hashed(value: str | None) -> bool:
    return bool(value) and value.startswith(_HASH_PREFIX)


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

    return value or None


class AuthService:
    async def _fetch_one(self, query: str, *args):
        async with get_conn() as conn:
            async with conn.cursor() as cur:
                await cur.execute(query, args)
                return await cur.fetchone()

    async def _fetch_value(self, query: str, *args):
        async with get_conn() as conn:
            async with conn.cursor() as cur:
                await cur.execute(query, args)
                row = await cur.fetchone()
                if row is None:
                    return None
                return list(row.values())[0]

    async def signup(self, dto: SignUpRequest) -> dict:
        login = dto.login.strip()
        email = normalize_email(getattr(dto, "email", None))
        phone = normalize_phone(getattr(dto, "phone", None))

        if not login:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Login is required",
            )

        conditions = ["login = %s"]
        params = [login]

        if email is not None:
            conditions.append("email = %s")
            params.append(email)

        if phone is not None:
            conditions.append("phone = %s")
            params.append(phone)

        duplicate = await self._fetch_one(
            f"""
            SELECT
                user_id,
                login,
                email,
                phone
            FROM homonet.auth_user
            WHERE {" OR ".join(conditions)}
            LIMIT 1
            """,
            *params,
        )

        if duplicate:
            if str(duplicate["login"]).lower() == login.lower():
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Login already exists",
                )
            if email and duplicate["email"] and str(duplicate["email"]).lower() == email.lower():
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Email already exists",
                )
            if phone and duplicate["phone"] == phone:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Phone already exists",
                )

        async with get_conn() as conn:
            async with conn.cursor() as cur:
                await cur.execute(
                    """
                    INSERT INTO homonet.auth_user
                        (login, email, phone, password_hash, is_active, is_superuser, is_verified, is_confirmed)
                    VALUES
                        (%s, %s, %s, %s, TRUE, FALSE, FALSE, FALSE)
                    RETURNING user_id, login, email, phone
                    """,
                    (
                        login,
                        email,
                        phone,
                        hash_password(dto.password),
                    ),
                )
                row = await cur.fetchone()

        return {
            "message": f"Registration request accepted for {row['login']}",
            "userId": str(row["user_id"]),
            "login": str(row["login"]),
            "email": row["email"],
            "phone": row["phone"],
        }

    async def signup_confirm(self, dto: ConfirmRequest) -> dict:
        login = (getattr(dto, "Login", None) or getattr(dto, "login", None) or "").strip()
        if not login:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Login is required",
            )

        auth_user = await self._fetch_one(
            """
            SELECT
                user_id,
                login,
                person_id,
                subject_id,
                is_active,
                is_verified
            FROM homonet.auth_user
            WHERE login = %s
            """,
            login,
        )

        if not auth_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found",
            )

        async with get_conn() as conn:
            async with conn.cursor() as cur:
                await cur.execute(
                    """
                    UPDATE homonet.auth_user
                    SET
                        is_verified = TRUE,
                        is_confirmed = TRUE,
                        updated_at = now()
                    WHERE login = %s
                    RETURNING user_id, login
                    """,
                    (login,),
                )
                row = await cur.fetchone()

        if not row:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found",
            )

        fresh_user = await self._fetch_one(
            """
            SELECT
                user_id,
                login,
                person_id,
                subject_id
            FROM homonet.auth_user
            WHERE login = %s
            """,
            login,
        )

        if fresh_user and fresh_user["subject_id"] is None:
            surname = (
                getattr(dto, "Surname", None)
                or getattr(dto, "surname", None)
                or login
            ).strip()
            first_name = (
                getattr(dto, "FirstName", None)
                or getattr(dto, "firstName", None)
                or login
            ).strip()
            second_name = (
                getattr(dto, "SecondName", None)
                or getattr(dto, "secondName", None)
                or None
            )

            subject_service = SubjectService()
            try:
                await subject_service.create_personal_subject(
                    CreatePersonalSubjectRequest(
                        authUserLogin=login,
                        surname=surname or login,
                        firstName=first_name or login,
                        secondName=second_name.strip() if isinstance(second_name, str) and second_name.strip() else None,
                    )
                )
            except HTTPException as exc:
                if exc.status_code != status.HTTP_409_CONFLICT:
                    raise

        return {"message": f"Registration confirmed for {row['login']}"}

    async def login(self, login: str, password: str) -> LoginResponse:
        if not login or not password:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Login and password are required",
            )

        row = await self._fetch_one(
            """
            SELECT
                user_id,
                login,
                password_hash,
                is_active,
                is_verified,
                subject_id
            FROM homonet.auth_user
            WHERE LOWER(login) = LOWER(%s)
            """,
            login.strip(),
        )

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

        if REQUIRE_EMAIL_VERIFICATION:
            subject_id = row.get("subject_id")
            if not subject_id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Email is not verified",
                )

            subject_row = await self._fetch_one(
                """
                SELECT
                    email_verification_status::text AS email_verification_status
                FROM homonet.subject
                WHERE subject_id = %s
                """,
                subject_id,
            )

            if not subject_row or subject_row["email_verification_status"] != "verified":
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Email is not verified",
                )
        else:
            if not row["is_verified"]:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Registration is not confirmed",
                )

        stored = row["password_hash"] or ""
        password_ok = False
        needs_rehash = False

        if _is_hashed(stored):
            try:
                password_ok = verify_password(password, stored)
            except Exception:
                password_ok = False
        else:
            password_ok = stored == password
            needs_rehash = password_ok

        if not password_ok:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials",
            )

        if needs_rehash:
            new_hash = hash_password(password)
            async with get_conn() as conn:
                async with conn.cursor() as cur:
                    await cur.execute(
                        "UPDATE homonet.auth_user SET password_hash = %s, updated_at = now() WHERE user_id = %s",
                        (new_hash, row["user_id"]),
                    )

        access_token = create_access_token(
            {"user_id": str(row["user_id"]), "login": str(row["login"])}
        )
        refresh_token = create_refresh_token(
            {"user_id": str(row["user_id"]), "login": str(row["login"])}
        )

        return LoginResponse(
            accessToken=access_token,
            refreshToken=refresh_token,
        )

    async def logout(self, token: str) -> dict:
        return {"status": "ok"}

    async def refresh(self, refresh_token: str) -> LoginResponse:
        payload = decode_refresh_token(refresh_token)

        access_token = create_access_token(
            {"user_id": payload.get("user_id"), "login": payload.get("login")}
        )
        new_refresh_token = create_refresh_token(
            {"user_id": payload.get("user_id"), "login": payload.get("login")}
        )

        return LoginResponse(
            accessToken=access_token,
            refreshToken=new_refresh_token,
        )

    async def validate_login(self, login: str) -> dict:
        if not login:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Login is required",
            )

        exists = await self._fetch_value(
            "SELECT 1 FROM homonet.auth_user WHERE login = %s",
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
        exists = await self._fetch_value(
            "SELECT 1 FROM homonet.auth_user WHERE email = %s",
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
        exists = await self._fetch_value(
            "SELECT 1 FROM homonet.auth_user WHERE phone = %s",
            normalized,
        )
        return {"valid": not bool(exists), "message": "ok"}