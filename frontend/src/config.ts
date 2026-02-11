/**
 * Configuration constants for the AI-generated video detection frontend.
 *
 * This file centralizes configuration values including API endpoints, UI constants,
 * and analysis settings. Environment variables (via Vite) can override defaults.
 */

// ============================================================================
// API CONFIGURATION
// ============================================================================

/**
 * Base URL for API endpoints.
 * Can be overridden with VITE_API_BASE_URL environment variable.
 * In production, point to your backend URL.
 */
export const API_BASE_URL =
  typeof import.meta !== "undefined" && import.meta.env?.VITE_API_BASE_URL
    ? String(import.meta.env.VITE_API_BASE_URL).replace(/\/$/, "")
    : "http://localhost:8000";

/** Endpoint for video analysis */
export const getAnalyzeUrl = () => `${API_BASE_URL}/api/analyze`;

// ============================================================================
// VIDEO UPLOAD CONFIGURATION
// ============================================================================

/** Accepted video file formats */
export const SUPPORTED_VIDEO_FORMATS = [".mp4", ".webm", ".mov", ".avi", ".mkv"];

/** Maximum video file size in MB */
export const MAX_VIDEO_SIZE_MB = 100;

/** File size in bytes */
export const MAX_VIDEO_SIZE_BYTES = MAX_VIDEO_SIZE_MB * 1024 * 1024;

// ============================================================================
// ANALYSIS CONFIGURATION
// ============================================================================

/** Confidence threshold for AI-generation classification (0-1) */
export const CLASSIFICATION_THRESHOLD = 0.5;

/** Confidence threshold for "low" risk level */
export const RISK_LEVEL_LOW_THRESHOLD = 0.35;

/** Confidence threshold for "medium" risk level */
export const RISK_LEVEL_MEDIUM_THRESHOLD = 0.65;

// ============================================================================
// UI/UX CONSTANTS
// ============================================================================

/** Default toast notification display duration (ms) */
export const DEFAULT_TOAST_DURATION = 4000;

/** Maximum number of toasts to display simultaneously */
export const MAX_TOASTS = 3;

/** Animation duration for transitions (ms) */
export const ANIMATION_DURATION = 300;

/** Delay before showing skeleton loaders (prevents flashing) */
export const SKELETON_DELAY = 200;

// ============================================================================
// RESPONSIVE BREAKPOINTS
// ============================================================================

/**
 * Tailwind-compatible breakpoints for responsive design.
 * Used in CSS media queries and shared with TypeScript when needed.
 */
export const BREAKPOINTS = {
  xs: 320,      // Mobile phones
  sm: 640,      // Small devices
  md: 768,      // Tablets
  lg: 1024,     // Desktops
  xl: 1280,     // Large desktops
  "2xl": 1536,  // Extra large screens
};

// ============================================================================
// THEME CONFIGURATION
// ============================================================================

/**
 * Rainbow ROY G BIV color palette for vibrant, energetic UI.
 * Uses the full spectrum for visual appeal and distinct color differentiation.
 * Each color has strong saturation and brightness for accessibility.
 */
export const RAINBOW_COLORS = {
  red: "#FF0000",       // Pure red
  orange: "#FF7F00",    // Pure orange
  yellow: "#FFFF00",    // Pure yellow
  green: "#00FF00",     // Pure green
  blue: "#0000FF",      // Pure blue
  indigo: "#4B0082",    // Indigo
  violet: "#9400D3",    // Violet
  pink: "#FF1493",      // Deep pink
  cyan: "#00FFFF",      // Cyan
};

/**
 * Color palette for AI-generated video detection UI.
 * Uses rainbow spectrum for visual dynamism and color transitions.
 * Gradients cycle through the spectrum for animated effects.
 */
export const THEME_COLORS = {
  // Rainbow gradient for primary UI elements (cycles through spectrum)
  // Used in buttons, headers, gradients with animation
  primary: {
    start: "#FF0000",    // Red
    mid: "#9400D3",      // Violet (middle of spectrum)
    end: "#00FFFF",      // Cyan
  },

  // Dark gradient for backgrounds (complementary to rainbow)
  darkGradient: {
    start: "#0A0E27",    // Very dark blue
    mid: "#1E1B4B",      // Dark navy
    end: "#2D1B4B",      // Dark purple
  },

  // Detection indicator colors (each unique)
  indicators: {
    sharpness: RAINBOW_COLORS.blue,        // Blue for sharpness
    compression: RAINBOW_COLORS.orange,    // Orange for compression
    opticalFlow: RAINBOW_COLORS.green,     // Green for motion/flow
    frequency: RAINBOW_COLORS.violet,      // Violet for frequency
    entropy: RAINBOW_COLORS.pink,          // Pink for entropy/color
  },

  // Accent colors from spectrum
  accent: {
    cyan: RAINBOW_COLORS.cyan,
    amber: "#FBBF24",
  },

  // Status colors (consistent with common conventions)
  success: "#10B981",
  warning: "#F59E0B",
  danger: "#EF4444",
  info: RAINBOW_COLORS.blue,

  // Neutral colors
  text: {
    primary: "#FFFFFF",
    secondary: "#E5E7EB",
  },
  background: {
    dark: "#0F172A",
    darker: "#0A0E27",
  },
};

// Rainbow spectrum for animated color cycling (for gradients and effects)
export const SPECTRUM_COLORS = [
  RAINBOW_COLORS.red,
  RAINBOW_COLORS.orange,
  RAINBOW_COLORS.yellow,
  RAINBOW_COLORS.green,
  RAINBOW_COLORS.blue,
  RAINBOW_COLORS.indigo,
  RAINBOW_COLORS.violet,
  RAINBOW_COLORS.pink,
  RAINBOW_COLORS.cyan,
];

// ============================================================================
// RISK LEVEL COLORS
// ============================================================================

/**
 * Color mapping for risk levels in UI.
 * Used in charts, badges, and indicators.
 */
export const RISK_COLORS = {
  low: "#10B981",    // Green - safe
  medium: "#F59E0B", // Amber - caution
  high: "#EF4444",   // Red - alert
};

