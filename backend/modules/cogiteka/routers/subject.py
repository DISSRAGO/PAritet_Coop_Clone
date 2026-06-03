from fastapi import APIRouter, Depends

from backend.modules.cogiteka.services.subject_service import SubjectService
from backend.shared.schemas.subject import (
    CreateCollectiveSubjectRequest,
    CreateCollectiveSubjectResponse,
    CreatePersonalSubjectRequest,
    CreatePersonalSubjectResponse,
    SubjectCardResponse,
)

# ---------------------------------------------------------------------------
# Subject API (HomoNet V0.51)
# ---------------------------------------------------------------------------
# Под cogi_router маршруты регистрируются с префиксом /api, итог:
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
