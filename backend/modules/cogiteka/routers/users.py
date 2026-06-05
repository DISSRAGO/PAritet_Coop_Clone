from fastapi import APIRouter, Header, HTTPException, Query

from backend.shared.db import get_conn
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


async def _resolve_subject_id(user_id: str | int | None) -> str:
    """Stage 3 PR 4: резолвит subject_id для auth_user.user_id.

    Канон V0.51: auth_user.subject_id — каноническая связь. Фронт получает
    его в /user/header_info и пробрасывает в SOAP-payload как SubjectId,
    что выше login'а в приоритете (login — лишь один из входов).

    Если auth_user.subject_id IS NULL (например, ещё не создан personal
    subject) — возвращает пустую строку, фронт продолжит работать на login.
    """
    if not user_id:
        return ""
    try:
        async with get_conn() as conn:
            async with conn.cursor() as cur:
                await cur.execute(
                    "SELECT subject_id::text AS sid FROM homonet.auth_user WHERE user_id::text = %s",
                    (str(user_id),),
                )
                row = await cur.fetchone()
                if row and row["sid"]:
                    return row["sid"]
    except Exception:
        # Не валим header_info, если subject_id вдруг не резолвится — это
        # опциональное поле, фронт на это рассчитан (fallback на login).
        return ""
    return ""


async def _header_info_payload(authorization: str | None) -> dict:
    payload = _decode_bearer(authorization)
    user_id = payload.get("user_id")
    login = payload.get("login") or ""
    # id фронт ожидает числом; берём хэш строки как стабильный суррогат,
    # пока в auth_user нет integer-PK для фронта.
    try:
        id_value: int | str | None = int(user_id) if user_id and str(user_id).isdigit() else user_id
    except Exception:
        id_value = user_id
    subject_id = await _resolve_subject_id(user_id)
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
        # Stage 3 PR 4: subject_id (UUID или пустая строка) — фронт пробрасывает
        # в SOAP-запросы как SubjectId, который имеет приоритет над Login.
        "subjectId": subject_id,
    }


@router.get("/headerinfo")
async def headerinfo(authorization: str | None = Header(default=None)):
    return await _header_info_payload(authorization)


@router.get("/header_info")
async def header_info(authorization: str | None = Header(default=None)):
    return await _header_info_payload(authorization)


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
