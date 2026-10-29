# -*- coding: utf-8 -*-
"""
AgriVision AI — Authentication Schemas
"""

from __future__ import annotations

import re
from typing import Optional
from pydantic import BaseModel, Field, field_validator


class UserRegisterRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=80, description="Full display name")
    email: str = Field(..., description="Unique user email address")
    password: str = Field(..., min_length=8, max_length=128, description="Account password (min 8 characters)")
    password_confirm: Optional[str] = Field(None, description="Password confirmation")

    @field_validator("email")
    @classmethod
    def validate_email_format(cls, v: str) -> str:
        clean = v.strip().lower()
        # Basic RFC 5322 compatible regex
        if not re.match(r"^[^@\s]+@[^@\s]+\.[^@\s]+$", clean):
            raise ValueError("Invalid email address format.")
        return clean

    @field_validator("name")
    @classmethod
    def clean_name(cls, v: str) -> str:
        clean = v.strip()
        if len(clean) < 2:
            raise ValueError("Name must be at least 2 characters.")
        return clean


class UserLoginRequest(BaseModel):
    email: str = Field(..., description="User email address")
    password: str = Field(..., description="Account password")

    @field_validator("email")
    @classmethod
    def clean_email(cls, v: str) -> str:
        return v.strip().lower()


class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    created_at: str
    total_diagnoses: int = 0
    storage_mode: str = "local_dev"


class AuthTokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
