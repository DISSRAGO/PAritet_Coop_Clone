from __future__ import annotations

from typing import Literal, Optional

from pydantic import BaseModel, Field


class Meta(BaseModel):
    total: int
    limit: int
    offset: int


class ReclamationListItem(BaseModel):
    reclamationId: str
    reclamationType: str
    sourceType: str
    status: str
    priority: str
    title: str
    targetType: Optional[str] = None
    targetId: Optional[str] = None
    createdBySubjectId: Optional[str] = None
    respondentSubjectId: Optional[str] = None
    currentResponsibleSubjectId: Optional[str] = None
    communityId: Optional[str] = None
    createdAt: Optional[str] = None
    deadlineAt: Optional[str] = None
    hasUnread: bool = False
    unreadCount: int = 0
    claimantEffectiveSubjectId: Optional[str] = None
    respondentEffectiveSubjectId: Optional[str] = None
    escalationLevel: int = 0


class ReclamationListResponse(BaseModel):
    data: list[ReclamationListItem]
    meta: Meta


class CreateReclamationRequest(BaseModel):
    actorSubjectId: str
    reclamationType: str
    sourceType: str
    priority: str
    title: str
    description: Optional[str] = None
    targetType: str
    targetId: str
    respondentSubjectId: Optional[str] = None
    communityId: Optional[str] = None


class CreateReclamationResponse(BaseModel):
    reclamationId: str
    status: str
    title: str
    reclamationType: str
    sourceType: str
    priority: str
    targetType: str
    targetId: str
    createdAt: Optional[str] = None
    createdBySubjectId: Optional[str] = None
    respondentSubjectId: Optional[str] = None
    currentResponsibleSubjectId: Optional[str] = None
    communityId: Optional[str] = None
    deadlineAt: Optional[str] = None
    claimantEffectiveSubjectId: Optional[str] = None
    respondentEffectiveSubjectId: Optional[str] = None
    escalationLevel: int = 0


class PatchReclamationRequest(BaseModel):
    actorSubjectId: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    description: Optional[str] = None
    deadlineAt: Optional[str] = None
    currentResponsibleSubjectId: Optional[str] = None


class StatusTransitionResponse(BaseModel):
    reclamationId: str
    status: str
    message: str


class AcceptReclamationRequest(BaseModel):
    actorSubjectId: str
    responsibleSubjectId: Optional[str] = None


class AssignReclamationRequest(BaseModel):
    actorSubjectId: str
    responsibleSubjectId: str


class WithdrawReclamationRequest(BaseModel):
    actorSubjectId: str


class CloseReclamationRequest(BaseModel):
    actorSubjectId: str


class CreateMessageRequest(BaseModel):
    actorSubjectId: str
    messageType: str
    body: str
    visibility: str = "all_participants"


class CreateMessageResponse(BaseModel):
    messageId: str
    reclamationId: str
    createdAt: Optional[str] = None


class CreateAttachmentRequest(BaseModel):
    actorSubjectId: str
    messageId: Optional[str] = None
    uri: str
    title: Optional[str] = None
    description: Optional[str] = None


class CreateAttachmentResponse(BaseModel):
    attachmentId: str
    reclamationId: str


class CreateResponseRequest(BaseModel):
    actorSubjectId: str
    responseType: str
    body: Optional[str] = None


class CreateResponseResponse(BaseModel):
    responseId: str
    reclamationId: str
    createdAt: Optional[str] = None


class CreateDecisionRequest(BaseModel):
    actorSubjectId: str
    decisionType: str
    decisionText: Optional[str] = None
    reason: Optional[str] = None
    isFinal: bool = False


class CreateDecisionResponse(BaseModel):
    reclamationDecisionId: str
    reclamationId: str
    decisionType: str


class EscalateReclamationRequest(BaseModel):
    actorSubjectId: str
    escalationReason: Literal[
        "no_response",
        "conflict_of_interest",
        "timeout",
        "appeal",
        "insufficient_authority",
        "manual",
    ]
    comment: str = Field(..., min_length=3, max_length=4000)


class EscalateReclamationResponse(BaseModel):
    escalationId: str
    reclamationId: str
    status: str
    claimantEffectiveSubjectId: str
    respondentEffectiveSubjectId: str
    escalationLevel: int


class DashboardData(BaseModel):
    inboxCount: int
    outboxCount: int
    waitingResponseCount: int
    escalatedCount: int
    overdueCount: int
    closedCount: int


class PanelDashboardResponse(BaseModel):
    data: DashboardData
    meta: Meta


class PanelInboxResponse(BaseModel):
    data: list[ReclamationListItem]
    meta: Meta


class ReclamationDetailResponse(BaseModel):
    reclamationId: str
    reclamationType: str
    sourceType: str
    status: str
    priority: str
    title: str
    description: Optional[str] = None
    targetType: Optional[str] = None
    targetId: Optional[str] = None
    createdBySubjectId: Optional[str] = None
    respondentSubjectId: Optional[str] = None
    currentResponsibleSubjectId: Optional[str] = None
    claimantEffectiveSubjectId: Optional[str] = None
    respondentEffectiveSubjectId: Optional[str] = None
    escalationLevel: int = 0
    communityId: Optional[str] = None
    createdAt: Optional[str] = None
    acceptedAt: Optional[str] = None
    closedAt: Optional[str] = None
    deadlineAt: Optional[str] = None
    participants: list[dict] = []
    messages: list[dict] = []
    decisions: list[dict] = []
    escalations: list[dict] = []
    attachments: list[dict] = []
    responses: list[dict] = []
    events: list[dict] = []