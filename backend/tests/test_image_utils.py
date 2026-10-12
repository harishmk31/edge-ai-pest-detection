import io
import pytest
from PIL import Image
from app.services.image_utils import (
    ImageProcessingError,
    annotate_image,
    load_and_normalize_image,
    pil_to_base64,
)


def test_load_and_normalize_rgb():
    img = Image.new("RGB", (100, 100), (46, 125, 79))
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    normalized = load_and_normalize_image(buf.getvalue())
    assert normalized.mode == "RGB"
    assert normalized.size == (100, 100)


def test_load_and_normalize_rgba_compositing():
    # RGBA with transparency
    img = Image.new("RGBA", (120, 80), (255, 0, 0, 128))
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    normalized = load_and_normalize_image(buf.getvalue())
    assert normalized.mode == "RGB"
    assert normalized.size == (120, 80)


def test_load_and_normalize_grayscale():
    img = Image.new("L", (80, 80), 128)
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    normalized = load_and_normalize_image(buf.getvalue())
    assert normalized.mode == "RGB"


def test_reject_empty_bytes():
    with pytest.raises(ImageProcessingError, match="Empty image"):
        load_and_normalize_image(b"")


def test_reject_corrupted_data():
    with pytest.raises(ImageProcessingError):
        load_and_normalize_image(b"not-an-image-payload-header")


def test_reject_too_small_image():
    img = Image.new("RGB", (10, 10), (0, 0, 0))
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    with pytest.raises(ImageProcessingError, match="too small"):
        load_and_normalize_image(buf.getvalue())


def test_pil_to_base64_data_uri():
    img = Image.new("RGB", (50, 50), (10, 20, 30))
    uri = pil_to_base64(img)
    assert uri.startswith("data:image/jpeg;base64,")


def test_annotate_image():
    img = Image.new("RGB", (200, 200), (200, 200, 200))
    dets = [
        {
            "class_id": 0,
            "pest_name": "rice leaf roller",
            "common_name": "Rice leaf roller",
            "confidence": 88.5,
            "bbox": [20, 20, 100, 100],
        }
    ]
    annotated = annotate_image(img, dets)
    assert annotated.size == (200, 200)
    assert annotated.mode == "RGB"
