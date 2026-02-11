"""
Custom exception classes for the AI video detection system.

These exceptions provide specific error types for different failure scenarios,
allowing the API to respond with appropriate HTTP status codes and messages.
Specific exceptions make error handling more robust and debugging easier.
"""
from __future__ import annotations


class VideoAnalysisException(Exception):
    """
    Base exception for all video analysis related errors.

    This is the parent class for all exceptions in the analysis pipeline,
    making it easy to catch all video-related errors with a single except clause.
    """

    pass


class VideoProcessingError(VideoAnalysisException):
    """
    Raised when video frame extraction or fundamental processing fails.

    This typically indicates corrupted video files, unsupported codecs,
    or files that don't contain valid video streams.
    """

    pass


class InvalidVideoFileError(VideoAnalysisException):
    """
    Raised when the uploaded file is not a valid video.

    Reasons include: wrong file extension, file is not a video,
    corrupted video data, or unsupported codec.
    """

    pass


class VideoFileTooLargeError(VideoAnalysisException):
    """
    Raised when uploaded video exceeds the maximum allowed file size.

    This protects against memory exhaustion and excessive processing time.
    Users should compress their videos before upload.
    """

    pass


class AnalysisTimeoutError(VideoAnalysisException):
    """
    Raised when video analysis exceeds the maximum processing time.

    Very long videos or corrupted files can cause analysis to hang.
    This timeout prevents the API from becoming unresponsive.
    """

    pass


class ModelLoadingError(VideoAnalysisException):
    """
    Raised when a deep learning model fails to load or initialize.

    This can happen if model weights are corrupt, GPU memory is exhausted,
    or required libraries are missing. Falls back to heuristic-only mode.
    """

    pass


class InferenceError(VideoAnalysisException):
    """
    Raised when model inference fails during analysis.

    This can occur due to out-of-memory errors, NaN values in weights,
    or other runtime errors in the neural network.
    """

    pass


class PreprocessingError(VideoAnalysisException):
    """
    Raised when frame preprocessing fails.

    Reasons include: unable to resize frames, normalization issues,
    or unsupported color space conversions.
    """

    pass


class NoFramesExtractedError(VideoAnalysisException):
    """
    Raised when no frames could be extracted from the video.

    This indicates the video file contains no valid frames (likely corrupted).
    The file should be re-encoded before upload.
    """

    pass


class ConfigurationError(VideoAnalysisException):
    """
    Raised when application configuration is invalid or incomplete.

    This includes missing environment variables, invalid paths,
    or misconfigured model weights.
    """

    pass
