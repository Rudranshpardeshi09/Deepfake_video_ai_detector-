// Hook for managing video file uploads and validation
// Handles file selection, validation, and preview URL generation
import { useCallback, useState } from 'react';
import { MAX_VIDEO_SIZE_BYTES, SUPPORTED_VIDEO_FORMATS } from '../config';
import type { VideoDetails } from '../types';

interface UseVideoUploadReturn {
  video: VideoDetails | null;
  selectVideo: (file: File) => void;
  clearVideo: () => void;
  error: string | null;
  isValidFile: (file: File) => boolean;
}

// Hook to handle video file uploads and state
export const useVideoUpload = (): UseVideoUploadReturn => {
  const [video, setVideo] = useState<VideoDetails | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Validate file meets requirements
  const isValidFile = useCallback((file: File): boolean => {
    // Check file type by extension
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();

    if (!SUPPORTED_VIDEO_FORMATS.includes(fileExtension)) {
      return false;
    }

    // Check file size
    if (file.size > MAX_VIDEO_SIZE_BYTES) {
      return false;
    }

    return true;
  }, []);

  // Handle file selection
  const selectVideo = useCallback(
    (file: File) => {
      // Reset previous error
      setError(null);

      // Validate file
      if (!isValidFile(file)) {
        let errorMsg = 'Invalid file';

        if (!SUPPORTED_VIDEO_FORMATS.includes('.' + file.name.split('.').pop()?.toLowerCase())) {
          errorMsg = `Unsupported format. Supported: ${SUPPORTED_VIDEO_FORMATS.join(', ')}`;
        } else if (file.size > MAX_VIDEO_SIZE_BYTES) {
          const sizeMB = Math.round(file.size / 1024 / 1024);
          errorMsg = `File too large (${sizeMB}MB). Maximum: 100MB`;
        }

        setError(errorMsg);
        setVideo(null);
        return;
      }

      // Create object URL for video preview
      // This allows streaming the video without uploading yet
      const url = URL.createObjectURL(file);

      setVideo({
        url,
        file,
        status: 'idle',
      });
    },
    [isValidFile]
  );

  // Clear selected video and cleanup URL
  const clearVideo = useCallback(() => {
    if (video?.url) {
      // Release the blob URL to free memory
      URL.revokeObjectURL(video.url);
    }

    setVideo(null);
    setError(null);
  }, [video?.url]);

  return {
    video,
    selectVideo,
    clearVideo,
    error,
    isValidFile,
  };
};

export default useVideoUpload;
