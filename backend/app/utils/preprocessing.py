# Frame preprocessing and normalization utilities
from __future__ import annotations

import logging
from typing import List, Tuple

import cv2
import numpy as np

from app.constants import (
    MODEL_INPUT_HEIGHT,
    MODEL_INPUT_WIDTH,
    IMAGENET_MEAN,
    IMAGENET_STD,
    COLOR_SPACE,
)

logger = logging.getLogger(__name__)


def resize_frame(frame: np.ndarray, height: int = MODEL_INPUT_HEIGHT, width: int = MODEL_INPUT_WIDTH) -> np.ndarray:
    # Resize frame to target (height,width) using bilinear interpolation
    # cv2.resize uses (width, height) ordering, not (height, width)
    # This is opposite to numpy/matrix convention, so we swap them
    return cv2.resize(frame, (width, height), interpolation=cv2.INTER_LINEAR)


def normalize_frame(
    frame: np.ndarray,
    mean: Tuple[float, float, float] = IMAGENET_MEAN,
    std: Tuple[float, float, float] = IMAGENET_STD,
) -> np.ndarray:
    # Normalize frame using ImageNet mean/std (returns float32 RGB)
    # Convert to float first to avoid integer overflow
    # Divide by 255 to get values in [0, 1] range
    frame_float = frame.astype(np.float32) / 255.0

    # RGB mean/std are provided, but frame is BGR, so we need RGB first
    # Convert BGR to RGB for proper channel ordering
    frame_rgb = cv2.cvtColor(frame_float, cv2.COLOR_BGR2RGB)

    # Now apply ImageNet normalization
    # Note: cv2.cvtColor expects uint8 for BGR/RGB conversion,
    # so we kept the float conversion simple
    mean_array = np.array(mean, dtype=np.float32).reshape(1, 1, 3)
    std_array = np.array(std, dtype=np.float32).reshape(1, 1, 3)

    # Subtract mean and divide by std for each channel
    # This centers the distribution and scales variance
    normalized = (frame_rgb - mean_array) / std_array

    return normalized


def preprocess_frame(
    frame: np.ndarray,
    target_height: int = MODEL_INPUT_HEIGHT,
    target_width: int = MODEL_INPUT_WIDTH,
) -> np.ndarray:
    # Full preprocessing: resize then normalize
    # Step 1: Resize to target dimensions
    # This ensures all frames have consistent size for batch processing
    resized = resize_frame(frame, target_height, target_width)

    # Step 2: Normalize using ImageNet statistics
    # This centers and scales the pixel distribution
    normalized = normalize_frame(resized)

    return normalized


def preprocess_frames_batch(
    frames: List[np.ndarray],
    target_height: int = MODEL_INPUT_HEIGHT,
    target_width: int = MODEL_INPUT_WIDTH,
) -> np.ndarray:
    # Preprocess list of frames into a stacked batch array
    if not frames:
        return np.array([], dtype=np.float32)

    # Process each frame individually, then stack
    # This is clearer than complex numpy operations
    preprocessed_frames = []

    for frame in frames:
        try:
            preprocessed = preprocess_frame(frame, target_height, target_width)
            preprocessed_frames.append(preprocessed)
        except Exception as e:
            # Log but don't fail - skip corrupted frames
            logger.warning(f"Failed to preprocess frame: {e}")
            continue

    if not preprocessed_frames:
        return np.array([], dtype=np.float32)

    # Stack frames along batch dimension: shape becomes (N, H, W, 3)
    batch = np.stack(preprocessed_frames, axis=0)

    return batch.astype(np.float32)


def frame_to_rgb(frame: np.ndarray) -> np.ndarray:
    # Convert BGR frame to RGB
    return cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)


def frame_to_grayscale(frame: np.ndarray) -> np.ndarray:
    # Convert BGR frame to grayscale
    return cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)


def frame_to_hsv(frame: np.ndarray) -> np.ndarray:
    # Convert BGR frame to HSV
    return cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)


def normalize_pixel_values(frame: np.ndarray, target_min: float = 0.0, target_max: float = 1.0) -> np.ndarray:
    # Normalize pixel values to a target range
    frame_float = frame.astype(np.float32)

    # Min-max normalization: (x - min) / (max - min) * (target_max - target_min) + target_min
    frame_min = frame_float.min()
    frame_max = frame_float.max()

    # Avoid division by zero if all pixels have same value
    if frame_max == frame_min:
        # Constant frame - normalize to middle of target range
        return np.full_like(frame_float, (target_min + target_max) / 2.0)

    # Scale to [0, 1], then shift to [target_min, target_max]
    normalized = (frame_float - frame_min) / (frame_max - frame_min)
    normalized = normalized * (target_max - target_min) + target_min

    return normalized
