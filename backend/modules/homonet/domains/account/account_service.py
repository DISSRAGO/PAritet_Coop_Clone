from __future__ import annotations

from datetime import datetime, timezone

from fastapi import HTTPException, status

from backend.modules.homonet.domains.account.account_schemas import (
    DeleteAccountRequest,
    DeleteAccountResponse,
)
from backend.shared.db import get_conn


class AccountService:
    async def _fetch_one(self, query: str, *args):
        async with get_conn() as conn:
            async with conn.cursor() as cur:
                await cur.execute(query, args)
                return await cur.fetchone()

    async def delete_account(
        self,
        payload: DeleteAccountRequest,
    ) -> DeleteAccountResponse:
        auth_user = await self._fetch_one(
            """
            SELECT user_id, login, person_id, subject_id, is_active
            FROM homonet.auth_user
            WHERE user_id = %s
            """,
            payload.actorUserId,
        )

        if not auth_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found",
            )

        if not auth_user["is_active"]:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Account already deleted",
            )

        user_id = auth_user["user_id"]
        person_id = auth_user["person_id"]
        subject_id = auth_user["subject_id"]
        anonymized_login = f"deleted_{user_id}"

        async with get_conn() as conn:
            async with conn.cursor() as cur:
                await cur.execute(
                    """
                    UPDATE homonet.auth_user
                    SET
                        is_active = FALSE,
                        login = %s,
                        email = NULL,
                        phone = NULL,
                        updated_at = now()
                    WHERE user_id = %s
                    """,
                    (anonymized_login, user_id),
                )

                if person_id is not None:
                    await cur.execute(
                        """
                        UPDATE homonet.person
                        SET
                            display_name = 'Удалённый пользователь',
                            status = 'blocked'
                        WHERE person_id = %s
                        """,
                        (person_id,),
                    )

                if subject_id is not None:
                    await cur.execute(
                        """
                        UPDATE homonet.subject
                        SET
                            status = 'inactive'
                        WHERE subject_id = %s
                        """,
                        (subject_id,),
                    )

        return DeleteAccountResponse(
            message="Account deleted",
            userId=str(user_id),
            subjectId=str(subject_id) if subject_id else None,
            deletedAt=datetime.now(timezone.utc).isoformat(),
        )
