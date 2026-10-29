# -*- coding: utf-8 -*-
"""
AgriVision AI — Authentication Endpoints
"""

from __future__ import annotations

from typing import Any, Dict
from fastapi import APIRouter, Depends, HTTPException, status

from app.api.deps import get_current_user
from app.core.security import create_access_token
from app.schemas.auth import (
    AuthTokenResponse,
    UserLoginRequest,
    UserRegisterRequest,
    UserResponse,
)
from app.services.user_service import user_service

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=AuthTokenResponse, status_code=status.HTTP_201_CREATED)
def register(payload: UserRegisterRequest):
    """
    Register a new user account with hashed password storage.
    Returns a signed JWT access token and user profile.
    """
    if payload.password_confirm and payload.password != payload.password_confirm:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Password and password confirmation do not match.",
        )

    try:
        user = user_service.register_user(
            name=payload.name,
            email=payload.email,
            password=payload.password,
        )
    except ValueError as val_err:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(val_err),
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Registration failed due to a server error. Please try again.",
        )

    token = create_access_token(data={"sub": user["id"], "email": user["email"]})
    return AuthTokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse(**user),
    )


@router.post("/login", response_model=AuthTokenResponse)
def login(payload: UserLoginRequest):
    """
    Authenticate with email and password.
    Returns a signed JWT access token upon successful credentials verification.
    """
    user = user_service.authenticate(email=payload.email, password=payload.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password. Please verify your credentials.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = create_access_token(data={"sub": user["id"], "email": user["email"]})
    return AuthTokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse(**user),
    )


@router.get("/me", response_model=UserResponse)
def get_current_user_profile(current_user: Dict[str, Any] = Depends(get_current_user)):
    """
    Retrieve profile details for the authenticated user.
    """
    return UserResponse(**current_user)


@router.post("/logout")
def logout(current_user: Dict[str, Any] = Depends(get_current_user)):
    """
    Terminate session on client side.
    """
    return {
        "status": "success",
        "message": f"User '{current_user['email']}' has logged out successfully.",
    }
