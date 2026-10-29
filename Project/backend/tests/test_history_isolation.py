# -*- coding: utf-8 -*-
"""
AgriVision AI — User History Isolation Tests
Validates that diagnosis history is strictly isolated per authenticated user account.
"""

import io
import uuid
from PIL import Image
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def create_test_image_bytes() -> bytes:
    img = Image.new("RGB", (320, 320), color=(50, 150, 50))
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    return buf.getvalue()


def test_diagnosis_history_isolation_between_users():
    rand_a = uuid.uuid4().hex[:8]
    rand_b = uuid.uuid4().hex[:8]

    # 1. Register User A
    user_a_email = f"user_alpha_{rand_a}@farm.org"
    reg_a = client.post(
        "/api/v1/auth/register",
        json={"name": "User Alpha", "email": user_a_email, "password": "PasswordAlpha123!"},
    )
    assert reg_a.status_code in (200, 201)
    token_a = reg_a.json()["access_token"]
    user_a_id = reg_a.json()["user"]["id"]

    # 2. Register User B
    user_b_email = f"user_beta_{rand_b}@farm.org"
    reg_b = client.post(
        "/api/v1/auth/register",
        json={"name": "User Beta", "email": user_b_email, "password": "PasswordBeta123!"},
    )
    assert reg_b.status_code in (200, 201)
    token_b = reg_b.json()["access_token"]
    user_b_id = reg_b.json()["user"]["id"]

    # 3. User A submits a diagnosis image
    img_bytes = create_test_image_bytes()
    diag_resp = client.post(
        "/api/v1/diagnose",
        files={"file": ("leaf_test_a.jpg", img_bytes, "image/jpeg")},
        headers={"Authorization": f"Bearer {token_a}"},
    )
    assert diag_resp.status_code == 200
    diag_id = diag_resp.json()["diagnosis_id"]

    # 4. User A checks their personal history
    hist_a = client.get(
        "/api/v1/history/my",
        headers={"Authorization": f"Bearer {token_a}"},
    )
    assert hist_a.status_code == 200
    records_a = hist_a.json()["items"]
    assert any(r["id"] == diag_id for r in records_a)

    # 5. User B checks their personal history — MUST NOT contain User A's diagnosis
    hist_b = client.get(
        "/api/v1/history/my",
        headers={"Authorization": f"Bearer {token_b}"},
    )
    assert hist_b.status_code == 200
    records_b = hist_b.json()["items"]
    assert not any(r["id"] == diag_id for r in records_b), "Security failure: User B can see User A's diagnosis record!"

    # 6. Verify User A's profile diagnosis count reflects their scans
    prof_a = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {token_a}"},
    )
    assert prof_a.status_code == 200
    assert prof_a.json()["total_diagnoses"] >= 1
