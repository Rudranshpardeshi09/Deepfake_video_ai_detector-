import React, { useState, useCallback } from 'react';
import { Upload, AlertCircle } from 'lucide-react';

interface VideoUploaderProps {
  onVideoSelect: (url: string, file: File) => void;
}

export function VideoUploader({ onVideoSelect }: VideoUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true);
    } else if (e.type === 'dragleave') {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    setError(null);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('video/')) {
        const url = URL.createObjectURL(file);
        onVideoSelect(url, file);
      } else {
        setError('Please upload a video file');
      }
    }
  }, [onVideoSelect]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('video/')) {
        const url = URL.createObjectURL(file);
        onVideoSelect(url, file);
      } else {
        setError('Please upload a video file');
      }
    }
  }, [onVideoSelect]);

  return (
    <div
      className={`uploader-zone ${isDragging ? "uploader-zone--active" : ""}`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <div className="uploader-zone-inner">
        <Upload className={`uploader-icon ${isDragging ? "uploader-icon--active" : ""}`} />
        <div className="uploader-text">
          <p className="uploader-title">Drag and drop your video here</p>
          <p className="uploader-or">or</p>
          <label className="uploader-label">
            Select video
            <input
              type="file"
              className="uploader-input"
              accept="video/*"
              onChange={handleFileInput}
            />
          </label>
        </div>
        <p className="uploader-formats">Supported: MP4, WebM, MOV (max 100MB)</p>
        {error && (
          <div className="uploader-error">
            <AlertCircle className="uploader-error-icon" />
            <span>{error}</span>
          </div>
        )}
      </div>
    </div>
  );
}