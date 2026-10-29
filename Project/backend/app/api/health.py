from datetime import datetime
from fastapi import APIRouter
from app.core.config import settings
from app.db.mongodb import db_client
from app.services.inference import InferenceService

router = APIRouter(tags=["Health"])


@router.get("/health")
def get_health():
    inference = InferenceService.get_instance()
    mongo_health = db_client.check_health()

    return {
        "status": "healthy" if inference.is_available else "degraded",
        "service": "AgriVision AI API",
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "environment": settings.ENVIRONMENT,
        "model": {
            "loaded": inference.is_available,
            "device": inference.device,
            "classes_count": 102 if inference.is_available else 0,
        },
        "database": {
            "connected": mongo_health["is_connected"],
            "storage_mode": "mongodb" if mongo_health["is_connected"] else "local_dev",
            "message": mongo_health["error"] or "Connected to MongoDB Atlas",
        },
    }
