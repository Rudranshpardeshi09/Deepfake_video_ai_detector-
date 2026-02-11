"""
Frame preprocessing and normalization utilities.

This module handles all frame-level preprocessing required before analysis,
including resizing, normalization, and color space conversions.
These utilities ensure consistency across different detection methods.
"""
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
    """
    Resize a frame to specified dimensions using bilinear interpolation.

    We use bilinear interpolation as a good balance between quality and speed.
    This is useful for feeding frames into neural networks that expect fixed input sizes.

    Args:
        frame: Input BGR frame (numpy array)
        height: Target height in pixels
        width: Target width in pixels

    Returns:
        Resized frame (BGR)
    """
    # cv2.resize uses (width, height) ordering, not (height, width)
    # This is opposite to numpy/matrix convention, so we swap them
    return cv2.resize(frame, (width, height), interpolation=cv2.INTER_LINEAR)


def normalize_frame(
    frame: np.ndarray,
    mean: Tuple[float, float, float] = IMAGENET_MEAN,
    std: Tuple[float, float, float] = IMAGENET_STD,
) -> np.ndarray:
    """
    Normalize frame using ImageNet statistics.

    This normalization is standard for transfer learning with models trained on ImageNet.
    It converts pixel values from [0, 255] to approximately normalized distribution.

    The formula for each channel: normalized = (pixel - mean) / std

    Args:
        frame: Input BGR frame with pixel values in [0, 255]
        mean: Mean values for normalization (RGB order, we handle BGR conversion)
        std: Standard deviation values for normalization (RGB order)

    Returns:
        Normalized frame as float32 with values approximately in [-1, 1]
    """
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
    """
    Complete preprocessing pipeline for a single frame.

    This chains all preprocessing steps: resizing and normalization.
    Used before feeding frames to neural networks.

    Args:
        frame: Input BGR frame (any size)
        target_height: Target height for resizing
        target_width: Target width for resizing

    Returns:
        Preprocessed frame (float32, normalized, RGB channel order)
    """
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
    """
    Preprocess multiple frames into a batch array.

    This is efficient for processing all frames at once (vectorized operation).
    Converts list of frames into a single numpy array of shape [N, H, W, 3].

    Args:
        frames: List of BGR frames (numpy arrays)
        target_height: Target height for resizing
        target_width: Target width for resizing

    Returns:
        Batch array of shape (N, height, width, 3) with float32 values
        Values are normalized to approximately [-1, 1] range
    """
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
    """
    Convert BGR frame to RGB.

    OpenCV uses BGR format by default, but most visualization and ML tools expect RGB.
    This simple utility makes the conversion explicit and avoids mistakes.

    Args:
        frame: Input frame in BGR format

    Returns:
        Frame in RGB format
    """
    return cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)


def frame_to_grayscale(frame: np.ndarray) -> np.ndarray:
    """
    Convert BGR frame to grayscale.

    Grayscale conversion is useful for certain analysis features like edge detection
    and sharpness measurement, as they don't require color information.

    Args:
        frame: Input frame in BGR format

    Returns:
        Grayscale frame (single channel)
    """
    return cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)


def frame_to_hsv(frame: np.ndarray) -> np.ndarray:
    """
    Convert BGR frame to HSV color space.

    HSV is useful for color distribution analysis because it separates color
    information (Hue) from intensity (Value), making it more perceptually
    meaningful than RGB for certain detection tasks.

    Args:
        frame: Input frame in BGR format

    Returns:
        Frame in HSV color space
    """
    return cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)


def normalize_pixel_values(frame: np.ndarray, target_min: float = 0.0, target_max: float = 1.0) -> np.ndarray:
    """
    Normalize pixel values to a specific range.

    This is useful for standardizing frame intensity across different videos
    (e.g., some videos are brighter or darker than others).

    Args:
        frame: Input frame (can be any data type)
        target_min: Minimum value of output range
        target_max: Maximum value of output range

    Returns:
        Normalized frame as float32 in specified range
    """
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
