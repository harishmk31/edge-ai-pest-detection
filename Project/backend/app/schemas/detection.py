from __future__ import annotations

from typing import List, Optional
from pydantic import BaseModel, Field

from app.schemas.pest import PestManagementDetails


class BoundingBox(BaseModel):
    x1: float
    y1: float
    x2: float
    y2: float
    width: float
    height: float
    area_ratio: float


class DetectionItem(BaseModel):
    class_id: int
    pest_name: str
    common_name: str
    group: str
    confidence: float = Field(..., description="Model detector confidence percentage 0-100")
    confidence_level: str = Field(..., description="'high' (>=75%), 'moderate' (50-74%), or 'low' (<50%)")
    bbox: List[float] = Field(..., description="[x1, y1, x2, y2] bounding box coordinates")
    area_ratio: float
    symptoms: str
    relevance: str
    verified: bool


class DiagnosisResponse(BaseModel):
    diagnosis_id: str
    timestamp: str
    status: str = Field(..., description="'detected', 'no_pest_detected', or 'warning'")
    total_detections: int
    top_pest: Optional[str] = None
    top_confidence: Optional[float] = None
    confidence_level: Optional[str] = None
    detections: List[DetectionItem]
    pest_management: List[PestManagementDetails] = []
    annotated_image: str = Field(..., description="Base64 Data URI of annotated image with bounding boxes")
    notes: str
    execution_time_ms: float
    storage_mode: str = Field(..., description="'mongodb' or 'local_dev'")


class ModelInfoResponse(BaseModel):
    model_name: str
    model_path: str
    task: str
    num_classes: int
    classes: List[str]
    device: str
    default_confidence_threshold: float
    status: str
