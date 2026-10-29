from pathlib import Path
import pytest
from PIL import Image
import numpy as np

from app.services.inference import InferenceService


@pytest.fixture(scope="module")
def inference_service():
    service = InferenceService.get_instance()
    assert service.is_available, "YOLO model should be loaded"
    return service


def test_model_info_endpoint(inference_service):
    info = inference_service.get_model_info()
    assert info["status"] == "online"
    assert info["num_classes"] in (97, 102)
    assert "rice leaf roller" in info["classes"]


def test_inference_known_image(inference_service):
    val_image_path = Path(r"C:\Users\Harish\Desktop\edge-ai-pest-detection\data\processed\images\val\ip000000008.jpg")
    if not val_image_path.exists():
        pytest.skip("Validation image not accessible")

    res = inference_service.predict_image(val_image_path, conf_threshold=0.25)
    assert res["status"] == "detected"
    assert res["total_detections"] >= 1
    assert res["top_pest"] in ("Rice leaf roller", "rice leaf roller")
    assert res["top_confidence"] > 70.0
    assert "annotated_image" in res
    assert res["annotated_image"].startswith("data:image/jpeg;base64,")


def test_inference_no_detection_on_empty(inference_service):
    # Blank grey image should yield no pest detection
    blank = Image.new("RGB", (640, 640), (128, 128, 128))
    res = inference_service.predict_image(blank, conf_threshold=0.30)
    assert res["status"] == "no_pest_detected"
    assert res["total_detections"] == 0
    assert res["top_pest"] is None


def test_inference_rgba_handling(inference_service):
    # Transparent RGBA image should composite onto white and not crash
    rgba = Image.new("RGBA", (300, 300), (0, 0, 0, 0))
    res = inference_service.predict_image(rgba, conf_threshold=0.30)
    assert res["status"] == "no_pest_detected"
    assert res["total_detections"] == 0
