// Global application context for state management
// Stores toasts, video state, analysis results
import React, { createContext, useContext, useState, useCallback } from 'react';
import type { Toast, VideoDetails, DetectionResult } from '../types';

interface AppContextType {
  // Toast management
  toasts: Toast[];
  addToast: (message: string, type: Toast['type'], duration?: number) => void;
  removeToast: (id: string) => void;

  // Analysis state
  currentVideo: VideoDetails | null;
  setCurrentVideo: (video: VideoDetails | null) => void;
  isAnalyzing: boolean;
  setIsAnalyzing: (isAnalyzing: boolean) => void;

  // Results
  lastResult: DetectionResult | null;
  setLastResult: (result: DetectionResult | null) => void;
}

// Create context with undefined default (enforces provider usage)
const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider component that wraps the app with global state
export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [currentVideo, setCurrentVideo] = useState<VideoDetails | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lastResult, setLastResult] = useState<DetectionResult | null>(null);

  // Add toast notification
  // Generates unique ID and auto-removes after duration
  const addToast = useCallback(
    (message: string, type: Toast['type'], duration: number = 4000) => {
      const id = Math.random().toString(36).substr(2, 9);
      const newToast: Toast = { id, message, type, duration };

      setToasts((prev) => [...prev, newToast]);

      // Auto-remove toast after duration
      if (duration && duration > 0) {
        setTimeout(() => removeToast(id), duration);
      }
    },
    []
  );

  // Remove toast by ID
  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <AppContext.Provider
      value={{
        toasts,
        addToast,
        removeToast,
        currentVideo,
        setCurrentVideo,
        isAnalyzing,
        setIsAnalyzing,
        lastResult,
        setLastResult,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

// Hook to access global app context; requires AppProvider
export const useApp = (): AppContextType => {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error('useApp must be used inside AppProvider');
  }

  return context;
};

export default AppContext;
