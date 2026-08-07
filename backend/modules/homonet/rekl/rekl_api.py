from typing import Any, Literal, Optional
import httpx

ReclamationStatus = Literal[
    "draft", "registered", "accepted", "in_review",
    "waiting_response", "resolved", "escalated",
    "closed", "cancelled",
]

class ReclamationApiClient:
    def __init__(self, base_url: str, timeout: float = 5.0):
        self.base_url = base_url.rstrip("/")
        self.client = httpx.AsyncClient(timeout=timeout)

    # --- Core Reclamation API ---

    async def create_reclamation(
        self,
        *,
        reclamation_type: str,               # "content" / "context" / ...
        source_type: str,                    # "user"
        priority: str,                       # "normal"
        created_by_subject_id: str,
        respondent_subject_id: Optional[str],
        target_type: str,                    # "thanka"
        target_id: str,
        community_id: Optional[str],
        title: str,
        description: str,
    ) -> dict[str, Any]:
        """
        POST /reclamations → { data: { reclamation_id, status } }
        """
        payload = {
            "reclamation_type": reclamation_type,
            "source_type": source_type,
            "priority": priority,
            "created_by_subject_id": created_by_subject_id,
            "respondent_subject_id": respondent_subject_id,
            "target_type": target_type,
            "target_id": target_id,
            "community_id": community_id,
            "process_id": None,
            "deal_id": None,
            "title": title,
            "description": description,
        }
        r = await self.client.post(f"{self.base_url}/reclamations", json=payload)
        r.raise_for_status()
        return r.json()

    async def get_reclamation(self, reclamation_id: str) -> dict[str, Any]:
        """
        GET /reclamations/{id} → полная карточка со всеми дочерними сущностями.
        """
        r = await self.client.get(f"{self.base_url}/reclamations/{reclamation_id}")
        r.raise_for_status()
        return r.json()

    # --- Messages / Responses ---

    async def add_message(
        self,
        reclamation_id: str,
        *,
        author_subject_id: str,
        message_type: str,   # "comment" / "explanation" / "objection" / ...
        body: str,
        visibility: str = "participants",  # "participants" / "public" / ...
    ) -> dict[str, Any]:
        """
        POST /reclamations/{id}/messages
        """
        payload = {
            "author_subject_id": author_subject_id,
            "message_type": message_type,
            "body": body,
            "visibility": visibility,
        }
        r = await self.client.post(
            f"{self.base_url}/reclamations/{reclamation_id}/messages",
            json=payload,
        )
        r.raise_for_status()
        return r.json()

    async def add_response(
        self,
        reclamation_id: str,
        *,
        respondent_subject_id: str,
        response_type: str,  # "accept" / "reject" / "explain" / "correct" / ...
        body: str,
    ) -> dict[str, Any]:
        """
        POST /reclamations/{id}/responses
        """
        payload = {
            "respondent_subject_id": respondent_subject_id,
            "response_type": response_type,
            "body": body,
        }
        r = await self.client.post(
            f"{self.base_url}/reclamations/{reclamation_id}/responses",
            json=payload,
        )
        r.raise_for_status()
        return r.json()

    # --- Decisions / Escalation / Close ---

    async def add_decision(
        self,
        reclamation_id: str,
        *,
        decision_by_subject_id: str,
        decision_type: str,      # "reject" / "accept" / "correct" / "warn" / "hide" / ...
        decision_text: str,
        reason: str,
        is_final: bool = False,
        effective_from: Optional[str] = None,
    ) -> dict[str, Any]:
        """
        POST /reclamations/{id}/decisions
        """
        payload = {
            "decision_by_subject_id": decision_by_subject_id,
            "decision_type": decision_type,
            "decision_text": decision_text,
            "reason": reason,
            "effective_from": effective_from,
            "is_final": is_final,
        }
        r = await self.client.post(
            f"{self.base_url}/reclamations/{reclamation_id}/decisions",
            json=payload,
        )
        r.raise_for_status()
        return r.json()

    async def escalate(
        self,
        reclamation_id: str,
        *,
        created_by_subject_id: str,
        from_subject_id: str,
        to_subject_id: str,
        from_level: int,
        to_level: int,
        escalation_reason: str,  # "timeout" / "appeal" / "insufficient_authority" / ...
    ) -> dict[str, Any]:
        """
        POST /reclamations/{id}/escalate
        """
        payload = {
            "created_by_subject_id": created_by_subject_id,
            "from_subject_id": from_subject_id,
            "to_subject_id": to_subject_id,
            "from_level": from_level,
            "to_level": to_level,
            "escalation_reason": escalation_reason,
        }
        r = await self.client.post(
            f"{self.base_url}/reclamations/{reclamation_id}/escalate",
            json=payload,
        )
        r.raise_for_status()
        return r.json()

    async def close(
        self,
        reclamation_id: str,
        *,
        actor_subject_id: str,
        reason: str,
    ) -> dict[str, Any]:
        """
        POST /reclamations/{id}/close
        """
        payload = {
            "actor_subject_id": actor_subject_id,
            "reason": reason,
        }
        r = await self.client.post(
            f"{self.base_url}/reclamations/{reclamation_id}/close",
            json=payload,
        )
        r.raise_for_status()
        return r.json()

    # --- Moderation Panel Facade ---

    async def panel_inbox(
        self,
        *,
        responsible_subject_id: str,
        status: Optional[ReclamationStatus] = None,
        priority: Optional[str] = None,
        limit: int = 20,
        offset: int = 0,
    ) -> dict[str, Any]:
        """
        GET /panel/inbox
        """
        params = {
            "responsible_subject_id": responsible_subject_id,
            "limit": limit,
            "offset": offset,
        }
        if status:
            params["status"] = status
        if priority:
            params["priority"] = priority

        r = await self.client.get(f"{self.base_url}/panel/inbox", params=params)
        r.raise_for_status()
        return r.json()

    async def panel_outbox(
        self,
        *,
        created_by_subject_id: str,
        status: Optional[ReclamationStatus] = None,
        limit: int = 20,
        offset: int = 0,
    ) -> dict[str, Any]:
        """
        GET /panel/outbox
        """
        params = {
            "created_by_subject_id": created_by_subject_id,
            "limit": limit,
            "offset": offset,
        }
        if status:
            params["status"] = status

        r = await self.client.get(f"{self.base_url}/panel/outbox", params=params)
        r.raise_for_status()
        return r.json()

    async def panel_my_targets(
        self,
        *,
        owner_subject_id: str,
        target_type: str = "thanka",
        status: Optional[ReclamationStatus] = None,
        limit: int = 20,
        offset: int = 0,
    ) -> dict[str, Any]:
        """
        GET /panel/my-targets
        """
        params = {
            "owner_subject_id": owner_subject_id,
            "target_type": target_type,
            "limit": limit,
            "offset": offset,
        }
        if status:
            params["status"] = status

        r = await self.client.get(f"{self.base_url}/panel/my-targets", params=params)
        r.raise_for_status()
        return r.json()

    async def panel_archive(
        self,
        *,
        owner_subject_id: Optional[str] = None,
        created_by_subject_id: Optional[str] = None,
        limit: int = 20,
        offset: int = 0,
    ) -> dict[str, Any]:
        """
        GET /panel/archive
        (фильтры можно уточнить, в OpenAPI есть только базовый набросок)
        """
        params = {
            "limit": limit,
            "offset": offset,
        }
        if owner_subject_id:
            params["owner_subject_id"] = owner_subject_id
        if created_by_subject_id:
            params["created_by_subject_id"] = created_by_subject_id

        r = await self.client.get(f"{self.base_url}/panel/archive", params=params)
        r.raise_for_status()
        return r.json()

    async def panel_dashboard(self, *, subject_id: str) -> dict[str, Any]:
        """
        GET /panel/dashboard
        """
        # В OpenAPI dashboard без параметров; при необходимости можно добавить subject_id
        r = await self.client.get(f"{self.base_url}/panel/dashboard")
        r.raise_for_status()
        return r.json()