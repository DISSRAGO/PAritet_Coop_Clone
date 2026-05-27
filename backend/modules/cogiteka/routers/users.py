from fastapi import APIRouter, Header, HTTPException

router = APIRouter(prefix="/user", tags=["user"])


def require_auth(authorization: str | None):
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing Authorization header")


@router.get("/headerinfo")
async def headerinfo(authorization: str | None = Header(default=None)):
    require_auth(authorization)
    return {
        "firstName": "Тест",
        "secondName": "",
        "surname": "Пользователь",
        "bonusCount": 0,
        "notificationCount": 0,
    }


@router.get("/header_info")
async def header_info(authorization: str | None = Header(default=None)):
    require_auth(authorization)
    return {
        "firstName": "Тест",
        "secondName": "",
        "surname": "Пользователь",
        "bonusCount": 0,
        "notificationCount": 0,
    }