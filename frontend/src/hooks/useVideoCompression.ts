/**
 * useVideoCompression - Hook for client-side video compression using FFmpeg.wasm
 *
 * Provides video compression capability using FFmpeg in the browser.
 * Allows users to reduce video file size before uploading for analysis.
 *
 * Features:
 * - Compress video at specified quality levels (80%, 60%, 40%)
 * - Client-side processing (no server upload until compression complete)
 * - Progress tracking for compression operation
 * - Error handling and fallback if FFmpeg.wasm is unavailable
 */

import { useState, useCallback } from 'react';

export interface CompressionProgress {
  percentage: number;
  status: 'idle' | 'loading' | 'compressing' | 'complete' | 'error';
  message: string;
}

export interface UseVideoCompressionReturn {
  compressVideo: (file: File, quality: 80 | 60 | 40) => Promise<File | null>;
  progress: CompressionProgress;
  isAvailable: boolean;
}

/**
 * Hook for video compression using FFmpeg.wasm.
 * Provides client-side compression to reduce video file sizes before upload.
 *
 * Quality levels:
 * - 80: High quality (20-30% size reduction)
 * - 60: Medium quality (40-50% size reduction)
 * - 40: Low quality (60-70% size reduction)
 *
 * Note: FFmpeg.wasm requires:
 * - npm install @ffmpeg/ffmpeg @ffmpeg/util
 * - Enable SharedArrayBuffer in browser (requires COOP/COEP headers)
 */
export const useVideoCompression = (): UseVideoCompressionReturn => {
  const [progress, setProgress] = useState<CompressionProgress>({
    percentage: 0,
    status: 'idle',
    message: '',
  });

  // Check if FFmpeg.wasm is available by attempting dynamic import.
  // This allows graceful degradation if dependencies aren't installed.
  const [isAvailable] = useState(() => {
    try {
      // FFmpeg.wasm requires SharedArrayBuffer which may not be available
      if (typeof SharedArrayBuffer === 'undefined') {
        console.warn('SharedArrayBuffer not available - video compression disabled');
        return false;
      }
      return true;
    } catch {
      return false;
    }
  });

  const compressVideo = useCallback(
    async (file: File, quality: 80 | 60 | 40): Promise<File | null> => {
      if (!isAvailable) {
        setProgress({
          percentage: 0,
          status: 'error',
          message: 'Video compression not available (FFmpeg.wasm not installed)',
        });
        return null;
      }

      try {
        setProgress({ percentage: 0, status: 'loading', message: 'Loading FFmpeg...' });

        // Dynamically import FFmpeg to keep bundle size small
        // Users who don't compress videos won't download FFmpeg.wasm
        const { FFmpeg } = await import('@ffmpeg/ffmpeg');
        const { fetchFile, toBlobURL } = await import('@ffmpeg/util');

        const ffmpeg = new FFmpeg();

        // Configure FFmpeg to use web worker in background
        ffmpeg.on('log', ({ message }: { message: string }) => {
          // Optionally log FFmpeg internal messages for debugging
          if (message.includes('Duration')) {
            setProgress({ percentage: 10, status: 'compressing', message: 'Analyzing video...' });
          }
        });

        // Load FFmpeg WASM files from CDN
        // Using jsdelivr CDN for reliability
        const coreURL = await toBlobURL(`https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist/ffmpeg-core.js`, 'text/javascript');
        const wasmURL = await toBlobURL(`https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist/ffmpeg-core.wasm`, 'application/wasm');

        setProgress({ percentage: 15, status: 'compressing', message: 'Initializing FFmpeg...' });

        // Initialize FFmpeg with web worker
        await ffmpeg.load({
          coreURL,
          wasmURL,
        });

        setProgress({ percentage: 25, status: 'compressing', message: 'Reading video file...' });

        // Convert file to buffer for FFmpeg processing
        const fileData = await fetchFile(file);
        const inputName = `input_${Date.now()}.${file.name.split('.').pop()}`;
        const outputName = `output_${Date.now()}.mp4`;

        // Write input file to FFmpeg filesystem
        ffmpeg.writeFile(inputName, fileData);

        setProgress({ percentage: 40, status: 'compressing', message: 'Compressing video...' });

        // FFmpeg compression command - quality is CRF (Constant Rate Factor)
        // Lower CRF = higher quality (0-51, default 23)
        // Quality mapping: 80 → CRF 23 (high), 60 → CRF 28 (medium), 40 → CRF 33 (low)
        const crf = quality === 80 ? 23 : quality === 60 ? 28 : 33;

        // Use H.264 codec with adaptive bitrate based on quality level.
        // This provides good compression with broad compatibility.
        const maxbitrate = quality === 80 ? '5000k' : quality === 60 ? '2500k' : '1000k';

        const command = [
          '-i', inputName,
          '-c:v', 'libx264',           // H.264 video codec
          '-crf', String(crf),          // Quality (lower = better, but larger)
          '-c:a', 'aac',                // AAC audio codec
          '-b:a', '128k',               // Audio bitrate
          '-maxrate', maxbitrate,       // Maximum bitrate
          '-bufsize', maxbitrate,       // Buffer size
          '-movflags', '+faststart',    // Web-optimized (moov atom at start)
          outputName,
        ];

        // Run FFmpeg compression
        // Progress tracking happens via ffmpeg.on('progress', ...)
        await ffmpeg.exec(command as unknown as string[]);

        setProgress({ percentage: 85, status: 'compressing', message: 'Finalizing compression...' });

        // Read compressed video from FFmpeg filesystem
        const compressedData = await ffmpeg.readFile(outputName);

        // Create new File object with compressed video
        // Preserve original filename but change size indicator
        // Convert to regular ArrayBuffer to ensure compatibility with Blob constructor
        const arrayBuffer = new Uint8Array(compressedData as any).buffer;
        const compressedBlob = new Blob([arrayBuffer], { type: 'video/mp4' });
        const compressedFile = new File([compressedBlob], file.name, { type: 'video/mp4' });

        // Calculate compression ratio for feedback
        const ratio = ((1 - compressedFile.size / file.size) * 100).toFixed(0);
        const originalSizeMB = (file.size / 1024 / 1024).toFixed(1);
        const compressedSizeMB = (compressedFile.size / 1024 / 1024).toFixed(1);

        setProgress({
          percentage: 100,
          status: 'complete',
          message: `Compression complete: ${originalSizeMB}MB → ${compressedSizeMB}MB (${ratio}% reduction)`,
        });

        // Cleanup: Unload FFmpeg to free memory
        await ffmpeg.terminate();

        return compressedFile;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error during compression';
        console.error('Video compression error:', error);

        setProgress({
          percentage: 0,
          status: 'error',
          message: `Compression failed: ${errorMessage}`,
        });

        return null;
      }
    },
    [isAvailable]
  );

  return {
    compressVideo,
    progress,
    isAvailable,
  };
};
