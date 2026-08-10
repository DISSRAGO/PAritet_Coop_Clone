from __future__ import annotations

from typing import Optional

from fastapi import HTTPException, status

from backend.shared.db import get_conn
from .schemas import (
    GuarantorInfo,
    GuarantorResponse,
    GuaranteedSubjectItem,
    GuaranteedSubjectsResponse,
    RequestGuarantorRequest,
    ConfirmGuarantorRequest,
    RejectGuarantorRequest,
)


class GuarantorService:
    @staticmethod
    def _fmt(val) -> Optional[str]:
        if val is None:
            return None
        return val.isoformat() if hasattr(val, "isoformat") else str(val)

    async def _fetch_one(self, query: str, *args) -> Optional[dict]:
        async with get_conn() as conn:
            async with conn.cursor() as cur:
                await cur.execute(query, args)
                return await cur.fetchone()

    async def _fetch_all(self, query: str, *args) -> list[dict]:
        async with get_conn() as conn:
            async with conn.cursor() as cur:
                await cur.execute(query, args)
                return await cur.fetchall()

    async def _ensure_subject(self, subject_id: str) -> dict:
        row = await self._fetch_one(
            """
            SELECT subject_id::text AS subject_id, display_name
            FROM homonet.subject
            WHERE subject_id = %s
            """,
            subject_id,
        )
        if not row:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Subject {subject_id} not found",
            )
        return row

    async def _resolve_subject_by_login_or_email(self, login_or_email: str) -> dict:
        row = await self._fetch_one(
            """
            SELECT
                au.subject_id::text AS subject_id,
                s.display_name
            FROM homonet.auth_user au
            JOIN homonet.subject s
              ON s.subject_id = au.subject_id
            WHERE au.login = %s
               OR au.email = %s
            LIMIT 1
            """,
            login_or_email,
            login_or_email,
        )
        if not row:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"User with login/email '{login_or_email}' not found",
            )
        return row

    async def get_guarantor(self, subject_id: str) -> GuarantorResponse:
        await self._ensure_subject(subject_id)

        row = await self._fetch_one(
            """
            SELECT
                sg.subject_id::text AS subject_id,
                sg.guarantor_subject_id::text AS guarantor_subject_id,
                gs.display_name AS guarantor_display_name,
                sg.status,
                sg.is_default,
                sg.requested_at,
                sg.confirmed_at,
                sg.rejected_at,
                sg.revoked_at
            FROM homonet.subject_guarantor sg
            JOIN homonet.subject gs
              ON gs.subject_id = sg.guarantor_subject_id
            WHERE sg.subject_id = %s
              AND sg.status IN ('pending', 'confirmed')
            ORDER BY
                CASE WHEN sg.status = 'confirmed' THEN 0 ELSE 1 END,
                sg.requested_at DESC
            LIMIT 1
            """,
            subject_id,
        )

        if not row:
            return GuarantorResponse(data=None)

        return GuarantorResponse(
            data=GuarantorInfo(
                subjectId=row["subject_id"],
                guarantorSubjectId=row["guarantor_subject_id"],
                guarantorDisplayName=row["guarantor_display_name"],
                status=row["status"],
                isDefault=bool(row["is_default"]),
                requestedAt=self._fmt(row["requested_at"]),
                confirmedAt=self._fmt(row["confirmed_at"]),
                rejectedAt=self._fmt(row["rejected_at"]),
                revokedAt=self._fmt(row["revoked_at"]),
            )
        )

    async def request_guarantor(self, payload: RequestGuarantorRequest) -> GuarantorResponse:
        actor = await self._ensure_subject(payload.actorSubjectId)
        guarantor = await self._resolve_subject_by_login_or_email(payload.guarantorLoginOrEmail)

        actor_id = actor["subject_id"]
        guarantor_id = guarantor["subject_id"]

        if actor_id == guarantor_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User cannot be their own guarantor",
            )

        async with get_conn() as conn:
            async with conn.cursor() as cur:
                await cur.execute(
                    """
                    SELECT
                        sg.subject_id::text AS subject_id,
                        sg.guarantor_subject_id::text AS guarantor_subject_id,
                        sg.status,
                        sg.is_default,
                        sg.requested_at,
                        sg.confirmed_at,
                        sg.rejected_at,
                        sg.revoked_at
                    FROM homonet.subject_guarantor sg
                    WHERE sg.subject_id = %s
                    AND sg.guarantor_subject_id = %s
                    AND sg.status IN ('pending', 'confirmed')
                    ORDER BY
                    CASE WHEN sg.status = 'confirmed' THEN 0 ELSE 1 END,
                    sg.requested_at DESC
                    LIMIT 1
                    """,
                    (actor_id, guarantor_id),
                )
                existing_same_pair = await cur.fetchone()

                if existing_same_pair:
                    return GuarantorResponse(
                        data=GuarantorInfo(
                            subjectId=existing_same_pair["subject_id"],
                            guarantorSubjectId=existing_same_pair["guarantor_subject_id"],
                            guarantorDisplayName=guarantor["display_name"],
                            status=existing_same_pair["status"],
                            isDefault=bool(existing_same_pair["is_default"]),
                            requestedAt=self._fmt(existing_same_pair["requested_at"]),
                            confirmedAt=self._fmt(existing_same_pair["confirmed_at"]),
                            rejectedAt=self._fmt(existing_same_pair["rejected_at"]),
                            revokedAt=self._fmt(existing_same_pair["revoked_at"]),
                        )
                    )

                await cur.execute(
                    """
                    UPDATE homonet.subject_guarantor
                    SET status = 'revoked',
                        revoked_at = now()
                    WHERE subject_id = %s
                    AND guarantor_subject_id <> %s
                    AND status IN ('pending', 'confirmed')
                    """,
                    (actor_id, guarantor_id),
                )

                await cur.execute(
                    """
                    INSERT INTO homonet.subject_guarantor (
                        subject_id,
                        guarantor_subject_id,
                        status,
                        is_default,
                        requested_at,
                        requested_by_subject_id
                    )
                    VALUES (%s, %s, 'pending', false, now(), %s)
                    RETURNING
                        subject_id::text AS subject_id,
                        guarantor_subject_id::text AS guarantor_subject_id,
                        status,
                        is_default,
                        requested_at,
                        confirmed_at,
                        rejected_at,
                        revoked_at
                    """,
                    (actor_id, guarantor_id, actor_id),
                )

                row = await cur.fetchone()

        return GuarantorResponse(
            data=GuarantorInfo(
                subjectId=row["subject_id"],
                guarantorSubjectId=row["guarantor_subject_id"],
                guarantorDisplayName=guarantor["display_name"],
                status=row["status"],
                isDefault=bool(row["is_default"]),
                requestedAt=self._fmt(row["requested_at"]),
                confirmedAt=self._fmt(row["confirmed_at"]),
                rejectedAt=self._fmt(row["rejected_at"]),
                revokedAt=self._fmt(row["revoked_at"]),
            )
        )



    async def confirm_guarantor(self, payload: ConfirmGuarantorRequest) -> GuarantorResponse:
        await self._ensure_subject(payload.actorSubjectId)
        await self._ensure_subject(payload.subjectId)

        async with get_conn() as conn:
            async with conn.cursor() as cur:
                await cur.execute(
                    """
                    SELECT
                        sg.subject_id::text AS subject_id,
                        sg.guarantor_subject_id::text AS guarantor_subject_id,
                        gs.display_name AS guarantor_display_name,
                        sg.status,
                        sg.is_default,
                        sg.requested_at
                    FROM homonet.subject_guarantor sg
                    JOIN homonet.subject gs
                      ON gs.subject_id = sg.guarantor_subject_id
                    WHERE sg.subject_id = %s
                      AND sg.guarantor_subject_id = %s
                      AND sg.status = 'pending'
                    ORDER BY sg.requested_at DESC
                    LIMIT 1
                    """,
                    (payload.subjectId, payload.actorSubjectId),
                )
                row = await cur.fetchone()

                if not row:
                    raise HTTPException(
                        status_code=status.HTTP_404_NOT_FOUND,
                        detail="Pending guarantor request not found",
                    )

                await cur.execute(
                    """
                    UPDATE homonet.subject_guarantor
                    SET status = 'revoked',
                        revoked_at = now()
                    WHERE subject_id = %s
                      AND status = 'confirmed'
                    """,
                    (payload.subjectId,),
                )

                await cur.execute(
                    """
                    UPDATE homonet.subject_guarantor
                    SET status = 'confirmed',
                        confirmed_at = now()
                    WHERE subject_id = %s
                      AND guarantor_subject_id = %s
                      AND status = 'pending'
                    RETURNING
                        subject_id::text AS subject_id,
                        guarantor_subject_id::text AS guarantor_subject_id,
                        status,
                        is_default,
                        requested_at,
                        confirmed_at,
                        rejected_at,
                        revoked_at
                    """,
                    (payload.subjectId, payload.actorSubjectId),
                )
                updated = await cur.fetchone()

        return GuarantorResponse(
            data=GuarantorInfo(
                subjectId=updated["subject_id"],
                guarantorSubjectId=updated["guarantor_subject_id"],
                guarantorDisplayName=row["guarantor_display_name"],
                status=updated["status"],
                isDefault=bool(updated["is_default"]),
                requestedAt=self._fmt(updated["requested_at"]),
                confirmedAt=self._fmt(updated["confirmed_at"]),
                rejectedAt=self._fmt(updated["rejected_at"]),
                revokedAt=self._fmt(updated["revoked_at"]),
            )
        )

    async def reject_guarantor(self, payload: RejectGuarantorRequest) -> GuarantorResponse:
        await self._ensure_subject(payload.actorSubjectId)
        await self._ensure_subject(payload.subjectId)

        async with get_conn() as conn:
            async with conn.cursor() as cur:
                await cur.execute(
                    """
                    UPDATE homonet.subject_guarantor
                    SET status = 'rejected',
                        rejected_at = now()
                    WHERE subject_id = %s
                      AND guarantor_subject_id = %s
                      AND status = 'pending'
                    RETURNING
                        subject_id::text AS subject_id,
                        guarantor_subject_id::text AS guarantor_subject_id,
                        requested_at,
                        confirmed_at,
                        rejected_at,
                        revoked_at,
                        status,
                        is_default
                    """,
                    (payload.subjectId, payload.actorSubjectId),
                )
                row = await cur.fetchone()

                if not row:
                    raise HTTPException(
                        status_code=status.HTTP_404_NOT_FOUND,
                        detail="Pending guarantor request not found",
                    )

                await cur.execute(
                    """
                    SELECT display_name
                    FROM homonet.subject
                    WHERE subject_id = %s
                    """,
                    (payload.actorSubjectId,),
                )
                guarantor = await cur.fetchone()

        return GuarantorResponse(
            data=GuarantorInfo(
                subjectId=row["subject_id"],
                guarantorSubjectId=row["guarantor_subject_id"],
                guarantorDisplayName=guarantor["display_name"] if guarantor else None,
                status=row["status"],
                isDefault=bool(row["is_default"]),
                requestedAt=self._fmt(row["requested_at"]),
                confirmedAt=self._fmt(row["confirmed_at"]),
                rejectedAt=self._fmt(row["rejected_at"]),
                revokedAt=self._fmt(row["revoked_at"]),
            )
        )

    async def list_guaranteed_subjects(
        self,
        guarantor_subject_id: str,
    ) -> GuaranteedSubjectsResponse:
        await self._ensure_subject(guarantor_subject_id)

        rows = await self._fetch_all(
            """
            SELECT DISTINCT ON (sg.subject_id)
                sg.subject_id::text AS subject_id,
                s.display_name,
                sg.status,
                sg.is_default,
                sg.requested_at,
                sg.confirmed_at
            FROM homonet.subject_guarantor sg
            JOIN homonet.subject s
              ON s.subject_id = sg.subject_id
            WHERE sg.guarantor_subject_id = %s
              AND sg.status IN ('pending', 'confirmed')
            ORDER BY
                sg.subject_id,
                CASE WHEN sg.status = 'confirmed' THEN 0 ELSE 1 END,
                sg.requested_at DESC
            """,
            guarantor_subject_id,
        )

        return GuaranteedSubjectsResponse(
            data=[
                GuaranteedSubjectItem(
                    subjectId=r["subject_id"],
                    displayName=r["display_name"],
                    status=r["status"],
                    isDefault=bool(r["is_default"]),
                    requestedAt=self._fmt(r["requested_at"]),
                    confirmedAt=self._fmt(r["confirmed_at"]),
                )
                for r in rows
            ]
        )