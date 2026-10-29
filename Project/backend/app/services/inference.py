from __future__ import annotations

import logging
import time
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple
import numpy as np
from PIL import Image

from app.core.config import settings
from app.data.pest_catalog import IP102_CLASSES, get_pest_by_name, get_pest_management_details
from app.services.image_utils import annotate_image, load_and_normalize_image, pil_to_base64

logger = logging.getLogger("agrivision.inference")


class InferenceService:
    """
    Singleton-style inference service for AgriVision AI.
    Loads YOLO once in memory and performs robust, color-corrected detections.
    """

    _instance: Optional["InferenceService"] = None

    def __init__(self, model_path: Optional[str] = None):
        self.model_path = Path(model_path or settings.MODEL_PATH)
        self.model = None
        self.device = "cpu"
        self._load_model()

    @classmethod
    def get_instance(cls) -> "InferenceService":
        if cls._instance is None:
            cls._instance = InferenceService()
        return cls._instance

    def _load_model(self) -> None:
        """Load the YOLO model from checkpoint with error handling."""
        if not self.model_path.is_file():
            logger.error(f"Model file not found at: {self.model_path}")
            self.model = None
            return

        try:
            from ultralytics import YOLO
            import torch

            logger.info(f"Loading YOLO checkpoint from {self.model_path}...")
            self.model = YOLO(str(self.model_path))
            self.device = "cuda:0" if torch.cuda.is_available() else "cpu"
            logger.info(f"YOLO model loaded successfully. Device: {self.device}, Classes: {len(self.model.names)}")
        except Exception as exc:
            logger.error(f"Failed to load YOLO model: {exc}", exc_info=True)
            self.model = None

    @property
    def is_available(self) -> bool:
        return self.model is not None

    def get_model_info(self) -> Dict[str, Any]:
        """Return runtime details about the loaded model."""
        if not self.is_available:
            return {
                "model_name": self.model_path.name,
                "model_path": str(self.model_path),
                "task": "detect",
                "num_classes": 0,
                "classes": [],
                "device": "unavailable",
                "default_confidence_threshold": settings.DEFAULT_CONFIDENCE_THRESHOLD,
                "status": "unavailable",
            }

        names = getattr(self.model, "names", {}) or {}
        class_list = [names.get(i, f"class_{i}") for i in range(len(names))]

        return {
            "model_name": self.model_path.name,
            "model_path": str(self.model_path),
            "task": getattr(self.model, "task", "detect"),
            "num_classes": len(names),
            "classes": class_list,
            "device": self.device,
            "default_confidence_threshold": settings.DEFAULT_CONFIDENCE_THRESHOLD,
            "status": "online",
        }

    def predict_image(
        self,
        image_input: bytes | str | Path | Image.Image,
        conf_threshold: Optional[float] = None,
        iou_threshold: Optional[float] = None,
    ) -> Dict[str, Any]:
        """
        Run pest detection on an image.
        Ensures strict RGB/BGR color correction and handles EXIF/RGBA transparency.
        """
        if not self.is_available:
            raise RuntimeError(f"YOLO model is not available at {self.model_path}. Check model file path.")

        start_time = time.perf_counter()

        # 1. Normalize image (strips alpha, resolves EXIF rotation, ensures standard RGB)
        normalized_pil = load_and_normalize_image(image_input)
        img_width, img_height = normalized_pil.size
        full_area = max(float(img_width * img_height), 1.0)

        conf = float(conf_threshold if conf_threshold is not None else settings.DEFAULT_CONFIDENCE_THRESHOLD)
        conf = min(max(conf, 0.05), 0.95)
        iou = float(iou_threshold if iou_threshold is not None else settings.DEFAULT_IOU_THRESHOLD)

        # 2. COLOR CORRECTION:
        # Pass PIL image directly to Ultralytics.
        # Ultralytics LoadPilAndNumpy correctly converts PIL RGB to BGR for internal OpenCV processing,
        # which its BasePredictor.preprocess then reverses back to RGB for neural network inference.
        results = self.model.predict(
            source=normalized_pil,
            conf=conf,
            iou=iou,
            imgsz=640,
            max_det=settings.MAX_DETECTIONS,
            verbose=False,
        )

        if not results:
            raise RuntimeError("Model returned no prediction outputs.")

        result = results[0]
        boxes = getattr(result, "boxes", None)
        detections: List[Dict[str, Any]] = []

        if boxes is not None and len(boxes) > 0:
            for box in boxes:
                class_id = int(box.cls[0].item())
                confidence = float(box.conf[0].item())
                coords = [float(v) for v in box.xyxy[0].tolist()]
                x1, y1, x2, y2 = coords

                bw = max(x2 - x1, 0.0)
                bh = max(y2 - y1, 0.0)
                area_ratio = (bw * bh) / full_area

                if area_ratio < settings.IMAGE_MIN_AREA_RATIO:
                    continue

                dataset_name = self.model.names.get(class_id, f"class_{class_id}")
                meta = get_pest_by_name(dataset_name, class_id=class_id)

                conf_pct = round(confidence * 100.0, 1)
                if conf_pct >= 75.0:
                    conf_level = "high"
                elif conf_pct >= 50.0:
                    conf_level = "moderate"
                else:
                    conf_level = "low"

                detections.append(
                    {
                        "class_id": class_id,
                        "pest_name": dataset_name,
                        "common_name": meta["common_name"],
                        "group": meta["group"],
                        "confidence": conf_pct,
                        "confidence_level": conf_level,
                        "bbox": [round(x1, 1), round(y1, 1), round(x2, 1), round(y2, 1)],
                        "area_ratio": round(area_ratio, 5),
                        "symptoms": meta["symptoms"],
                        "relevance": meta["relevance"],
                        "verified": meta["verified"],
                    }
                )

        # Sort detections descending by confidence
        detections.sort(key=lambda d: d["confidence"], reverse=True)

        # 3. Create annotated visualization
        annotated_pil = annotate_image(normalized_pil, detections)
        annotated_base64 = pil_to_base64(annotated_pil, format="JPEG", quality=88)

        elapsed_ms = round((time.perf_counter() - start_time) * 1000.0, 1)

        # 4. Formulate status, guidance, and pest management details
        pest_management: List[Dict[str, Any]] = []
        if detections:
            status = "detected"
            top_det = detections[0]
            top_pest = top_det["common_name"]
            top_conf = top_det["confidence"]
            top_level = top_det["confidence_level"]
            notes = (
                f"Detected {len(detections)} potential pest occurrence(s). "
                f"Top identification: {top_pest} ({top_conf}% model confidence). "
                f"Model score indicates pattern similarity, not an infallible biological diagnosis."
            )

            # Group repeated species so advice isn't duplicated while showing instance count
            species_counts: Dict[str, int] = {}
            for d in detections:
                p_name = d["pest_name"]
                species_counts[p_name] = species_counts.get(p_name, 0) + 1

            for p_name, count in species_counts.items():
                pm_entry = get_pest_management_details(p_name, instance_count=count)
                pest_management.append(pm_entry)
        else:
            status = "no_pest_detected"
            top_pest = None
            top_conf = None
            top_level = None
            notes = (
                f"No pests detected with confidence >= {int(conf * 100)}%. "
                "Ensure the insect is centered, in clear focus, and well-lit. "
                "If inspecting crop damage, capture the affected foliage up close."
            )

        return {
            "status": status,
            "total_detections": len(detections),
            "top_pest": top_pest,
            "top_confidence": top_conf,
            "confidence_level": top_level,
            "detections": detections,
            "pest_management": pest_management,
            "annotated_image": annotated_base64,
            "annotated_pil": annotated_pil,
            "normalized_pil": normalized_pil,
            "notes": notes,
            "execution_time_ms": elapsed_ms,
        }
