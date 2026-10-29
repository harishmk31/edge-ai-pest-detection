import io
from pathlib import Path
import pytest
from fastapi.testclient import TestClient
from PIL import Image

from app.main import app

client = TestClient(app)


def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["service"] == "AgriVision AI API"
    assert "model" in data
    assert "database" in data


def test_model_info_endpoint():
    response = client.get("/api/v1/model-info")
    assert response.status_code == 200
    data = response.json()
    assert data["num_classes"] in (97, 102)
    assert data["status"] == "online"
    assert len(data["classes"]) in (97, 102)


def test_list_pests_endpoint():
    response = client.get("/api/v1/pests")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 102
    assert len(data["items"]) == 102


def test_search_pests_endpoint():
    response = client.get("/api/v1/pests?search=rice")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] > 0
    assert any("rice" in p["common_name"].lower() for p in data["items"])


def test_get_pest_details_valid():
    response = client.get("/api/v1/pests/0")
    assert response.status_code == 200
    data = response.json()
    assert data["class_id"] == 0
    assert data["common_name"] == "Rice leaf roller"


def test_get_pest_details_invalid():
    response = client.get("/api/v1/pests/999")
    assert response.status_code == 404


def test_get_history_endpoint():
    response = client.get("/api/v1/history?limit=10")
    assert response.status_code == 200
    data = response.json()
    assert "total" in data
    assert "storage_mode" in data
    assert "items" in data


def test_diagnose_endpoint_valid_image():
    # Use real validation image
    val_image = Path(r"C:\Users\Harish\Desktop\edge-ai-pest-detection\data\processed\images\val\ip000000008.jpg")
    if not val_image.exists():
        pytest.skip("Validation image not accessible")

    with open(val_image, "rb") as f:
        response = client.post(
            "/api/v1/diagnose",
            files={"file": ("pest.jpg", f, "image/jpeg")},
            data={"confidence": 0.25},
        )

    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "detected"
    assert data["total_detections"] >= 1
    assert data["top_pest"] in ("Rice leaf roller", "rice leaf roller")
    assert data["annotated_image"].startswith("data:image/jpeg;base64,")
    assert "diagnosis_id" in data


def test_diagnose_endpoint_invalid_extension():
    response = client.post(
        "/api/v1/diagnose",
        files={"file": ("test.txt", b"plain text", "text/plain")},
    )
    assert response.status_code == 400
    assert "Unsupported file format" in response.json()["detail"]


def test_diagnose_endpoint_empty_file():
    response = client.post(
        "/api/v1/diagnose",
        files={"file": ("empty.jpg", b"", "image/jpeg")},
    )
    assert response.status_code == 400
