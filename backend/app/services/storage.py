from __future__ import annotations

import json
import logging
import uuid
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional
from PIL import Image

from app.core.config import settings
from app.db.mongodb import db_client
from app.services.image_utils import pil_to_base64, pil_to_bytes

logger = logging.getLogger("agrivision.storage")


class StorageService:
    def __init__(self):
        self.storage_dir = settings.storage_path
        self.images_dir = self.storage_dir / "images"
        self.annotated_dir = self.storage_dir / "annotated"
        self.local_history_file = self.storage_dir / "local_history.json"

        self.images_dir.mkdir(parents=True, exist_ok=True)
        self.annotated_dir.mkdir(parents=True, exist_ok=True)

    def save_diagnosis(
        self,
        prediction_result: Dict[str, Any],
        original_image: Image.Image,
        annotated_image: Image.Image,
        original_filename: str = "upload.jpg",
    ) -> Dict[str, Any]:
        diagnosis_id = str(uuid.uuid4())
        now_iso = datetime.utcnow().isoformat() + "Z"

        # 1. Save original and annotated images to disk
        orig_file = self.images_dir / f"{diagnosis_id}.jpg"
        ann_file = self.annotated_dir / f"{diagnosis_id}.jpg"

        original_image.save(orig_file, format="JPEG", quality=90)
        annotated_image.save(ann_file, format="JPEG", quality=88)

        # 2. Generate small thumbnail for history
        thumb = annotated_image.copy()
        thumb.thumbnail((200, 200), Image.Resampling.LANCZOS)
        thumb_base64 = pil_to_base64(thumb, format="JPEG", quality=75)

        # 3. Create record structure
        record: Dict[str, Any] = {
            "id": diagnosis_id,
            "timestamp": now_iso,
            "filename": original_filename,
            "status": prediction_result["status"],
            "total_detections": prediction_result["total_detections"],
            "top_pest": prediction_result.get("top_pest"),
            "top_confidence": prediction_result.get("top_confidence"),
            "confidence_level": prediction_result.get("confidence_level"),
            "detections_summary": [
                f"{d['common_name']} ({d['confidence']}%)"
                for d in prediction_result.get("detections", [])
            ],
            "thumbnail_url": thumb_base64,
            "image_url": f"/static/images/{diagnosis_id}.jpg",
            "annotated_url": f"/static/annotated/{diagnosis_id}.jpg",
            "notes": prediction_result.get("notes"),
            "execution_time_ms": prediction_result.get("execution_time_ms", 0.0),
        }

        # 4. Attempt MongoDB storage, fallback to local file
        saved_to_mongo = False
        if db_client.is_connected:
            saved_to_mongo = db_client.save_diagnosis(record)

        if not saved_to_mongo:
            self._save_to_local_file(record)
            record["storage_mode"] = "local_dev"
        else:
            record["storage_mode"] = "mongodb"

        return record

    def _save_to_local_file(self, record: Dict[str, Any]) -> None:
        try:
            records = []
            if self.local_history_file.exists():
                try:
                    records = json.loads(self.local_history_file.read_text(encoding="utf-8"))
                except Exception:
                    records = []

            # Prepend newest
            records.insert(0, record)
            # Cap at 100 entries for local file
            records = records[:100]
            self.local_history_file.write_text(json.dumps(records, indent=2), encoding="utf-8")
        except Exception as exc:
            logger.error(f"Failed to save record to local history file: {exc}")

    def get_history(self, limit: int = 50) -> Dict[str, Any]:
        if db_client.is_connected:
            items = db_client.get_history(limit=limit)
            return {
                "total": len(items),
                "storage_mode": "mongodb",
                "is_database_connected": True,
                "items": items,
            }

        # Fallback to local file
        records: List[Dict[str, Any]] = []
        if self.local_history_file.exists():
            try:
                records = json.loads(self.local_history_file.read_text(encoding="utf-8"))
            except Exception as exc:
                logger.error(f"Failed to read local history file: {exc}")

        return {
            "total": len(records),
            "storage_mode": "local_dev",
            "is_database_connected": False,
            "items": records[:limit],
        }


storage_service = StorageService()
