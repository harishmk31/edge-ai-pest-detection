from pathlib import Path
from typing import List, Optional
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

    # Authentication & Session Security
    JWT_SECRET: str = Field(
        default="agrivision-development-secret-key-replace-in-production-2026",
        description="Secret key for signing JWT tokens",
    )
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_HOURS: int = 24

    # Kural AI Assistant Configuration
    OPENAI_API_KEY: str = Field(
        default="",
        description="API key for OpenAI-compatible LLM provider",
    )
    OPENAI_MODEL: str = Field(
        default="gpt-4o-mini",
        description="Model identifier for Kural AI Assistant",
    )
    OPENAI_BASE_URL: Optional[str] = Field(
        default=None,
        description="Optional base URL for OpenAI-compatible custom endpoints",
    )
    ASSISTANT_MAX_TOKENS: int = 1000
    ASSISTANT_TEMPERATURE: float = 0.2

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
