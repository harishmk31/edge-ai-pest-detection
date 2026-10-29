from fastapi import APIRouter
from app.api.assistant import router as assistant_router
from app.api.auth import router as auth_router
from app.api.diagnosis import router as diagnosis_router
from app.api.history import router as history_router
from app.api.pests import router as pests_router

api_router = APIRouter(prefix="/api/v1")
api_router.include_router(auth_router)
api_router.include_router(diagnosis_router)
api_router.include_router(pests_router)
api_router.include_router(history_router)
api_router.include_router(assistant_router)
