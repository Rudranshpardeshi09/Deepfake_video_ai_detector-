// Hook for managing video analysis workflow
// Handles validation, API calls, errors, and result state
import { useCallback, useState } from 'react';
import { getAnalyzeUrl } from '../config';
import type { DetectionResult, VideoDetails } from '../types';
import { useApp } from '../context/AppContext';

interface UseAnalysisReturn {
  analyzeVideo: (videoDetails: VideoDetails) => Promise<DetectionResult | null>;
  isLoading: boolean;
  error: string | null;
}

// Hook to handle video analysis and expose analyzeVideo
export const useAnalysis = (): UseAnalysisReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addToast } = useApp();

  // Main analysis function
  const analyzeVideo = useCallback(
    async (videoDetails: VideoDetails): Promise<DetectionResult | null> => {
      // Reset state before analysis
      setIsLoading(true);
      setError(null);

      try {
        // Validate file exists
        if (!videoDetails.file) {
          throw new Error('No video file selected');
        }

        // Create FormData for multipart upload
        // Backend expects "video" field
        const formData = new FormData();
        formData.append('video', videoDetails.file);

        // Show loading toast
        addToast('Analyzing video... This may take a few seconds', 'info', 0);

        // Call API endpoint
        // Use fetch with proper error handling
        const response = await fetch(getAnalyzeUrl(), {
          method: 'POST',
          body: formData,
          // Don't set Content-Type - browser auto-detects for FormData
        });

        // Handle different response statuses
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          const errorMessage = errorData.detail || `Analysis failed (${response.status})`;
          throw new Error(errorMessage);
        }

        // Parse response
        const result: DetectionResult = await response.json();

        // Validate response has required fields
        if (!('isAIGenerated' in result) || !('confidence' in result)) {
          throw new Error('Invalid response format from server');
        }

        // Format confidence to 2 decimal places for display
        result.confidence = Math.round(result.confidence * 100) / 100;

        // Show success toast with result
        const riskLevel = result.riskLevel?.toUpperCase() || 'UNKNOWN';
        const message = result.isAIGenerated
          ? `AI-Generated Content Detected (${riskLevel} Risk)`
          : `Natural/Real Video (${riskLevel} Risk)`;
        addToast(message, result.riskLevel === 'high' ? 'warning' : 'success');

        return result;
      } catch (err) {
        // Detailed error handling
        const errorMsg =
          err instanceof Error
            ? err.message
            : 'An unexpected error occurred during analysis';

        setError(errorMsg);
        addToast(errorMsg, 'error', 5000);

        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [addToast]
  );

  return {
    analyzeVideo,
    isLoading,
    error,
  };
};

export default useAnalysis;
