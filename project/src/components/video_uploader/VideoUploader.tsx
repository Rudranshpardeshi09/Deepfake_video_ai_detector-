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
      className={`relative rounded-lg border-2 border-dashed p-8 transition-colors ${
        isDragging
          ? 'border-blue-500 bg-blue-50'
          : 'border-gray-300 hover:border-gray-400'
      }`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <div className="flex flex-col items-center justify-center space-y-4">
        <Upload
          className={`h-12 w-12 ${
            isDragging ? 'text-blue-500' : 'text-gray-400'
          }`}
        />
        <div className="text-center">
          <p className="text-lg font-medium text-gray-700">
            Drag and drop your video here
          </p>
          <p className="text-sm text-gray-500">or</p>
          <label className="mt-2 inline-block cursor-pointer rounded-md bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
            Select video
            <input
              type="file"
              className="hidden"
              accept="video/*"
              onChange={handleFileInput}
            />
          </label>
        </div>
        <p className="text-sm text-gray-500">
          Supported formats: MP4, WebM, MOV (max 100MB)
        </p>
        {error && (
          <div className="flex items-center text-red-500">
            <AlertCircle className="mr-2 h-4 w-4" />
            <span className="text-sm">{error}</span>
          </div>
        )}
      </div>
    </div>
  );
}