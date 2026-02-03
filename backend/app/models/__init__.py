"""Optional ML models for deepfake detection."""
from .detector import load_detector, preprocess_frames

__all__ = ["load_detector", "preprocess_frames"]
