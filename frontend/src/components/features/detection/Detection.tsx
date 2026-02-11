/**
 * Detection page component - main analysis interface.
 *
 * Features:
 * - Video file upload with drag-and-drop
 * - Video preview player
 * - Analysis trigger
 * - Results display with risk level and confidence
 * - Detailed breakdown of detection indicators
 */

import React from 'react';
import { Play, Upload, AlertCircle } from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { useVideoUpload } from '../../../hooks/useVideoUpload';
import { useAnalysis } from '../../../hooks/useAnalysis';
import { useVideoCompression } from '../../../hooks/useVideoCompression';
import type { VideoDetails } from '../../../types';

/**
 * Detection component for video analysis workflow.
 *
 * Manages the complete user flow:
 * 1. File upload/selection
 * 2. Video preview
 * 3. Analysis trigger
 * 4. Results display
 */
const Detection: React.FC = () => {
  const { video, selectVideo, clearVideo } = useVideoUpload();
  const { analyzeVideo, isLoading } = useAnalysis();
  const { addToast, currentVideo, setCurrentVideo } = useApp();
  const { compressVideo, progress: compressionProgress, isAvailable: isCompressionAvailable } = useVideoCompression();
  const [analysisResult, setAnalysisResult] = React.useState(currentVideo?.result || null);
  const [showCompressionOptions, setShowCompressionOptions] = React.useState(false);
  const [isCompressing, setIsCompressing] = React.useState(false);

  // Handle file drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.style.backgroundColor = 'rgba(236, 72, 153, 0.1)';
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.05)';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.05)';

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      selectVideo(files[0]);
    }
  };

  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      selectVideo(e.target.files[0]);
    }
  };

  // Handle clearing the selected video.
  // Important: When user clears the video, we also need to clear the analysis result
  // so the old results don't persist on the UI. This ensures clean state transition.
  const handleClearVideo = () => {
    clearVideo();
    setAnalysisResult(null);
  };

  // Handle video compression before analysis.
  // This allows users to reduce file size and upload speed for large videos.
  const handleCompressVideo = async (quality: 80 | 60 | 40) => {
    if (!video || !video.file) {
      addToast('No video selected', 'error');
      return;
    }

    setIsCompressing(true);
    try {
      const originalSize = (video.file.size / 1024 / 1024).toFixed(1);
      addToast(`Compressing video (${quality}% quality)...`, 'info');

      const compressedFile = await compressVideo(video.file, quality);

      if (compressedFile) {
        // Replace video with compressed version
        selectVideo(compressedFile);
        const compressedSize = (compressedFile.size / 1024 / 1024).toFixed(1);
        const reduction = (((video.file.size - compressedFile.size) / video.file.size) * 100).toFixed(0);
        addToast(
          `Compression complete: ${originalSize}MB → ${compressedSize}MB (${reduction}% smaller)`,
          'success'
        );
      } else {
        addToast('Compression failed', 'error');
      }
    } finally {
      setIsCompressing(false);
      setShowCompressionOptions(false);
    }
  };

  // Handle analysis
  const handleAnalyze = async () => {
    if (!video) {
      addToast('No video selected', 'error');
      return;
    }

    const updatedVideo: VideoDetails = {
      ...video,
      status: 'analyzing',
    };

    setCurrentVideo(updatedVideo);

    const result = await analyzeVideo(updatedVideo);
    if (result) {
      setAnalysisResult(result);
      setCurrentVideo({
        ...updatedVideo,
        status: 'completed',
        result,
      });
    } else {
      setCurrentVideo({
        ...updatedVideo,
        status: 'error',
        error: 'Analysis failed',
      });
    }
  };

  // Get risk level color
  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low':
        return '#10b981';
      case 'medium':
        return '#f59e0b';
      case 'high':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  return (
    <div
      style={{
        width: '100%',
        minHeight: '100vh',
        padding: '2rem 1.5rem',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0a0e27 100%)',
        backgroundAttachment: 'fixed',
      }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1
          style={{
            fontSize: '2.5rem',
            fontWeight: '700',
            marginBottom: '3rem',
            textAlign: 'center',
            color: '#ffffff',
          }}
        >
          Analyze Video for AI Generation
        </h1>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
            gap: '2rem',
          }}
        >
          {/* Upload Section */}
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1.5rem', color: '#ffffff' }}>
              Upload Video
            </h2>

            {/* Drag and drop area */}
            {!video && (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                style={{
                  border: '2px dashed rgba(59, 130, 246, 0.3)',
                  borderRadius: '1rem',
                  padding: '2rem',
                  textAlign: 'center',
                  backgroundColor: 'rgba(59, 130, 246, 0.05)',
                  transition: 'all 0.3s ease-out',
                  cursor: 'pointer',
                  marginBottom: '1.5rem',
                }}
              >
                <Upload size={48} color="#3b82f6" style={{ margin: '0 auto 1rem' }} />
                <p style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem', color: '#ffffff' }}>
                  Drag and drop your video here
                </p>
                <p style={{ color: '#9ca3af', marginBottom: '1.5rem' }}>or click below to select</p>

                <label
                  style={{
                    display: 'inline-block',
                    padding: '0.75rem 1.5rem',
                    backgroundColor: 'linear-gradient(135deg, #3b82f6 0%, #ec4899 100%)',
                    color: '#ffffff',
                    borderRadius: '0.5rem',
                    cursor: 'pointer',
                    fontWeight: '600',
                    transition: 'all 0.3s ease-out',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  Select File
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                    aria-label="Upload video file"
                  />
                </label>

                <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '1rem' }}>
                  Supported formats: MP4, WebM, MOV, AVI, MKV (Max 100MB)
                </p>
              </div>
            )}

            {/* Selected file display */}
            {video && (
              <div
                style={{
                  backgroundColor: 'rgba(59, 130, 246, 0.1)',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  borderRadius: '1rem',
                  padding: '1.5rem',
                  marginBottom: '1.5rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                  <div>
                    <p style={{ fontSize: '0.875rem', color: '#9ca3af', marginBottom: '0.25rem' }}>Selected File</p>
                    <p style={{ fontSize: '1.125rem', fontWeight: '600', color: '#ffffff', wordBreak: 'break-word' }}>
                      {video.file?.name}
                    </p>
                    <p style={{ fontSize: '0.875rem', color: '#9ca3af', marginTop: '0.25rem' }}>
                      {video.file && (Math.round(video.file.size / 1024 / 1024 * 10) / 10).toFixed(1)}MB
                    </p>
                  </div>
                  <button
                    onClick={handleClearVideo}
                    style={{
                      background: 'rgba(239, 68, 68, 0.2)',
                      border: '1px solid rgba(239, 68, 68, 0.5)',
                      color: '#ef4444',
                      padding: '0.5rem 1rem',
                      borderRadius: '0.5rem',
                      cursor: 'pointer',
                      fontWeight: '600',
                      fontSize: '0.875rem',
                      transition: 'all 0.3s ease-out',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.2)';
                    }}
                  >
                    Clear
                  </button>
                </div>

                {/* Video preview */}
                <video
                  src={video.url}
                  controls
                  style={{
                    width: '100%',
                    borderRadius: '0.5rem',
                    backgroundColor: '#000000',
                    marginBottom: '1rem',
                    maxHeight: '300px',
                  }}
                />

                {/* Optional: Video compression section (if FFmpeg.wasm available) */}
                {isCompressionAvailable && (
                  <div
                    style={{
                      marginBottom: '1rem',
                      padding: '1rem',
                      backgroundColor: 'rgba(100, 200, 250, 0.1)',
                      borderRadius: '0.5rem',
                      border: '1px solid rgba(100, 200, 250, 0.3)',
                    }}
                  >
                    <p style={{ fontSize: '0.875rem', color: '#9ca3af', marginBottom: '0.75rem' }}>
                      Optional: Compress video to reduce upload size (client-side processing)
                    </p>

                    {!showCompressionOptions ? (
                      <button
                        onClick={() => setShowCompressionOptions(true)}
                        disabled={isCompressing}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          backgroundColor: 'rgba(100, 200, 250, 0.2)',
                          border: '1px solid rgba(100, 200, 250, 0.5)',
                          color: '#64c8fa',
                          borderRadius: '0.5rem',
                          cursor: isCompressing ? 'not-allowed' : 'pointer',
                          fontWeight: '600',
                          fontSize: '0.875rem',
                          opacity: isCompressing ? 0.7 : 1,
                          transition: 'all 0.3s ease-out',
                        }}
                        onMouseEnter={(e) => {
                          if (!isCompressing) {
                            e.currentTarget.style.backgroundColor = 'rgba(100, 200, 250, 0.3)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isCompressing) {
                            e.currentTarget.style.backgroundColor = 'rgba(100, 200, 250, 0.2)';
                          }
                        }}
                      >
                        {isCompressing ? 'Compressing...' : 'Compress Video'}
                      </button>
                    ) : (
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
                        {[80, 60, 40].map((quality) => (
                          <button
                            key={quality}
                            onClick={() => handleCompressVideo(quality as 80 | 60 | 40)}
                            disabled={isCompressing}
                            style={{
                              padding: '0.5rem',
                              backgroundColor:
                                quality === 80
                                  ? 'rgba(16, 185, 129, 0.2)'
                                  : quality === 60
                                  ? 'rgba(245, 158, 11, 0.2)'
                                  : 'rgba(239, 68, 68, 0.2)',
                              border:
                                quality === 80
                                  ? '1px solid rgba(16, 185, 129, 0.5)'
                                  : quality === 60
                                  ? '1px solid rgba(245, 158, 11, 0.5)'
                                  : '1px solid rgba(239, 68, 68, 0.5)',
                              color:
                                quality === 80
                                  ? '#10b981'
                                  : quality === 60
                                  ? '#f59e0b'
                                  : '#ef4444',
                              borderRadius: '0.5rem',
                              cursor: isCompressing ? 'not-allowed' : 'pointer',
                              fontWeight: '600',
                              fontSize: '0.75rem',
                              opacity: isCompressing ? 0.7 : 1,
                              transition: 'all 0.3s ease-out',
                            }}
                            onMouseEnter={(e) => {
                              if (!isCompressing) {
                                e.currentTarget.style.opacity = '0.8';
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (!isCompressing) {
                                e.currentTarget.style.opacity = '1';
                              }
                            }}
                          >
                            {quality}% Quality
                          </button>
                        ))}
                      </div>
                    )}

                    {compressionProgress.status !== 'idle' && (
                      <p
                        style={{
                          fontSize: '0.75rem',
                          color: '#e5e7eb',
                          marginTop: '0.5rem',
                          textAlign: 'center',
                        }}
                      >
                        {compressionProgress.message}
                        {compressionProgress.percentage > 0 && compressionProgress.percentage < 100
                          ? ` (${compressionProgress.percentage}%)`
                          : ''}
                      </p>
                    )}
                  </div>
                )}

                {/* Analyze button */}
                <button
                  onClick={handleAnalyze}
                  disabled={isLoading}
                  style={{
                    width: '100%',
                    padding: '1rem',
                    backgroundColor:
                      video.status === 'analyzed' || isLoading
                        ? 'rgba(107, 114, 128, 0.3)'
                        : 'linear-gradient(135deg, #3b82f6 0%, #ec4899 100%)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '0.5rem',
                    fontSize: '1.125rem',
                    fontWeight: '600',
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    opacity: isLoading ? 0.7 : 1,
                    transition: 'all 0.3s ease-out',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                  }}
                  onMouseEnter={(e) => {
                    if (!isLoading) {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 6px 20px rgba(59, 130, 246, 0.4)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isLoading) {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }
                  }}
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin" style={{ width: '20px', height: '20px' }}>
                        ⚙️
                      </div>
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Play size={20} />
                      Analyze Video
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Results Section */}
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1.5rem', color: '#ffffff' }}>
              Analysis Results
            </h2>

            {analysisResult ? (
              <div
                style={{
                  backgroundColor: 'rgba(59, 130, 246, 0.05)',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  borderRadius: '1rem',
                  padding: '2rem',
                  animation: 'slideInUp 0.3s ease-out',
                }}
              >
                {/* Risk badge */}
                <div
                  style={{
                    display: 'inline-block',
                    padding: '0.5rem 1rem',
                    backgroundColor: getRiskColor(analysisResult.riskLevel),
                    borderRadius: '9999px',
                    color: '#ffffff',
                    fontWeight: '600',
                    fontSize: '0.875rem',
                    marginBottom: '1.5rem',
                    textTransform: 'uppercase',
                  }}
                >
                  {analysisResult.riskLevel} Risk
                </div>

                {/* Main result */}
                <div style={{ marginBottom: '2rem' }}>
                  <p style={{ fontSize: '0.875rem', color: '#9ca3af', marginBottom: '0.5rem' }}>Classification</p>
                  <p style={{ fontSize: '1.75rem', fontWeight: '700', color: analysisResult.isAIGenerated ? '#ef4444' : '#10b981' }}>
                    {analysisResult.isAIGenerated ? 'AI-Generated' : 'Natural/Real'}
                  </p>
                </div>

                {/* Confidence score */}
                <div style={{ marginBottom: '2rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <p style={{ fontSize: '0.875rem', color: '#9ca3af' }}>Confidence Score</p>
                    <p style={{ fontSize: '1.125rem', fontWeight: '700', color: '#ffffff' }}>
                      {(analysisResult.confidence * 100).toFixed(1)}%
                    </p>
                  </div>
                  <div
                    style={{
                      width: '100%',
                      height: '8px',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: '9999px',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        width: `${analysisResult.confidence * 100}%`,
                        height: '100%',
                        background: `linear-gradient(90deg, #3b82f6, ${getRiskColor(analysisResult.riskLevel)})`,
                        transition: 'width 0.5s ease-out',
                      }}
                    />
                  </div>
                </div>

                {/* Metadata */}
                <div style={{ borderTop: '1px solid rgba(59, 130, 246, 0.2)', paddingTop: '1.5rem' }}>
                  <div style={{ marginBottom: '1rem' }}>
                    <p style={{ fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase' }}>Detection Method</p>
                    <p style={{ fontSize: '0.875rem', color: '#e5e7eb', fontWeight: '600' }}>
                      {analysisResult.detectionMethod}
                    </p>
                  </div>

                  <div style={{ marginBottom: '1rem' }}>
                    <p style={{ fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase' }}>Frames Analyzed</p>
                    <p style={{ fontSize: '0.875rem', color: '#e5e7eb', fontWeight: '600' }}>
                      {analysisResult.frameCount}
                    </p>
                  </div>

                  <div>
                    <p style={{ fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase' }}>Processing Time</p>
                    <p style={{ fontSize: '0.875rem', color: '#e5e7eb', fontWeight: '600' }}>
                      {analysisResult.processingTime}s
                    </p>
                  </div>
                </div>

                {/* Detail breakdown */}
                {analysisResult.detailBreakdown && Object.keys(analysisResult.detailBreakdown).length > 0 && (
                  <div style={{ marginTop: '2rem', borderTop: '1px solid rgba(59, 130, 246, 0.2)', paddingTop: '1.5rem' }}>
                    <h4 style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '1rem', color: '#ffffff', textTransform: 'uppercase' }}>
                      Detection Indicators
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
                      {Object.entries(analysisResult.detailBreakdown).map(([key, value]) => {
                        if (typeof value !== 'number') return null;
                        return (
                          <div key={key}>
                            <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginBottom: '0.25rem' }}>
                              {key.replace(/_/g, ' ')}
                            </p>
                            <p style={{ fontSize: '1.125rem', fontWeight: '700', color: '#ffffff' }}>
                              {(value * 100).toFixed(0)}%
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div
                style={{
                  backgroundColor: 'rgba(107, 114, 128, 0.1)',
                  border: '1px solid rgba(107, 114, 128, 0.3)',
                  borderRadius: '1rem',
                  padding: '2rem',
                  textAlign: 'center',
                }}
              >
                <AlertCircle size={32} color="#9ca3af" style={{ margin: '0 auto 1rem' }} />
                <p style={{ color: '#9ca3af' }}>
                  {video ? 'Click "Analyze Video" to get results' : 'Upload a video to begin analysis'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Detection;
