from typing import Optional

from fastapi import APIRouter, Depends, Query

from backend.modules.homonet.domains.subject.schemas import (
    CreateCollectiveSubjectRequest,
    CreateCollectiveSubjectResponse,
    CreatePersonalSubjectRequest,
    CreatePersonalSubjectResponse,
    SubjectAccountsResponse,
    SubjectCardResponse,
    SubjectContributionsResponse,
    SubjectDealsResponse,
    SubjectDecisionsResponse,
    SubjectListingsResponse,
    SubjectObjectsResponse,
    SubjectSummaryResponse,
    SubjectThankasResponse,
)
from backend.modules.homonet.domains.subject.service import SubjectService

# ---------------------------------------------------------------------------
# Subject API (HomoNet V0.51)
# ---------------------------------------------------------------------------
# Под homonet_router (prefix=/api):
#   POST /api/subject/personal/create        — legacy (оставлен для совместимости)
#   POST /api/subject/collective/create      — UC-05
#   GET  /api/subject/{subject_id}           — legacy (оставлен для совместимости)
#
# Канонические алиасы (OpenAPI V0.51 §5.2 subject_app_api):
#   POST /api/app/subjects/create-personal-subject
#   POST /api/app/subjects/create-collective-subject
#   GET  /api/app/subjects/{subject_id}/card
# ---------------------------------------------------------------------------

router = APIRouter(prefix="/subject", tags=["subject"])


def get_subject_service() -> SubjectService:
    return SubjectService()


# ---------- legacy маршруты (/api/subject/...) -----------------------------

@router.post("/personal/create", response_model=CreatePersonalSubjectResponse)
async def create_personal_subject(
    payload: CreatePersonalSubjectRequest,
    svc: SubjectService = Depends(get_subject_service),
):
    return await svc.create_personal_subject(payload)


@router.post("/collective/create", response_model=CreateCollectiveSubjectResponse)
async def create_collective_subject(
    payload: CreateCollectiveSubjectRequest,
    svc: SubjectService = Depends(get_subject_service),
):
    return await svc.create_collective_subject(payload)


@router.get("/{subject_id}", response_model=SubjectCardResponse)
async def get_subject_card(
    subject_id: str,
    svc: SubjectService = Depends(get_subject_service),
):
    return await svc.get_subject_card(subject_id)


# ---------- Subject Resolver: кросс-доменные выборки (Stage 3 / PR 1) -----
#
# Общий принцип: фронт держит subject_id текущего пользователя (из authStore) и
# дёргает нужные endpoint'ы. Сортировка всюду по «свежести» DESC — лента-лайк.
# Совпадающие канонические пути под subject_app_router определены ниже.


@router.get("/{subject_id}/thankas", response_model=SubjectThankasResponse)
async def get_subject_thankas(
    subject_id: str,
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    status_filter: Optional[str] = Query(None, alias="status"),
    svc: SubjectService = Depends(get_subject_service),
):
    return await svc.list_thankas(
        subject_id, limit=limit, offset=offset, status_filter=status_filter
    )


@router.get("/{subject_id}/listings", response_model=SubjectListingsResponse)
async def get_subject_listings(
    subject_id: str,
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    status_filter: Optional[str] = Query(None, alias="status"),
    svc: SubjectService = Depends(get_subject_service),
):
    return await svc.list_listings(
        subject_id, limit=limit, offset=offset, status_filter=status_filter
    )


@router.get("/{subject_id}/deals", response_model=SubjectDealsResponse)
async def get_subject_deals(
    subject_id: str,
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    role: Optional[str] = Query(None, description="'supplier' или 'buyer'; дефолт — обе"),
    status_filter: Optional[str] = Query(None, alias="status"),
    svc: SubjectService = Depends(get_subject_service),
):
    return await svc.list_deals(
        subject_id, limit=limit, offset=offset, role=role, status_filter=status_filter
    )


@router.get("/{subject_id}/decisions", response_model=SubjectDecisionsResponse)
async def get_subject_decisions(
    subject_id: str,
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    status_filter: Optional[str] = Query(None, alias="status"),
    svc: SubjectService = Depends(get_subject_service),
):
    return await svc.list_decisions(
        subject_id, limit=limit, offset=offset, status_filter=status_filter
    )


@router.get("/{subject_id}/contributions", response_model=SubjectContributionsResponse)
async def get_subject_contributions(
    subject_id: str,
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    svc: SubjectService = Depends(get_subject_service),
):
    return await svc.list_contributions(subject_id, limit=limit, offset=offset)


@router.get("/{subject_id}/accounts", response_model=SubjectAccountsResponse)
async def get_subject_accounts(
    subject_id: str,
    svc: SubjectService = Depends(get_subject_service),
):
    return await svc.list_accounts(subject_id)


@router.get("/{subject_id}/summary", response_model=SubjectSummaryResponse)
async def get_subject_summary(
    subject_id: str,
    svc: SubjectService = Depends(get_subject_service),
):
    return await svc.get_summary(subject_id)


@router.get("/{subject_id}/objects", response_model=SubjectObjectsResponse)
async def get_subject_objects(
    subject_id: str,
    domain: Optional[str] = Query(
        None,
        description=(
            "Список доменов через запятую: thanka,listing,deal,decision,contribution,account. "
            "Пустое значение — все домены"
        ),
    ),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    svc: SubjectService = Depends(get_subject_service),
):
    return await svc.list_objects(subject_id, domain_param=domain, limit=limit, offset=offset)


# ---------- канонические алиасы фасада subject_app_api ---------------------

subject_app_router = APIRouter(prefix="/app/subjects", tags=["subject_app_api"])


@subject_app_router.post(
    "/create-personal-subject",
    response_model=CreatePersonalSubjectResponse,
)
async def app_create_personal_subject(
    payload: CreatePersonalSubjectRequest,
    svc: SubjectService = Depends(get_subject_service),
):
    return await svc.create_personal_subject(payload)


@subject_app_router.post(
    "/create-collective-subject",
    response_model=CreateCollectiveSubjectResponse,
)
async def app_create_collective_subject(
    payload: CreateCollectiveSubjectRequest,
    svc: SubjectService = Depends(get_subject_service),
):
    return await svc.create_collective_subject(payload)


@subject_app_router.get(
    "/{subject_id}/card",
    response_model=SubjectCardResponse,
)
async def app_get_subject_card(
    subject_id: str,
    svc: SubjectService = Depends(get_subject_service),
):
    return await svc.get_subject_card(subject_id)


# ---- Resolver-алиасы под subject_app_api (канон OpenAPI V0.51 §5.2) ---------


@subject_app_router.get(
    "/{subject_id}/thankas",
    response_model=SubjectThankasResponse,
)
async def app_get_subject_thankas(
    subject_id: str,
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    status_filter: Optional[str] = Query(None, alias="status"),
    svc: SubjectService = Depends(get_subject_service),
):
    return await svc.list_thankas(
        subject_id, limit=limit, offset=offset, status_filter=status_filter
    )


@subject_app_router.get(
    "/{subject_id}/listings",
    response_model=SubjectListingsResponse,
)
async def app_get_subject_listings(
    subject_id: str,
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    status_filter: Optional[str] = Query(None, alias="status"),
    svc: SubjectService = Depends(get_subject_service),
):
    return await svc.list_listings(
        subject_id, limit=limit, offset=offset, status_filter=status_filter
    )


@subject_app_router.get(
    "/{subject_id}/deals",
    response_model=SubjectDealsResponse,
)
async def app_get_subject_deals(
    subject_id: str,
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    role: Optional[str] = Query(None),
    status_filter: Optional[str] = Query(None, alias="status"),
    svc: SubjectService = Depends(get_subject_service),
):
    return await svc.list_deals(
        subject_id, limit=limit, offset=offset, role=role, status_filter=status_filter
    )


@subject_app_router.get(
    "/{subject_id}/decisions",
    response_model=SubjectDecisionsResponse,
)
async def app_get_subject_decisions(
    subject_id: str,
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    status_filter: Optional[str] = Query(None, alias="status"),
    svc: SubjectService = Depends(get_subject_service),
):
    return await svc.list_decisions(
        subject_id, limit=limit, offset=offset, status_filter=status_filter
    )


@subject_app_router.get(
    "/{subject_id}/contributions",
    response_model=SubjectContributionsResponse,
)
async def app_get_subject_contributions(
    subject_id: str,
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    svc: SubjectService = Depends(get_subject_service),
):
    return await svc.list_contributions(subject_id, limit=limit, offset=offset)


@subject_app_router.get(
    "/{subject_id}/accounts",
    response_model=SubjectAccountsResponse,
)
async def app_get_subject_accounts(
    subject_id: str,
    svc: SubjectService = Depends(get_subject_service),
):
    return await svc.list_accounts(subject_id)


@subject_app_router.get(
    "/{subject_id}/summary",
    response_model=SubjectSummaryResponse,
)
async def app_get_subject_summary(
    subject_id: str,
    svc: SubjectService = Depends(get_subject_service),
):
    return await svc.get_summary(subject_id)


@subject_app_router.get(
    "/{subject_id}/objects",
    response_model=SubjectObjectsResponse,
)
async def app_get_subject_objects(
    subject_id: str,
    domain: Optional[str] = Query(
        None,
        description=(
            "Список доменов через запятую: thanka,listing,deal,decision,contribution,account. "
            "Пустое значение — все домены"
        ),
    ),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    svc: SubjectService = Depends(get_subject_service),
):
    return await svc.list_objects(subject_id, domain_param=domain, limit=limit, offset=offset)
