# -*- coding: utf-8 -*-
"""
AgriVision AI — Kural AI Agricultural Assistant Schemas
"""

from __future__ import annotations

from typing import List, Optional
from pydantic import BaseModel, Field


class ChatMessage(BaseModel):
    role: str = Field(..., description="Role of the sender: 'user', 'assistant', or 'system'")
    content: str = Field(..., description="Message text")
    timestamp: Optional[str] = Field(None, description="ISO timestamp of the message")


class ChatSource(BaseModel):
    title: str = Field(..., description="Name or title of the verified agricultural reference")
    authority: str = Field(..., description="Institutional source, e.g., ICAR, TNAU, or IP102")
    relevance: str = Field(..., description="Summary of relevant guidance drawn from this reference")


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=2500, description="User question or query for Kural")
    language: str = Field("en", description="Target response language ('en', 'ta', or 'hi')")
    diagnosis_id: Optional[str] = Field(None, description="Optional ID of a saved diagnosis for context grounding")
    pest_name: Optional[str] = Field(None, description="Optional pest common or dataset name for context grounding")
    history: List[ChatMessage] = Field(default_factory=list, description="Prior conversation history turns")


class ChatResponse(BaseModel):
    reply: str = Field(..., description="Markdown-formatted response from Kural")
    sources: List[ChatSource] = Field(default_factory=list, description="Agricultural reference sources consulted")
    suggested_questions: List[str] = Field(default_factory=list, description="Relevant follow-up question prompts")
    disclaimer: str = Field(..., description="Mandatory agricultural decision-support disclaimer")
    language: str = Field("en", description="Language used in the response")
    diagnosis_context_used: bool = Field(False, description="Whether diagnosis metadata was provided and incorporated")
    model_used: str = Field("local-rag", description="Model engine that produced the response")
    execution_time_ms: float = Field(0.0, description="Processing latency in milliseconds")
