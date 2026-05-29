from fastapi import APIRouter, Header, HTTPException, Query

from backend.shared.schemas.auth import (
    JWT_ALGORITHM,
    JWT_SECRET,
)
import jwt

router = APIRouter(prefix="/user", tags=["user"])


def _decode_bearer(authorization: str | None) -> dict:
    """
    Извлекает payload из JWT access-токена.
    Используется временно, пока нет полноценного dependency.
    """
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Missing Authorization header")
    token = authorization.split(" ", 1)[1].strip()
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid access token")
    if payload.get("type") != "access":
        raise HTTPException(status_code=401, detail="Invalid token type")
    return payload


def _header_info_payload(authorization: str | None) -> dict:
    payload = _decode_bearer(authorization)
    user_id = payload.get("user_id")
    login = payload.get("login") or ""
    # id фронт ожидает числом; берём хэш строки как стабильный суррогат,
    # пока в auth_user нет integer-PK для фронта.
    try:
        id_value: int | str | None = int(user_id) if user_id and str(user_id).isdigit() else user_id
    except Exception:
        id_value = user_id
    return {
        "id": id_value,
        "login": login,
        "email": payload.get("email", ""),
        "name": login,
        "firstName": "",
        "secondName": "",
        "surname": "",
        "bonusCount": 0,
        "notificationCount": 0,
    }


@router.get("/headerinfo")
async def headerinfo(authorization: str | None = Header(default=None)):
    return _header_info_payload(authorization)


@router.get("/header_info")
async def header_info(authorization: str | None = Header(default=None)):
    return _header_info_payload(authorization)


# --- профиль (заглушка V0.51, поверх auth_user) -------------------------------


@router.get("/profile")
async def get_profile(authorization: str | None = Header(default=None)):
    payload = _decode_bearer(authorization)
    return {
        "id": payload.get("user_id"),
        "login": payload.get("login", ""),
        "email": payload.get("email", ""),
        "firstName": "",
        "secondName": "",
        "surname": "",
        "phone": "",
        "address": None,
    }


@router.post("/profile")
async def save_profile(authorization: str | None = Header(default=None)):
    _decode_bearer(authorization)
    # MVP: сохранение профиля ещё не реализовано.
    return {"status": "ok"}


@router.post("/profile/address")
async def save_profile_address(authorization: str | None = Header(default=None)):
    _decode_bearer(authorization)
    return {"status": "ok"}


# --- кошелёк / история операций (заглушки V0.51) ------------------------------


@router.get("/account")
async def get_account(authorization: str | None = Header(default=None)):
    _decode_bearer(authorization)
    return {
        "account": {
            "id": 0,
            "balance": 0,
            "currency": "RUB",
            "operations": [],
        },
        "payLink": "",
    }


@router.get("/operation_history")
async def get_operation_history(
    authorization: str | None = Header(default=None),
    accountId: str | None = Query(default=None),
    dateBegin: str | None = Query(default=None),
    dateEnd: str | None = Query(default=None),
):
    _decode_bearer(authorization)
    return {
        "accountId": accountId,
        "dateBegin": dateBegin,
        "dateEnd": dateEnd,
        "operations": [],
    }
