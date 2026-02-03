"""Video upload and analysis API."""
from __future__ import annotations

import logging
import uuid
from datetime import datetime, timezone
from pathlib import Path

from fastapi import APIRouter, File, HTTPException, UploadFile

from app.config import UPLOAD_DIR, MAX_VIDEO_SIZE_MB
from app.services.video_analysis import analyze_video

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["analysis"])
MAX_BYTES = MAX_VIDEO_SIZE_MB * 1024 * 1024


@router.post("/analyze")
async def analyze_uploaded_video(video: UploadFile = File(..., description="Video file")):
    """
    Upload a video and run deepfake analysis.
    Returns isDeepfake, confidence, analyzedAt.
    """
    if not video.filename or not video.filename.lower().endswith((".mp4", ".webm", ".mov", ".avi", ".mkv")):
        raise HTTPException(status_code=400, detail="Invalid or missing video file (use MP4, WebM, MOV, AVI, MKV)")

    content = await video.read()
    if len(content) > MAX_BYTES:
        raise HTTPException(
            status_code=400,
            detail=f"Video too large. Maximum size is {MAX_VIDEO_SIZE_MB}MB.",
        )
    if len(content) == 0:
        raise HTTPException(status_code=400, detail="Empty file")

    suffix = Path(video.filename).suffix or ".mp4"
    safe_name = f"{uuid.uuid4().hex}{suffix}"
    file_path = UPLOAD_DIR / safe_name

    try:
        file_path.write_bytes(content)
        result = analyze_video(file_path)
        analyzed_at = datetime.now(timezone.utc).isoformat()
        return {
            "isDeepfake": result.is_deepfake,
            "confidence": result.confidence,
            "analyzedAt": analyzed_at,
            "mode": result.mode,
            "frameCount": result.frame_count,
            **(result.details or {}),
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.exception("Analysis failed")
        raise HTTPException(status_code=500, detail="Analysis failed. Please try again.")
    finally:
        if file_path.exists():
            try:
                file_path.unlink()
            except OSError:
                pass
