# Application configuration from environment
from __future__ import annotations

import os
from pathlib import Path

# Base paths
BASE_DIR = Path(__file__).resolve().parent.parent
UPLOAD_DIR = Path(os.environ.get("UPLOAD_DIR", BASE_DIR / "uploads"))
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

# Server
HOST = os.environ.get("HOST", "0.0.0.0")
PORT = int(os.environ.get("PORT", "8000"))

# Analysis
MAX_VIDEO_SIZE_MB = int(os.environ.get("MAX_VIDEO_SIZE_MB", "100"))
FRAMES_PER_SECOND_SAMPLED = float(os.environ.get("FRAMES_PER_SECOND_SAMPLED", "1"))
MAX_FRAMES = int(os.environ.get("MAX_FRAMES", "64"))
# Optional path to PyTorch model weights (.pth). If set, model inference is used.
MODEL_WEIGHTS_PATH = os.environ.get("MODEL_WEIGHTS_PATH", "")

# CORS - allow frontend origin
CORS_ORIGINS = os.environ.get("CORS_ORIGINS", "*").split(",")
