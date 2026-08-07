from fastapi import APIRouter, Depends, HTTPException, status

from backend.shared.db import get_conn  # прямой доступ к пулу БД
from backend.modules.homonet.domains.thanka.service import ThankaService
from backend.modules.homonet.domains.thanka.schemas import (
    SystemRootResponse,
    ThankaTreeItem,
    ThankaTreeResponse,
    ThankaTypeSector,
    ThankaTypeSectorResponse,
    ThankaSummary,
    ThankaByTypeResponse,
)

thanka_router = APIRouter(prefix="/thanka", tags=["thanka"])

# legacy ID, оставляем как запасной фолбэк, основная выборка идёт по is_system = true
SYSTEM_ROOT_THANKA_ID = "00000000-0000-0000-0000-000000000010"


def get_service() -> ThankaService:
    return ThankaService()


@thanka_router.get(
    "/system-root",
    response_model=SystemRootResponse,
)
async def get_system_root() -> SystemRootResponse:
    async with get_conn() as conn:
        async with conn.cursor() as cur:
            # основная логика: берём первую тханку с is_system = true
            await cur.execute(
                """
                SELECT
                    thanka_id::text AS thanka_id,
                    title,
                    status::text AS status
                FROM homonet.thanka
                WHERE is_system = true
                ORDER BY created_at
                LIMIT 1
                """
            )
            row = await cur.fetchone()

    # если в базе пока нет ни одной is_system = true (чистый стенд),
    # пробуем legacy-ID 0000...0010, чтобы не ломать старые дампы
    if not row:
        async with get_conn() as conn:
            async with conn.cursor() as cur:
                await cur.execute(
                    """
                    SELECT
                        thanka_id::text AS thanka_id,
                        title,
                        status::text AS status
                    FROM homonet.thanka
                    WHERE thanka_id = %s
                    """,
                    (SYSTEM_ROOT_THANKA_ID,),
                )
                row = await cur.fetchone()

        if not row:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="system_root_thanka_not_found",
            )

    return SystemRootResponse(
        thankaId=row["thanka_id"],
        title=row["title"],
        status=row["status"],
        isSystem=True,  # флаг системной корневой
    )


@thanka_router.get(
    "/{thanka_id}/children",
    response_model=ThankaTreeResponse,
)
async def get_thanka_children(
    thanka_id: str,
    svc: ThankaService = Depends(get_service),
) -> ThankaTreeResponse:
    # как было — логика в ThankaService
    rows = await svc.get_thanka_children(thanka_id)

    items = [
        ThankaTreeItem(
            thankaId=r["thanka_id"],
            title=r["title"],
            status=r["status"],
            typeCode=r.get("type_code"),
            typeName=r.get("type_name"),
        )
        for r in rows
    ]

    return ThankaTreeResponse(data=items)


@thanka_router.get(
    "/system-root/types",
    response_model=ThankaTypeSectorResponse,
)
async def get_system_root_types(
    svc: ThankaService = Depends(get_service),
) -> ThankaTypeSectorResponse:
    """
    Сектора системной тханки — типы содержимого.
    """
    rows = await svc.get_type_sectors()

    # минимальная визуальная дифференциация: цвет по коду
    def pick_color(code: str | None) -> str:
        c = (code or "").lower()
        if c in ("article", "статья"):
            return "#1890ff"  # синий
        if c in ("document", "документ"):
            return "#13c2c2"  # бирюза
        if c in ("catalog", "каталог"):
            return "#faad14"  # жёлтый
        if c in ("collection", "коллекция"):
            return "#eb2f96"  # розовый
        if c in ("bot", "бот"):
            return "#722ed1"  # фиолет
        if c in ("link", "ссылка"):
            return "#52c41a"  # зелёный
        if c in ("product", "товар"):
            return "#ff4d4f"  # красный
        return "#8c8c8c"  # дефолт

    sectors = [
        ThankaTypeSector(
            typeId=r["type_id"],
            code=r["code"],
            name=r["name"],
            color=pick_color(r["code"] or r["name"]),
            count=int(r["cnt"] or 0),
        )
        for r in rows
    ]

    return ThankaTypeSectorResponse(data=sectors)


@thanka_router.get(
    "/types/{type_code}/thankas",
    response_model=ThankaByTypeResponse,
)
async def get_thankas_by_type(
    type_code: str,
    svc: ThankaService = Depends(get_service),
) -> ThankaByTypeResponse:
    rows = await svc.get_thankas_by_type(type_code)

    # Если для типа ещё нет ни одной тханки — возвращаем пустой список
    # и count=0, чтобы фронт показал текст "Для этого типа пока нет ни одной тханки",
    # а не ловил 404.
    if not rows:
        sector = ThankaTypeSector(
            typeId="",
            code=type_code,
            name="",
            color="#8c8c8c",
            count=0,
        )
        return ThankaByTypeResponse(type=sector, data=[])

    first = rows[0]
    sector = ThankaTypeSector(
        typeId=str(first.get("type_id") or ""),
        code=first["code"],
        name=first["name"],
        color="#8c8c8c",  # можно синхронизировать с pick_color при желании
        count=len(rows),
    )

    items = [
        ThankaSummary(
            thankaId=r["thanka_id"],
            title=r["title"],
            status=r["status"],
            typeCode=r["code"],
            typeName=r["name"],
            createdAt=str(r["created_at"]) if r.get("created_at") else None,
        )
        for r in rows
    ]

    return ThankaByTypeResponse(type=sector, data=items)