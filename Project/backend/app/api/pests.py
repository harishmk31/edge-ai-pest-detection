from typing import Optional
from fastapi import APIRouter, HTTPException, Query, status

from app.data.pest_catalog import (
    IP102_CLASSES,
    get_all_pests,
    get_pest_by_id,
    search_pests,
)
from app.schemas.pest import PestItem, PestListResponse

router = APIRouter(tags=["Pests"])


@router.get("/pests", response_model=PestListResponse)
def list_pests(
    search: Optional[str] = Query(None, description="Search term for pest name, symptoms, or group"),
):
    """Retrieve catalog of supported agricultural pests (IP102 benchmark classes)."""
    if search:
        items = search_pests(search)
    else:
        items = get_all_pests()

    return PestListResponse(total=len(items), items=items)


@router.get("/pests/{pest_id}", response_model=PestItem)
def get_pest_details(pest_id: int):
    """Retrieve detailed biological and management information for a specific pest ID."""
    entry = get_pest_by_id(pest_id)
    if entry is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Pest with class ID {pest_id} not found. Valid IDs range from 0 to {len(IP102_CLASSES) - 1}.",
        )
    return entry
