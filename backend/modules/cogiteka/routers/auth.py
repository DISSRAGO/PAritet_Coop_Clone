from fastapi import APIRouter, Header, Depends

from backend.shared.schemas.auth import (
    ConfirmRequest,
    LoginRequest,
    RefreshRequest,
    SignUpRequest,
    ValidateEmailRequest,
    ValidateLoginRequest,
    ValidatePhoneRequest,
    LoginResponse,
)
from backend.modules.cogiteka.services.auth_service import AuthService


router = APIRouter(prefix="/auth", tags=["auth"])


def get_auth_service() -> AuthService:
    return AuthService()


@router.post("/login", response_model=LoginResponse)
async def login(
    payload: LoginRequest,
    svc: AuthService = Depends(get_auth_service),
):
    return await svc.login(payload.login, payload.password)


@router.post("/logout")
async def logout(
    authorization: str | None = Header(default=None),
    svc: AuthService = Depends(get_auth_service),
):
    token = ""
    if authorization and authorization.lower().startswith("bearer "):
        token = authorization.split(" ", 1)[1]
    return await svc.logout(token)


@router.post("/refresh", response_model=LoginResponse)
async def refresh(
    payload: RefreshRequest,
    svc: AuthService = Depends(get_auth_service),
):
    return await svc.refresh(payload.refreshToken)


@router.post("/signUp")
async def sign_up(
    payload: SignUpRequest,
    svc: AuthService = Depends(get_auth_service),
):
    return await svc.signup(payload)


@router.post("/confirm")
async def confirm(
    payload: ConfirmRequest,
    svc: AuthService = Depends(get_auth_service),
):
    return await svc.signup_confirm(payload)


@router.post("/validate/login")
async def validate_login(
    payload: ValidateLoginRequest,
    svc: AuthService = Depends(get_auth_service),
):
    return await svc.validate_login(payload.login)


@router.post("/validate/email")
async def validate_email(
    payload: ValidateEmailRequest,
    svc: AuthService = Depends(get_auth_service),
):
    return await svc.validate_email(payload.email)


@router.post("/validate/phone")
async def validate_phone(
    payload: ValidatePhoneRequest,
    svc: AuthService = Depends(get_auth_service),
):
    return await svc.validate_phone(payload.phone)