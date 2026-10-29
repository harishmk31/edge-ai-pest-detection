from pathlib import Path
import pytest
from fastapi.testclient import TestClient
from PIL import Image
import io

from app.main import app

client = TestClient(app)


def test_e2e_full_workflow():
    # 1. Health check
    res_health = client.get("/health")
    assert res_health.status_code == 200
    health_data = res_health.json()
    assert health_data["status"] == "healthy"
    assert health_data["model"]["loaded"] is True
    assert health_data["model"]["classes_count"] == 102

    # 2. Model info
    res_model = client.get("/api/v1/model-info")
    assert res_model.status_code == 200
    model_data = res_model.json()
    assert model_data["num_classes"] == 102
    assert "rice leaf roller" in model_data["classes"]

    # 3. Pest catalog lookup
    res_pests = client.get("/api/v1/pests?search=rice")
    assert res_pests.status_code == 200
    pest_data = res_pests.json()
    assert pest_data["total"] > 0
    assert any("rice leaf roller" in p["dataset_name"].lower() for p in pest_data["items"])

    # 4. End-to-end diagnose with real validation image
    val_image_path = Path(r"C:\Users\Harish\Desktop\edge-ai-pest-detection\data\processed\images\val\ip000000008.jpg")
    if not val_image_path.exists():
        pytest.skip("Validation image not accessible on disk")

    with open(val_image_path, "rb") as f:
        res_diag = client.post(
            "/api/v1/diagnose",
            files={"file": ("ip000000008.jpg", f, "image/jpeg")},
            data={"confidence": 0.35},
        )

    assert res_diag.status_code == 200
    diag_data = res_diag.json()
    assert diag_data["status"] == "detected"
    assert diag_data["total_detections"] >= 1
    assert diag_data["top_pest"] in ("Rice leaf roller", "rice leaf roller")
    assert diag_data["top_confidence"] > 75.0
    assert diag_data["confidence_level"] == "high"
    assert diag_data["annotated_image"].startswith("data:image/jpeg;base64,")
    assert "diagnosis_id" in diag_data

    # 5. Verify history record was created and stored
    res_hist = client.get("/api/v1/history?limit=10")
    assert res_hist.status_code == 200
    hist_data = res_hist.json()
    assert hist_data["total"] >= 1
    recent = hist_data["items"][0]
    assert recent["top_pest"] in ("Rice leaf roller", "rice leaf roller")
    assert recent["status"] == "detected"
    assert recent["thumbnail_url"] is not None

    # 6. End-to-end diagnose with blank image (clean / no pest)
    blank_img = Image.new("RGB", (640, 640), (128, 128, 128))
    buf = io.BytesIO()
    blank_img.save(buf, format="JPEG")
    buf.seek(0)

    res_clean = client.post(
        "/api/v1/diagnose",
        files={"file": ("clean_crop.jpg", buf.getvalue(), "image/jpeg")},
        data={"confidence": 0.35},
    )
    assert res_clean.status_code == 200
    clean_data = res_clean.json()
    assert clean_data["status"] == "no_pest_detected"
    assert clean_data["total_detections"] == 0
    assert clean_data["top_pest"] is None
