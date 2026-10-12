from typing import Optional
from fastapi import APIRouter, Query
from app.schemas.history import HistoryResponse
from app.services.storage import storage_service

router = APIRouter(tags=["History"])


@router.get("/history", response_model=HistoryResponse)
def get_diagnosis_history(
    limit: int = Query(50, ge=1, le=100, description="Max history records to return"),
):
    """Retrieve saved diagnosis history with thumbnail and detection details."""
    result = storage_service.get_history(limit=limit)
    return HistoryResponse(
        total=result["total"],
        storage_mode=result["storage_mode"],
        is_database_connected=result["is_database_connected"],
        items=result["items"],
    )
