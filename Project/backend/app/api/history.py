# -*- coding: utf-8 -*-
"""
AgriVision AI — Diagnosis History API
Provides history retrieval with multi-user isolation and guest support.
"""

from __future__ import annotations

from typing import Any, Dict, Optional
from fastapi import APIRouter, Depends, Query

from app.api.deps import get_current_user, get_optional_current_user
from app.schemas.history import HistoryResponse
from app.services.storage import storage_service

router = APIRouter(tags=["History"])


@router.get("/history", response_model=HistoryResponse)
def get_diagnosis_history(
    limit: int = Query(50, ge=1, le=100, description="Max history records to return"),
    current_user: Optional[Dict[str, Any]] = Depends(get_optional_current_user),
):
    """
    Retrieve diagnosis history.
    - If user is authenticated, returns only their own diagnosis records.
    - If user is a guest, returns recent public/guest diagnosis scans.
    """
    user_id = current_user.get("id") if current_user else None
    result = storage_service.get_history(user_id=user_id, limit=limit)
    return HistoryResponse(
        total=result["total"],
        storage_mode=result["storage_mode"],
        is_database_connected=result["is_database_connected"],
        items=result["items"],
    )


@router.get("/history/my", response_model=HistoryResponse)
def get_my_diagnosis_history(
    limit: int = Query(50, ge=1, le=100, description="Max history records to return"),
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """
    Retrieve only the authenticated user's diagnosis records.
    Strictly isolated: User A cannot access User B's records.
    """
    result = storage_service.get_history(user_id=current_user["id"], limit=limit)
    return HistoryResponse(
        total=result["total"],
        storage_mode=result["storage_mode"],
        is_database_connected=result["is_database_connected"],
        items=result["items"],
    )
