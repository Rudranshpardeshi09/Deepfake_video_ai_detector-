"""
Video processing utility functions.

This module provides low-level video frame extraction and processing functions.
It abstracts away OpenCV complexity and provides error handling for common
video processing issues.
"""
from __future__ import annotations

import logging
from pathlib import Path
from typing import List, Tuple

import cv2
import numpy as np

from app.constants import DEFAULT_MAX_FRAMES, DEFAULT_FRAMES_PER_SECOND
from app.exceptions import VideoProcessingError, NoFramesExtractedError

logger = logging.getLogger(__name__)


def extract_frames(
    video_path: str | Path,
    frames_per_second: float = DEFAULT_FRAMES_PER_SECOND,
    max_frames: int = DEFAULT_MAX_FRAMES,
) -> Tuple[List[np.ndarray], float, int]:
    """
    Extract sampled frames from a video file.

    This function samples frames at regular intervals to reduce processing time
    while capturing sufficient temporal diversity. Frames are returned in BGR format
    (OpenCV's default) to maintain consistency with the rest of the pipeline.

    Args:
        video_path: Path to video file
        frames_per_second: Sampling rate (e.g., 1.0 = extract 1 frame per second)
        max_frames: Maximum number of frames to extract (prevents excessive memory use)

    Returns:
        Tuple of:
        - List of BGR frames (as numpy arrays)
        - Video FPS (frames per second of original video)
        - Total number of frames in original video

    Raises:
        VideoProcessingError: If video cannot be opened or read
        NoFramesExtractedError: If no valid frames could be extracted
    """
    video_path_str = str(video_path)

    # Use cv2.VideoCapture to open the video file
    # We try to open the file before any other operations to fail fast
    cap = cv2.VideoCapture(video_path_str)
    if not cap.isOpened():
        msg = f"OpenCV could not open video: {video_path_str}. Check the file format and integrity."
        logger.error(msg)
        raise VideoProcessingError(msg)

    try:
        # Get video properties before frame extraction
        # These are used to calculate frame sampling interval
        fps = cap.get(cv2.CAP_PROP_FPS) or 25.0  # Default 25 FPS if unavailable
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT) or 0)

        # Calculate sampling interval to achieve desired frames_per_second
        # For example: if fps=30 and frames_per_second=1, interval=30 (skip 30 frames)
        interval = max(1, int(fps / max(frames_per_second, 0.1)))

        frames: List[np.ndarray] = []
        frame_idx = 0

        # Read frames in a loop until we hit max_frames or end of video
        while len(frames) < max_frames:
            ret, frame = cap.read()

            # ret=False means we've reached end of video or hit an error
            if not ret:
                break

            # Sample frames at regular intervals to reduce computation
            # This preserves temporal diversity while reducing data volume
            if frame_idx % interval == 0:
                frames.append(frame)

            frame_idx += 1

        if not frames:
            msg = f"No frames could be extracted from video: {video_path}. File may be corrupted."
            logger.error(msg)
            raise NoFramesExtractedError(msg)

        logger.info(
            f"Extracted {len(frames)} frames at {frames_per_second} fps from video "
            f"(original fps: {fps}, total frames: {total_frames})"
        )

        return frames, float(fps), total_frames

    except (VideoProcessingError, NoFramesExtractedError):
        # Re-raise our custom exceptions as-is
        raise
    except Exception as e:
        # Catch any unexpected errors (e.g., memory issues, codec problems)
        msg = f"Unexpected error extracting frames: {str(e)}"
        logger.error(msg)
        raise VideoProcessingError(msg) from e
    finally:
        # Always release the video capture object to free resources
        # This prevents file locks and memory leaks
        cap.release()


def get_video_metadata(video_path: str | Path) -> dict:
    """
    Extract metadata from a video file without loading all frames.

    This is useful for quick validation and logging without the
    overhead of frame extraction.

    Args:
        video_path: Path to video file

    Returns:
        Dictionary with keys: fps, total_frames, width, height, codec

    Raises:
        VideoProcessingError: If video cannot be opened
    """
    video_path_str = str(video_path)
    cap = cv2.VideoCapture(video_path_str)

    if not cap.isOpened():
        msg = f"Could not open video for metadata extraction: {video_path}"
        raise VideoProcessingError(msg)

    try:
        fps = cap.get(cv2.CAP_PROP_FPS) or 25.0
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT) or 0)
        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        # Note: codec codes are integers, use fourcc conversion if needed
        codec = int(cap.get(cv2.CAP_PROP_FOURCC))

        return {
            "fps": float(fps),
            "total_frames": total_frames,
            "width": width,
            "height": height,
            "codec": codec,
            "duration_seconds": total_frames / fps if fps > 0 else 0,
        }
    finally:
        cap.release()


def is_valid_video_format(filename: str) -> bool:
    """
    Check if filename has a supported video format extension.

    We validate extensions early to avoid OpenCV hanging on malformed files.
    This is a quick check before attempting to open the file.

    Args:
        filename: Original filename from upload

    Returns:
        True if extension is in supported formats, False otherwise
    """
    # Supported video formats (lowercase extensions)
    supported_formats = {".mp4", ".webm", ".mov", ".avi", ".mkv", ".flv", ".wmv", ".m4v"}

    if not filename:
        return False

    # Get extension and convert to lowercase for case-insensitive comparison
    extension = Path(filename).suffix.lower()

    return extension in supported_formats


def validate_video_file(
    file_path: str | Path,
    max_size_mb: int | None = None,
) -> bool:
    """
    Validate that a file is a readable video file.

    This performs basic checks before expensive frame extraction.
    Checks file existence, size, and ability to open as video.

    Args:
        file_path: Path to file to validate
        max_size_mb: Optional maximum file size in MB

    Returns:
        True if file is valid, False otherwise

    Raises:
        VideoProcessingError: If validation fails with specific reason
    """
    path = Path(file_path)

    # Check file exists
    if not path.exists():
        raise VideoProcessingError(f"File not found: {file_path}")

    # Check file size if limit provided
    if max_size_mb is not None:
        file_size_mb = path.stat().st_size / (1024 * 1024)
        if file_size_mb > max_size_mb:
            msg = f"File size {file_size_mb:.1f}MB exceeds limit of {max_size_mb}MB"
            raise VideoProcessingError(msg)

    # Try to open as video without reading frames
    try:
        metadata = get_video_metadata(file_path)
        # Basic sanity checks on metadata
        if metadata["fps"] <= 0 or metadata["total_frames"] <= 0:
            raise VideoProcessingError(
                f"Invalid video metadata: fps={metadata['fps']}, frames={metadata['total_frames']}"
            )
        return True
    except VideoProcessingError:
        raise
    except Exception as e:
        raise VideoProcessingError(f"Cannot validate video file: {str(e)}") from e
