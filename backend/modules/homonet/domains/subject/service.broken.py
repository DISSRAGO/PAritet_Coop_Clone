from __future__ import annotations

import json
from typing import Optional

from fastapi import HTTPException, status

from backend.modules.homonet.domains.reclamation.schemas import (
    AcceptReclamationRequest,
    AssignReclamationRequest,
    CloseReclamationRequest,
    CreateAttachmentRequest,
    CreateAttachmentResponse,
    CreateDecisionRequest,
    CreateDecisionResponse,
    CreateMessageRequest,
    CreateMessageResponse,
    CreateReclamationRequest,
    CreateReclamationResponse,
    CreateResponseRequest,
    CreateResponseResponse,
    DashboardData,
    EscalateReclamationRequest,
    EscalateReclamationResponse,
    Meta,
    PanelDashboardResponse,
    PanelInboxResponse,
    PatchReclamationRequest,
    ReclamationDetailResponse,
    ReclamationListItem,
    ReclamationListResponse,
    StatusTransitionResponse,
    WithdrawReclamationRequest,
)
from backend.shared.db import get_conn


_ALLOWED_TRANSITIONS: dict[str, set[str]] = {
    "draft": {"registered", "cancelled"},
    "registered": {"accepted", "cancelled"},
    "accepted": {"in_progress", "rejected", "cancelled"},
    "in_progress": {"waiting_response", "resolved", "rejected", "escalated"},
    "waiting_response": {"in_progress", "resolved", "rejected"},
    "rejected": {"completed", "escalated"},
    "resolved": {"completed", "closed"},
    "escalated": {"in_progress", "waiting_response", "resolved", "closed"},
    "completed": set(),
    "closed": set(),
    "cancelled": set(),
}

_ACTIVE_STATUSES = (
    "registered",
    "accepted",
    "in_progress",
    "waiting_response",
    "escalated",
    "rejected",
)

_OUTBOX_ACTIVE_STATUSES = (
    "registered",
    "accepted",
    "in_progress",
    "waiting_response",
    "escalated",
    "resolved",
    "rejected",
)

_ARCHIVE_STATUSES = ("completed", "closed", "cancelled")

_ACTIVE_SQL = "(" + ",".join(f"'{s}'" for s in _ACTIVE_STATUSES) + ")"
_OUTBOX_ACTIVE_SQL = "(" + ",".join(f"'{s}'" for s in _OUTBOX_ACTIVE_STATUSES) + ")"
_ARCHIVE_SQL = "(" + ",".join(f"'{s}'" for s in _ARCHIVE_STATUSES) + ")"


class ReclamationService:
    _MAX_PAGE_SIZE = 100
    _DEFAULT_PAGE_SIZE = 20

    def _clamp_paging(self, limit: int, offset: int) -> tuple[int, int]:
        return max(1, min(limit or self._DEFAULT_PAGE_SIZE, self._MAX_PAGE_SIZE)), max(0, offset)

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

    async def _ensure_reclamation(self, reclamation_id: str) -> dict:
        row = await self._fetch_one(
            "SELECT * FROM homonet.reclamation WHERE reclamation_id = %s",
            reclamation_id,
        )
        if not row:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="reclamation_not_found",
            )
        return row

    async def _ensure_subject(self, subject_id: str) -> None:
        row = await self._fetch_one(
            "SELECT subject_id FROM homonet.subject WHERE subject_id = %s",
            subject_id,
        )
        if not row:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Subject {subject_id} not found",
            )

    def _check_transition(self, current: str, target: str) -> None:
        if target not in _ALLOWED_TRANSITIONS.get(current, set()):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"transition_not_allowed: {current} -> {target}",
            )

    @staticmethod
    def _fmt(val) -> Optional[str]:
        if val is None:
            return None
        return val.isoformat() if hasattr(val, "isoformat") else str(val)

    @staticmethod
    def _row_to_list_item(row: dict) -> ReclamationListItem:
        return ReclamationListItem(
            reclamationId=row["reclamation_id"],
            reclamationType=row["reclamation_type"],
            sourceType=row["source_type"],
            status=row["status"],
            priority=row["priority"],
            title=row["title"],
            targetType=row["target_type"],
            targetId=row["target_id"],
            createdBySubjectId=row["created_by_subject_id"],
            respondentSubjectId=row["respondent_subject_id"],
            currentResponsibleSubjectId=row["current_responsible_subject_id"],
            communityId=row["community_id"],
            createdAt=ReclamationService._fmt(row["created_at"]),
            deadlineAt=ReclamationService._fmt(row["deadline_at"]),
            hasUnread=bool(row.get("has_unread", False)),
        )

    async def create_reclamation(self, payload: CreateReclamationRequest) -> CreateReclamationResponse:
        await self._ensure_subject(payload.actorSubjectId)

        respondent_subject_id = payload.respondentSubjectId

        if not respondent_subject_id and payload.targetType == "thanka":
            owner_row = await self._fetch_one(
                """
                SELECT a.subject_id::text AS subject_id
                FROM homonet.thanka t
                JOIN homonet.author a ON a.author_id = t.author_id
                WHERE t.thanka_id = %s::uuid
                LIMIT 1
                """,
                payload.targetId,
            )
            respondent_subject_id = owner_row["subject_id"] if owner_row and owner_row.get("subject_id") else None

        async with get_conn() as conn:
            async with conn.cursor() as cur:
                await cur.execute(
                    """
                    INSERT INTO homonet.reclamation (
                        reclamation_type,
                        source_type,
                        status,
                        priority,
                        created_by_subject_id,
                        respondent_subject_id,
                        target_type,
                        target_id,
                        community_id,
                        title,
                        description
                    ) VALUES (
                        %s::homonet.reclamation_type_enum,
                        %s::homonet.reclamation_source_enum,
                        'registered'::homonet.reclamation_status_enum,
                        %s::homonet.reclamation_priority_enum,
                        %s,
                        %s,
                        %s,
                        %s::uuid,
                        %s,
                        %s,
                        %s
                    ) RETURNING reclamation_id
                    """,
                    (
                        payload.reclamationType,
                        payload.sourceType,
                        payload.priority,
                        payload.actorSubjectId,
                        respondent_subject_id,
                        payload.targetType,
                        payload.targetId,
                        payload.communityId,
                        payload.title,
                        payload.description,
                    ),
                )
                row = await cur.fetchone()
                reclamation_id = str(row["reclamation_id"])

                await cur.execute(
                    """
                    INSERT INTO homonet.reclamation_participant
                        (reclamation_id, subject_id, participant_role, added_by_subject_id)
                    VALUES (%s, %s, 'claimant'::homonet.reclamation_participant_role_enum, %s)
                    """,
                    (reclamation_id, payload.actorSubjectId, payload.actorSubjectId),
                )

                if respondent_subject_id and respondent_subject_id != payload.actorSubjectId:
                    await cur.execute(
                        """
                        INSERT INTO homonet.reclamation_participant
                            (reclamation_id, subject_id, participant_role, added_by_subject_id)
                        VALUES (%s, %s, 'respondent'::homonet.reclamation_participant_role_enum, %s)
                        ON CONFLICT (reclamation_id, subject_id, participant_role) DO NOTHING
                        """,
                        (reclamation_id, respondent_subject_id, payload.actorSubjectId),
                    )

                await cur.execute(
                    """
                    INSERT INTO homonet.reclamation_event
                        (reclamation_id, event_type, actor_subject_id, payload)
                    VALUES (%s, 'created', %s, '{}'::jsonb)
                    """,
                    (reclamation_id, payload.actorSubjectId),
                )

        return CreateReclamationResponse(
            reclamationId=reclamation_id,
            status="registered",
        )

    async def list_reclamations(
        self,
        *,
        limit=20,
        offset=0,
        status_filter=None,
        reclamation_type=None,
        priority=None,
        created_by_subject_id=None,
        current_responsible_subject_id=None,
        target_type=None,
        target_id=None,
        community_id=None,
    ) -> ReclamationListResponse:
        lim, off = self._clamp_paging(limit, offset)
        where_clauses, params = [], []

        if status_filter:
            where_clauses.append("r.status = %s::homonet.reclamation_status_enum")
            params.append(status_filter)
        if reclamation_type:
            where_clauses.append("r.reclamation_type = %s::homonet.reclamation_type_enum")
            params.append(reclamation_type)
        if priority:
            where_clauses.append("r.priority = %s::homonet.reclamation_priority_enum")
            params.append(priority)
        if created_by_subject_id:
            where_clauses.append("r.created_by_subject_id = %s")
            params.append(created_by_subject_id)
        if current_responsible_subject_id:
            where_clauses.append("r.current_responsible_subject_id = %s")
            params.append(current_responsible_subject_id)
        if target_type:
            where_clauses.append("r.target_type = %s")
            params.append(target_type)
        if target_id:
            where_clauses.append("r.target_id = %s::uuid")
            params.append(target_id)
        if community_id:
            where_clauses.append("r.community_id = %s")
            params.append(community_id)

        where_sql = "WHERE " + " AND ".join(where_clauses) if where_clauses else ""

        count_row = await self._fetch_one(
            f"SELECT COUNT(*) AS cnt FROM homonet.reclamation r {where_sql}",
            *params,
        )
        total = int(count_row["cnt"]) if count_row else 0

        rows = await self._fetch_all(
            f"""
            SELECT
                r.reclamation_id::text,
                r.reclamation_type::text,
                r.source_type::text,
                r.status::text,
                r.priority::text,
                r.title,
                r.target_type,
                r.target_id::text,
                r.created_by_subject_id::text,
                r.respondent_subject_id::text,
                r.current_responsible_subject_id::text,
                r.community_id::text,
                r.created_at,
                r.deadline_at,
                FALSE AS has_unread
            FROM homonet.reclamation r
            {where_sql}
            ORDER BY r.created_at DESC
            LIMIT %s OFFSET %s
            """,
            *params,
            lim,
            off,
        )

        items = [self._row_to_list_item(r) for r in rows]

        return ReclamationListResponse(
            data=items,
            meta=Meta(total=total, limit=lim, offset=off),
        )

    async def get_reclamation(self, reclamation_id: str) -> ReclamationDetailResponse:
        rec = await self._ensure_reclamation(reclamation_id)

        def ser(rows):
            result = []
            for row in rows:
                d = dict(row)
                for k, v in d.items():
                    if hasattr(v, "isoformat"):
                        d[k] = v.isoformat()
                    elif v is not None and not isinstance(v, (str, int, float, bool, list, dict)):
                        d[k] = str(v)
                result.append(d)
            return result

        participants = await self._fetch_all(
            """
            SELECT participant_id::text, subject_id::text, participant_role::text, added_at, status
            FROM homonet.reclamation_participant
            WHERE reclamation_id = %s
            """,
            reclamation_id,
        )

        messages = await self._fetch_all(
            """
            SELECT
                message_id::text,
                author_subject_id::text,
                message_type::text,
                body,
                visibility::text,
                created_at
            FROM homonet.reclamation_message
            WHERE reclamation_id = %s
            ORDER BY created_at
            """,
            reclamation_id,
        )

        decisions = await self._fetch_all(
            """
            SELECT
                reclamation_decision_id::text,
                decision_by_subject_id::text,
                decision_type::text,
                decision_text,
                reason,
                created_at,
                is_final
            FROM homonet.reclamation_decision
            WHERE reclamation_id = %s
            ORDER BY created_at
            """,
            reclamation_id,
        )

        escalations = await self._fetch_all(
            """
            SELECT
                escalation_id::text,
                from_level,
                to_level,
                escalation_reason::text,
                created_at
            FROM homonet.reclamation_escalation
            WHERE reclamation_id = %s
            ORDER BY created_at
            """,
            reclamation_id,
        )

        return ReclamationDetailResponse(
            reclamationId=str(rec["reclamation_id"]),
            reclamationType=str(rec["reclamation_type"]),
            sourceType=str(rec["source_type"]),
            status=str(rec["status"]),
            priority=str(rec["priority"]),
            title=rec["title"],
            description=rec["description"],
            targetType=rec["target_type"],
            targetId=str(rec["target_id"]),
            createdBySubjectId=str(rec["created_by_subject_id"]),
            respondentSubjectId=str(rec["respondent_subject_id"]) if rec["respondent_subject_id"] else None,
            currentResponsibleSubjectId=(
                str(rec["current_responsible_subject_id"])
                if rec["current_responsible_subject_id"]
                else None
            ),
            communityId=str(rec["community_id"]) if rec["community_id"] else None,
            createdAt=self._fmt(rec["created_at"]),
            acceptedAt=self._fmt(rec.get("accepted_at")),
            closedAt=self._fmt(rec["closed_at"]),
            deadlineAt=self._fmt(rec["deadline_at"]),
            participants=ser(participants),
            messages=ser(messages),
            decisions=ser(decisions),
            escalations=ser(escalations),
        )

    async def patch_reclamation(
        self,
        reclamation_id: str,
        payload: PatchReclamationRequest,
    ) -> StatusTransitionResponse:
        rec = await self._ensure_reclamation(reclamation_id)

        if payload.actorSubjectId:
            await self._ensure_subject(payload.actorSubjectId)

        current_status = str(rec["status"])
        if current_status in ("closed", "cancelled", "completed"):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="closed_reclamation_immutable",
            )

        claimant_id = str(rec["created_by_subject_id"]) if rec.get("created_by_subject_id") else None
        respondent_id = str(rec["respondent_subject_id"]) if rec.get("respondent_subject_id") else None
        responsible_id = (
            str(rec["current_responsible_subject_id"])
            if rec.get("current_responsible_subject_id")
            else None
        )

        actor_id = payload.actorSubjectId
        is_claimant = bool(actor_id and claimant_id and actor_id == claimant_id)
        is_executor = bool(actor_id and (actor_id == respondent_id or actor_id == responsible_id))

        set_clauses: list[str] = []
        params: list = []

        if payload.priority:
            set_clauses.append("priority = %s::homonet.reclamation_priority_enum")
            params.append(payload.priority)

        if payload.description is not None:
            set_clauses.append("description = %s")
            params.append(payload.description)

        if payload.deadlineAt:
            set_clauses.append("deadline_at = %s::timestamptz")
            params.append(payload.deadlineAt)

        if payload.currentResponsibleSubjectId:
            await self._ensure_subject(payload.currentResponsibleSubjectId)
            set_clauses.append("current_responsible_subject_id = %s")
            params.append(payload.currentResponsibleSubjectId)

        next_status = None
        if payload.status:
            next_status = str(payload.status)
            self._check_transition(current_status, next_status)

            if next_status in ("accepted", "in_progress", "waiting_response", "resolved", "rejected") and not is_executor:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="only_executor_can_set_processing_status",
                )

            if next_status in ("completed", "escalated") and not is_claimant:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="only_claimant_can_finalize_or_escalate_reclamation",
                )

            if next_status == "closed" and not is_executor:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="only_executor_can_close_reclamation",
                )

            if next_status == "cancelled" and not is_claimant:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="only_claimant_can_cancel_reclamation",
                )

            set_clauses.append("status = %s::homonet.reclamation_status_enum")
            params.append(next_status)

            if next_status == "accepted":
                set_clauses.append("accepted_at = COALESCE(accepted_at, now())")

            if next_status in ("accepted", "in_progress", "waiting_response", "resolved", "rejected", "escalated"):
                set_clauses.append("closed_at = NULL")

            if next_status in ("completed", "closed", "cancelled"):
                set_clauses.append("closed_at = now()")

        if not set_clauses:
            return StatusTransitionResponse(
                reclamationId=reclamation_id,
                status=current_status,
                message="nothing_to_update",
            )

        params.append(reclamation_id)

        async with get_conn() as conn:
            async with conn.cursor() as cur:
                await cur.execute(
                    f"""
                    UPDATE homonet.reclamation
                    SET {", ".join(set_clauses)}
                    WHERE reclamation_id = %s
                    """,
                    params,
                )

                if payload.status and payload.actorSubjectId:
                    await cur.execute(
                        """
                        INSERT INTO homonet.reclamation_event (
                            reclamation_id,
                            event_type,
                            actor_subject_id,
                            payload
                        ) VALUES (%s, %s, %s, %s::jsonb)
                        """,
                        (
                            reclamation_id,
                            "status_changed",
                            payload.actorSubjectId,
                            json.dumps({"status": payload.status}),
                        ),
                    )

        return StatusTransitionResponse(
            reclamationId=reclamation_id,
            status=next_status or current_status,
            message="updated",
        )

    async def accept_reclamation(
        self,
        reclamation_id: str,
        payload: AcceptReclamationRequest,
    ) -> StatusTransitionResponse:
        rec = await self._ensure_reclamation(reclamation_id)

        if payload.actorSubjectId:
            await self._ensure_subject(payload.actorSubjectId)

        respondent_id = str(rec["respondent_subject_id"]) if rec.get("respondent_subject_id") else None
        responsible_id = (
            str(rec["current_responsible_subject_id"])
            if rec.get("current_responsible_subject_id")
            else None
        )

        actor_id = payload.actorSubjectId
        is_executor = bool(actor_id and (actor_id == respondent_id or actor_id == responsible_id))

        if not is_executor:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="only_executor_can_accept_reclamation",
            )

        self._check_transition(str(rec["status"]), "accepted")

        async with get_conn() as conn:
            async with conn.cursor() as cur:
                sql = """
                UPDATE homonet.reclamation
                SET status = 'accepted'::homonet.reclamation_status_enum,
                    accepted_at = COALESCE(accepted_at, now()),
                    closed_at = NULL
                """
                p = []

                if payload.responsibleSubjectId:
                    await self._ensure_subject(payload.responsibleSubjectId)
                    sql += ", current_responsible_subject_id = %s"
                    p.append(payload.responsibleSubjectId)

                sql += " WHERE reclamation_id = %s"
                p.append(reclamation_id)

                await cur.execute(sql, p)

                if payload.responsibleSubjectId:
                    await cur.execute(
                        """
                        INSERT INTO homonet.reclamation_participant
                            (reclamation_id, subject_id, participant_role, added_by_subject_id)
                        VALUES (%s, %s, 'responsible'::homonet.reclamation_participant_role_enum, %s)
                        ON CONFLICT (reclamation_id, subject_id, participant_role) DO NOTHING
                        """,
                        (reclamation_id, payload.responsibleSubjectId, payload.actorSubjectId),
                    )

                await cur.execute(
                    """
                    INSERT INTO homonet.reclamation_event
                        (reclamation_id, event_type, actor_subject_id, payload)
                    VALUES (%s, 'status_changed', %s, %s::jsonb)
                    """,
                    (
                        reclamation_id,
                        payload.actorSubjectId,
                        json.dumps({"status": "accepted"}),
                    ),
                )

        return StatusTransitionResponse(
            reclamationId=reclamation_id,
            status="accepted",
            message="accepted",
        )

    async def withdraw_reclamation(
        self,
        reclamation_id: str,
        payload: WithdrawReclamationRequest,
    ) -> StatusTransitionResponse:
        return await self.patch_reclamation(
            reclamation_id,
            PatchReclamationRequest(
                actorSubjectId=payload.actorSubjectId,
                status="cancelled",
            ),
        )

    async def assign_reclamation(
        self,
        reclamation_id: str,
        payload: AssignReclamationRequest,
    ) -> StatusTransitionResponse:
        rec = await self._ensure_reclamation(reclamation_id)
        await self._ensure_subject(payload.actorSubjectId)
        await self._ensure_subject(payload.responsibleSubjectId)

        respondent_id = str(rec["respondent_subject_id"]) if rec.get("respondent_subject_id") else None
        responsible_id = (
            str(rec["current_responsible_subject_id"])
            if rec.get("current_responsible_subject_id")
            else None
        )

        actor_id = payload.actorSubjectId
        is_executor = bool(actor_id and (actor_id == respondent_id or actor_id == responsible_id))
        if not is_executor:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="only_executor_can_assign_reclamation",
            )

        async with get_conn() as conn:
            async with conn.cursor() as cur:
                await cur.execute(
                    """
                    UPDATE homonet.reclamation
                    SET current_responsible_subject_id = %s
                    WHERE reclamation_id = %s
                    """,
                    (payload.responsibleSubjectId, reclamation_id),
                )

                await cur.execute(
                    """
                    INSERT INTO homonet.reclamation_participant
                        (reclamation_id, subject_id, participant_role, added_by_subject_id)
                    VALUES (%s, %s, 'responsible'::homonet.reclamation_participant_role_enum, %s)
                    ON CONFLICT (reclamation_id, subject_id, participant_role) DO NOTHING
                    """,
                    (reclamation_id, payload.responsibleSubjectId, payload.actorSubjectId),
                )

                await cur.execute(
                    """
                    INSERT INTO homonet.reclamation_event
                        (reclamation_id, event_type, actor_subject_id, payload)
                    VALUES (%s, 'assigned', %s, %s::jsonb)
                    """,
                    (
                        reclamation_id,
                        payload.actorSubjectId,
                        json.dumps({"responsibleSubjectId": payload.responsibleSubjectId}),
                    ),
                )

        return StatusTransitionResponse(
            reclamationId=reclamation_id,
            status=str(rec["status"]),
            message="assigned",
        )

    async def close_reclamation(
        self,
        reclamation_id: str,
        payload: CloseReclamationRequest,
    ) -> StatusTransitionResponse:
        return await self.patch_reclamation(
            reclamation_id,
            PatchReclamationRequest(
                actorSubjectId=payload.actorSubjectId,
                status="closed",
            ),
        )

    async def escalate_reclamation(
        self,
        reclamation_id: str,
        payload: EscalateReclamationRequest,
    ) -> EscalateReclamationResponse:
        rec = await self._ensure_reclamation(reclamation_id)
        await self._ensure_subject(payload.actorSubjectId)

        claimant_id = str(rec["created_by_subject_id"]) if rec.get("created_by_subject_id") else None
        if payload.actorSubjectId != claimant_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="only_claimant_can_escalate_reclamation",
            )

        self._check_transition(str(rec["status"]), "escalated")

        async with get_conn() as conn:
            async with conn.cursor() as cur:
                await cur.execute(
                    """
                    INSERT INTO homonet.reclamation_escalation
                        (reclamation_id, from_level, to_level, escalation_reason)
                    VALUES (%s, %s, %s, %s::homonet.reclamation_escalation_reason_enum)
                    RETURNING escalation_id, created_at
                    """,
                    (
                        reclamation_id,
                        payload.fromLevel,
                        payload.toLevel,
                        payload.reason,
                    ),
                )
                row = await cur.fetchone()

                await cur.execute(
                    """
                    UPDATE homonet.reclamation
                    SET status = 'escalated'::homonet.reclamation_status_enum,
                        closed_at = NULL
                    WHERE reclamation_id = %s
                    """,
                    (reclamation_id,),
                )

                await cur.execute(
                    """
                    INSERT INTO homonet.reclamation_event
                        (reclamation_id, event_type, actor_subject_id, payload)
                    VALUES (%s, 'escalated', %s, %s::jsonb)
                    """,
                    (
                        reclamation_id,
                        payload.actorSubjectId,
                        json.dumps(
                            {
                                "fromLevel": payload.fromLevel,
                                "toLevel": payload.toLevel,
                                "reason": payload.reason,
                            }
                        ),
                    ),
                )

        return EscalateReclamationResponse(
            escalationId=str(row["escalation_id"]),
            reclamationId=reclamation_id,
            createdAt=self._fmt(row["created_at"]),
        )

    async def create_message(
        self,
        reclamation_id: str,
        payload: CreateMessageRequest,
    ) -> CreateMessageResponse:
        rec = await self._ensure_reclamation(reclamation_id)

        if str(rec["status"]) in ("closed", "cancelled", "completed"):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="closed_reclamation_immutable",
            )

        await self._ensure_subject(payload.actorSubjectId)

        async with get_conn() as conn:
            async with conn.cursor() as cur:
                await cur.execute(
                    """
                    INSERT INTO homonet.reclamation_message
                        (reclamation_id, author_subject_id, message_type, body, visibility)
                    VALUES (
                        %s,
                        %s,
                        %s::homonet.reclamation_message_type_enum,
                        %s,
                        %s::homonet.reclamation_visibility_enum
                    )
                    RETURNING message_id, created_at
                    """,
                    (
                        reclamation_id,
                        payload.actorSubjectId,
                        payload.messageType,
                        payload.body,
                        payload.visibility,
                    ),
                )
                row = await cur.fetchone()

                await cur.execute(
                    """
                    INSERT INTO homonet.reclamation_event
                        (reclamation_id, event_type, actor_subject_id, payload)
                    VALUES (%s, 'message_added', %s, %s::jsonb)
                    """,
                    (
                        reclamation_id,
                        payload.actorSubjectId,
                        json.dumps({"messageType": payload.messageType}),
                    ),
                )

                auto_next_status = None
                current_status = str(rec["status"])
                claimant_id = str(rec["created_by_subject_id"]) if rec.get("created_by_subject_id") else None
                actor_id = payload.actorSubjectId

                if current_status == "in_progress" and payload.messageType == "clarification_request":
                    auto_next_status = "waiting_response"

                if current_status == "waiting_response" and actor_id == claimant_id:
                    auto_next_status = "in_progress"

                if auto_next_status:
                    await cur.execute(
                        """
                        UPDATE homonet.reclamation
                        SET status = %s::homonet.reclamation_status_enum,
                            closed_at = NULL
                        WHERE reclamation_id = %s
                        """,
                        (auto_next_status, reclamation_id),
                    )
                    await cur.execute(
                        """
                        INSERT INTO homonet.reclamation_event
                            (reclamation_id, event_type, actor_subject_id, payload)
                        VALUES (%s, 'status_changed', %s, %s::jsonb)
                        """,
                        (
                            reclamation_id,
                            payload.actorSubjectId,
                            json.dumps({"status": auto_next_status, "source": "message"}),
                        ),
                    )

        return CreateMessageResponse(
            messageId=str(row["message_id"]),
            reclamationId=reclamation_id,
            createdAt=self._fmt(row["created_at"]),
        )

    async def mark_reclamation_read(
        self,
        reclamation_id: str,
        subject_id: str,
    ) -> dict:
        await self._ensure_reclamation(reclamation_id)
        await self._ensure_subject(subject_id)

        async with get_conn() as conn:
            async with conn.cursor() as cur:
                await cur.execute(
                    """
                    INSERT INTO homonet.reclamation_message_read (
                        message_id,
                        subject_id,
                        read_at
                    )
                    SELECT
                        m.message_id,
                        %s,
                        now()
                    FROM homonet.reclamation_message m
                    WHERE
                        m.reclamation_id = %s
                        AND m.author_subject_id IS DISTINCT FROM %s
                    ON CONFLICT (message_id, subject_id) DO UPDATE
                    SET read_at = EXCLUDED.read_at
                    """,
                    (subject_id, reclamation_id, subject_id),
                )

        return {
            "ok": True,
            "reclamationId": reclamation_id,
            "subjectId": subject_id,
        }

    async def create_response(
        self,
        reclamation_id: str,
        payload: CreateResponseRequest,
    ) -> CreateResponseResponse:
        await self._ensure_reclamation(reclamation_id)
        await self._ensure_subject(payload.respondentSubjectId)

        async with get_conn() as conn:
            async with conn.cursor() as cur:
                await cur.execute(
                    """
                    INSERT INTO homonet.reclamation_response
                        (reclamation_id, respondent_subject_id, response_type, body)
                    VALUES (
                        %s,
                        %s,
                        %s::homonet.reclamation_response_type_enum,
                        %s
                    )
                    RETURNING response_id, created_at
                    """,
                    (
                        reclamation_id,
                        payload.respondentSubjectId,
                        payload.responseType,
                        payload.body,
                    ),
                )
                row = await cur.fetchone()

                await cur.execute(
                    """
                    INSERT INTO homonet.reclamation_event
                        (reclamation_id, event_type, actor_subject_id, payload)
                    VALUES (%s, 'response_added', %s, %s::jsonb)
                    """,
                    (
                        reclamation_id,
                        payload.respondentSubjectId,
                        json.dumps({"responseType": payload.responseType}),
                    ),
                )

        return CreateResponseResponse(
            responseId=str(row["response_id"]),
            reclamationId=reclamation_id,
            createdAt=self._fmt(row["created_at"]),
        )

    async def create_decision(
        self,
        reclamation_id: str,
        payload: CreateDecisionRequest,
    ) -> CreateDecisionResponse:
        rec = await self._ensure_reclamation(reclamation_id)

        if str(rec["status"]) in ("closed", "cancelled", "completed"):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="closed_reclamation_immutable",
            )

        await self._ensure_subject(payload.decisionBySubjectId)

        async with get_conn() as conn:
            async with conn.cursor() as cur:
                await cur.execute(
                    """
                    INSERT INTO homonet.reclamation_decision
                        (reclamation_id, decision_by_subject_id, decision_type, decision_text, reason, is_final)
                    VALUES (
                        %s,
                        %s,
                        %s::homonet.reclamation_decision_type_enum,
                        %s,
                        %s,
                        %s
                    )
                    RETURNING reclamation_decision_id, created_at
                    """,
                    (
                        reclamation_id,
                        payload.decisionBySubjectId,
                        payload.decisionType,
                        payload.decisionText,
                        payload.reason,
                        payload.isFinal,
                    ),
                )
                row = await cur.fetchone()

                await cur.execute(
                    """
                    INSERT INTO homonet.reclamation_event
                        (reclamation_id, event_type, actor_subject_id, payload)
                    VALUES (%s, 'decision_made', %s, %s::jsonb)
                    """,
                    (
                        reclamation_id,
                        payload.decisionBySubjectId,
                        json.dumps(
                            {
                                "decisionType": payload.decisionType,
                                "isFinal": payload.isFinal,
                            }
                        ),
                    ),
                )

        return CreateDecisionResponse(
            reclamationDecisionId=str(row["reclamation_decision_id"]),
            reclamationId=reclamation_id,
            createdAt=self._fmt(row["created_at"]),
        )

    async def create_attachment(
        self,
        reclamation_id: str,
        payload: CreateAttachmentRequest,
    ) -> CreateAttachmentResponse:
        await self._ensure_reclamation(reclamation_id)
        await self._ensure_subject(payload.uploadedBySubjectId)

        async with get_conn() as conn:
            async with conn.cursor() as cur:
                await cur.execute(
                    """
                    INSERT INTO homonet.reclamation_attachment
                        (reclamation_id, message_id, uploaded_by_subject_id, file_ref_id, uri, title, description)
                    VALUES (%s, %s, %s, %s, %s, %s, %s)
                    RETURNING attachment_id, created_at
                    """,
                    (
                        reclamation_id,
                        payload.messageId,
                        payload.uploadedBySubjectId,
                        payload.fileRefId,
                        payload.uri,
                        payload.title,
                        payload.description,
                    ),
                )
                row = await cur.fetchone()

        return CreateAttachmentResponse(
            attachmentId=str(row["attachment_id"]),
            reclamationId=reclamation_id,
            createdAt=self._fmt(row["created_at"]),
        )

    async def get_panel_inbox(
        self,
        subject_id: str,
        *,
        limit: int = 20,
        offset: int = 0,
    ) -> PanelInboxResponse:
        lim, off = self._clamp_paging(limit, offset)
        await self._ensure_subject(subject_id)

        count_row = await self._fetch_one(
            f"""
            SELECT COUNT(*) AS cnt
            FROM homonet.reclamation r
            WHERE
                (r.respondent_subject_id = %s OR r.current_responsible_subject_id = %s)
                AND r.status::text IN {_ACTIVE_SQL}
            """,
            subject_id,
            subject_id,
        )
        total = int(count_row["cnt"]) if count_row else 0

        rows = await self._fetch_all(
            f"""
            SELECT
                r.reclamation_id::text,
                r.reclamation_type::text,
                r.source_type::text,
                r.status::text,
                r.priority::text,
                r.title,
                r.target_type,
                r.target_id::text,
                r.created_by_subject_id::text,
                r.respondent_subject_id::text,
                r.current_responsible_subject_id::text,
                r.community_id::text,
                r.created_at,
                r.deadline_at,
                EXISTS (
                    SELECT 1
                    FROM homonet.reclamation_message m
                    WHERE
                        m.reclamation_id = r.reclamation_id
                        AND m.author_subject_id IS DISTINCT FROM %s
                        AND NOT EXISTS (
                            SELECT 1
                            FROM homonet.reclamation_message_read mr
                            WHERE
                                mr.message_id = m.message_id
                                AND mr.subject_id = %s
                        )
                ) AS has_unread
            FROM homonet.reclamation r
            WHERE
                (r.respondent_subject_id = %s OR r.current_responsible_subject_id = %s)
                AND r.status::text IN {_ACTIVE_SQL}
            ORDER BY r.created_at DESC
            LIMIT %s OFFSET %s
            """,
            subject_id,
            subject_id,
            subject_id,
            subject_id,
            lim,
            off,
        )

        items = [self._row_to_list_item(r) for r in rows]

        return PanelInboxResponse(
            data=items,
            meta=Meta(total=total, limit=lim, offset=off),
        )

    async def get_panel_outbox(
        self,
        created_by_subject_id: str,
        *,
        limit: int = 20,
        offset: int = 0,
    ) -> ReclamationListResponse:
        lim, off = self._clamp_paging(limit, offset)
        await self._ensure_subject(created_by_subject_id)

        count_row = await self._fetch_one(
            f"""
            SELECT COUNT(*) AS cnt
            FROM homonet.reclamation r
            WHERE
                r.created_by_subject_id = %s
                AND r.status::text IN {_OUTBOX_ACTIVE_SQL}
            """,
            created_by_subject_id,
        )
        total = int(count_row["cnt"]) if count_row else 0

        rows = await self._fetch_all(
            f"""
            SELECT
                r.reclamation_id::text,
                r.reclamation_type::text,
                r.source_type::text,
                r.status::text,
                r.priority::text,
                r.title,
                r.target_type,
                r.target_id::text,
                r.created_by_subject_id::text,
                r.respondent_subject_id::text,
                r.current_responsible_subject_id::text,
                r.community_id::text,
                r.created_at,
                r.deadline_at,
                EXISTS (
                    SELECT 1
                    FROM homonet.reclamation_message m
                    WHERE
                        m.reclamation_id = r.reclamation_id
                        AND m.author_subject_id IS DISTINCT FROM %s
                        AND NOT EXISTS (
                            SELECT 1
                            FROM homonet.reclamation_message_read mr
                            WHERE
                                mr.message_id = m.message_id
                                AND mr.subject_id = %s
                        )
                ) AS has_unread
            FROM homonet.reclamation r
            WHERE
                r.created_by_subject_id = %s
                AND r.status::text IN {_OUTBOX_ACTIVE_SQL}
            ORDER BY r.created_at DESC
            LIMIT %s OFFSET %s
            """,
            created_by_subject_id,
            created_by_subject_id,
            created_by_subject_id,
            lim,
            off,
        )

        items = [self._row_to_list_item(r) for r in rows]

        return ReclamationListResponse(
            data=items,
            meta=Meta(total=total, limit=lim, offset=off),
        )

    async def get_panel_archive(
        self,
        subject_id: str,
        *,
        limit: int = 20,
        offset: int = 0,
    ) -> ReclamationListResponse:
        lim, off = self._clamp_paging(limit, offset)
        await self._ensure_subject(subject_id)

        count_row = await self._fetch_one(
            f"""
            SELECT COUNT(*) AS cnt
            FROM homonet.reclamation r
            WHERE
                (
                    r.created_by_subject_id = %s
                    OR r.respondent_subject_id = %s
                    OR r.current_responsible_subject_id = %s
                )
                AND r.status::text IN {_ARCHIVE_SQL}
            """,
            subject_id,
            subject_id,
            subject_id,
        )
        total = int(count_row["cnt"]) if count_row else 0

        rows = await self._fetch_all(
            f"""
            SELECT
                r.reclamation_id::text,
                r.reclamation_type::text,
                r.source_type::text,
                r.status::text,
                r.priority::text,
                r.title,
                r.target_type,
                r.target_id::text,
                r.created_by_subject_id::text,
                r.respondent_subject_id::text,
                r.current_responsible_subject_id::text,
                r.community_id::text,
                r.created_at,
                r.deadline_at,
                EXISTS (
                    SELECT 1
                    FROM homonet.reclamation_message m
                    WHERE
                        m.reclamation_id = r.reclamation_id
                        AND m.author_subject_id IS DISTINCT FROM %s
                        AND NOT EXISTS (
                            SELECT 1
                            FROM homonet.reclamation_message_read mr
                            WHERE
                                mr.message_id = m.message_id
                                AND mr.subject_id = %s
                        )
                ) AS has_unread
            FROM homonet.reclamation r
            WHERE
                (
                    r.created_by_subject_id = %s
                    OR r.respondent_subject_id = %s
                    OR r.current_responsible_subject_id = %s
                )
                AND r.status::text IN {_ARCHIVE_SQL}
            ORDER BY COALESCE(r.closed_at, r.created_at) DESC
            LIMIT %s OFFSET %s
            """,
            subject_id,
            subject_id,
            subject_id,
            subject_id,
            subject_id,
            lim,
            off,
        )

        items = [self._row_to_list_item(r) for r in rows]

        return ReclamationListResponse(
            data=items,
            meta=Meta(total=total, limit=lim, offset=off),
        )

    async def get_panel_dashboard(
        self,
        subject_id: str,
    ) -> PanelDashboardResponse:
        await self._ensure_subject(subject_id)

        row = await self._fetch_one(
            f"""
            SELECT
                (
                    SELECT COUNT(*)
                    FROM homonet.reclamation r
                    WHERE
                        (r.respondent_subject_id = %s OR r.current_responsible_subject_id = %s)
                        AND r.status::text IN {_ACTIVE_SQL}
                ) AS inbox_count,
                (
                    SELECT COUNT(*)
                    FROM homonet.reclamation r
                    WHERE
                        r.created_by_subject_id = %s
                        AND r.status::text IN {_OUTBOX_ACTIVE_SQL}
                ) AS outbox_count,
                (
                    SELECT COUNT(*)
                    FROM homonet.reclamation r
                    WHERE
                        (
                            r.created_by_subject_id = %s
                            OR r.respondent_subject_id = %s
                            OR r.current_responsible_subject_id = %s
                        )
                        AND r.status = 'waiting_response'::homonet.reclamation_status_enum
                ) AS waiting_response_count,
                (
                    SELECT COUNT(*)
                    FROM homonet.reclamation r
                    WHERE
                        (
                            r.created_by_subject_id = %s
                            OR r.respondent_subject_id = %s
                            OR r.current_responsible_subject_id = %s
                        )
                        AND r.status = 'escalated'::homonet.reclamation_status_enum
                ) AS escalated_count,
                (
                    SELECT COUNT(*)
                    FROM homonet.reclamation r
                    WHERE
                        (
                            r.created_by_subject_id = %s
                            OR r.respondent_subject_id = %s
                            OR r.current_responsible_subject_id = %s
                        )
                        AND r.deadline_at IS NOT NULL
                        AND r.deadline_at < now()
                        AND r.status::text NOT IN {_ARCHIVE_SQL}
                ) AS overdue_count,
                (
                    SELECT COUNT(*)
                    FROM homonet.reclamation r
                    WHERE
                        (
                            r.created_by_subject_id = %s
                            OR r.respondent_subject_id = %s
                            OR r.current_responsible_subject_id = %s
                        )
                        AND r.status::text IN {_ARCHIVE_SQL}
                ) AS closed_count
            """,
            subject_id,
            subject_id,
            subject_id,
            subject_id,
            subject_id,
            subject_id,
            subject_id,
            subject_id,
            subject_id,
            subject_id,
            subject_id,
            subject_id,
        )

        data = DashboardData(
            inboxCount=int(row["inbox_count"] or 0),
            outboxCount=int(row["outbox_count"] or 0),
            waitingResponseCount=int(row["waiting_response_count"] or 0),
            escalatedCount=int(row["escalated_count"] or 0),
            overdueCount=int(row["overdue_count"] or 0),
            closedCount=int(row["closed_count"] or 0),
        )

        return PanelDashboardResponse(data=data)