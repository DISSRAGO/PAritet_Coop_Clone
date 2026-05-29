from __future__ import annotations

import re
from typing import Optional

from fastapi import HTTPException, status

from backend.shared.db import get_conn
from backend.shared.schemas.subject import (
    CreateCollectiveSubjectRequest,
    CreateCollectiveSubjectResponse,
    CreatePersonalSubjectRequest,
    CreatePersonalSubjectResponse,
    SubjectCardResponse,
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

    return value or None


def build_display_name(surname: str, first_name: str, second_name: Optional[str]) -> str:
    parts = [surname.strip(), first_name.strip()]
    if second_name and second_name.strip():
        parts.append(second_name.strip())
    return " ".join(parts)


class SubjectService:
    """Сервис subject-слоя (HomoNet V0.51).

    Владеет таблицами: person, person_profile, subject.
    Канонические проверки:
      * subject имеет ровно один источник (person/organization/community);
      * subject_kind соответствует заполненному FK;
      * нельзя создать второй subject для того же person/community/organization
        (на уровне БД — UNIQUE на FK, на уровне сервиса — pre-check + 409).
    """

    # ---------- helpers --------------------------------------------------

    async def _fetch_one(self, query: str, *args):
        async with get_conn() as conn:
            async with conn.cursor() as cur:
                await cur.execute(query, args)
                return await cur.fetchone()

    # ---------- UC-03: create personal subject ---------------------------

    async def create_personal_subject(
        self,
        payload: CreatePersonalSubjectRequest,
    ) -> CreatePersonalSubjectResponse:
        auth_user = await self._fetch_one(
            """
            SELECT
                user_id,
                person_id,
                subject_id,
                email,
                phone,
                is_verified,
                is_active,
                login
            FROM homonet.auth_user
            WHERE login = %s
            """,
            payload.authUserLogin.strip(),
        )

        if not auth_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Auth user not found",
            )

        if not auth_user["is_active"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Auth user is inactive",
            )

        if not auth_user["is_verified"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Auth user is not verified",
            )

        if auth_user["subject_id"] is not None:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Subject is already linked to this auth user",
            )

        surname = payload.surname.strip()
        first_name = payload.firstName.strip()
        second_name = (payload.secondName or "").strip()
        display_name = build_display_name(surname, first_name, second_name)

        async with get_conn() as conn:
            async with conn.cursor() as cur:
                person_id = auth_user["person_id"]

                if person_id is None:
                    await cur.execute(
                        """
                        INSERT INTO homonet.person
                            (display_name, status)
                        VALUES
                            (%s, 'draft')
                        RETURNING person_id
                        """,
                        (display_name,),
                    )
                    person_row = await cur.fetchone()
                    person_id = person_row["person_id"]

                    await cur.execute(
                        """
                        UPDATE homonet.auth_user
                        SET
                            person_id = %s,
                            updated_at = now()
                        WHERE user_id = %s
                        """,
                        (person_id, auth_user["user_id"]),
                    )
                else:
                    # дополнительная защита: если у person уже есть subject —
                    # вернём 409 заранее, не дожидаясь UNIQUE violation
                    existing = await self._fetch_one(
                        "SELECT subject_id FROM homonet.subject WHERE person_id = %s",
                        person_id,
                    )
                    if existing:
                        raise HTTPException(
                            status_code=status.HTTP_409_CONFLICT,
                            detail="Personal subject already exists for this person",
                        )

                await cur.execute(
                    """
                    INSERT INTO homonet.subject
                        (subject_kind, person_id, display_name, status)
                    VALUES
                        ('personal', %s, %s, 'active')
                    RETURNING subject_id
                    """,
                    (person_id, display_name),
                )
                subject_row = await cur.fetchone()
                subject_id = subject_row["subject_id"]

                await cur.execute(
                    """
                    UPDATE homonet.auth_user
                    SET
                        subject_id = %s,
                        updated_at = now()
                    WHERE user_id = %s
                    """,
                    (subject_id, auth_user["user_id"]),
                )

        return CreatePersonalSubjectResponse(
            subjectId=str(subject_id),
            message="Personal subject created",
        )

    # ---------- UC-05: create collective subject -------------------------

    async def create_collective_subject(
        self,
        payload: CreateCollectiveSubjectRequest,
    ) -> CreateCollectiveSubjectResponse:
        community = await self._fetch_one(
            """
            SELECT community_id, name, status
            FROM homonet.community
            WHERE community_id = %s
            """,
            payload.communityId.strip(),
        )
        if not community:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Community not found",
            )

        existing = await self._fetch_one(
            "SELECT subject_id FROM homonet.subject WHERE community_id = %s",
            community["community_id"],
        )
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Collective subject already exists for this community",
            )

        display_name = (payload.displayName or community["name"]).strip()
        if not display_name:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="displayName is empty",
            )

        async with get_conn() as conn:
            async with conn.cursor() as cur:
                await cur.execute(
                    """
                    INSERT INTO homonet.subject
                        (subject_kind, community_id, display_name, status)
                    VALUES
                        ('collective', %s, %s, 'active')
                    RETURNING subject_id
                    """,
                    (community["community_id"], display_name),
                )
                row = await cur.fetchone()
                subject_id = row["subject_id"]

        return CreateCollectiveSubjectResponse(
            subjectId=str(subject_id),
            message="Collective subject created",
        )

    # ---------- get subject card -----------------------------------------

    async def get_subject_card(self, subject_id: str) -> SubjectCardResponse:
        row = await self._fetch_one(
            """
            SELECT
                s.subject_id,
                s.subject_kind,
                s.display_name,
                s.status,
                s.person_id,
                s.organization_id,
                s.community_id,
                au.login   AS auth_user_login,
                au.email   AS auth_user_email,
                au.phone   AS auth_user_phone
            FROM homonet.subject s
            LEFT JOIN homonet.auth_user au
                ON au.subject_id = s.subject_id
            WHERE s.subject_id = %s
            """,
            subject_id,
        )

        if not row:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Subject not found",
            )

        return SubjectCardResponse(
            id=str(row["subject_id"]),
            subjectKind=str(row["subject_kind"]),
            displayName=row["display_name"],
            status=str(row["status"]),
            personId=str(row["person_id"]) if row["person_id"] else None,
            organizationId=str(row["organization_id"]) if row["organization_id"] else None,
            communityId=str(row["community_id"]) if row["community_id"] else None,
            authUserLogin=row["auth_user_login"],
            email=row["auth_user_email"],
            phone=row["auth_user_phone"],
        )
