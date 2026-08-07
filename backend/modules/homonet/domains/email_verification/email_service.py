from __future__ import annotations

import hashlib
import random
import string
from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi import HTTPException, status

from backend.shared.db import get_conn
from backend.modules.homonet.domains.email_verification.email_schemas import (
    RequestEmailCode,
    EmailCodeRequestResponse,
    ConfirmEmailCodeRequest,
    ConfirmEmailCodeResponse,
    EmailVerificationMeta,
)

from backend.shared.mail import send_email_verification_code

class EmailVerificationService:
    CODE_TTL_MINUTES = 15
    RESEND_COOLDOWN_MINUTES = 5
    MAX_ATTEMPTS = 5
    CODE_LENGTH = 6

    async def fetch_one(self, query: str, args: tuple | None = None) -> Optional[dict]:
        async with get_conn() as conn:
            async with conn.cursor() as cur:
                await cur.execute(query, args or ())
                return await cur.fetchone()

    async def fetch_all(self, query: str, args: tuple | None = None) -> list[dict]:
        async with get_conn() as conn:
            async with conn.cursor() as cur:
                await cur.execute(query, args or ())
                return await cur.fetchall()

    async def ensure_subject(self, subject_id: str) -> dict:
        row = await self.fetch_one(
            """
            SELECT
                s.subject_id::text AS subject_id,
                s.subject_kind::text AS subject_kind,
                s.person_id::text AS person_id,
                s.display_name AS display_name,
                s.status::text AS status,
                s.email_verification_status::text AS email_verification_status,
                s.email_verified_at,
                s.email_verification_last_sent_at
            FROM homonet.subject s
            WHERE s.subject_id = %s::uuid
            """,
            (subject_id,),
        )
        if not row:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Subject {subject_id} not found",
            )
        return row

    async def fetch_subject_email(self, subject_id: str) -> str:
        row = await self.fetch_one(
            """
            SELECT
                COALESCE(
                    NULLIF(pp.email, ''),
                    NULLIF(au.email, '')
                )::text AS email
            FROM homonet.subject s
            LEFT JOIN homonet.person p
                ON p.person_id = s.person_id
            LEFT JOIN homonet.person_profile pp
                ON pp.person_id = p.person_id
            LEFT JOIN homonet.auth_user au
                ON au.subject_id = s.subject_id
            WHERE s.subject_id = %s::uuid
            """,
            (subject_id,),
        )
        email = (row or {}).get("email")
        if not email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="email_not_set",
            )
        return str(email).strip()

    
    @staticmethod
    def generate_code(length: int = 6) -> str:
        return "".join(random.choice(string.digits) for _ in range(length))

    @staticmethod
    def hash_code(code: str) -> str:
        return hashlib.sha256(code.encode("utf-8")).hexdigest()

    @staticmethod
    def utcnow() -> datetime:
        return datetime.now(timezone.utc)

    async def request_code(self, payload: RequestEmailCode) -> EmailCodeRequestResponse:
        subject_id = payload.actorSubjectId.strip()

        subject = await self.ensure_subject(subject_id)
        email = await self.fetch_subject_email(subject_id)

        if subject.get("email_verification_status") == "verified":
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="email_already_verified",
            )

        now = self.utcnow()
        cooldown_border = now - timedelta(minutes=self.RESEND_COOLDOWN_MINUTES)

        last_sent_at = subject.get("email_verification_last_sent_at")
        if last_sent_at and last_sent_at > cooldown_border:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="too_many_requests",
            )

        code = self.generate_code(self.CODE_LENGTH)
        code_hash = self.hash_code(code)
        expires_at = now + timedelta(minutes=self.CODE_TTL_MINUTES)

        async with get_conn() as conn:
            async with conn.cursor() as cur:
                await cur.execute(
                    """
                    UPDATE homonet.subject_email_code_verification
                    SET status = 'revoked'::homonet.email_verification_status_enum,
                        revoked_at = %s
                    WHERE subject_id = %s::uuid
                      AND status = 'pending'::homonet.email_verification_status_enum
                    """,
                    (now, subject_id),
                )

                await cur.execute(
                    """
                    INSERT INTO homonet.subject_email_code_verification (
                        subject_id,
                        code_hash,
                        status,
                        sent_at,
                        expires_at,
                        attempts
                    )
                    VALUES (
                        %s::uuid,
                        %s,
                        'pending'::homonet.email_verification_status_enum,
                        %s,
                        %s,
                        0
                    )
                    RETURNING verification_id::text AS verification_id
                    """,
                    (subject_id, code_hash, now, expires_at),
                )
                await cur.fetchone()

                await cur.execute(
                    """
                    UPDATE homonet.subject
                    SET email_verification_status = 'pending'::homonet.email_verification_status_enum,
                        email_verification_last_sent_at = %s
                    WHERE subject_id = %s::uuid
                    """,
                    (now, subject_id),
                )

        # TODO: заменить на реальную интеграцию письма
        try:
            send_email_verification_code(email, code)
        except Exception as exc:
            print("ERROR sending email verification code", {
                "email": email,
                "subject_id": subject_id,
                "error": str(exc),
            })
            raise
        
        return EmailCodeRequestResponse(
            subjectId=subject_id,
            status="pending",
            email=email,
            sentAt=now,
            expiresAt=expires_at,
        )

    async def confirm_code(self, payload: ConfirmEmailCodeRequest) -> ConfirmEmailCodeResponse:
        subject_id = payload.actorSubjectId.strip()
        code = payload.code.strip()

        if not code:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="code_required",
            )

        await self.ensure_subject(subject_id)
        email = await self.fetch_subject_email(subject_id)

        now = self.utcnow()
        actual_hash = self.hash_code(code)

        row = await self.fetch_one(
            """
            SELECT
                verification_id::text AS verification_id,
                subject_id::text AS subject_id,
                code_hash,
                status::text AS status,
                sent_at,
                expires_at,
                confirmed_at,
                revoked_at,
                attempts
            FROM homonet.subject_email_code_verification
            WHERE subject_id = %s::uuid
              AND status = 'pending'::homonet.email_verification_status_enum
            ORDER BY sent_at DESC
            LIMIT 1
            """,
            (subject_id,),
        )

        if not row:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="code_not_found",
            )

        if row["expires_at"] < now:
            async with get_conn() as conn:
                async with conn.cursor() as cur:
                    await cur.execute(
                        """
                        UPDATE homonet.subject_email_code_verification
                        SET status = 'revoked'::homonet.email_verification_status_enum,
                            revoked_at = %s
                        WHERE verification_id = %s::uuid
                        """,
                        (now, row["verification_id"]),
                    )
            raise HTTPException(
                status_code=status.HTTP_410_GONE,
                detail="code_expired",
            )

        attempts = int(row.get("attempts") or 0)
        if attempts >= self.MAX_ATTEMPTS:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="too_many_attempts",
            )

        async with get_conn() as conn:
            async with conn.cursor() as cur:
                await cur.execute(
                    """
                    UPDATE homonet.subject_email_code_verification
                    SET attempts = attempts + 1
                    WHERE verification_id = %s::uuid
                    """,
                    (row["verification_id"],),
                )

        if actual_hash != row["code_hash"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="invalid_code",
            )

        async with get_conn() as conn:
            async with conn.cursor() as cur:
                await cur.execute(
                    """
                    UPDATE homonet.subject_email_code_verification
                    SET status = 'verified'::homonet.email_verification_status_enum,
                        confirmed_at = %s
                    WHERE verification_id = %s::uuid
                    """,
                    (now, row["verification_id"]),
                )

                await cur.execute(
                    """
                    UPDATE homonet.subject_email_code_verification
                    SET status = 'revoked'::homonet.email_verification_status_enum,
                        revoked_at = %s
                    WHERE subject_id = %s::uuid
                      AND status = 'pending'::homonet.email_verification_status_enum
                      AND verification_id <> %s::uuid
                    """,
                    (now, subject_id, row["verification_id"]),
                )

                await cur.execute(
                    """
                    UPDATE homonet.subject
                    SET email_verification_status = 'verified'::homonet.email_verification_status_enum,
                        email_verified_at = %s
                    WHERE subject_id = %s::uuid
                    """,
                    (now, subject_id),
                )

        return ConfirmEmailCodeResponse(
            subjectId=subject_id,
            status="verified",
            email=email,
            verifiedAt=now,
        )

    def build_meta(self) -> EmailVerificationMeta:
        return EmailVerificationMeta(
            attempts=0,
            maxAttempts=self.MAX_ATTEMPTS,
            ttlMinutes=self.CODE_TTL_MINUTES,
            resendCooldownMinutes=self.RESEND_COOLDOWN_MINUTES,
        )