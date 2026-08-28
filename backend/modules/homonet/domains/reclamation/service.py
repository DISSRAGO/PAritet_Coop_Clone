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
    ReclamationLevelItem,
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
    "resolved": {"completed", "closed", "escalated"},
    "escalated": {"accepted", "cancelled"},
    "with_chairman": {"accepted"},
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
    "with_chairman",
    "rejected",
)

_INBOX_STATUSES = (
    "registered",
    "accepted",
    "in_progress",
    "waiting_response",
    "escalated",
    "with_chairman",
    "resolved",
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
_INBOX_SQL = "(" + ",".join(f"'{s}'" for s in _INBOX_STATUSES) + ")"

class ReclamationService:
    _MAX_PAGE_SIZE = 100
    _DEFAULT_PAGE_SIZE = 20

    async def _get_confirmed_guarantor_subject_id(self, subject_id: str) -> str:
        """
        Возвращает subject_id подтверждённого поручителя.
        Если его ещё нет — автоматически навешивает админа (login='admin')
        как confirmed + is_default, затем возвращает его subject_id.
        """
        # 1. Пытаемся найти уже существующего confirmed‑поручителя
        row = await self._fetch_one(
            """
            SELECT guarantor_subject_id::text AS guarantor_subject_id
            FROM homonet.subject_guarantor
            WHERE subject_id = %s
              AND status = 'confirmed'
            ORDER BY confirmed_at DESC NULLS LAST, requested_at DESC
            LIMIT 1
            """,
            subject_id,
        )
        if row and row.get("guarantor_subject_id"):
            return row["guarantor_subject_id"]

        # 2. Ищем subject админа по auth_user.login = 'admin'
        admin_row = await self._fetch_one(
            """
            SELECT subject_id::text AS subject_id
            FROM homonet.auth_user
            WHERE login = 'admin'
              AND is_active = TRUE
              AND is_superuser = TRUE
              AND subject_id IS NOT NULL
            LIMIT 1
            """
        )
        if not admin_row or not admin_row.get("subject_id"):
            # Админа или его subject_id нет — сохранить прежнее поведение
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Confirmed guarantor for subject {subject_id} not found",
            )

        admin_subject_id = admin_row["subject_id"]

        # На всякий случай не создаём "сам себе поручитель"
        if admin_subject_id == subject_id:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Confirmed guarantor for subject {subject_id} not found",
            )

        # 3. Автоматически создаём запись в subject_guarantor
        async with get_conn() as conn:
            async with conn.cursor() as cur:
                await cur.execute(
                    """
                    INSERT INTO homonet.subject_guarantor (
                        subject_id,
                        guarantor_subject_id,
                        status,
                        is_default,
                        requested_at,
                        requested_by_subject_id,
                        confirmed_at
                    )
                    VALUES (
                        %s,
                        %s,
                        'confirmed',
                        TRUE,
                        now(),
                        %s,
                        now()
                    )
                    ON CONFLICT (subject_id, guarantor_subject_id) DO NOTHING
                    """,
                    (
                        subject_id,
                        admin_subject_id,
                        admin_subject_id,
                    ),
                )

        return admin_subject_id


    async def _is_active_superuser_subject(self, subject_id: str) -> bool:
        row = await self._fetch_one(
            """
            SELECT 1
            FROM homonet.auth_user
            WHERE subject_id = %s
              AND is_active = true
              AND is_superuser = true
            LIMIT 1
            """,
            subject_id,
        )
        return bool(row)

    async def _list_guaranteed_subject_ids(self, guarantor_subject_id: str) -> list[str]:
        rows = await self._fetch_all(
            """
            SELECT subject_id::text AS subject_id
            FROM homonet.subject_guarantor
            WHERE guarantor_subject_id = %s
              AND status = 'confirmed'
            """,
            guarantor_subject_id,
        )
        return [r["subject_id"] for r in rows]

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

    async def _resolve_profile_thanka_id(self, subject_id):
        """
        Находит профильную тханку субъекта:
        thanka_type_id IS NULL AND title = display_name.
        """
        if not subject_id:
            return None

        row = await self._fetch_one(
            """
            SELECT t.thanka_id::text AS thanka_id
            FROM homonet.thanka t
            JOIN homonet.author a ON a.author_id = t.author_id
            WHERE a.subject_id = %s
              AND t.thanka_type_id IS NULL
              AND t.title = a.display_name
            ORDER BY t.created_at ASC
            LIMIT 1
            """,
            subject_id,
        )
        return row["thanka_id"] if row else None

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
    def _effective_claimant_id(rec: dict) -> Optional[str]:
        if rec.get("claimant_effective_subject_id"):
            return str(rec["claimant_effective_subject_id"])
        if rec.get("created_by_subject_id"):
            return str(rec["created_by_subject_id"])
        return None

    @staticmethod
    def _effective_respondent_id(rec: dict) -> Optional[str]:
        if rec.get("respondent_effective_subject_id"):
            return str(rec["respondent_effective_subject_id"])
        if rec.get("current_responsible_subject_id"):
            return str(rec["current_responsible_subject_id"])
        if rec.get("respondent_subject_id"):
            return str(rec["respondent_subject_id"])
        return None

    @staticmethod
    def _responsible_id(rec: dict) -> Optional[str]:
        if rec.get("current_responsible_subject_id"):
            return str(rec["current_responsible_subject_id"])
        return ReclamationService._effective_respondent_id(rec)

    async def _insert_status_change_message(
        self,
        reclamation_id: str,
        actor_subject_id: Optional[str],
        old_status: str,
        new_status: str,
    ) -> None:
        """
        Создаёт системное сообщение в чат о смене статуса рекламации.
        Используем тип 'comment', чтобы сообщение отображалось как обычная реплика.
        """
        if old_status == new_status:
            return

        text = f"Статус рекламации изменён: {old_status} → {new_status}"

        async with get_conn() as conn:
            async with conn.cursor() as cur:
                await cur.execute(
                    """
                    INSERT INTO homonet.reclamation_message (
                        reclamation_id,
                        author_subject_id,
                        message_type,
                        body,
                        visibility
                    )
                    VALUES (
                        %s,
                        %s,
                        'comment'::homonet.reclamation_message_type_enum,
                        %s,
                        'participants'::homonet.reclamation_visibility_enum
                    )
                    RETURNING message_id
                    """,
                    (
                        reclamation_id,
                        actor_subject_id,
                        text,
                    ),
                )
                row = await cur.fetchone()
                message_id = str(row["message_id"])

                await cur.execute(
                    """
                    INSERT INTO homonet.reclamation_event (
                        reclamation_id,
                        event_type,
                        actor_subject_id,
                        payload
                    )
                    VALUES (
                        %s,
                        'message_added',
                        %s,
                        %s::jsonb
                    )
                    """,
                    (
                        reclamation_id,
                        actor_subject_id,
                        json.dumps(
                            {
                                "messageId": message_id,
                                "messageType": "comment",
                                "source": "status_change",
                            }
                        ),
                    ),
                )


    @staticmethod
    def _build_list_item(r: dict, unread_count: int = 0, is_current_actor: bool = True) -> ReclamationListItem:
        return ReclamationListItem(
            reclamationId=r["reclamation_id"],
            reclamationType=r["reclamation_type"],
            sourceType=r["source_type"],
            status=r["status"],
            priority=r["priority"],
            title=r["title"],
            targetType=r["target_type"],
            targetId=r["target_id"],
            createdBySubjectId=r["created_by_subject_id"],
            respondentSubjectId=r["respondent_subject_id"],
            currentResponsibleSubjectId=r["current_responsible_subject_id"],
            communityId=r["community_id"],
            createdAt=ReclamationService._fmt(r["created_at"]),
            deadlineAt=ReclamationService._fmt(r["deadline_at"]),
            hasUnread=unread_count > 0,
            unreadCount=unread_count,
            claimantEffectiveSubjectId=r.get("claimant_effective_subject_id"),
            respondentEffectiveSubjectId=r.get("respondent_effective_subject_id"),
            escalationLevel=int(r.get("escalation_level") or 0),
            isCurrentActor=is_current_actor,
        )

    async def create_reclamation(
        self,
        payload: CreateReclamationRequest,
    ) -> CreateReclamationResponse:
        await self._ensure_subject(payload.actorSubjectId)

        # Уровень 0: заявитель — исходный автор рекламации.
        # Поручитель становится effective claimant только при эскалации.
        claimant_effective_subject_id = str(payload.actorSubjectId)

        respondent_subject_id: Optional[str] = payload.respondentSubjectId

        if not respondent_subject_id and payload.targetType == "thanka":
            owner_row = await self._fetch_one(
                """
                SELECT a.subject_id::text AS subject_id
                FROM homonet.thanka t
                JOIN homonet.author a ON a.author_id = t.author_id
                WHERE t.thanka_id = %s::uuid
                LIMIT 1
                """,
                (payload.targetId,),
            )
            respondent_subject_id = (
                owner_row["subject_id"]
                if owner_row and owner_row.get("subject_id")
                else None
            )

        if respondent_subject_id:
            await self._ensure_subject(respondent_subject_id)

        # Уровень 0: исполнитель — исходный исполнитель.
        respondent_effective_subject_id: Optional[str] = respondent_subject_id

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
                        current_responsible_subject_id,
                        claimant_effective_subject_id,
                        respondent_effective_subject_id,
                        escalation_level,
                        target_type,
                        target_id,
                        community_id,
                        title,
                        description,
                        created_at
                    )
                    VALUES (
                        %s::homonet.reclamation_type_enum,
                        %s::homonet.reclamation_source_enum,
                        'registered'::homonet.reclamation_status_enum,
                        %s::homonet.reclamation_priority_enum,
                        %s,
                        %s,
                        %s,
                        %s,
                        %s,
                        0,
                        %s,
                        %s::uuid,
                        %s,
                        %s,
                        %s,
                        now()
                    )
                    RETURNING reclamation_id, created_at
                    """,
                    (
                        payload.reclamationType,
                        payload.sourceType,
                        payload.priority,
                        payload.actorSubjectId,
                        respondent_subject_id,
                        respondent_effective_subject_id,
                        claimant_effective_subject_id,
                        respondent_effective_subject_id,
                        payload.targetType,
                        payload.targetId,
                        payload.communityId,
                        payload.title,
                        payload.description,
                    ),
                )
                row = await cur.fetchone()

                reclamation_id = str(row["reclamation_id"])
                created_at = self._fmt(row.get("created_at"))

                # Фиксируем исходную пару на level 0.
                await cur.execute(
                    """
                    INSERT INTO homonet.reclamation_level (
                        reclamation_id,
                        level,
                        claimant_subject_id,
                        respondent_subject_id,
                        created_at,
                        closed_at
                    )
                    VALUES (%s, 0, %s, %s, now(), NULL)
                    ON CONFLICT (reclamation_id, level) DO NOTHING
                    """,
                    (
                        reclamation_id,
                        payload.actorSubjectId,
                        respondent_subject_id,
                    ),
                )

                # Участник-заявитель level 0 — исходный автор.
                await cur.execute(
                    """
                    INSERT INTO homonet.reclamation_participant (
                        reclamation_id,
                        subject_id,
                        participant_role,
                        added_by_subject_id
                    )
                    VALUES (
                        %s,
                        %s,
                        'claimant'::homonet.reclamation_participant_role_enum,
                        %s
                    )
                    ON CONFLICT (reclamation_id, subject_id, participant_role)
                    DO NOTHING
                    """,
                    (
                        reclamation_id,
                        payload.actorSubjectId,
                        payload.actorSubjectId,
                    ),
                )

                if (
                    respondent_effective_subject_id
                    and respondent_effective_subject_id
                    != claimant_effective_subject_id
                ):
                    await cur.execute(
                        """
                        INSERT INTO homonet.reclamation_participant (
                            reclamation_id,
                            subject_id,
                            participant_role,
                            added_by_subject_id
                        )
                        VALUES (
                            %s,
                            %s,
                            'respondent'::homonet.reclamation_participant_role_enum,
                            %s
                        )
                        ON CONFLICT (reclamation_id, subject_id, participant_role)
                        DO NOTHING
                        """,
                        (
                            reclamation_id,
                            respondent_effective_subject_id,
                            payload.actorSubjectId,
                        ),
                    )

                if respondent_effective_subject_id:
                    await cur.execute(
                        """
                        INSERT INTO homonet.reclamation_participant (
                            reclamation_id,
                            subject_id,
                            participant_role,
                            added_by_subject_id
                        )
                        VALUES (
                            %s,
                            %s,
                            'responsible'::homonet.reclamation_participant_role_enum,
                            %s
                        )
                        ON CONFLICT (reclamation_id, subject_id, participant_role)
                        DO NOTHING
                        """,
                        (
                            reclamation_id,
                            respondent_effective_subject_id,
                            payload.actorSubjectId,
                        ),
                    )

                await cur.execute(
                    """
                    INSERT INTO homonet.reclamation_event (
                        reclamation_id,
                        event_type,
                        actor_subject_id,
                        payload
                    )
                    VALUES (%s, 'created', %s, %s::jsonb)
                    """,
                    (
                        reclamation_id,
                        payload.actorSubjectId,
                        json.dumps(
                            {
                                "claimantEffectiveSubjectId": (
                                    claimant_effective_subject_id
                                ),
                                "respondentSubjectId": respondent_subject_id,
                                "respondentEffectiveSubjectId": (
                                    respondent_effective_subject_id
                                ),
                                "escalationLevel": 0,
                            }
                        ),
                    ),
                )

        return CreateReclamationResponse(
            reclamationId=reclamation_id,
            status="registered",
            title=payload.title,
            reclamationType=payload.reclamationType,
            sourceType=payload.sourceType,
            priority=payload.priority,
            targetType=payload.targetType,
            targetId=payload.targetId,
            createdAt=created_at,
            createdBySubjectId=payload.actorSubjectId,
            respondentSubjectId=respondent_subject_id,
            currentResponsibleSubjectId=respondent_effective_subject_id,
            communityId=payload.communityId,
            deadlineAt=None,
            claimantEffectiveSubjectId=claimant_effective_subject_id,
            respondentEffectiveSubjectId=respondent_effective_subject_id,
            escalationLevel=0,
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
                r.reclamation_id::text AS reclamation_id,
                r.reclamation_type::text AS reclamation_type,
                r.source_type::text AS source_type,
                r.status::text AS status,
                r.priority::text AS priority,
                r.title,
                r.target_type,
                r.target_id::text AS target_id,
                r.created_by_subject_id::text AS created_by_subject_id,
                r.respondent_subject_id::text AS respondent_subject_id,
                r.current_responsible_subject_id::text AS current_responsible_subject_id,
                r.claimant_effective_subject_id::text AS claimant_effective_subject_id,
                r.respondent_effective_subject_id::text AS respondent_effective_subject_id,
                r.escalation_level,
                r.community_id::text AS community_id,
                r.created_at,
                r.deadline_at
            FROM homonet.reclamation r
            {where_sql}
            ORDER BY r.created_at DESC
            LIMIT %s OFFSET %s
            """,
            *params,
            lim,
            off,
        )

        items = [self._build_list_item(r, 0, True) for r in rows]
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
            SELECT
                participant_id::text AS participant_id,
                reclamation_id::text AS reclamation_id,
                subject_id::text AS subject_id,
                participant_role::text AS participant_role,
                added_at,
                added_by_subject_id::text AS added_by_subject_id,
                status::text AS status
            FROM homonet.reclamation_participant
            WHERE reclamation_id = %s
            ORDER BY added_at
            """,
            reclamation_id,
        )

        messages = await self._fetch_all(
            """
            SELECT
                message_id::text AS message_id,
                reclamation_id::text AS reclamation_id,
                author_subject_id::text AS author_subject_id,
                message_type::text AS message_type,
                body,
                visibility::text AS visibility,
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
                reclamation_decision_id::text AS reclamation_decision_id,
                reclamation_id::text AS reclamation_id,
                decision_by_subject_id::text AS decision_by_subject_id,
                decision_type::text AS decision_type,
                decision_text,
                reason,
                created_at,
                effective_from,
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
                escalation_id::text AS escalation_id,
                reclamation_id::text AS reclamation_id,
                from_subject_id::text AS from_subject_id,
                to_subject_id::text AS to_subject_id,
                from_level,
                to_level,
                escalation_reason::text AS escalation_reason,
                created_at,
                created_by_subject_id::text AS created_by_subject_id
            FROM homonet.reclamation_escalation
            WHERE reclamation_id = %s
            ORDER BY created_at
            """,
            reclamation_id,
        )

        levels_raw = await self._fetch_all(
            """
            SELECT
                rl.reclamation_id::text AS reclamation_id,
                rl.level,
                rl.claimant_subject_id::text AS claimant_subject_id,
                cs.display_name AS claimant_display_name,
                ca.login AS claimant_login,
                rl.respondent_subject_id::text AS respondent_subject_id,
                rs.display_name AS respondent_display_name,
                ra.login AS respondent_login,
                rl.created_at, rl.closed_at
            FROM homonet.reclamation_level rl
            LEFT JOIN homonet.subject cs ON cs.subject_id = rl.claimant_subject_id
            LEFT JOIN homonet.subject rs ON rs.subject_id = rl.respondent_subject_id
            LEFT JOIN homonet.auth_user ca ON ca.subject_id = rl.claimant_subject_id
            LEFT JOIN homonet.auth_user ra ON ra.subject_id = rl.respondent_subject_id
            WHERE rl.reclamation_id = %s
            ORDER BY rl.level
            """,
            reclamation_id,
        )

        levels = []
        for row in levels_raw:
            claimant_thanka_id = await self._resolve_profile_thanka_id(row.get("claimant_subject_id"))
            respondent_thanka_id = await self._resolve_profile_thanka_id(row.get("respondent_subject_id"))
            levels.append(
                ReclamationLevelItem(
                    reclamationId=row["reclamation_id"],
                    level=row["level"],
                    claimantSubjectId=row.get("claimant_subject_id"),
                    claimantDisplayName=row.get("claimant_display_name"),
                    claimantLogin=row.get("claimant_login"),
                    claimantThankaId=claimant_thanka_id,
                    respondentSubjectId=row.get("respondent_subject_id"),
                    respondentDisplayName=row.get("respondent_display_name"),
                    respondentLogin=row.get("respondent_login"),
                    respondentThankaId=respondent_thanka_id,
                    createdAt=self._fmt(row.get("created_at")),
                    closedAt=self._fmt(row.get("closed_at")),
                )
            )

        attachments = await self._fetch_all(
            """
            SELECT
                attachment_id::text AS attachment_id,
                reclamation_id::text AS reclamation_id,
                message_id::text AS message_id,
                uploaded_by_subject_id::text AS uploaded_by_subject_id,
                file_ref_id::text AS file_ref_id,
                uri,
                title,
                description,
                created_at
            FROM homonet.reclamation_attachment
            WHERE reclamation_id = %s
            ORDER BY created_at
            """,
            reclamation_id,
        )

        responses = await self._fetch_all(
            """
            SELECT
                response_id::text AS response_id,
                reclamation_id::text AS reclamation_id,
                respondent_subject_id::text AS respondent_subject_id,
                response_type::text AS response_type,
                body,
                created_at
            FROM homonet.reclamation_response
            WHERE reclamation_id = %s
            ORDER BY created_at
            """,
            reclamation_id,
        )

        events = await self._fetch_all(
            """
            SELECT
                event_id::text AS event_id,
                reclamation_id::text AS reclamation_id,
                event_type::text AS event_type,
                actor_subject_id::text AS actor_subject_id,
                payload,
                created_at
            FROM homonet.reclamation_event
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
            respondentSubjectId=str(rec["respondent_subject_id"]) if rec.get("respondent_subject_id") else None,
            currentResponsibleSubjectId=(
                str(rec["current_responsible_subject_id"])
                if rec.get("current_responsible_subject_id")
                else None
            ),
            claimantEffectiveSubjectId=(
                str(rec["claimant_effective_subject_id"])
                if rec.get("claimant_effective_subject_id")
                else None
            ),
            respondentEffectiveSubjectId=(
                str(rec["respondent_effective_subject_id"])
                if rec.get("respondent_effective_subject_id")
                else None
            ),
            escalationLevel=int(rec.get("escalation_level") or 0),
            communityId=str(rec["community_id"]) if rec.get("community_id") else None,
            createdAt=self._fmt(rec["created_at"]),
            acceptedAt=self._fmt(rec.get("accepted_at")),
            closedAt=self._fmt(rec.get("closed_at")),
            deadlineAt=self._fmt(rec.get("deadline_at")),
            participants=ser(participants),
            messages=ser(messages),
            decisions=ser(decisions),
            escalations=ser(escalations),
            attachments=ser(attachments),
            responses=ser(responses),
            events=ser(events),
            levels=levels,
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

        claimant_id = self._effective_claimant_id(rec)
        respondent_id = self._effective_respondent_id(rec)
        responsible_id = self._responsible_id(rec)
        actor_id = payload.actorSubjectId

        is_claimant = bool(
            actor_id and claimant_id and actor_id == claimant_id
        )
        is_executor = bool(
            actor_id and (actor_id == respondent_id or actor_id == responsible_id)
        )

        is_chairman_mode = bool(
            actor_id
            and claimant_id == actor_id
            and respondent_id == actor_id
            and responsible_id == actor_id
            and await self._is_active_superuser_subject(actor_id)
        )

        set_clauses: list[str] = []
        params: list = []

        if payload.priority:
            set_clauses.append(
                "priority = %s::homonet.reclamation_priority_enum"
            )
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

        requested_status: Optional[str] = None
        final_status: Optional[str] = None
        chairman_final_decision = False

        if payload.status:
            requested_status = str(payload.status)
            self._check_transition(current_status, requested_status)

            if requested_status in (
                "accepted",
                "in_progress",
                "waiting_response",
                "resolved",
                "rejected",
            ) and not is_executor:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="only_executor_can_set_processing_status",
                )

            if requested_status in ("completed", "escalated") and not is_claimant:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="only_claimant_can_finalize_or_escalate_reclamation",
                )

            if requested_status == "closed" and not is_executor:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="only_executor_can_close_reclamation",
                )

            if requested_status == "cancelled" and not is_claimant:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="only_claimant_can_cancel_reclamation",
                )

            chairman_final_decision = bool(
                is_chairman_mode
                and requested_status in ("resolved", "rejected")
            )

            # Решение председателя окончательно. Итог в основной таблице —
            # completed, а resolved/rejected остаётся отдельным event.
            final_status = (
                "completed" if chairman_final_decision else requested_status
            )

            set_clauses.append(
                "status = %s::homonet.reclamation_status_enum"
            )
            params.append(final_status)

            if requested_status == "accepted":
                set_clauses.append("accepted_at = COALESCE(accepted_at, now())")

            if final_status in (
                "accepted",
                "in_progress",
                "waiting_response",
                "resolved",
                "rejected",
                "escalated",
                "with_chairman",
            ):
                set_clauses.append("closed_at = NULL")

            if final_status in ("completed", "closed", "cancelled"):
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

                if requested_status and actor_id:
                    if chairman_final_decision:
                        await cur.execute(
                            """
                            INSERT INTO homonet.reclamation_event
                            (
                                reclamation_id,
                                event_type,
                                actor_subject_id,
                                payload
                            )
                            VALUES (%s, 'status_changed', %s, %s::jsonb)
                            """,
                            (
                                reclamation_id,
                                actor_id,
                                json.dumps(
                                    {
                                        "status": requested_status,
                                        "source": "chairman_final_decision",
                                        "isFinal": True,
                                    }
                                ),
                            ),
                        )

                        await cur.execute(
                            """
                            INSERT INTO homonet.reclamation_event
                            (
                                reclamation_id,
                                event_type,
                                actor_subject_id,
                                payload
                            )
                            VALUES (%s, 'status_changed', %s, %s::jsonb)
                            """,
                            (
                                reclamation_id,
                                actor_id,
                                json.dumps(
                                    {
                                        "status": "completed",
                                        "source": "chairman_final_decision",
                                        "decisionStatus": requested_status,
                                        "isFinal": True,
                                    }
                                ),
                            ),
                        )

                        await cur.execute(
                            """
                            UPDATE homonet.reclamation_level
                            SET closed_at = COALESCE(closed_at, now())
                            WHERE reclamation_id = %s
                              AND level = %s
                            """,
                            (
                                reclamation_id,
                                int(rec.get("escalation_level") or 0),
                            ),
                        )
                    else:
                        await cur.execute(
                            """
                            INSERT INTO homonet.reclamation_event
                            (
                                reclamation_id,
                                event_type,
                                actor_subject_id,
                                payload
                            )
                            VALUES (%s, 'status_changed', %s, %s::jsonb)
                            """,
                            (
                                reclamation_id,
                                actor_id,
                                json.dumps({"status": final_status}),
                            ),
                        )

        # Системное сообщение в чат о смене статуса (если он действительно поменялся)
        if final_status and final_status != current_status:
            await self._insert_status_change_message(
                reclamation_id=reclamation_id,
                actor_subject_id=actor_id,
                old_status=current_status,
                new_status=final_status,
            )

        if chairman_final_decision:
            return StatusTransitionResponse(
                reclamationId=reclamation_id,
                status="completed",
                message=(
                    "chairman_final_resolution"
                    if requested_status == "resolved"
                    else "chairman_final_rejection"
                ),
            )

        return StatusTransitionResponse(
            reclamationId=reclamation_id,
            status=final_status or current_status,
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

        respondent_id = self._effective_respondent_id(rec)
        responsible_id = self._responsible_id(rec)
        actor_id = payload.actorSubjectId
        is_executor = bool(actor_id and (actor_id == respondent_id or actor_id == responsible_id))

        if not is_executor:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="only_executor_can_accept_reclamation",
            )

        old_status = str(rec["status"])
        self._check_transition(old_status, "accepted")

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

        await self._insert_status_change_message(
            reclamation_id=reclamation_id,
            actor_subject_id=payload.actorSubjectId,
            old_status=old_status,
            new_status="accepted",
        )

        return StatusTransitionResponse(
            reclamationId=reclamation_id,
            status="accepted",
            message="reclamation accepted",
        )

    
    async def assign_reclamation(
        self,
        reclamation_id: str,
        payload: AssignReclamationRequest,
    ) -> StatusTransitionResponse:
        rec = await self._ensure_reclamation(reclamation_id)
        if str(rec["status"]) in ("closed", "cancelled", "completed"):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="closed_reclamation_immutable",
            )

        await self._ensure_subject(payload.responsibleSubjectId)

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
                    VALUES (%s, 'responsible_assigned', %s, '{}'::jsonb)
                    """,
                    (reclamation_id, payload.actorSubjectId),
                )

        return StatusTransitionResponse(
            reclamationId=reclamation_id,
            status=str(rec["status"]),
            message="responsible assigned",
        )

    async def withdraw_reclamation(
        self,
        reclamation_id: str,
        payload: WithdrawReclamationRequest,
    ) -> StatusTransitionResponse:
        rec = await self._ensure_reclamation(reclamation_id)

        if payload.actorSubjectId:
            await self._ensure_subject(payload.actorSubjectId)

        claimant_id = self._effective_claimant_id(rec)
        if payload.actorSubjectId != claimant_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="only_claimant_can_cancel_reclamation",
            )

        old_status = str(rec["status"])
        self._check_transition(old_status, "cancelled")

        async with get_conn() as conn:
            async with conn.cursor() as cur:
                await cur.execute(
                    """
                    UPDATE homonet.reclamation
                    SET status = 'cancelled'::homonet.reclamation_status_enum,
                        closed_at = now()
                    WHERE reclamation_id = %s
                    """,
                    (reclamation_id,),
                )

                await cur.execute(
                    """
                    INSERT INTO homonet.reclamation_event
                    (reclamation_id, event_type, actor_subject_id, payload)
                    VALUES (%s, 'cancelled', %s, '{}'::jsonb)
                    """,
                    (reclamation_id, payload.actorSubjectId),
                )

        await self._insert_status_change_message(
            reclamation_id=reclamation_id,
            actor_subject_id=payload.actorSubjectId,
            old_status=old_status,
            new_status="cancelled",
        )

        return StatusTransitionResponse(
            reclamationId=reclamation_id,
            status="cancelled",
            message="reclamation cancelled",
        )


    async def close_reclamation(
        self,
        reclamation_id: str,
        payload: CloseReclamationRequest,
    ) -> StatusTransitionResponse:
        rec = await self._ensure_reclamation(reclamation_id)

        if payload.actorSubjectId:
            await self._ensure_subject(payload.actorSubjectId)

        respondent_id = self._effective_respondent_id(rec)
        responsible_id = self._responsible_id(rec)
        actor_id = payload.actorSubjectId
        is_executor = bool(actor_id and (actor_id == respondent_id or actor_id == responsible_id))

        if not is_executor:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="only_executor_can_close_reclamation",
            )

        old_status = str(rec["status"])
        self._check_transition(old_status, "closed")

        async with get_conn() as conn:
            async with conn.cursor() as cur:
                await cur.execute(
                    """
                    UPDATE homonet.reclamation
                    SET status = 'closed'::homonet.reclamation_status_enum,
                        closed_at = now()
                    WHERE reclamation_id = %s
                    """,
                    (reclamation_id,),
                )

                await cur.execute(
                    """
                    INSERT INTO homonet.reclamation_event
                    (reclamation_id, event_type, actor_subject_id, payload)
                    VALUES (%s, 'closed', %s, '{}'::jsonb)
                    """,
                    (reclamation_id, payload.actorSubjectId),
                )

        await self._insert_status_change_message(
            reclamation_id=reclamation_id,
            actor_subject_id=payload.actorSubjectId,
            old_status=old_status,
            new_status="closed",
        )

        return StatusTransitionResponse(
            reclamationId=reclamation_id,
            status="closed",
            message="reclamation closed",
        )


    async def escalate_reclamation(
        self,
        reclamation_id: str,
        payload: EscalateReclamationRequest,
    ) -> EscalateReclamationResponse:
        rec = await self._ensure_reclamation(reclamation_id)

        if payload.actorSubjectId:
            await self._ensure_subject(payload.actorSubjectId)

        claimant_id = self._effective_claimant_id(rec)
        respondent_id = self._effective_respondent_id(rec)
        created_by_subject_id = (
            str(rec["created_by_subject_id"])
            if rec.get("created_by_subject_id")
            else None
        )

        if payload.actorSubjectId not in {claimant_id, created_by_subject_id}:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="only_current_claimant_can_escalate_reclamation",
            )

        self._check_transition(str(rec["status"]), "escalated")

        if not claimant_id or not respondent_id:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="reclamation_actors_are_not_defined_for_escalation",
            )

        allowed_escalation_reasons = {
            "no_response",
            "conflict_of_interest",
            "timeout",
            "appeal",
            "insufficient_authority",
            "manual",
        }

        if payload.escalationReason not in allowed_escalation_reasons:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail={
                    "code": "invalid_escalation_reason",
                    "message": "Invalid escalation reason",
                    "allowedValues": sorted(allowed_escalation_reasons),
                },
            )

        comment = (payload.comment or "").strip()
        if not comment:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail={
                    "code": "empty_escalation_comment",
                    "message": "Escalation comment is required",
                },
            )

        next_claimant_id = await self._get_confirmed_guarantor_subject_id(
            claimant_id
        )
        next_respondent_id = await self._get_confirmed_guarantor_subject_id(
            respondent_id
        )

        next_claimant_is_chairman = await self._is_active_superuser_subject(
            next_claimant_id
        )
        next_respondent_is_chairman = await self._is_active_superuser_subject(
            next_respondent_id
        )

        chairman_subject_id: Optional[str] = None
        if next_claimant_is_chairman:
            chairman_subject_id = next_claimant_id
        elif next_respondent_is_chairman:
            chairman_subject_id = next_respondent_id

        is_chairman_case = chairman_subject_id is not None

        current_level = int(rec.get("escalation_level") or 0)
        next_level = current_level + 1

        next_status = "with_chairman" if is_chairman_case else "escalated"

        # У председателя нет раздельных ролей claimant/respondent:
        # он — единый финальный арбитр.
        effective_claimant_id = (
            chairman_subject_id if is_chairman_case else next_claimant_id
        )
        effective_respondent_id = (
            chairman_subject_id if is_chairman_case else next_respondent_id
        )
        effective_responsible_id = effective_respondent_id

        async with get_conn() as conn:
            async with conn.cursor() as cur:
                await cur.execute(
                    """
                    INSERT INTO homonet.reclamation_escalation
                    (
                        reclamation_id,
                        from_level,
                        to_level,
                        escalation_reason,
                        created_by_subject_id
                    )
                    VALUES (
                        %s,
                        %s,
                        %s,
                        %s::homonet.reclamation_escalation_reason_enum,
                        %s
                    )
                    RETURNING escalation_id
                    """,
                    (
                        reclamation_id,
                        current_level,
                        next_level,
                        payload.escalationReason,
                        payload.actorSubjectId,
                    ),
                )
                row = await cur.fetchone()
                escalation_id = str(row["escalation_id"])

                await cur.execute(
                    """
                    UPDATE homonet.reclamation
                    SET status = %s::homonet.reclamation_status_enum,
                        closed_at = NULL,
                        claimant_effective_subject_id = %s,
                        respondent_effective_subject_id = %s,
                        current_responsible_subject_id = %s,
                        escalation_level = %s
                    WHERE reclamation_id = %s
                    """,
                    (
                        next_status,
                        effective_claimant_id,
                        effective_respondent_id,
                        effective_responsible_id,
                        next_level,
                        reclamation_id,
                    ),
                )

                await cur.execute(
                    """
                    INSERT INTO homonet.reclamation_level
                    (
                        reclamation_id,
                        level,
                        claimant_subject_id,
                        respondent_subject_id,
                        created_at,
                        closed_at
                    )
                    VALUES (%s, %s, %s, %s, now(), NULL)
                    ON CONFLICT (reclamation_id, level) DO NOTHING
                    """,
                    (
                        reclamation_id,
                        next_level,
                        effective_claimant_id,
                        effective_respondent_id,
                    ),
                )

                await cur.execute(
                    """
                    UPDATE homonet.reclamation_level
                    SET closed_at = COALESCE(closed_at, now())
                    WHERE reclamation_id = %s
                      AND level = %s
                    """,
                    (
                        reclamation_id,
                        current_level,
                    ),
                )

                if is_chairman_case:
                    await cur.execute(
                        """
                        INSERT INTO homonet.reclamation_participant
                        (
                            reclamation_id,
                            subject_id,
                            participant_role,
                            added_by_subject_id
                        )
                        VALUES (
                            %s,
                            %s,
                            'responsible'::homonet.reclamation_participant_role_enum,
                            %s
                        )
                        ON CONFLICT (
                            reclamation_id,
                            subject_id,
                            participant_role
                        ) DO NOTHING
                        """,
                        (
                            reclamation_id,
                            chairman_subject_id,
                            payload.actorSubjectId,
                        ),
                    )
                else:
                    await cur.execute(
                        """
                        INSERT INTO homonet.reclamation_participant
                        (
                            reclamation_id,
                            subject_id,
                            participant_role,
                            added_by_subject_id
                        )
                        VALUES (
                            %s,
                            %s,
                            'claimant'::homonet.reclamation_participant_role_enum,
                            %s
                        )
                        ON CONFLICT (
                            reclamation_id,
                            subject_id,
                            participant_role
                        ) DO NOTHING
                        """,
                        (
                            reclamation_id,
                            next_claimant_id,
                            payload.actorSubjectId,
                        ),
                    )

                    await cur.execute(
                        """
                        INSERT INTO homonet.reclamation_participant
                        (
                            reclamation_id,
                            subject_id,
                            participant_role,
                            added_by_subject_id
                        )
                        VALUES (
                            %s,
                            %s,
                            'respondent'::homonet.reclamation_participant_role_enum,
                            %s
                        )
                        ON CONFLICT (
                            reclamation_id,
                            subject_id,
                            participant_role
                        ) DO NOTHING
                        """,
                        (
                            reclamation_id,
                            next_respondent_id,
                            payload.actorSubjectId,
                        ),
                    )

                    await cur.execute(
                        """
                        INSERT INTO homonet.reclamation_participant
                        (
                            reclamation_id,
                            subject_id,
                            participant_role,
                            added_by_subject_id
                        )
                        VALUES (
                            %s,
                            %s,
                            'responsible'::homonet.reclamation_participant_role_enum,
                            %s
                        )
                        ON CONFLICT (
                            reclamation_id,
                            subject_id,
                            participant_role
                        ) DO NOTHING
                        """,
                        (
                            reclamation_id,
                            next_respondent_id,
                            payload.actorSubjectId,
                        ),
                    )

                await cur.execute(
                    """
                    INSERT INTO homonet.reclamation_event
                    (
                        reclamation_id,
                        event_type,
                        actor_subject_id,
                        payload
                    )
                    VALUES (%s, 'escalated', %s, %s::jsonb)
                    """,
                    (
                        reclamation_id,
                        payload.actorSubjectId,
                        json.dumps(
                            {
                                "escalationId": escalation_id,
                                "escalationReason": payload.escalationReason,
                                "comment": comment,
                                "fromLevel": current_level,
                                "toLevel": next_level,
                                "prevClaimantSubjectId": claimant_id,
                                "prevRespondentSubjectId": respondent_id,
                                "nextClaimantSubjectId": effective_claimant_id,
                                "nextRespondentSubjectId": effective_respondent_id,
                                "initiatorSubjectId": created_by_subject_id,
                                "isChairmanCase": is_chairman_case,
                                "chairmanSubjectId": chairman_subject_id,
                                "nextStatus": next_status,
                            }
                        ),
                    ),
                )

                message_body = (
                    "Рекламация передана председателю для финального решения.\n"
                    if is_chairman_case
                    else "Рекламация эскалирована.\n"
                )
                message_body += (
                    f"Причина: {payload.escalationReason}\n\n"
                    f"Комментарий:\n{comment}"
                )

                await cur.execute(
                    """
                    INSERT INTO homonet.reclamation_message
                    (
                        reclamation_id,
                        author_subject_id,
                        message_type,
                        body,
                        visibility
                    )
                    VALUES (
                        %s,
                        %s,
                        'comment'::homonet.reclamation_message_type_enum,
                        %s,
                        'participants'::homonet.reclamation_visibility_enum
                    )
                    RETURNING message_id
                    """,
                    (
                        reclamation_id,
                        payload.actorSubjectId,
                        message_body,
                    ),
                )
                await cur.fetchone()

        return EscalateReclamationResponse(
            escalationId=escalation_id,
            reclamationId=reclamation_id,
            status=next_status,
            claimantEffectiveSubjectId=effective_claimant_id,
            respondentEffectiveSubjectId=effective_respondent_id,
            escalationLevel=next_level,
        )

    async def create_message(
        self,
        reclamation_id: str,
        payload: CreateMessageRequest,
    ) -> CreateMessageResponse:
        rec = await self._ensure_reclamation(reclamation_id)
        await self._ensure_subject(payload.actorSubjectId)

        current_status = str(rec["status"])

        if current_status in {"closed", "cancelled", "completed"}:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Закрытая рекламация недоступна для новых сообщений.",
            )

        actor_id = payload.actorSubjectId

        claimant_id = (
            str(rec["claimant_effective_subject_id"])
            if rec.get("claimant_effective_subject_id")
            else str(rec["created_by_subject_id"])
        )

        responsible_id = (
            str(rec["current_responsible_subject_id"])
            if rec.get("current_responsible_subject_id")
            else (
                str(rec["respondent_effective_subject_id"])
                if rec.get("respondent_effective_subject_id")
                else (
                    str(rec["respondent_subject_id"])
                    if rec.get("respondent_subject_id")
                    else None
                )
            )
        )

        active_writer_ids = {
            subject_id
            for subject_id in (claimant_id, responsible_id)
            if subject_id
        }

        if actor_id not in active_writer_ids:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=(
                    "Отправка сообщений недоступна после эскалации. "
                    "Переписка доступна только для чтения."
                ),
            )

        message_id: Optional[str] = None
        created_at: Optional[str] = None
        auto_status: Optional[str] = None

        async with get_conn() as conn:
            async with conn.cursor() as cur:
                await cur.execute(
                    """
                    INSERT INTO homonet.reclamation_message (
                        reclamation_id,
                        author_subject_id,
                        message_type,
                        body,
                        visibility
                    )
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

                message_id = str(row["message_id"])
                created_at_value = row["created_at"]
                created_at = (
                    created_at_value.isoformat()
                    if hasattr(created_at_value, "isoformat")
                    else str(created_at_value)
                )

                await cur.execute(
                    """
                    INSERT INTO homonet.reclamation_event (
                        reclamation_id,
                        event_type,
                        actor_subject_id,
                        payload
                    )
                    VALUES (
                        %s,
                        'message_added',
                        %s,
                        %s::jsonb
                    )
                    """,
                    (
                        reclamation_id,
                        payload.actorSubjectId,
                        json.dumps(
                            {
                                "messageId": message_id,
                                "messageType": payload.messageType,
                            }
                        ),
                    ),
                )

                is_claimant = actor_id == claimant_id
                is_executor = actor_id == responsible_id

                # Автоматическая смена статуса по типу сообщения
                if (
                    payload.messageType == "clarification_request"
                    and is_executor
                    and current_status in {"accepted", "in_progress", "escalated"}
                ):
                    auto_status = "waiting_response"
                elif current_status == "waiting_response" and is_claimant:
                    auto_status = "in_progress"

                if auto_status:
                    await cur.execute(
                        """
                        UPDATE homonet.reclamation
                        SET
                            status = %s::homonet.reclamation_status_enum,
                            closed_at = NULL
                        WHERE reclamation_id = %s
                        """,
                        (auto_status, reclamation_id),
                    )

                    await cur.execute(
                        """
                        INSERT INTO homonet.reclamation_event (
                            reclamation_id,
                            event_type,
                            actor_subject_id,
                            payload
                        )
                        VALUES (
                            %s,
                            'status_changed',
                            %s,
                            %s::jsonb
                        )
                        """,
                        (
                            reclamation_id,
                            payload.actorSubjectId,
                            json.dumps(
                                {
                                    "status": auto_status,
                                    "source": "message",
                                }
                            ),
                        ),
                    )

        if auto_status:
            await self._insert_status_change_message(
                reclamation_id=reclamation_id,
                actor_subject_id=payload.actorSubjectId,
                old_status=current_status,
                new_status=auto_status,
            )

        return CreateMessageResponse(
            messageId=message_id,
            reclamationId=reclamation_id,
            createdAt=created_at,
        )
    
    async def create_response(
        self,
        reclamation_id: str,
        payload: CreateResponseRequest,
    ) -> CreateResponseResponse:
        await self._ensure_reclamation(reclamation_id)
        await self._ensure_subject(payload.actorSubjectId)

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
                        payload.actorSubjectId,
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
                        payload.actorSubjectId,
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

        await self._ensure_subject(payload.actorSubjectId)

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
                    RETURNING reclamation_decision_id
                    """,
                    (
                        reclamation_id,
                        payload.actorSubjectId,
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
                        payload.actorSubjectId,
                        json.dumps({"decisionType": payload.decisionType, "isFinal": payload.isFinal}),
                    ),
                )

        return CreateDecisionResponse(
            reclamationDecisionId=str(row["reclamation_decision_id"]),
            reclamationId=reclamation_id,
            decisionType=payload.decisionType,
        )

    async def create_attachment(
        self,
        reclamation_id: str,
        payload: CreateAttachmentRequest,
    ) -> CreateAttachmentResponse:
        await self._ensure_reclamation(reclamation_id)
        await self._ensure_subject(payload.actorSubjectId)

        async with get_conn() as conn:
            async with conn.cursor() as cur:
                await cur.execute(
                    """
                    INSERT INTO homonet.reclamation_attachment
                    (reclamation_id, message_id, uploaded_by_subject_id, uri, title, description)
                    VALUES (%s, %s, %s, %s, %s, %s)
                    RETURNING attachment_id
                    """,
                    (
                        reclamation_id,
                        payload.messageId,
                        payload.actorSubjectId,
                        payload.uri,
                        payload.title,
                        payload.description,
                    ),
                )
                row = await cur.fetchone()

        return CreateAttachmentResponse(
            attachmentId=str(row["attachment_id"]),
            reclamationId=reclamation_id,
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

        # Входящие: пользователь был исполнителем хотя бы на одном уровне
        # истории рекламации. Архивные статусы сюда не входят через _INBOX_SQL.
        count_row = await self._fetch_one(
            f"""
            SELECT COUNT(*) AS cnt
            FROM homonet.reclamation r
            WHERE
                EXISTS (
                    SELECT 1
                    FROM homonet.reclamation_level rl
                    WHERE rl.reclamation_id = r.reclamation_id
                      AND rl.respondent_subject_id = %s
                )
                AND r.status::text IN (
                    'registered',
                    'accepted',
                    'in_progress',
                    'waiting_response',
                    'escalated',
                    'with_chairman',
                    'resolved'
                )
            """,
            subject_id,
        )
        total = int(count_row["cnt"] or 0) if count_row else 0

        rows = await self._fetch_all(
            f"""
            SELECT
                r.reclamation_id::text AS reclamation_id,
                r.reclamation_type::text AS reclamation_type,
                r.source_type::text AS source_type,
                r.status::text AS status,
                r.priority::text AS priority,
                r.title AS title,
                r.target_type AS target_type,
                r.target_id::text AS target_id,
                r.created_by_subject_id::text AS created_by_subject_id,
                r.respondent_subject_id::text AS respondent_subject_id,
                r.current_responsible_subject_id::text AS current_responsible_subject_id,
                r.claimant_effective_subject_id::text AS claimant_effective_subject_id,
                r.respondent_effective_subject_id::text AS respondent_effective_subject_id,
                r.escalation_level,
                r.community_id::text AS community_id,
                r.created_at AS created_at,
                r.deadline_at AS deadline_at,
                (
                    SELECT COUNT(*)
                    FROM homonet.reclamation_message m
                    WHERE m.reclamation_id = r.reclamation_id
                      AND m.author_subject_id <> %s
                      AND m.created_at > COALESCE(
                          rr.read_at,
                          '-infinity'::timestamptz
                      )
                )::int AS unread_count
            FROM homonet.reclamation r
            LEFT JOIN homonet.reclamation_read rr
                ON rr.reclamation_id = r.reclamation_id
               AND rr.subject_id = %s
            WHERE
                EXISTS (
                    SELECT 1
                    FROM homonet.reclamation_level rl
                    WHERE rl.reclamation_id = r.reclamation_id
                      AND rl.respondent_subject_id = %s
                )
                AND r.status::text IN (
                    'registered',
                    'accepted',
                    'in_progress',
                    'waiting_response',
                    'escalated',
                    'with_chairman',
                    'resolved'
                )
            ORDER BY r.created_at DESC
            LIMIT %s OFFSET %s
            """,
            subject_id,
            subject_id,
            subject_id,
            lim,
            off,
        )

        items = [
            self._build_list_item(r, int(r["unread_count"] or 0))
            for r in rows
        ]
        return PanelInboxResponse(
            data=items,
            meta=Meta(total=total, limit=lim, offset=off),
        )
    
    async def get_panel_outbox(
        self,
        subject_id: str,
        limit: int = 20,
        offset: int = 0,
    ) -> ReclamationListResponse:
        lim, off = self._clamp_paging(limit, offset)
        await self._ensure_subject(subject_id)

        # Исходящие: пользователь был заявителем хотя бы на одном уровне.
        count_row = await self._fetch_one(
            f"""
            SELECT COUNT(*) AS cnt
            FROM homonet.reclamation r
            WHERE
                EXISTS (
                    SELECT 1
                    FROM homonet.reclamation_level rl
                    WHERE rl.reclamation_id = r.reclamation_id
                      AND rl.claimant_subject_id = %s
                )
                AND r.status::text NOT IN (
                    'completed',
                    'closed',
                    'cancelled',
                    'with_chairman'
                )
            """,
            subject_id,
        )
        total = int(count_row["cnt"] or 0) if count_row else 0

        rows = await self._fetch_all(
            f"""
            SELECT
                r.reclamation_id::text AS reclamation_id,
                r.reclamation_type::text AS reclamation_type,
                r.source_type::text AS source_type,
                r.status::text AS status,
                r.priority::text AS priority,
                r.title AS title,
                r.target_type AS target_type,
                r.target_id::text AS target_id,
                r.created_by_subject_id::text AS created_by_subject_id,
                r.respondent_subject_id::text AS respondent_subject_id,
                r.current_responsible_subject_id::text AS current_responsible_subject_id,
                r.claimant_effective_subject_id::text AS claimant_effective_subject_id,
                r.respondent_effective_subject_id::text AS respondent_effective_subject_id,
                r.escalation_level,
                r.community_id::text AS community_id,
                r.created_at AS created_at,
                r.deadline_at AS deadline_at,
                (
                    r.claimant_effective_subject_id::text = %s
                ) AS iscurrentactor,
                (
                    SELECT COUNT(*)
                    FROM homonet.reclamation_message m
                    WHERE m.reclamation_id = r.reclamation_id
                      AND m.author_subject_id <> %s
                      AND m.created_at > COALESCE(
                          rr.read_at,
                          '-infinity'::timestamptz
                      )
                )::int AS unreadcount
            FROM homonet.reclamation r
            LEFT JOIN homonet.reclamation_read rr
                ON rr.reclamation_id = r.reclamation_id
               AND rr.subject_id = %s
            WHERE
                EXISTS (
                    SELECT 1
                    FROM homonet.reclamation_level rl
                    WHERE rl.reclamation_id = r.reclamation_id
                      AND rl.claimant_subject_id = %s
                )
                AND r.status::text NOT IN (
                    'completed',
                    'closed',
                    'cancelled',
                    'with_chairman'
                )
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

        items = [
            self._build_list_item(
                r,
                int(r["unreadcount"] or 0),
                bool(r["iscurrentactor"]),
            )
            for r in rows
        ]
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
                    OR r.claimant_effective_subject_id = %s
                    OR r.respondent_effective_subject_id = %s
                    OR EXISTS (
                        SELECT 1
                        FROM homonet.reclamation_participant rp
                        WHERE rp.reclamation_id = r.reclamation_id
                          AND rp.subject_id = %s
                    )
                )
                AND r.status::text IN {_ARCHIVE_SQL}
            """,
            subject_id,
            subject_id,
            subject_id,
            subject_id,
            subject_id,
            subject_id,
        )
        total = int(count_row["cnt"]) if count_row else 0

        rows = await self._fetch_all(
            f"""
            SELECT
                r.reclamation_id::text AS reclamation_id,
                r.reclamation_type::text AS reclamation_type,
                r.source_type::text AS source_type,
                r.status::text AS status,
                r.priority::text AS priority,
                r.title,
                r.target_type,
                r.target_id::text AS target_id,
                r.created_by_subject_id::text AS created_by_subject_id,
                r.respondent_subject_id::text AS respondent_subject_id,
                r.current_responsible_subject_id::text AS current_responsible_subject_id,
                r.claimant_effective_subject_id::text AS claimant_effective_subject_id,
                r.respondent_effective_subject_id::text AS respondent_effective_subject_id,
                r.escalation_level,
                r.community_id::text AS community_id,
                r.created_at,
                r.deadline_at,
                (
                    r.claimant_effective_subject_id::text = %s
                    OR r.respondent_effective_subject_id::text = %s
                    OR r.current_responsible_subject_id::text = %s
                ) AS is_current_actor
            FROM homonet.reclamation r
            WHERE
                (
                    r.created_by_subject_id = %s
                    OR r.respondent_subject_id = %s
                    OR r.current_responsible_subject_id = %s
                    OR r.claimant_effective_subject_id = %s
                    OR r.respondent_effective_subject_id = %s
                    OR EXISTS (
                        SELECT 1
                        FROM homonet.reclamation_participant rp
                        WHERE rp.reclamation_id = r.reclamation_id
                          AND rp.subject_id = %s
                    )
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
            subject_id,
            subject_id,
            subject_id,
            subject_id,
            lim,
            off,
        )

        items = [
            self._build_list_item(r, 0, bool(r["is_current_actor"]))
            for r in rows
        ]
        return ReclamationListResponse(
            data=items,
            meta=Meta(total=total, limit=lim, offset=off),
        )

    async def get_panel_current_all_levels(
        self,
        subject_id: str,
        limit: int = 20,
        offset: int = 0,
    ) -> ReclamationListResponse:
        """
        Текущие рекламации для участника любого уровня эскалации.

        Рекламация видна, пока не архивирована, если субъект был:
        - заявителем на level 0, 1, 2, ...;
        - исполнителем на level 0, 1, 2, ... .

        Права на действия здесь не определяются: они по-прежнему проверяются
        по current effective claimant/respondent в buildActions и backend-методах.
        """
        lim, off = self._clamp_paging(limit, offset)
        await self._ensure_subject(subject_id)

        count_row = await self._fetch_one(
            """
            SELECT COUNT(*) AS cnt
            FROM homonet.reclamation r
            WHERE
                EXISTS (
                    SELECT 1
                    FROM homonet.reclamation_level rl
                    WHERE rl.reclamation_id = r.reclamation_id
                      AND (
                          rl.claimant_subject_id = %s
                          OR rl.respondent_subject_id = %s
                      )
                )
                AND r.status::text NOT IN (
                    'completed',
                    'closed',
                    'cancelled'
                )
            """,
            subject_id,
            subject_id,
        )
        total = int(count_row["cnt"] or 0) if count_row else 0

        rows = await self._fetch_all(
            """
            SELECT
                r.reclamation_id::text AS reclamation_id,
                r.reclamation_type::text AS reclamation_type,
                r.source_type::text AS source_type,
                r.status::text AS status,
                r.priority::text AS priority,
                r.title AS title,
                r.target_type AS target_type,
                r.target_id::text AS target_id,
                r.created_by_subject_id::text AS created_by_subject_id,
                r.respondent_subject_id::text AS respondent_subject_id,
                r.current_responsible_subject_id::text AS current_responsible_subject_id,
                r.claimant_effective_subject_id::text AS claimant_effective_subject_id,
                r.respondent_effective_subject_id::text AS respondent_effective_subject_id,
                r.escalation_level AS escalation_level,
                r.community_id::text AS community_id,
                r.created_at AS created_at,
                r.deadline_at AS deadline_at,
                (
                    r.claimant_effective_subject_id::text = %s
                    OR r.respondent_effective_subject_id::text = %s
                    OR r.current_responsible_subject_id::text = %s
                ) AS iscurrentactor,
                (
                    SELECT COUNT(*)
                    FROM homonet.reclamation_message m
                    LEFT JOIN homonet.reclamation_read rr
                        ON rr.reclamation_id = r.reclamation_id
                       AND rr.subject_id = %s
                    WHERE m.reclamation_id = r.reclamation_id
                      AND m.author_subject_id <> %s
                      AND m.created_at > COALESCE(
                          rr.read_at,
                          '-infinity'::timestamptz
                      )
                )::int AS unreadcount
            FROM homonet.reclamation r
            WHERE
                EXISTS (
                    SELECT 1
                    FROM homonet.reclamation_level rl
                    WHERE rl.reclamation_id = r.reclamation_id
                      AND (
                          rl.claimant_subject_id = %s
                          OR rl.respondent_subject_id = %s
                      )
                )
                AND r.status::text NOT IN (
                    'completed',
                    'closed',
                    'cancelled'
                )
            ORDER BY r.created_at DESC
            LIMIT %s OFFSET %s
            """,
            subject_id,  # effective claimant для iscurrentactor
            subject_id,  # effective respondent для iscurrentactor
            subject_id,  # current responsible для iscurrentactor
            subject_id,  # rr.subject_id в unread subquery
            subject_id,  # не считать собственные сообщения
            subject_id,  # claimant любого level
            subject_id,  # respondent любого level
            lim,
            off,
        )

        items = [
            self._build_list_item(
                row,
                int(row["unreadcount"] or 0),
                bool(row["iscurrentactor"]),
            )
            for row in rows
        ]

        return ReclamationListResponse(
            data=items,
            meta=Meta(total=total, limit=lim, offset=off),
        )


    
    async def get_admin_archive(
        self,
        *,
        limit: int = 20,
        offset: int = 0,
    ) -> ReclamationListResponse:
        lim, off = self._clamp_paging(limit, offset)

        count_row = await self._fetch_one(
            f"""
            SELECT COUNT(*) AS cnt
            FROM homonet.reclamation r
            WHERE r.status::text IN {_ARCHIVE_SQL}
            """
        )
        total = int(count_row["cnt"]) if count_row else 0

        rows = await self._fetch_all(
            f"""
            SELECT
                r.reclamation_id::text AS reclamation_id,
                r.reclamation_type::text AS reclamation_type,
                r.source_type::text AS source_type,
                r.status::text AS status,
                r.priority::text AS priority,
                r.title,
                r.target_type,
                r.target_id::text AS target_id,
                r.created_by_subject_id::text AS created_by_subject_id,
                r.respondent_subject_id::text AS respondent_subject_id,
                r.current_responsible_subject_id::text AS current_responsible_subject_id,
                r.claimant_effective_subject_id::text AS claimant_effective_subject_id,
                r.respondent_effective_subject_id::text AS respondent_effective_subject_id,
                r.escalation_level,
                r.community_id::text AS community_id,
                r.created_at,
                r.deadline_at
            FROM homonet.reclamation r
            WHERE r.status::text IN {_ARCHIVE_SQL}
            ORDER BY COALESCE(r.closed_at, r.created_at) DESC
            LIMIT %s OFFSET %s
            """,
            lim,
            off,
        )

        items = [self._build_list_item(r, 0, True) for r in rows]
        return ReclamationListResponse(
            data=items,
            meta=Meta(total=total, limit=lim, offset=off),
        )

    async def get_panel_dashboard(self, subject_id: str) -> PanelDashboardResponse:
        await self._ensure_subject(subject_id)

        # Число входящих и исходящих берём из уже существующих методов списка,
        # чтобы счётчики ВСЕГДА совпадали с тем, что реально показывается во вкладках.
        inbox_resp = await self.get_panel_inbox(
            subject_id=subject_id,
            limit=self._MAX_PAGE_SIZE,
            offset=0,
        )
        outbox_resp = await self.get_panel_outbox(
            subject_id=subject_id,
            limit=self._MAX_PAGE_SIZE,
            offset=0,
        )

        inbox_count = inbox_resp.meta.total
        outbox_count = outbox_resp.meta.total

        # Ждут ответа — для исполнителя
        waiting_row = await self._fetch_one(
            """
            SELECT COUNT(*) AS cnt
            FROM homonet.reclamation r
            WHERE
                (
                    r.respondent_effective_subject_id = %s
                    OR r.current_responsible_subject_id = %s
                )
                AND r.status::text = 'waiting_response'
            """,
            subject_id,
            subject_id,
        )
        waiting_count = int(waiting_row["cnt"] or 0) if waiting_row else 0

        # Эскалированные — где пользователь участвует как любой актор
        escalated_row = await self._fetch_one(
            """
            SELECT COUNT(*) AS cnt
            FROM homonet.reclamation r
            WHERE
                (
                    r.created_by_subject_id = %s
                    OR r.respondent_subject_id = %s
                    OR r.current_responsible_subject_id = %s
                    OR r.claimant_effective_subject_id = %s
                    OR r.respondent_effective_subject_id = %s
                )
                AND r.status::text = 'escalated'
            """,
            subject_id,
            subject_id,
            subject_id,
            subject_id,
            subject_id,
        )
        escalated_count = int(escalated_row["cnt"] or 0) if escalated_row else 0

        # Просроченные — для исполнителя (по общему набору активных статусов)
        overdue_row = await self._fetch_one(
            f"""
            SELECT COUNT(*) AS cnt
            FROM homonet.reclamation r
            WHERE
                (
                    r.respondent_effective_subject_id = %s
                    OR r.current_responsible_subject_id = %s
                )
                AND r.deadline_at IS NOT NULL
                AND r.deadline_at < now()
                AND r.status::text IN {_ACTIVE_SQL}
            """,
            subject_id,
            subject_id,
        )
        overdue_count = int(overdue_row["cnt"] or 0) if overdue_row else 0

        # Закрытые — считаем ТЕМ ЖЕ критерием, что get_panel_outbox (created_by_subject_id),
        # чтобы счётчик совпадал с реальным подмножеством "исходящих" пользователя.
        closed_row = await self._fetch_one(
            """
            SELECT COUNT(*) AS cnt
            FROM homonet.reclamation r
            WHERE
                r.created_by_subject_id = %s
                AND r.status::text IN ('completed', 'closed')
            """,
            subject_id,
        )
        closed_count = int(closed_row["cnt"] or 0) if closed_row else 0

        data = DashboardData(
            inboxCount=inbox_count,
            outboxCount=outbox_count,
            waitingResponseCount=waiting_count,
            escalatedCount=escalated_count,
            overdueCount=overdue_count,
            closedCount=closed_count,
        )
        return PanelDashboardResponse(data=data, meta=Meta(total=0, limit=0, offset=0))


    
    async def mark_as_read(self, reclamation_id: str, subject_id: str) -> None:
        await self._ensure_reclamation(reclamation_id)
        await self._ensure_subject(subject_id)

        async with get_conn() as conn:
            async with conn.cursor() as cur:
                await cur.execute(
                    """
                    INSERT INTO homonet.reclamation_read
                    (reclamation_id, subject_id, read_at)
                    VALUES (%s, %s, now())
                    ON CONFLICT (reclamation_id, subject_id)
                    DO UPDATE SET read_at = EXCLUDED.read_at
                    """,
                    (reclamation_id, subject_id),
                )

    async def get_unread_count(self, subject_id: str) -> int:
        await self._ensure_subject(subject_id)

        row = await self._fetch_one(
            f"""
            SELECT COUNT(*) AS cnt
            FROM homonet.reclamation r
            LEFT JOIN homonet.reclamation_read rr
                ON rr.reclamation_id = r.reclamation_id
               AND rr.subject_id = %s
            WHERE
                (
                    r.respondent_effective_subject_id = %s
                    OR r.current_responsible_subject_id = %s
                )
                AND r.status::text IN {_ACTIVE_SQL}
                AND EXISTS (
                    SELECT 1
                    FROM homonet.reclamation_message m
                    WHERE m.reclamation_id = r.reclamation_id
                      AND m.author_subject_id != %s
                      AND m.created_at > COALESCE(rr.read_at, '-infinity'::timestamptz)
                )
            """,
            subject_id,
            subject_id,
            subject_id,
            subject_id,
        )

        return int(row["cnt"] or 0) if row else 0