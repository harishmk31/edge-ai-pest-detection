# -*- coding: utf-8 -*-
"""
AgriVision AI — Camera Snapshot Capture & Diagnosis Test
Validates that camera-captured JPEG blobs/files are accepted and processed
cleanly by the YOLO11n inference engine and return simplified IPM advice.
"""

import io
from PIL import Image
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_camera_captured_frame_diagnosis():
    # Generate synthetic 1280x720 camera frame matching video canvas capture
    img = Image.new("RGB", (1280, 720), color=(40, 110, 40))
    buf = io.BytesIO()
    img.save(buf, format="JPEG", quality=92)
    camera_bytes = buf.getvalue()

    filename = "camera_capture_1730000000000.jpg"

    resp = client.post(
        "/api/v1/diagnose",
        files={"file": (filename, camera_bytes, "image/jpeg")},
        data={"confidence": 0.35, "iou": 0.45},
    )

    assert resp.status_code == 200
    data = resp.json()

    assert data["status"] in ("detected", "no_pest_detected")
    assert "diagnosis_id" in data
    assert "annotated_image" in data
    assert "pest_management" in data
    assert isinstance(data["pest_management"], list)
    assert data["execution_time_ms"] > 0
