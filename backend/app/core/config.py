from pathlib import Path
from typing import List
from pydantic_settings import BaseSettings
from pydantic import Field


class Settings(BaseSettings):
    ENVIRONMENT: str = "development"
    HOST: str = "127.0.0.1"
    PORT: int = 8000
    CORS_ORIGINS: str = "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173"

    # AI Model Configuration
    MODEL_PATH: str = Field(
        default=r"C:\Users\Harish\Desktop\edge-ai-pest-detection\models\best.pt",
        description="Path to the trained YOLO pest detection checkpoint",
    )
    DEFAULT_CONFIDENCE_THRESHOLD: float = 0.35
    DEFAULT_IOU_THRESHOLD: float = 0.45
    IMAGE_MIN_AREA_RATIO: float = 0.001
    MAX_DETECTIONS: int = 20

    # Image Upload & Storage Configuration
    UPLOAD_STORAGE_DIR: str = "./uploads"
    MAX_UPLOAD_SIZE_MB: int = 15
    ALLOWED_EXTENSIONS: List[str] = [".jpg", ".jpeg", ".png", ".webp", ".bmp"]

    # MongoDB Atlas (Optional; offline fallback if empty)
    MONGODB_URI: str = ""
    MONGODB_DB_NAME: str = "agrivision_ai"

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "extra": "ignore",
    }

    @property
    def cors_origin_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

    @property
    def storage_path(self) -> Path:
        p = Path(self.UPLOAD_STORAGE_DIR)
        p.mkdir(parents=True, exist_ok=True)
        return p


settings = Settings()
