# -*- coding: utf-8 -*-
"""
AgriVision AI — Pest Catalog & Management Schemas
"""

from __future__ import annotations

from typing import List, Optional
from pydantic import BaseModel, Field


class PestItem(BaseModel):
    class_id: int = Field(..., description="0-based class ID index (0..101)")
    dataset_name: str = Field(..., description="Exact dataset label in IP102")
    common_name: str = Field(..., description="English common name")
    scientific_name: Optional[str] = Field(None, description="Verified binomial scientific name")
    group: str = Field(..., description="Biological or functional group")
    description: str = Field(..., description="General biological description")
    symptoms: str = Field(..., description="Visible signs, symptoms, or characteristics")
    relevance: str = Field(..., description="Agricultural context and relevance")
    verified: bool = Field(..., description="Whether verified detailed metadata is present")


class PestListResponse(BaseModel):
    total: int
    items: List[PestItem]


class IPMRecommendations(BaseModel):
    monitoring: str = Field(..., description="Field scouting and trap monitoring advice")
    cultural_mechanical: str = Field(..., description="Cultural practices, crop rotation, mechanical collection")
    biological: str = Field(..., description="Natural enemies, parasitoids, predatory biocontrol agents")
    chemical: str = Field(..., description="Cautious chemical guidelines, economic threshold levels, safety advice")


class PestManagementDetails(BaseModel):
    class_id: int
    pest_name: str
    common_name: str
    scientific_name: Optional[str] = None
    group: str
    instance_count: int = Field(1, description="Number of instances of this pest species localized in the image")
    crops_affected: List[str] = Field(default_factory=list, description="Host crops and affected plants")
    description: str
    symptoms: str
    life_cycle: Optional[str] = None
    ipm_recommendations: IPMRecommendations
    prevention_monitoring: str
    when_to_consult_expert: str
    source: str = "ICAR - National Research Centre for IPM / TNAU Agritech Portal"
    last_reviewed: str = "October 2026"
    disclaimer: str = (
        "AI model detections indicate visual pattern similarity and are not infallible taxonomic determinations. "
        "Always confirm critical crop protection and chemical interventions with a certified agricultural extension officer."
    )
