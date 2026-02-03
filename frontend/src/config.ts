/**
 * Frontend API configuration.
 * In production, set VITE_API_BASE_URL to your backend URL (e.g. https://api.example.com).
 */
export const API_BASE_URL =
  typeof import.meta !== "undefined" && import.meta.env?.VITE_API_BASE_URL
    ? String(import.meta.env.VITE_API_BASE_URL).replace(/\/$/, "")
    : "http://localhost:8000";

export const getAnalyzeUrl = () => `${API_BASE_URL}/api/analyze`;
