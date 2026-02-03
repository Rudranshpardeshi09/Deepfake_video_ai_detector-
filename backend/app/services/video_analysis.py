"""
Video analysis service: frame extraction and deepfake detection.

Uses a deterministic heuristic pipeline (frame quality + temporal consistency)
to produce a reproducible fake probability. Optional PyTorch model can be
loaded via MODEL_WEIGHTS_PATH for higher accuracy.
"""
from __future__ import annotations

import logging
from dataclasses import dataclass
from pathlib import Path
from typing import List, Optional

import cv2
import numpy as np

from app.config import FRAMES_PER_SECOND_SAMPLED, MAX_FRAMES, MODEL_WEIGHTS_PATH

logger = logging.getLogger(__name__)


@dataclass
class AnalysisResult:
    """Result of video deepfake analysis."""
    is_deepfake: bool
    confidence: float
    mode: str  # "heuristic" or "model"
    frame_count: int
    details: Optional[dict] = None


def extract_frames(video_path: str | Path) -> tuple[List[np.ndarray], float]:
    """
    Extract sampled frames from video.
    Returns (list of BGR frames, fps).
    """
    path = str(video_path)
    cap = cv2.VideoCapture(path)
    if not cap.isOpened():
        raise ValueError("Could not open video file")

    fps = cap.get(cv2.CAP_PROP_FPS) or 25.0
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT) or 0)
    interval = max(1, int(fps / FRAMES_PER_SECOND_SAMPLED))
    frames: List[np.ndarray] = []
    frame_idx = 0

    while len(frames) < MAX_FRAMES:
        ret, frame = cap.read()
        if not ret:
            break
        if frame_idx % interval == 0:
            frames.append(frame)
        frame_idx += 1

    cap.release()
    if not frames:
        raise ValueError("No frames could be extracted from video")
    return frames, float(fps)


def _laplacian_variance(frame: np.ndarray) -> float:
    """Sharpness measure: higher = sharper. Deepfakes often have inconsistent sharpness."""
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    return float(cv2.Laplacian(gray, cv2.CV_64F).var())


def _color_histogram_entropy(frame: np.ndarray) -> float:
    """Per-frame color distribution complexity."""
    hsv = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)
    hist = cv2.calcHist([hsv], [0, 1], None, [32, 32], [0, 180, 0, 256])
    hist = np.clip(hist, 1e-6, None)
    hist = hist / hist.sum()
    return float(-np.sum(hist * np.log2(hist)))


def _temporal_difference(frames: List[np.ndarray]) -> np.ndarray:
    """Per-pixel absolute difference between consecutive frames (mean over frame)."""
    if len(frames) < 2:
        return np.array([0.0])
    diffs = []
    for i in range(len(frames) - 1):
        g1 = cv2.cvtColor(frames[i], cv2.COLOR_BGR2GRAY)
        g2 = cv2.cvtColor(frames[i + 1], cv2.COLOR_BGR2GRAY)
        diff = np.abs(g1.astype(np.float32) - g2.astype(np.float32))
        diffs.append(float(np.mean(diff)))
    return np.array(diffs)


def heuristic_score(frames: List[np.ndarray]) -> tuple[float, dict]:
    """
    Compute a deterministic fake probability from frame-level and temporal features.
    Returns (score in [0, 1], details dict). Higher score = more likely deepfake.
    """
    n = len(frames)
    lap_vars = np.array([_laplacian_variance(f) for f in frames])
    entropies = np.array([_color_histogram_entropy(f) for f in frames])
    temp_diffs = _temporal_difference(frames)

    # Inconsistent sharpness across frames (common in deepfakes)
    lap_std = float(np.std(lap_vars))
    lap_mean = float(np.mean(lap_vars)) or 1e-6
    sharpness_consistency = lap_std / lap_mean  # normalized

    # Temporal jitter: very low or very high can be suspicious
    temp_mean = float(np.mean(temp_diffs))
    temp_std = float(np.std(temp_diffs)) if len(temp_diffs) > 1 else 0.0

    # Normalize into a 0-1 score using sigmoid-like mapping
    # Heuristic: high sharpness inconsistency -> higher fake score
    # Very low temporal difference (static face) or very high (glitches) -> higher
    raw = 0.0
    raw += min(1.0, sharpness_consistency / 2.0) * 0.4
    if temp_mean < 2.0:
        raw += 0.25  # very static
    elif temp_mean > 30.0:
        raw += 0.2   # high jitter
    raw += min(1.0, temp_std / 20.0) * 0.2
    entropy_std = float(np.std(entropies))
    raw += min(1.0, entropy_std / 1.0) * 0.15

    score = round(float(np.clip(raw, 0.0, 1.0)), 4)
    details = {
        "sharpness_std": round(lap_std, 4),
        "temporal_diff_mean": round(temp_mean, 4),
        "temporal_diff_std": round(temp_std, 4),
        "entropy_std": round(entropy_std, 4),
    }
    return score, details


def _run_model_inference(frames: List[np.ndarray], model_path: str) -> float:
    """Run PyTorch model on preprocessed frames. Returns mean probability of fake [0,1]."""
    try:
        import torch
    except ImportError:
        logger.warning("PyTorch not installed; falling back to heuristic.")
        return -1.0

    from app.models.detector import load_detector, preprocess_frames

    model = load_detector(model_path)
    if model is None:
        return -1.0
    tensor = preprocess_frames(frames)
    if tensor is None:
        return -1.0
    tensor = tensor.to(next(model.parameters()).device)
    with torch.no_grad():
        logits = model(tensor)
        if logits.shape[-1] == 1:
            probs = torch.sigmoid(logits).squeeze(-1)
        else:
            probs = torch.softmax(logits, dim=1)[:, 1]
        return float(probs.mean().item())


def analyze_video(video_path: str | Path) -> AnalysisResult:
    """
    Run full analysis on a video file: extract frames, then either
    heuristic scoring or model inference (if MODEL_WEIGHTS_PATH set).
    """
    frames, fps = extract_frames(video_path)
    frame_count = len(frames)
    details: Optional[dict] = None

    model_path = (MODEL_WEIGHTS_PATH or "").strip()
    if model_path and Path(model_path).exists():
        model_score = _run_model_inference(frames, model_path)
        if model_score >= 0:
            return AnalysisResult(
                is_deepfake=model_score >= 0.5,
                confidence=round(model_score, 2),
                mode="model",
                frame_count=frame_count,
                details={"model_score": model_score},
            )

    # Heuristic path (default)
    score, details = heuristic_score(frames)
    return AnalysisResult(
        is_deepfake=score >= 0.5,
        confidence=round(score, 2),
        mode="heuristic",
        frame_count=frame_count,
        details=details,
    )
