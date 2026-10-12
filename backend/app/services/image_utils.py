from __future__ import annotations

import base64
import io
from pathlib import Path
from typing import Any, List, Tuple
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageOps


class ImageProcessingError(Exception):
    """Raised when an uploaded image is invalid or cannot be processed."""
    pass


def load_and_normalize_image(image_input: bytes | str | Path | Image.Image) -> Image.Image:
    """
    Safely load and normalize an image:
    1. Reads bytes, path, or existing PIL Image.
    2. Applies EXIF rotation/transpose so mobile photos are oriented correctly.
    3. Handles RGBA / Palette / Grayscale by compositing over white into standard 3-channel RGB.
    4. Validates reasonable dimensions (at least 16x16, up to 6000x6000).
    """
    try:
        if isinstance(image_input, Image.Image):
            pil_img = image_input
        elif isinstance(image_input, (str, Path)):
            pil_img = Image.open(image_input)
        elif isinstance(image_input, (bytes, bytearray)):
            if len(image_input) == 0:
                raise ImageProcessingError("Empty image file provided.")
            pil_img = Image.open(io.BytesIO(image_input))
        else:
            raise ImageProcessingError(f"Unsupported image input type: {type(image_input)}")

        # Respect EXIF orientation tag from smartphones and digital cameras
        pil_img = ImageOps.exif_transpose(pil_img)

        # Handle color modes
        if pil_img.mode in ("RGBA", "LA") or (pil_img.mode == "P" and "transparency" in pil_img.info):
            # Composite over clean white background so alpha channel doesn't distort detection
            rgba = pil_img.convert("RGBA")
            background = Image.new("RGBA", rgba.size, (255, 255, 255, 255))
            composite = Image.alpha_composite(background, rgba)
            pil_img = composite.convert("RGB")
        elif pil_img.mode != "RGB":
            pil_img = pil_img.convert("RGB")

        w, h = pil_img.size
        if w < 16 or h < 16:
            raise ImageProcessingError(f"Image is too small ({w}x{h}). Minimum size is 16x16 pixels.")
        if w > 6000 or h > 6000:
            # Rescale excessive dimensions preserving aspect ratio to avoid OOM
            pil_img.thumbnail((4000, 4000), Image.Resampling.LANCZOS)

        return pil_img

    except ImageProcessingError:
        raise
    except Exception as exc:
        raise ImageProcessingError(f"Failed to process image: {str(exc)}") from exc


def pil_to_base64(image: Image.Image, format: str = "JPEG", quality: int = 88) -> str:
    """Encode PIL image to a base64 data URI string."""
    buffer = io.BytesIO()
    image.save(buffer, format=format, quality=quality)
    encoded = base64.b64encode(buffer.getvalue()).decode("utf-8")
    mime = "image/jpeg" if format.upper() == "JPEG" else "image/png"
    return f"data:{mime};base64,{encoded}"


def pil_to_bytes(image: Image.Image, format: str = "JPEG", quality: int = 90) -> bytes:
    """Convert PIL image to bytes."""
    buffer = io.BytesIO()
    image.save(buffer, format=format, quality=quality)
    return buffer.getvalue()


def annotate_image(
    image: Image.Image,
    detections: List[dict[str, Any]],
    line_width: int = 3,
) -> Image.Image:
    """
    Draw bounding boxes and styled labels onto the image.
    Uses PIL to avoid OpenCV color conversion pitfalls and ensure crisp rendering.
    """
    annotated = image.copy()
    draw = ImageDraw.Draw(annotated)

    # Palette for diverse bounding box labels
    palette = [
        ("#166534", "#FFFFFF"),  # Forest green
        ("#0E7490", "#FFFFFF"),  # Cyan
        ("#B45309", "#FFFFFF"),  # Amber
        ("#7E22CE", "#FFFFFF"),  # Purple
        ("#BE123C", "#FFFFFF"),  # Rose
    ]

    try:
        font = ImageFont.load_default()
    except Exception:
        font = None

    for idx, det in enumerate(detections):
        box = det.get("bbox") or det.get("xyxy")
        if not box or len(box) != 4:
            continue

        x1, y1, x2, y2 = [int(round(v)) for v in box]
        # Keep inside image bounds
        x1 = max(0, min(x1, annotated.width - 1))
        x2 = max(0, min(x2, annotated.width - 1))
        y1 = max(0, min(y1, annotated.height - 1))
        y2 = max(0, min(y2, annotated.height - 1))

        if x2 <= x1 or y2 <= y1:
            continue

        border_color, text_color = palette[idx % len(palette)]
        # Draw bounding rectangle
        draw.rectangle([x1, y1, x2, y2], outline=border_color, width=line_width)

        pest_name = det.get("pest_name") or det.get("Pest") or "Pest"
        conf = det.get("confidence", 0.0)
        label = f"{pest_name} ({conf:.1f}%)"

        # Measure text box
        if hasattr(draw, "textbbox"):
            bbox = draw.textbbox((x1, y1), label, font=font)
            tw = bbox[2] - bbox[0]
            th = bbox[3] - bbox[1]
        else:
            tw, th = len(label) * 6, 12

        pad = 4
        tag_y1 = max(0, y1 - th - (pad * 2))
        tag_y2 = tag_y1 + th + (pad * 2)
        tag_x2 = min(annotated.width, x1 + tw + (pad * 2))

        # Tag background banner
        draw.rectangle([x1, tag_y1, tag_x2, tag_y2], fill=border_color)
        draw.text((x1 + pad, tag_y1 + pad), label, fill=text_color, font=font)

    return annotated
