# /srv/clone/backend/modules/cogiteka/routers/request.py

from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse

request_router = APIRouter(prefix="/api/request", tags=["cogiteka-request"])


@request_router.post("")
async def request_endpoint_root(request: Request):
    return await request_endpoint_php(request)


@request_router.post("/request.php")
async def request_endpoint_php(request: Request):
    form = await request.form()
    method = str(form.get("method", "")).strip()

    if method == "getAllThankas":
        req_type = str(form.get("type", "")).strip()

        # Минимально совместимый ответ для фронта WidgetCreate:
        # result.data.List -> массив объектов
        return JSONResponse(
            {
                "List": []
            }
        )

    if method == "getThankaInfo":
        return JSONResponse({})

    if method == "getGoodsList":
        return JSONResponse({"List": []})

    if method == "getTvtList":
        return JSONResponse({"List": []})

    if method == "getProducerList":
        return JSONResponse({"List": []})

    if method == "getTvt":
        return JSONResponse({})

    return JSONResponse(
        {"error": f"Unknown method: {method}"},
        status_code=400,
    )