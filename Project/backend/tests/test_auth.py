# -*- coding: utf-8 -*-
"""
AgriVision AI — Authentication & Security Unit & Integration Tests
"""

import uuid
import pytest
from fastapi.testclient import TestClient

from app.core.security import (
    create_access_token,
    decode_access_token,
    hash_password,
    verify_password,
)
from app.main import app

client = TestClient(app)


def test_password_hashing():
    pwd = "AgriVisionSecurePass2026!"
    hashed = hash_password(pwd)
    assert hashed != pwd
    assert hashed.startswith("pbkdf2_sha256$")
    assert verify_password(pwd, hashed) is True
    assert verify_password("WrongPassword!", hashed) is False


def test_jwt_token_generation_and_decoding():
    claims = {"sub": "user_test_123", "email": "farmer@example.com"}
    token = create_access_token(claims)
    assert isinstance(token, str)

    payload = decode_access_token(token)
    assert payload is not None
    assert payload.get("sub") == "user_test_123"
    assert payload.get("email") == "farmer@example.com"
    assert "exp" in payload

    # Test invalid token
    assert decode_access_token("invalid.token.here") is None


def test_user_registration_and_login_flow():
    rand_id = uuid.uuid4().hex[:8]
    test_email = f"agri_tester_{rand_id}@domain.org"
    test_password = "Password123!"
    test_name = "Farmer Ramesh"

    # 1. Register new user
    reg_resp = client.post(
        "/api/v1/auth/register",
        json={"name": test_name, "email": test_email, "password": test_password},
    )
    assert reg_resp.status_code in (200, 201)
    reg_data = reg_resp.json()
    assert "access_token" in reg_data
    assert reg_data["user"]["email"] == test_email
    assert reg_data["user"]["name"] == test_name
    assert "hashed_password" not in reg_data["user"]

    token = reg_data["access_token"]

    # 2. Duplicate registration should be rejected
    dup_resp = client.post(
        "/api/v1/auth/register",
        json={"name": "Duplicate Tester", "email": test_email, "password": "AnotherPassword123!"},
    )
    assert dup_resp.status_code in (400, 409)
    detail_msg = dup_resp.json()["detail"].lower()
    assert "already exists" in detail_msg or "already registered" in detail_msg

    # 3. Login with correct credentials
    login_resp = client.post(
        "/api/v1/auth/login",
        json={"email": test_email, "password": test_password},
    )
    assert login_resp.status_code == 200
    login_data = login_resp.json()
    assert "access_token" in login_data
    assert login_data["user"]["email"] == test_email

    # 4. Login with incorrect password
    bad_login = client.post(
        "/api/v1/auth/login",
        json={"email": test_email, "password": "WrongPassword!"},
    )
    assert bad_login.status_code == 401

    # 5. Profile /me endpoint with Bearer token
    me_resp = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert me_resp.status_code == 200
    me_data = me_resp.json()
    assert me_data["email"] == test_email
    assert me_data["name"] == test_name

    # 6. Profile /me without token
    unauth_resp = client.get("/api/v1/auth/me")
    assert unauth_resp.status_code == 401

    # 7. Logout endpoint
    logout_resp = client.post(
        "/api/v1/auth/logout",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert logout_resp.status_code == 200
