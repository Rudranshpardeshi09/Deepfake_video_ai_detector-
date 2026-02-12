# Metrics and score aggregation utilities
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
    # Combine heuristic and optional model scores into final confidence
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
    # Classify confidence score as AI-generated (>= threshold)
    if not isinstance(confidence, (int, float)) or np.isnan(confidence):
        logger.error(f"Invalid confidence for classification: {confidence}")
        return False

    return float(confidence) >= threshold


def get_risk_level(confidence: float) -> str:
    # Convert confidence score to risk level: low/medium/high
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
    # Map risk level to UI color (hex)
    color_map = {
        "low": "#10B981",        # Green
        "medium": "#F59E0B",     # Amber/Yellow
        "high": "#EF4444",       # Red
    }
    return color_map.get(risk_level, "#6B7280")  # Default gray


def aggregate_frame_scores(frame_scores: List[float]) -> Tuple[float, float, float]:
    # Aggregate per-frame detection scores into (mean, std, max)
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
    # Calculate 95% confidence interval bounds for the score
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
    # Determine if prediction is high confidence based on agreement
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
