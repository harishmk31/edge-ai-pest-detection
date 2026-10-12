from pathlib import Path
from typing import Optional
from fastapi import APIRouter, File, Form, HTTPException, UploadFile, status

from app.core.config import settings
from app.schemas.detection import DiagnosisResponse, ModelInfoResponse
from app.services.image_utils import ImageProcessingError
from app.services.inference import InferenceService
from app.services.storage import storage_service

router = APIRouter(tags=["Diagnosis"])


@router.get("/model-info", response_model=ModelInfoResponse)
def get_model_info():
    """Retrieve details on the loaded YOLO pest detection model."""
    inference = InferenceService.get_instance()
    info = inference.get_model_info()
    return info


@router.post("/diagnose", response_model=DiagnosisResponse)
async def diagnose_image(
    file: UploadFile = File(..., description="Uploaded crop or pest image (JPEG, PNG, WebP)"),
    confidence: Optional[float] = Form(None, description="Optional custom confidence threshold (0.05 - 0.95)"),
    iou: Optional[float] = Form(None, description="Optional custom IoU threshold (0.1 - 0.9)"),
):
    """
    Diagnose a pest in an uploaded image:
    1. Validates file extension and size.
    2. Corrects color channel order, handles EXIF orientation and alpha transparency.
    3. Runs AI object detection using the fine-tuned IP102 YOLO model.
    4. Annotates bounding boxes, computes confidence ratings, and enriches with pest biology.
    5. Saves diagnosis metadata and original/annotated image to storage.
    """
    # 1. Validate file extension
    ext = Path(file.filename or "").suffix.lower()
    if ext not in settings.ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file format '{ext}'. Allowed formats: {', '.join(settings.ALLOWED_EXTENSIONS)}",
        )

    # 2. Read bytes and validate file size
    contents = await file.read()
    max_bytes = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024
    if len(contents) > max_bytes:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"Image size exceeds the maximum limit of {settings.MAX_UPLOAD_SIZE_MB}MB.",
        )

    if len(contents) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The uploaded file is empty.",
        )

    # 3. Run AI Inference
    inference = InferenceService.get_instance()
    if not inference.is_available:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="AI inference service is currently offline or model is not loaded.",
        )

    try:
        prediction = inference.predict_image(
            image_input=contents,
            conf_threshold=confidence,
            iou_threshold=iou,
        )
    except ImageProcessingError as err:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Invalid image file: {str(err)}",
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Inference execution failed: {str(exc)}",
        )

    # 4. Save to storage
    record = storage_service.save_diagnosis(
        prediction_result=prediction,
        original_image=prediction["normalized_pil"],
        annotated_image=prediction["annotated_pil"],
        original_filename=file.filename or "upload.jpg",
    )

    return DiagnosisResponse(
        diagnosis_id=record["id"],
        timestamp=record["timestamp"],
        status=prediction["status"],
        total_detections=prediction["total_detections"],
        top_pest=prediction.get("top_pest"),
        top_confidence=prediction.get("top_confidence"),
        confidence_level=prediction.get("confidence_level"),
        detections=prediction["detections"],
        annotated_image=prediction["annotated_image"],
        notes=prediction["notes"],
        execution_time_ms=prediction["execution_time_ms"],
        storage_mode=record.get("storage_mode", "local_dev"),
    )
