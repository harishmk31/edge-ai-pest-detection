from typing import List, Optional
from pydantic import BaseModel, Field


class PestItem(BaseModel):
    class_id: int = Field(..., description="0-based class ID index (0..101)")
    dataset_name: str = Field(..., description="Exact dataset label in IP102")
    common_name: str = Field(..., description="English common name")
    group: str = Field(..., description="Biological or functional group")
    description: str = Field(..., description="General biological description")
    symptoms: str = Field(..., description="Visible signs, symptoms, or characteristics")
    relevance: str = Field(..., description="Agricultural context and relevance")
    verified: bool = Field(..., description="Whether verified detailed metadata is present")


class PestListResponse(BaseModel):
    total: int
    items: List[PestItem]
