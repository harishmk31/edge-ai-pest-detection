# -*- coding: utf-8 -*-
"""
AgriVision AI — Multi-Detection & Pest Management Unit Tests
"""

import io
from PIL import Image
from fastapi.testclient import TestClient

from app.data.pest_management import get_pest_management_details
from app.main import app
from app.schemas.pest import PestManagementDetails

client = TestClient(app)


def test_pest_management_curated_profiles():
    # Rice leaf roller profile
    pm_roller = get_pest_management_details("rice leaf roller", instance_count=3)
    assert pm_roller["common_name"] == "Rice leaf roller"
    assert "Cnaphalocrocis medinalis" in pm_roller["scientific_name"]
    assert pm_roller["instance_count"] == 3
    assert len(pm_roller["crops_affected"]) > 0
    assert "Rice" in pm_roller["crops_affected"][0]
    assert len(pm_roller["ipm_recommendations"]["monitoring"]) > 10
    assert len(pm_roller["ipm_recommendations"]["cultural_mechanical"]) > 10
    assert len(pm_roller["ipm_recommendations"]["biological"]) > 10
    assert len(pm_roller["ipm_recommendations"]["chemical"]) > 10
    assert "ICAR" in pm_roller["source"] or "TNAU" in pm_roller["source"]
    assert "AI model detections indicate" in pm_roller["disclaimer"]

    # Validate against Pydantic schema
    validated = PestManagementDetails(**pm_roller)
    assert validated.class_id == 0

    # Brown plant hopper profile
    pm_bph = get_pest_management_details("brown plant hopper", instance_count=5)
    assert "Nilaparvata lugens" in pm_bph["scientific_name"]
    assert pm_bph["instance_count"] == 5
    assert "hopperburn" in pm_bph["symptoms"].lower()

    # Fallback group profile
    pm_generic = get_pest_management_details("unknown_bug_species", instance_count=1)
    assert pm_generic["instance_count"] == 1
    assert "ipm_recommendations" in pm_generic
    assert pm_generic["disclaimer"] != ""


def test_diagnose_api_returns_pest_management_structure():
    # Submit a clean test image
    img = Image.new("RGB", (400, 400), color=(80, 140, 80))
    buf = io.BytesIO()
    img.save(buf, format="JPEG")

    resp = client.post(
        "/api/v1/diagnose",
        files={"file": ("field_green.jpg", buf.getvalue(), "image/jpeg")},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert "pest_management" in data
    assert isinstance(data["pest_management"], list)
    # If no detections on plain green, pest_management is empty list
    assert data["status"] in ("detected", "no_pest_detected")
    if data["total_detections"] == 0:
        assert len(data["pest_management"]) == 0
