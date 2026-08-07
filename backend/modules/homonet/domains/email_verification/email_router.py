from __future__ import annotations

from fastapi import APIRouter, Depends

from .email_schemas import (
    RequestEmailCode,
    EmailCodeRequestResponse,
    ConfirmEmailCodeRequest,
    ConfirmEmailCodeResponse,
)
from .email_service import EmailVerificationService


router = APIRouter(
    prefix="/email",
    tags=["email_verification"],
)


def get_service() -> EmailVerificationService:
    return EmailVerificationService()


@router.post("/code/request", response_model=EmailCodeRequestResponse)
async def request_email_code(
    payload: RequestEmailCode,
    svc: EmailVerificationService = Depends(get_service),
):
    """
    Запросить отправку одноразового кода подтверждения на почту субъекта.
    """
    return await svc.request_code(payload)


@router.post("/code/confirm", response_model=ConfirmEmailCodeResponse)
async def confirm_email_code(
    payload: ConfirmEmailCodeRequest,
    svc: EmailVerificationService = Depends(get_service),
):
    """
    Подтвердить одноразовый код, пометить почту как подтверждённую.
    """
    return await svc.confirm_code(payload)