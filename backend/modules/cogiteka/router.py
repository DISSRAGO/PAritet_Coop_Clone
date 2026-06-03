from fastapi import APIRouter

from backend.modules.cogiteka.routers.auth import router as auth_router
from backend.modules.cogiteka.routers.subject import (
    router as subject_router,
    subject_app_router,
)
from backend.modules.cogiteka.routers import (
    community,
    files,
    location,
    members,
    payment,
    site,
    story,
    thanka,
    users,
)

cogi_router = APIRouter(prefix="/api", tags=["cogi"])

cogi_router.include_router(auth_router)
cogi_router.include_router(subject_router)
cogi_router.include_router(subject_app_router)
cogi_router.include_router(users.router)
cogi_router.include_router(community.router)
cogi_router.include_router(location.router)
cogi_router.include_router(members.router)
cogi_router.include_router(payment.router)
cogi_router.include_router(site.router)
cogi_router.include_router(story.router)
cogi_router.include_router(thanka.router)
cogi_router.include_router(files.router)


@cogi_router.get("/health", tags=["health"])
def health():
    return {"status": "ok"}