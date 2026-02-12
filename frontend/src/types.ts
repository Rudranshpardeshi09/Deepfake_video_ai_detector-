// Type definitions for AI-generated video detection system
// Contains interfaces for API responses and component props

// Result from the AI-generation detection analysis API
// Matches backend response schema; scores in [0.0-1.0]
export interface DetectionResult {
  // Primary classification: true if AI-generated, false if real/natural video
  isAIGenerated: boolean;

  // Confidence score [0.0-1.0]: how confident the system is in the classification
  confidence: number;

  // Risk level for user-friendly presentation: "low", "medium", or "high"
  riskLevel: "low" | "medium" | "high";

  // Which detection method was used: heuristic, model, or ensemble
  detectionMethod: "heuristic" | "model" | "ensemble";

  // Number of frames extracted from video and analyzed
  frameCount: number;

  // Total processing time in seconds (including extraction and analysis)
  processingTime: number;

  // ISO 8601 timestamp when analysis was completed
  analyzedAt: string;

  // Breakdown of individual detection indicator scores for explainability
  detailBreakdown?: {
    // Sharpness consistency score [0, 1]
    sharpness_score?: number;
    // Compression artifacts score [0, 1]
    compression_score?: number;
    // Optical flow consistency score [0, 1]
    optical_flow_score?: number;
    // Frequency domain anomaly score [0, 1]
    frequency_score?: number;
    // Color entropy variation score [0, 1]
    entropy_score?: number;
    // Additional detailed metrics from the backend
    [key: string]: number | undefined;
  };

  // Optional error message if analysis failed
  error?: string;
}

// Video file details before and after analysis
// Tracks lifecycle: selection, preview, analysis, results
export interface VideoDetails {
  // Object URL for video preview in the player
  url: string;

  // The actual File object from the file input
  file?: File;

  // Generated thumbnail image (currently unused)
  thumbnail?: string;

  // Current state of the video processing workflow
  status: "idle" | "analyzing" | "completed" | "error";

  // Analysis result (populated after analysis completes)
  result?: DetectionResult;

  // Error message if analysis failed
  error?: string;
}

// UI notification/toast message for temporary user feedback
export interface Toast {
  // Unique identifier for the toast (for list rendering)
  id: string;

  // Message text to display
  message: string;

  // Toast type: determines color and icon
  type: "success" | "error" | "warning" | "info";

  // How long to display (ms), or null for permanent
  duration?: number | null;
}

// Application-wide state for theme configuration
export interface ThemeConfig {
  // Current theme mode
  mode: "light" | "dark" | "gradient-vibrant";

  // Primary color (used for buttons, links, highlights)
  primaryColor: string;

  // Accent color (used for secondary elements)
  accentColor: string;
}

// API error response from the backend
export interface APIError {
  // HTTP status code
  status: number;

  // Error detail message from backend
  detail: string;
}
