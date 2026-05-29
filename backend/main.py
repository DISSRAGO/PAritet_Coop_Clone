import os
from contextlib import asynccontextmanager
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from backend.modules.cogiteka.router import cogi_router
from backend.modules.cogiteka.routers.request import request_router
from backend.modules.cogiteka.site_router import site_router
from backend.shared.db import close_db_pool, init_db_pool

ROOT_DIR = Path(__file__).resolve().parents[1]
ENV_FILE = ROOT_DIR / ".env"
load_dotenv(dotenv_path=ENV_FILE)


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db_pool()
    yield
    await close_db_pool()


app = FastAPI(title="HomoNet API - Shared Server", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3001",
        "http://127.0.0.1:3001",
        "http://172.27.64.22:3001",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DATA_DIR = Path(os.getenv("DATA_DIR", "/srv/clone/data"))
STYLES_DIR = DATA_DIR / "styles"

STYLES_DIR.mkdir(parents=True, exist_ok=True)

if DATA_DIR.is_dir():
    app.mount("/data", StaticFiles(directory=str(DATA_DIR)), name="data")


@app.get("/")
async def root():
    return {
        "message": "HomoNet Shared API",
        "projects": ["cogiteka", "future1", "future2"],
    }


app.include_router(cogi_router)
app.include_router(site_router)
app.include_router(request_router)


@app.get("/cogi/status")
async def cogi_status():
    return {"cogiAPI": "active", "mode": "router+legacy-site"}


@app.get("/debug/routes")
async def debug_routes():
    result = []

    for route in app.routes:
        result.append(
            {
                "path": getattr(route, "path", None),
                "name": getattr(route, "name", None),
                "methods": sorted(list(getattr(route, "methods", []) or [])),
                "type": route.__class__.__name__,
            }
        )

    return sorted(result, key=lambda x: x["path"] or "")


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)