from typing import Optional

from fastapi import APIRouter, Depends, Query

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
    EscalateReclamationRequest,
    EscalateReclamationResponse,
    PanelDashboardResponse,
    PanelInboxResponse,
    PatchReclamationRequest,
    ReclamationDetailResponse,
    ReclamationListResponse,
    StatusTransitionResponse,
    WithdrawReclamationRequest,
)
from backend.modules.homonet.domains.reclamation.service import ReclamationService

reclamation_router = APIRouter(prefix="/reclamations", tags=["reclamation"])
panel_router = APIRouter(prefix="/panel", tags=["reclamation_panel"])

router = reclamation_router


def get_service() -> ReclamationService:
    return ReclamationService()


@reclamation_router.post(
    "",
    response_model=CreateReclamationResponse,
    status_code=201,
)
async def create_reclamation(
    payload: CreateReclamationRequest,
    svc: ReclamationService = Depends(get_service),
):
    return await svc.create_reclamation(payload)


@reclamation_router.get(
    "",
    response_model=ReclamationListResponse,
)
async def list_reclamations(
    status: Optional[str] = Query(None),
    reclamation_type: Optional[str] = Query(None),
    priority: Optional[str] = Query(None),
    created_by_subject_id: Optional[str] = Query(None),
    current_responsible_subject_id: Optional[str] = Query(None),
    target_type: Optional[str] = Query(None),
    target_id: Optional[str] = Query(None),
    community_id: Optional[str] = Query(None),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    svc: ReclamationService = Depends(get_service),
):
    return await svc.list_reclamations(
        limit=limit,
        offset=offset,
        status_filter=status,
        reclamation_type=reclamation_type,
        priority=priority,
        created_by_subject_id=created_by_subject_id,
        current_responsible_subject_id=current_responsible_subject_id,
        target_type=target_type,
        target_id=target_id,
        community_id=community_id,
    )


@reclamation_router.get(
    "/{reclamation_id}",
    response_model=ReclamationDetailResponse,
)
async def get_reclamation(
    reclamation_id: str,
    svc: ReclamationService = Depends(get_service),
):
    return await svc.get_reclamation(reclamation_id)


@reclamation_router.patch(
    "/{reclamation_id}",
    response_model=StatusTransitionResponse,
)
async def patch_reclamation(
    reclamation_id: str,
    payload: PatchReclamationRequest,
    svc: ReclamationService = Depends(get_service),
):
    return await svc.patch_reclamation(reclamation_id, payload)


@reclamation_router.post(
    "/{reclamation_id}/accept",
    response_model=StatusTransitionResponse,
)
async def accept_reclamation(
    reclamation_id: str,
    payload: AcceptReclamationRequest,
    svc: ReclamationService = Depends(get_service),
):
    return await svc.accept_reclamation(reclamation_id, payload)


@reclamation_router.post(
    "/{reclamation_id}/assign",
    response_model=StatusTransitionResponse,
)
async def assign_reclamation(
    reclamation_id: str,
    payload: AssignReclamationRequest,
    svc: ReclamationService = Depends(get_service),
):
    return await svc.assign_reclamation(reclamation_id, payload)


@reclamation_router.post(
    "/{reclamation_id}/withdraw",
    response_model=StatusTransitionResponse,
)
async def withdraw_reclamation(
    reclamation_id: str,
    payload: WithdrawReclamationRequest,
    svc: ReclamationService = Depends(get_service),
):
    return await svc.withdraw_reclamation(reclamation_id, payload)


@reclamation_router.post(
    "/{reclamation_id}/close",
    response_model=StatusTransitionResponse,
)
async def close_reclamation(
    reclamation_id: str,
    payload: CloseReclamationRequest,
    svc: ReclamationService = Depends(get_service),
):
    return await svc.close_reclamation(reclamation_id, payload)


@reclamation_router.post(
    "/{reclamation_id}/messages",
    response_model=CreateMessageResponse,
    status_code=201,
)
async def create_message(
    reclamation_id: str,
    payload: CreateMessageRequest,
    svc: ReclamationService = Depends(get_service),
):
    return await svc.create_message(reclamation_id, payload)


@reclamation_router.post(
    "/{reclamation_id}/attachments",
    response_model=CreateAttachmentResponse,
    status_code=201,
)
async def create_attachment(
    reclamation_id: str,
    payload: CreateAttachmentRequest,
    svc: ReclamationService = Depends(get_service),
):
    return await svc.create_attachment(reclamation_id, payload)


@reclamation_router.post(
    "/{reclamation_id}/responses",
    response_model=CreateResponseResponse,
    status_code=201,
)
async def create_response(
    reclamation_id: str,
    payload: CreateResponseRequest,
    svc: ReclamationService = Depends(get_service),
):
    return await svc.create_response(reclamation_id, payload)


@reclamation_router.post(
    "/{reclamation_id}/decisions",
    response_model=CreateDecisionResponse,
    status_code=201,
)
async def create_decision(
    reclamation_id: str,
    payload: CreateDecisionRequest,
    svc: ReclamationService = Depends(get_service),
):
    return await svc.create_decision(reclamation_id, payload)


@reclamation_router.post(
    "/{reclamation_id}/escalate",
    response_model=EscalateReclamationResponse,
    status_code=201,
)
async def escalate_reclamation(
    reclamation_id: str,
    payload: EscalateReclamationRequest,
    svc: ReclamationService = Depends(get_service),
):
    return await svc.escalate_reclamation(reclamation_id, payload)


@panel_router.get(
    "/inbox",
    response_model=PanelInboxResponse,
)
async def panel_inbox(
    subject_id: str = Query(...),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    svc: ReclamationService = Depends(get_service),
):
    return await svc.get_panel_inbox(
        subject_id=subject_id,
        limit=limit,
        offset=offset,
    )


@panel_router.get(
    "/outbox",
    response_model=PanelInboxResponse,
)
async def panel_outbox(
    subject_id: Optional[str] = Query(None),
    created_by_subject_id: Optional[str] = Query(None),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    svc: ReclamationService = Depends(get_service),
):
    actual_subject_id = subject_id or created_by_subject_id
    if not actual_subject_id:
        raise ValueError("subject_id or created_by_subject_id is required")

    return await svc.get_panel_outbox(
        subject_id=actual_subject_id,
        limit=limit,
        offset=offset,
    )

@panel_router.get(
    "/archive",
    response_model=PanelInboxResponse,
)
async def panel_archive(
    subject_id: str = Query(...),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    svc: ReclamationService = Depends(get_service),
):
    return await svc.get_panel_archive(
        subject_id=subject_id,
        limit=limit,
        offset=offset,
    )

@panel_router.get("/current-all-levels", response_model=ReclamationListResponse)
async def panel_current_all_levels(
    subject_id: str = Query(...),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    svc: ReclamationService = Depends(get_service),
) -> ReclamationListResponse:
    return await svc.get_panel_current_all_levels(
        subject_id=subject_id,
        limit=limit,
        offset=offset,
    )

@panel_router.get(
    "/admin-archive",
    response_model=ReclamationListResponse,
)
async def panel_admin_archive(
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    svc: ReclamationService = Depends(get_service),
):
    return await svc.get_admin_archive(
        limit=limit,
        offset=offset,
    )


@panel_router.get(
    "/dashboard",
    response_model=PanelDashboardResponse,
)
async def panel_dashboard(
    subject_id: str = Query(...),
    svc: ReclamationService = Depends(get_service),
):
    return await svc.get_panel_dashboard(subject_id=subject_id)


@reclamation_router.post(
    "/{reclamation_id}/read",
    status_code=204,
)
async def mark_reclamation_read(
    reclamation_id: str,
    subject_id: str = Query(...),
    svc: ReclamationService = Depends(get_service),
):
    await svc.mark_as_read(reclamation_id, subject_id)


@reclamation_router.get("/unread-count")
async def get_unread_count(
    subject_id: str = Query(...),
    svc: ReclamationService = Depends(get_service),
):
    count = await svc.get_unread_count(subject_id)
    return {"unreadCount": count}