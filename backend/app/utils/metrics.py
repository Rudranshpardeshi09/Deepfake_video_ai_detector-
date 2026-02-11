"""
Metrics and score aggregation utilities.

This module handles combining multiple detection scores from different methods
(heuristic, deep learning, etc.) into final confidence scores and risk levels.
Central location for all confidence score logic.
"""
from __future__ import annotations

import logging
from typing import List, Tuple

import numpy as np

from app.constants import (
    ENSEMBLE_WEIGHT_HEURISTIC,
    ENSEMBLE_WEIGHT_MODEL,
    MIN_AGREEMENT_FOR_HIGH_CONFIDENCE,
    CLASSIFICATION_THRESHOLD,
    RISK_LEVEL_LOW_THRESHOLD,
    RISK_LEVEL_MEDIUM_THRESHOLD,
)

logger = logging.getLogger(__name__)


def ensemble_score(heuristic_score: float, model_score: float | None = None) -> Tuple[float, str]:
    """
    Combine heuristic and optional model scores into final confidence.

    Uses weighted averaging when both scores are available. Falls back to heuristic only
    if model score is unavailable or invalid (None, NaN, or out of range).

    The ensemble approach gives more weight to the model (0.6) as it's typically more
    accurate than heuristics, but includes heuristic (0.4) for robustness when the model
    is not available.

    Args:
        heuristic_score: Score from heuristic detector [0, 1]
        model_score: Score from deep learning model [0, 1], or None if not available

    Returns:
        Tuple of:
        - Final confidence score [0, 1]
        - Detection method used ("heuristic", "model", or "ensemble")

    Raises:
        ValueError: If heuristic_score is invalid
    """
    # Validate heuristic score (primary method)
    if not isinstance(heuristic_score, (int, float)) or np.isnan(heuristic_score):
        raise ValueError(f"Invalid heuristic score: {heuristic_score}")

    # Clamp heuristic score to valid range (in case of floating point errors)
    heuristic_score = float(np.clip(heuristic_score, 0.0, 1.0))

    # Check if model score is available and valid
    model_available = (
        model_score is not None
        and isinstance(model_score, (int, float))
        and not np.isnan(model_score)
        and 0.0 <= model_score <= 1.0
    )

    if not model_available:
        # Fall back to heuristic only
        logger.debug(f"Using heuristic-only detection (model unavailable, score={model_score})")
        return heuristic_score, "heuristic"

    # Both scores available - use weighted ensemble
    # Model typically more accurate, so weight it more heavily
    model_score = float(np.clip(model_score, 0.0, 1.0))
    ensemble_result = (
        ENSEMBLE_WEIGHT_HEURISTIC * heuristic_score + ENSEMBLE_WEIGHT_MODEL * model_score
    )

    logger.debug(
        f"Ensemble score: {ensemble_result:.4f} "
        f"(heuristic={heuristic_score:.4f}, model={model_score:.4f})"
    )

    return float(np.clip(ensemble_result, 0.0, 1.0)), "ensemble"


def classify_score(confidence: float, threshold: float = CLASSIFICATION_THRESHOLD) -> bool:
    """
    Classify confidence score as AI-generated or real video.

    Binary classification: confidence >= threshold → AI-generated, else real video.

    Args:
        confidence: Confidence score [0, 1]
        threshold: Classification threshold (default 0.5)

    Returns:
        True if classified as AI-generated, False if real
    """
    if not isinstance(confidence, (int, float)) or np.isnan(confidence):
        logger.error(f"Invalid confidence for classification: {confidence}")
        return False

    return float(confidence) >= threshold


def get_risk_level(confidence: float) -> str:
    """
    Convert confidence score to human-readable risk level.

    Risk levels help users understand detection results:
    - Low: < 35% confidence AI-generated (likely real video)
    - Medium: 35-65% confidence (uncertain, borderline)
    - High: > 65% confidence (likely AI-generated)

    Args:
        confidence: Confidence score [0, 1]

    Returns:
        Risk level string: "low", "medium", or "high"
    """
    if not isinstance(confidence, (int, float)) or np.isnan(confidence):
        logger.error(f"Invalid confidence for risk level: {confidence}")
        return "medium"  # Default to medium for safety

    confidence = float(np.clip(confidence, 0.0, 1.0))

    if confidence < RISK_LEVEL_LOW_THRESHOLD:
        return "low"
    elif confidence < RISK_LEVEL_MEDIUM_THRESHOLD:
        return "medium"
    else:
        return "high"


def get_risk_color(risk_level: str) -> str:
    """
    Map risk level to UI color for visualization.

    Colors are chosen for accessibility and intuitiveness:
    - Low (green): Real video, no concern
    - Medium (yellow): Uncertain, review carefully
    - High (red): AI-generated content detected

    Args:
        risk_level: One of "low", "medium", "high"

    Returns:
        CSS color string (hex format)
    """
    color_map = {
        "low": "#10B981",        # Green
        "medium": "#F59E0B",     # Amber/Yellow
        "high": "#EF4444",       # Red
    }
    return color_map.get(risk_level, "#6B7280")  # Default gray


def aggregate_frame_scores(frame_scores: List[float]) -> Tuple[float, float, float]:
    """
    Aggregate per-frame detection scores into dataset-level statistics.

    Individual frames may have varying scores due to natural variation in AI generation
    quality. We aggregate across frames to get overall video-level confidence.

    Args:
        frame_scores: List of per-frame scores [0, 1]

    Returns:
        Tuple of (mean, std, max) scores across all frames
    """
    if not frame_scores:
        return 0.0, 0.0, 0.0

    frame_array = np.array(frame_scores, dtype=np.float32)
    frame_array = np.clip(frame_array, 0.0, 1.0)

    return (
        float(np.mean(frame_array)),
        float(np.std(frame_array)),
        float(np.max(frame_array)),
    )


def calculate_confidence_bounds(
    confidence: float,
    frame_count: int,
    std_dev: float = 0.1,
) -> Tuple[float, float]:
    """
    Calculate confidence interval bounds for the score.

    This gives users a sense of uncertainty in the measurement. More frames
    reduces uncertainty (narrows bounds). Individual frame variation is
    captured by std_dev.

    For example: confidence=0.7 with bounds (0.65, 0.75) means we're fairly
    confident the true score is in that range.

    Args:
        confidence: Central confidence score [0, 1]
        frame_count: Number of frames analyzed (more frames → lower uncertainty)
        std_dev: Per-frame standard deviation (default 0.1)

    Returns:
        Tuple of (lower_bound, upper_bound) for 95% confidence interval
    """
    # Standard error decreases with sqrt(n) due to law of large numbers
    # More frames → more stable estimate
    standard_error = std_dev / np.sqrt(max(1, frame_count))

    # 95% CI is approximately ± 1.96 * SE
    margin = 1.96 * standard_error

    lower = float(np.clip(confidence - margin, 0.0, 1.0))
    upper = float(np.clip(confidence + margin, 0.0, 1.0))

    return lower, upper


def is_high_confidence(
    confidence: float,
    heuristic_score: float | None = None,
    model_score: float | None = None,
) -> bool:
    """
    Determine if combined scores indicate high confidence prediction.

    High confidence means:
    1. Confidence is above threshold (>0.5)
    2. Individual detectors agree strongly (if both available)

    Strong agreement between heuristic and model increases our confidence in the result.

    Args:
        confidence: Final ensemble confidence [0, 1]
        heuristic_score: Optional heuristic score for agreement checking
        model_score: Optional model score for agreement checking

    Returns:
        True if high confidence, False otherwise
    """
    # Must be above threshold
    if confidence <= CLASSIFICATION_THRESHOLD:
        return False

    # If both individual scores available, check agreement
    if heuristic_score is not None and model_score is not None:
        # Both need to be valid for agreement check
        if (
            isinstance(heuristic_score, (int, float))
            and isinstance(model_score, (int, float))
            and not np.isnan(heuristic_score)
            and not np.isnan(model_score)
        ):
            # Calculate absolute difference between methods
            # If methods strongly agree, we have higher confidence
            difference = abs(float(heuristic_score) - float(model_score))
            agreement_level = 1.0 - difference

            # Both above threshold AND agree well
            if agreement_level >= MIN_AGREEMENT_FOR_HIGH_CONFIDENCE:
                return True

    # Fallback: just check confidence level with stricter threshold
    return confidence >= 0.7
