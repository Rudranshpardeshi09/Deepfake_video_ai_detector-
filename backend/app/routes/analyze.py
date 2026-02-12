# Video upload and AI-generation analysis API
from __future__ import annotations

import logging
import uuid
from datetime import datetime, timezone
from pathlib import Path

from fastapi import APIRouter, File, HTTPException, UploadFile

from app.config import UPLOAD_DIR, MAX_VIDEO_SIZE_MB
from app.exceptions import VideoProcessingError, NoFramesExtractedError
from app.services.video_analysis import analyze_video

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["analysis"])
MAX_BYTES = MAX_VIDEO_SIZE_MB * 1024 * 1024


@router.post("/analyze")
# Analyze uploaded video file
async def analyze_uploaded_video(video: UploadFile = File(..., description="Video file to analyze")):
    # Validate file exists and has content
    if not video.filename:
        raise HTTPException(status_code=400, detail="No file provided")

    # Extract and validate file extension
    # We check extension early to avoid wasting time on invalid files
    filename_lower = video.filename.lower()
    supported_extensions = (".mp4", ".webm", ".mov", ".avi", ".mkv")

    if not filename_lower.endswith(supported_extensions):
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported video format. Supported: {', '.join(supported_extensions)}",
        )

    # Read file content
    try:
        content = await video.read()
    except Exception as e:
        logger.error(f"Error reading uploaded file: {e}")
        raise HTTPException(status_code=400, detail="Could not read uploaded file")

    # Validate file is not empty
    if len(content) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty")

    # Validate file size (prevent memory exhaustion)
    if len(content) > MAX_BYTES:
        raise HTTPException(
            status_code=400,
            detail=f"Video file too large ({ len(content) / 1024 / 1024:.1f}MB). Maximum: {MAX_VIDEO_SIZE_MB}MB",
        )

    # Create temporary file with unique name
    # UUID prevents filename collisions if multiple uploads occur simultaneously
    suffix = Path(video.filename).suffix or ".mp4"
    safe_name = f"{uuid.uuid4().hex}{suffix}"
    file_path = UPLOAD_DIR / safe_name

    try:
        # Write uploaded content to temporary file
        file_path.write_bytes(content)

        # Run analysis
        try:
            result = analyze_video(file_path)
        except (VideoProcessingError, NoFramesExtractedError) as e:
            # Expected error during video processing
            logger.warning(f"Video processing error: {e}")
            raise HTTPException(status_code=400, detail=f"Invalid video: {str(e)}")

        # Get current timestamp (ISO 8601 format)
        analyzed_at = datetime.now(timezone.utc).isoformat()

        # Build response with new schema (AI-generation focused)
        response = {
            "isAIGenerated": result.is_ai_generated,
            "confidence": result.confidence,
            "riskLevel": result.risk_level,
            "detectionMethod": result.detection_method,
            "frameCount": result.frame_count,
            "processingTime": result.processing_time_seconds,
            "analyzedAt": analyzed_at,
            # Include detail breakdown if available
            "detailBreakdown": result.details or {},
        }

        logger.info(
            f"Analysis successful: file={video.filename}, "
            f"isAIGenerated={result.is_ai_generated}, "
            f"confidence={result.confidence}"
        )

        return response

    except HTTPException:
        # Re-raise HTTP exceptions (validation errors)
        raise
    except Exception as e:
        # Unexpected error
        logger.exception(f"Unexpected error during analysis: {e}")
        raise HTTPException(
            status_code=500,
            detail="An unexpected error occurred during analysis. Please try again.",
        )
    finally:
        # Cleanup: always delete temporary file
        # This is critical to prevent disk space exhaustion
        if file_path.exists():
            try:
                file_path.unlink()
                logger.debug(f"Deleted temporary file: {safe_name}")
            except OSError as e:
                logger.warning(f"Could not delete temporary file {safe_name}: {e}")
