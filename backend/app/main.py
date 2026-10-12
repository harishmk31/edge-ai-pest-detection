from contextlib import asynccontextmanager
import logging
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.api.health import router as health_router
from app.api.router import api_router
from app.core.config import settings
from app.db.mongodb import db_client
from app.services.inference import InferenceService

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("agrivision.main")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Warm up model and check DB
    logger.info("Initializing AgriVision AI Backend Services...")
    inference = InferenceService.get_instance()
    if inference.is_available:
        logger.info(f"Model online: {inference.model_path} ({inference.device})")
    else:
        logger.warning(f"Model offline: Check path {inference.model_path}")

    # Ensure storage paths exist
    storage_path = settings.storage_path
    (storage_path / "images").mkdir(parents=True, exist_ok=True)
    (storage_path / "annotated").mkdir(parents=True, exist_ok=True)

    yield

    logger.info("Shutting down AgriVision AI Backend.")


app = FastAPI(
    title="AgriVision AI API",
    description="High-performance, edge-capable agricultural pest detection & diagnosis API.",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files for stored uploads and annotated images
app.mount("/static", StaticFiles(directory=str(settings.storage_path)), name="static")

# Mount routes
app.include_router(health_router)
app.include_router(api_router)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=True,
    )
