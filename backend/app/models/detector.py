"""
Optional PyTorch deepfake detector (MesoNet-style).
Load weights from MODEL_WEIGHTS_PATH when available.
"""
from __future__ import annotations

import logging
from pathlib import Path
from typing import List, Optional
import torch
import numpy as np

logger = logging.getLogger(__name__)

# Input size expected by the model
INPUT_SIZE = 256
DEVICE = "cpu"


def _mesonet(num_classes: int = 1) -> "torch.nn.Module":
    """MesoNet-style small CNN for 256x256 RGB input."""
    import torch
    import torch.nn as nn

    class MesoNet(nn.Module):
        def __init__(self):
            super().__init__()
            self.features = nn.Sequential(
                nn.Conv2d(3, 8, 3, padding=1),
                nn.BatchNorm2d(8),
                nn.ReLU(inplace=True),
                nn.MaxPool2d(2, 2),
                nn.Conv2d(8, 8, 3, padding=1),
                nn.BatchNorm2d(8),
                nn.ReLU(inplace=True),
                nn.MaxPool2d(2, 2),
                nn.Conv2d(8, 16, 3, padding=1),
                nn.BatchNorm2d(16),
                nn.ReLU(inplace=True),
                nn.MaxPool2d(2, 2),
                nn.Conv2d(16, 16, 3, padding=1),
                nn.BatchNorm2d(16),
                nn.ReLU(inplace=True),
                nn.MaxPool2d(2, 2),
                nn.AdaptiveAvgPool2d(1),
            )
            self.classifier = nn.Sequential(
                nn.Flatten(),
                nn.Linear(16, 16),
                nn.ReLU(inplace=True),
                nn.Dropout(0.5),
                nn.Linear(16, num_classes),
            )

        def forward(self, x):
            x = self.features(x)
            x = self.classifier(x)
            return x

    return MesoNet()


def load_detector(weights_path: str | Path) -> Optional["torch.nn.Module"]:
    """Load detector from .pth file. Returns None on failure."""
    try:
        import torch
    except ImportError:
        return None
    path = Path(weights_path)
    if not path.exists():
        return None
    try:
        model = _mesonet(num_classes=1)
        try:
            state = torch.load(path, map_location=DEVICE, weights_only=True)
        except TypeError:
            state = torch.load(path, map_location=DEVICE)
        if isinstance(state, dict) and "state_dict" in state:
            state = state["state_dict"]
        model.load_state_dict(state, strict=False)
        model.to(DEVICE)
        model.eval()
        return model
    except Exception as e:
        logger.warning("Could not load detector from %s: %s", path, e)
        return None


def preprocess_frames(frames: List[np.ndarray]) -> Optional["torch.Tensor"]:
    """Convert list of BGR frames to normalized tensor [N, 3, H, W] for model."""
    try:
        import torch
        import cv2
    except ImportError:
        return None
    out = []
    for f in frames:
        rgb = cv2.cvtColor(f, cv2.COLOR_BGR2RGB)
        resized = cv2.resize(rgb, (INPUT_SIZE, INPUT_SIZE))
        # [0, 255] -> [0, 1]
        x = resized.astype(np.float32) / 255.0
        x = (x - np.array([0.485, 0.456, 0.406])) / np.array([0.229, 0.224, 0.225])
        out.append(x)
    if not out:
        return None
    tensor = torch.from_numpy(np.stack(out)).float().permute(0, 3, 1, 2)
    return tensor
