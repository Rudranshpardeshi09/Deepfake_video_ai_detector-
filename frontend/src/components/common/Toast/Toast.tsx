// Toast notification component
// Displays dismissible notifications with auto-dismiss

import React, { useEffect } from 'react';
import { useApp } from '../../../context/AppContext';
import type { Toast as ToastType } from '../../../types';

interface ToastProps extends ToastType {
  children?: React.ReactNode;
}

// Individual toast notification component
const Toast: React.FC<ToastProps> = ({ id, message, type, duration }) => {
  const { removeToast } = useApp();

  // Auto-dismiss effect
  useEffect(() => {
    if (!duration || duration <= 0) return;

    const timer = setTimeout(() => removeToast(id), duration);
    return () => clearTimeout(timer);
  }, [id, duration, removeToast]);

  // Color mapping for toast types
  const colorMap = {
    success: '#10b981',    // Green
    error: '#ef4444',      // Red
    warning: '#f59e0b',    // Amber
    info: '#3b82f6',       // Blue
  };

  const bgColorMap = {
    success: 'rgba(16, 185, 129, 0.1)',
    error: 'rgba(239, 68, 68, 0.1)',
    warning: 'rgba(245, 158, 11, 0.1)',
    info: 'rgba(59, 130, 246, 0.1)',
  };

  return (
    <div
      style={{
        padding: '1rem',
        marginBottom: '0.75rem',
        borderRadius: '0.5rem',
        backgroundColor: bgColorMap[type],
        borderLeft: `4px solid ${colorMap[type]}`,
        color: '#ffffff',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.2)',
        animation: 'slideInRight 0.3s ease-out',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '1rem',
        pointerEvents: 'auto',
      }}
    >
      <span>{message}</span>
      <button
        onClick={() => removeToast(id)}
        style={{
          background: 'none',
          border: 'none',
          color: 'inherit',
          cursor: 'pointer',
          fontSize: '1.25rem',
          padding: '0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        aria-label="Close notification"
      >
        ✕
      </button>
    </div>
  );
};

export default Toast;
