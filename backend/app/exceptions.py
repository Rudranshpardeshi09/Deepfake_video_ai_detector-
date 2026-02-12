# Custom exception classes for the AI video detection system
from __future__ import annotations


# Base exception for all video analysis related errors
class VideoAnalysisException(Exception):
    pass


# Raised when video frame extraction or fundamental processing fails
class VideoProcessingError(VideoAnalysisException):
    pass


# Raised when the uploaded file is not a valid video
class InvalidVideoFileError(VideoAnalysisException):
    pass


# Raised when uploaded video exceeds the maximum allowed file size
class VideoFileTooLargeError(VideoAnalysisException):
    pass


# Raised when video analysis exceeds the maximum processing time
class AnalysisTimeoutError(VideoAnalysisException):
    pass


# Raised when a deep learning model fails to load or initialize
class ModelLoadingError(VideoAnalysisException):
    pass


# Raised when model inference fails during analysis
class InferenceError(VideoAnalysisException):
    pass


# Raised when frame preprocessing fails
class PreprocessingError(VideoAnalysisException):
    pass


# Raised when no frames could be extracted from the video
class NoFramesExtractedError(VideoAnalysisException):
    pass


# Raised when application configuration is invalid or incomplete
class ConfigurationError(VideoAnalysisException):
    pass
