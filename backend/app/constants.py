# Application-wide constants for AI-generated video detection
from __future__ import annotations

# ============================================================================
# AI-GENERATED VIDEO DETECTION THRESHOLDS
# ============================================================================

# Primary Classification Threshold
# Videos with confidence >= this value are classified as AI-generated
CLASSIFICATION_THRESHOLD: float = 0.5

# ============================================================================
# HEURISTIC DETECTION FEATURE WEIGHTS
# ============================================================================

# These weights determine how much each feature contributes to the final score.
# They must sum to approximately 1.0 for normalized contributions.

# Weight for sharpness/blur inconsistency detection (identifies unnatural focus variation)
HEURISTIC_WEIGHT_SHARPNESS: float = 0.35

# Weight for compression artifact detection (AI videos often have distinct compression patterns)
HEURISTIC_WEIGHT_COMPRESSION: float = 0.25

# Weight for optical flow consistency (detects unnatural motion in AI-generated videos)
HEURISTIC_WEIGHT_OPTICAL_FLOW: float = 0.2

# Weight for frequency domain anomalies (AI generators leave characteristic frequency signatures)
HEURISTIC_WEIGHT_FREQUENCY: float = 0.2

# ============================================================================
# SHARPNESS ANALYSIS CONSTANTS
# ============================================================================

# Divisor for normalizing sharpness consistency metric
# Higher values = stricter penalty for sharpness variation
SHARPNESS_CONSISTENCY_DIVISOR: float = 2.0

# Minimum laplacian variance threshold (very blurry frames are suspicious)
MIN_LAPLACIAN_VARIANCE: float = 50.0

# ============================================================================
# TEMPORAL CONSISTENCY CONSTANTS
# ============================================================================

# If average pixel difference between frames is below this, video appears too static
# (suspicious for facial animation, common in low-quality AI generation)
TEMPORAL_DIFF_LOW_THRESHOLD: float = 2.0

# Penalty added if temporal difference is below LOW_THRESHOLD
TEMPORAL_DIFF_LOW_PENALTY: float = 0.25

# If average pixel difference exceeds this, video has suspicious jitter
# (can indicate generation glitches or stitching artifacts)
TEMPORAL_DIFF_HIGH_THRESHOLD: float = 30.0

# Penalty added if temporal difference exceeds HIGH_THRESHOLD
TEMPORAL_DIFF_HIGH_PENALTY: float = 0.2

# Divisor for temporal standard deviation normalization
TEMPORAL_STD_DIVISOR: float = 20.0

# ============================================================================
# FREQUENCY DOMAIN ANALYSIS CONSTANTS
# ============================================================================

# These help detect characteristic frequency patterns left by generative models.
# AI-generated videos often have unnatural frequency distributions.

# Entropy standard deviation divisor for normalization
ENTROPY_STD_DIVISOR: float = 1.0

# Number of histogram bins for color distribution analysis
HISTOGRAM_BINS_H: int = 32  # Hue channel bins
HISTOGRAM_BINS_S: int = 32  # Saturation channel bins

# Minimum entropy threshold (too uniform color = suspicious)
MIN_COLOR_ENTROPY: float = 0.1

# ============================================================================
# OPTICAL FLOW DETECTION CONSTANTS
# ============================================================================

# Maximum allowed optical flow magnitude variation
# Higher variation suggests unnatural motion (synthetic generation artifacts)
MAX_OPTICAL_FLOW_VARIANCE: float = 50.0

# Minimum optical flow magnitude for natural motion
MIN_OPTICAL_FLOW_MAGNITUDE: float = 0.5

# ============================================================================
# COMPRESSION ARTIFACT DETECTION CONSTANTS
# ============================================================================

# Block size for compression artifact detection (typically matches codec block size)
COMPRESSION_BLOCK_SIZE: int = 8

# Threshold for edge detection (identifies compression discontinuities)
EDGE_MAGNITUDE_THRESHOLD: float = 30.0

# ============================================================================
# FRAME PROCESSING CONFIGURATION
# ============================================================================

# Input frame size for model inference (if using pre-trained model)
# Frames are resized to this dimension before feeding to neural networks
MODEL_INPUT_HEIGHT: int = 256
MODEL_INPUT_WIDTH: int = 256

# Color space for frame processing
# BGR is OpenCV default, matches most video codecs
COLOR_SPACE: str = "BGR"

# Face detection input size (for face landmark irregularity detection in future)
FACE_DETECTION_INPUT_SIZE: int = 224

# ============================================================================
# DEEP LEARNING MODEL CONFIGURATION
# ============================================================================

# Device preference for PyTorch inference
# "cuda" for GPU acceleration, "cpu" for fallback
PYTORCH_DEVICE: str = "cpu"

# Whether to use GPU if available (auto-detect)
USE_GPU_IF_AVAILABLE: bool = True

# Model quantization (reduces memory and speeds up inference)
USE_MODEL_QUANTIZATION: bool = False

# Batch size for processing frames (impacts memory usage and speed)
INFERENCE_BATCH_SIZE: int = 8

# ============================================================================
# CONFIDENCE SCORE AGGREGATION
# ============================================================================

# When combining heuristic and model scores, use weighted average
# Weight for heuristic score when ensemble is used
ENSEMBLE_WEIGHT_HEURISTIC: float = 0.4

# Weight for deep learning model score when ensemble is used
ENSEMBLE_WEIGHT_MODEL: float = 0.6

# Minimum agreement threshold between detectors (for high-confidence predictions)
# If both methods agree this well, increase confidence
MIN_AGREEMENT_FOR_HIGH_CONFIDENCE: float = 0.8

# ============================================================================
# RISK LEVEL CLASSIFICATION
# ============================================================================

# Map confidence scores to risk levels for user-friendly display

# Confidence below this = low risk
RISK_LEVEL_LOW_THRESHOLD: float = 0.35

# Confidence between LOW and MEDIUM thresholds = medium risk
RISK_LEVEL_MEDIUM_THRESHOLD: float = 0.65

# Confidence above MEDIUM = high risk
# (RISK_LEVEL_HIGH is implicitly: confidence >= 0.65)

# ============================================================================
# PERFORMANCE OPTIMIZATION CONSTANTS
# ============================================================================

# Maximum number of frames to process (prevent timeout on very long videos)
# Set via environment variable MAX_FRAMES, defaults to this
DEFAULT_MAX_FRAMES: int = 64

# Frame sampling rate (frames per second to extract)
# Set via environment variable FRAMES_PER_SECOND_SAMPLED, defaults to this
DEFAULT_FRAMES_PER_SECOND: float = 1.0

# Request timeout in seconds (prevents hanging on corrupted videos)
VIDEO_PROCESSING_TIMEOUT_SECONDS: int = 60

# Maximum video file size in MB (prevents memory exhaustion)
DEFAULT_MAX_VIDEO_SIZE_MB: int = 100

# ============================================================================
# ERROR HANDLING & LOGGING
# ============================================================================

# Enable verbose logging of frame-level metrics (useful for debugging)
LOG_FRAME_DETAILS: bool = False

# Whether to save intermediate analysis data for debugging
SAVE_DEBUG_DATA: bool = False

# ============================================================================
# MODEL NORMALIZATION CONSTANTS
# ============================================================================

# ImageNet normalization statistics (used when loading pre-trained models)
# These are standard for transfer learning from ImageNet-trained models

IMAGENET_MEAN: tuple[float, float, float] = (0.485, 0.456, 0.406)
IMAGENET_STD: tuple[float, float, float] = (0.229, 0.224, 0.225)

# Custom normalization for audio analysis (if implemented)
# Mel-spectrogram normalization constants
AUDIO_MEAN: float = -4.5
AUDIO_STD: float = 4.5
