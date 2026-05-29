from fastapi import APIRouter, Depends

from backend.modules.cogiteka.services.subject_service import SubjectService
from backend.shared.schemas.subject import (
    CreatePersonalSubjectRequest,
    CreatePersonalSubjectResponse,
    SubjectCardResponse,
)

router = APIRouter(prefix="/subject", tags=["subject"])


def get_subject_service() -> SubjectService:
    return SubjectService()


@router.post("/personal/create", response_model=CreatePersonalSubjectResponse)
async def create_personal_subject(
    payload: CreatePersonalSubjectRequest,
    svc: SubjectService = Depends(get_subject_service),
):
    return await svc.create_personal_subject(payload)


@router.get("/{subject_id}", response_model=SubjectCardResponse)
async def get_subject_card(
    subject_id: str,
    svc: SubjectService = Depends(get_subject_service),
):
    return await svc.get_subject_card(subject_id)