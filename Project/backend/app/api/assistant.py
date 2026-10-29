# -*- coding: utf-8 -*-
"""
AgriVision AI — Kural AI Assistant API Endpoints
"""

from __future__ import annotations

from typing import Any, Dict, Optional
from fastapi import APIRouter, Depends, status

from app.api.deps import get_optional_current_user
from app.core.config import settings
from app.schemas.assistant import ChatRequest, ChatResponse
from app.services.kural_service import kural_service

router = APIRouter(prefix="/assistant", tags=["Kural Assistant"])


@router.post("/chat", response_model=ChatResponse, status_code=status.HTTP_200_OK)
def chat_with_kural(
    request: ChatRequest,
    current_user: Optional[Dict[str, Any]] = Depends(get_optional_current_user),
) -> ChatResponse:
    """
    Interact with Kural, your AI Pest & Crop Assistant.
    Supports multilingual Q&A (en, ta, hi), RAG knowledge grounding from ICAR/TNAU,
    and optional context linking to saved pest diagnoses.
    """
    return kural_service.process_chat(request=request, current_user=current_user)


@router.get("/status")
def get_assistant_status():
    """
    Retrieve Kural assistant engine status and available features.
    """
    has_api_key = bool(settings.OPENAI_API_KEY and settings.OPENAI_API_KEY.strip())
    return {
        "assistant_name": "Kural",
        "display_name": "Kural — Your AI Pest & Crop Assistant",
        "engine": "openai" if has_api_key else "local-rag",
        "model": settings.OPENAI_MODEL if has_api_key else "local-rag-catalog",
        "languages_supported": ["en", "ta", "hi"],
        "knowledge_base": "IP102 Benchmark (102 Pests) + ICAR & TNAU Extension Guidelines",
        "has_live_llm": has_api_key,
    }
