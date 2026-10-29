from typing import List, Optional
from pydantic import BaseModel


class DiagnosisRecord(BaseModel):
    id: str
    timestamp: str
    filename: str
    user_id: Optional[str] = None
    user_email: Optional[str] = None
    status: str
    total_detections: int
    top_pest: Optional[str] = None
    top_confidence: Optional[float] = None
    confidence_level: Optional[str] = None
    detections_summary: List[str] = []
    thumbnail_url: Optional[str] = None
    notes: Optional[str] = None


class HistoryResponse(BaseModel):
    total: int
    storage_mode: str
    is_database_connected: bool
    items: List[DiagnosisRecord]
