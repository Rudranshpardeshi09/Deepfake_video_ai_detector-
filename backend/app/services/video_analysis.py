# Video analysis service: AI-generated video detection
from __future__ import annotations

import logging
import time
from dataclasses import dataclass
from pathlib import Path
from typing import Dict, List, Optional, Tuple

import cv2
import numpy as np

from app.config import FRAMES_PER_SECOND_SAMPLED, MAX_FRAMES, MODEL_WEIGHTS_PATH
from app.constants import (
    HEURISTIC_WEIGHT_SHARPNESS,
    HEURISTIC_WEIGHT_COMPRESSION,
    HEURISTIC_WEIGHT_OPTICAL_FLOW,
    HEURISTIC_WEIGHT_FREQUENCY,
    CLASSIFICATION_THRESHOLD,
    SHARPNESS_CONSISTENCY_DIVISOR,
    TEMPORAL_DIFF_LOW_THRESHOLD,
    TEMPORAL_DIFF_LOW_PENALTY,
    TEMPORAL_DIFF_HIGH_THRESHOLD,
    TEMPORAL_DIFF_HIGH_PENALTY,
    TEMPORAL_STD_DIVISOR,
    ENTROPY_STD_DIVISOR,
    HISTOGRAM_BINS_H,
    HISTOGRAM_BINS_S,
    LOG_FRAME_DETAILS,
)
from app.exceptions import VideoProcessingError, NoFramesExtractedError
from app.utils.video_utils import extract_frames as util_extract_frames
from app.utils.metrics import ensemble_score, get_risk_level

logger = logging.getLogger(__name__)


@dataclass
# AnalysisResult: encapsulates final analysis outputs
class AnalysisResult:
    is_ai_generated: bool
    confidence: float
    detection_method: str  # "heuristic", "model", or "ensemble"
    frame_count: int
    risk_level: str  # "low", "medium", "high"
    processing_time_seconds: float
    details: Optional[Dict[str, float]] = None


def _laplacian_variance(frame: np.ndarray) -> float:
    # Compute Laplacian variance as a sharpness metric for a frame
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    laplacian = cv2.Laplacian(gray, cv2.CV_64F)
    return float(laplacian.var())


def _color_histogram_entropy(frame: np.ndarray) -> float:
    # Compute Shannon entropy of 2D HSV color histogram
    hsv = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)
    # Use histogram bins from constants
    hist = cv2.calcHist([hsv], [0, 1], None, [HISTOGRAM_BINS_H, HISTOGRAM_BINS_S], [0, 180, 0, 256])

    # Normalize histogram to probability distribution
    hist = np.clip(hist, 1e-6, None)  # Avoid log(0)
    hist = hist / hist.sum()

    # Shannon entropy: -sum(p * log2(p))
    # Higher entropy means more uniform distribution (more natural)
    # Lower entropy means concentrated in few colors (possibly synthetic)
    return float(-np.sum(hist * np.log2(hist)))


def _temporal_difference(frames: List[np.ndarray]) -> np.ndarray:
    # Compute mean pixel differences between consecutive frames
    if len(frames) < 2:
        return np.array([0.0])

    diffs = []
    for i in range(len(frames) - 1):
        # Convert to grayscale for motion detection
        # Color doesn't matter for motion measurement
        g1 = cv2.cvtColor(frames[i], cv2.COLOR_BGR2GRAY)
        g2 = cv2.cvtColor(frames[i + 1], cv2.COLOR_BGR2GRAY)

        # Compute absolute pixel-wise differences
        diff = np.abs(g1.astype(np.float32) - g2.astype(np.float32))

        # Average across the frame to get single motion magnitude value
        diffs.append(float(np.mean(diff)))

    return np.array(diffs)


def _compression_artifacts_score(frames: List[np.ndarray]) -> float:
    # Detect block-like compression artifacts across frames
    if not frames:
        return 0.0

    artifact_scores = []
    block_size = 8  # Standard codec block size

    for frame in frames:
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

        # Compute gradient magnitude (edge strength)
        sobelx = cv2.Sobel(gray, cv2.CV_64F, 1, 0, ksize=3)
        sobely = cv2.Sobel(gray, cv2.CV_64F, 0, 1, ksize=3)
        gradient = np.sqrt(sobelx**2 + sobely**2)

        # Sample edges at block boundaries to detect artificial block artifacts
        h, w = gray.shape
        boundary_edges = []

        # Check horizontal boundaries (every block_size pixels)
        for y in range(block_size, h, block_size):
            # Sum edge magnitude at this boundary
            boundary_edges.append(np.sum(gradient[y-1:y+1, :]))

        # Check vertical boundaries
        for x in range(block_size, w, block_size):
            boundary_edges.append(np.sum(gradient[:, x-1:x+1]))

        if boundary_edges:
            # Higher boundary edges = more pronounced block artifacts
            avg_boundary_edge = np.mean(boundary_edges)
            avg_interior_edge = np.mean(gradient)  # Average edge everywhere

            # Ratio of boundary to interior edges - if much higher, indicates blocks
            if avg_interior_edge > 0:
                artifact_ratio = min(1.0, avg_boundary_edge / avg_interior_edge)
            else:
                artifact_ratio = 0.0

            artifact_scores.append(artifact_ratio)

    # Average across frames
    return float(np.mean(artifact_scores)) if artifact_scores else 0.0


def _frequency_anomaly_score(frames: List[np.ndarray]) -> float:
    # Detect frequency-domain anomalies using FFT-based heuristics
    if not frames:
        return 0.0

    frequency_scores = []

    for frame in frames:
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY).astype(np.float32)

        # Compute FFT (frequency domain representation)
        fft = np.fft.fft2(gray)
        magnitude = np.abs(fft)

        # Shift zero-frequency component to center
        magnitude_shifted = np.fft.fftshift(magnitude)

        # Log-scale for better visualization
        magnitude_log = np.log(magnitude_shifted + 1)

        # Split into low and high frequency bands
        h, w = magnitude_log.shape
        center_h, center_w = h // 2, w // 2

        # Low frequency (center region - contains most natural image energy)
        low_freq_region = magnitude_log[
            center_h - h//4:center_h + h//4,
            center_w - w//4:center_w + w//4
        ]

        # High frequency (edges - contains fine details)
        high_freq_energy = magnitude_log.sum() - low_freq_region.sum()

        # Natural images have most energy in low frequencies
        # AI-generated images sometimes have abnormal high-frequency content
        low_freq_energy = low_freq_region.sum()

        if low_freq_energy > 0:
            high_freq_ratio = high_freq_energy / (low_freq_energy + high_freq_energy)
        else:
            high_freq_ratio = 0.0

        # Score: deviation from expected ratio (too much high-frequency = suspicious)
        # Natural images: ~10-15% high frequency, AI images may deviate
        natural_high_freq_ratio = 0.15
        anomaly = abs(high_freq_ratio - natural_high_freq_ratio)
        frequency_scores.append(min(1.0, anomaly * 5))  # Scale for sensitivity

    return float(np.mean(frequency_scores)) if frequency_scores else 0.0


def _contains_human(frames: List[np.ndarray], required_faces: int = 1) -> bool:
    # Quick face-presence check using OpenCV Haar cascade
    # Library
    try:
        import cv2 as _cv2
    except Exception:
        return False

    # Classifier
    cascade_path = _cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
    face_cascade = _cv2.CascadeClassifier(cascade_path)
    if face_cascade.empty():
        return False

    # Scan frames
    count = 0
    for f in frames:
        gray = _cv2.cvtColor(f, _cv2.COLOR_BGR2GRAY)
        faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30))
        if len(faces) > 0:
            count += len(faces)
        if count >= required_faces:
            return True

    return False


def heuristic_score(frames: List[np.ndarray]) -> Tuple[float, Dict[str, float]]:
   
    if not frames:
        raise ValueError("No frames provided for heuristic analysis")

    if LOG_FRAME_DETAILS:
        logger.debug(f"Computing heuristic score for {len(frames)} frames")

    # Feature 1: Sharpness consistency
    # Extract sharpness for each frame
    lap_vars = np.array([_laplacian_variance(f) for f in frames])
    lap_std = float(np.std(lap_vars))
    lap_mean = float(np.mean(lap_vars)) or 1e-6
    sharpness_consistency = lap_std / lap_mean  # normalized by mean

    # Convert to [0, 1] score: higher std/mean = more inconsistency = higher AI likelihood
    sharpness_score = min(1.0, sharpness_consistency / SHARPNESS_CONSISTENCY_DIVISOR)

    # Feature 2: Compression artifacts
    compression_score = _compression_artifacts_score(frames)

    # Feature 3: Optical flow consistency (temporal motion analysis)
    temp_diffs = _temporal_difference(frames)
    temp_mean = float(np.mean(temp_diffs))
    temp_std = float(np.std(temp_diffs)) if len(temp_diffs) > 1 else 0.0

    # Normalize temporal differences to [0, 1] range before using them.
    # Raw pixel differences can vary widely (0-255+ depending on content).
    # We normalize to a typical range where:
    # - 0-10: very static (low motion)
    # - 10-50: natural motion (expected range)
    # - 50+: very jittery (generation artifacts)
    normalized_temp_mean = min(1.0, temp_mean / 50.0)
    normalized_temp_std = min(1.0, temp_std / 30.0)

    # Too static or too jittery both indicate synthesis
    # Use normalized values to determine if motion is unnatural
    optical_flow_score = 0.0

    # Check if motion is too static (normalized mean < threshold)
    if normalized_temp_mean < 0.1:  # Very low normalized motion
        # Very static - suspicious for facial animation
        optical_flow_score += TEMPORAL_DIFF_LOW_PENALTY
    # Check if motion is too jittery (normalized mean > threshold)
    elif normalized_temp_mean > 0.8:  # Very high normalized motion
        # High jitter - generation artifacts
        optical_flow_score += TEMPORAL_DIFF_HIGH_PENALTY

    # Add motion inconsistency component (inconsistent motion = suspicious)
    # Use normalized std to measure how much motion varies frame-to-frame
    optical_flow_score += normalized_temp_std * 0.6
    optical_flow_score = min(1.0, optical_flow_score)

    # Feature 4: Frequency domain anomalies
    frequency_score = _frequency_anomaly_score(frames)

    # Feature 5: Color distribution entropy
    entropies = np.array([_color_histogram_entropy(f) for f in frames])
    entropy_std = float(np.std(entropies))
    entropy_score = min(1.0, entropy_std / ENTROPY_STD_DIVISOR)

    # Weighted combination of all features
    # Weights are defined in constants and sum to approximately 1.0
    raw_score = (
        HEURISTIC_WEIGHT_SHARPNESS * sharpness_score
        + HEURISTIC_WEIGHT_COMPRESSION * compression_score
        + HEURISTIC_WEIGHT_OPTICAL_FLOW * optical_flow_score
        + HEURISTIC_WEIGHT_FREQUENCY * frequency_score
    )

    # Clip to valid range [0, 1]
    final_score = float(np.clip(raw_score, 0.0, 1.0))

    # Detailed breakdown for user explanation
    details = {
        "sharpness_score": round(sharpness_score, 4),
        "compression_score": round(compression_score, 4),
        "optical_flow_score": round(optical_flow_score, 4),
        "frequency_score": round(frequency_score, 4),
        "entropy_score": round(entropy_score, 4),
        "sharpness_std": round(lap_std, 4),
        "temporal_diff_mean": round(temp_mean, 4),
        "temporal_diff_std": round(temp_std, 4),
        # Include normalized values for transparency - shows how raw values map to [0,1]
        "normalized_temporal_mean": round(normalized_temp_mean, 4),
        "normalized_temporal_std": round(normalized_temp_std, 4),
    }

    if LOG_FRAME_DETAILS:
        logger.debug(f"Heuristic score {final_score:.4f}: {details}")

    return final_score, details


def _run_model_inference(frames: List[np.ndarray], model_path: str) -> float:
    # Run pre-trained PyTorch model on frames, return score or -1.0 on failure
    try:
        import torch
    except ImportError:
        logger.warning("PyTorch not installed; cannot run model inference")
        return -1.0

    try:
        from app.models.detector import load_detector, preprocess_frames

        # Load model weights
        model = load_detector(model_path)
        if model is None:
            logger.warning(f"Failed to load model from {model_path}")
            return -1.0

        # Preprocess frames for model input
        tensor = preprocess_frames(frames)
        if tensor is None:
            logger.warning("Failed to preprocess frames for model")
            return -1.0

        # Move tensor to same device as model
        device = next(model.parameters()).device
        tensor = tensor.to(device)

        # Run inference with no gradient computation (evaluation mode)
        with torch.no_grad():
            logits = model(tensor)

            # Handle different output formats
            if logits.shape[-1] == 1:
                # Single output node - use sigmoid
                probs = torch.sigmoid(logits).squeeze(-1)
            else:
                # Multi-class - use softmax and take positive class
                probs = torch.softmax(logits, dim=1)[:, 1]

            # Average probability across frames
            return float(probs.mean().item())

    except Exception as e:
        logger.error(f"Error during model inference: {e}")
        return -1.0


def analyze_video(video_path: str | Path) -> AnalysisResult:
    # Main analysis pipeline: extract frames, heuristic, optional model, combine
    start_time = time.time()

    try:
        # Step 1: Extract frames from video using utility function
        frames, fps, total_frames = util_extract_frames(
            video_path,
            frames_per_second=FRAMES_PER_SECOND_SAMPLED,
            max_frames=MAX_FRAMES,
        )
        frame_count = len(frames)

        logger.info(f"Starting analysis of {frame_count} frames from video")

        # Human
        has_human = _contains_human(frames)
        if not has_human:
            processing_time = time.time() - start_time
            return AnalysisResult(
                is_ai_generated=False,
                confidence=0.0,
                detection_method="no_human",
                frame_count=frame_count,
                risk_level=get_risk_level(0.0),
                processing_time_seconds=round(processing_time, 2),
                details={"humans_detected": 0},
            )

        # Step 2: Run heuristic detection (always available)
        heuristic_confidence, heuristic_details = heuristic_score(frames)

        # Step 3: Try to run model-based detection if available
        model_path = (MODEL_WEIGHTS_PATH or "").strip()
        model_confidence = -1.0
        detection_method = "heuristic"

        if model_path and Path(model_path).exists():
            model_confidence = _run_model_inference(frames, model_path)
            if model_confidence >= 0:
                # Model inference succeeded - use ensemble
                final_confidence, detection_method = ensemble_score(
                    heuristic_confidence, model_confidence
                )
                heuristic_details["model_score"] = round(model_confidence, 4)
            else:
                # Model failed - fall back to heuristic
                final_confidence = heuristic_confidence
        else:
            # No model available - use heuristic
            final_confidence = heuristic_confidence

        # Step 4: Classify and determine risk level
        is_ai_generated = final_confidence >= CLASSIFICATION_THRESHOLD
        risk_level = get_risk_level(final_confidence)

        # Step 5: Calculate processing time
        processing_time = time.time() - start_time

        logger.info(
            f"Analysis complete: is_ai_generated={is_ai_generated}, "
            f"confidence={final_confidence:.4f}, risk_level={risk_level}, "
            f"method={detection_method}, time={processing_time:.2f}s"
        )

        return AnalysisResult(
            is_ai_generated=is_ai_generated,
            confidence=round(final_confidence, 2),
            detection_method=detection_method,
            frame_count=frame_count,
            risk_level=risk_level,
            processing_time_seconds=round(processing_time, 2),
            details=heuristic_details,
        )

    except (VideoProcessingError, NoFramesExtractedError) as e:
        # Expected error from video processing
        logger.error(f"Video processing error: {e}")
        raise
    except Exception as e:
        # Unexpected error
        logger.exception(f"Unexpected error during analysis: {e}")
        raise VideoProcessingError(f"Analysis failed: {str(e)}") from e
