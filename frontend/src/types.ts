export interface DetectionResult {
  isDeepfake: boolean;
  confidence: number;
  analyzedAt: string;
  mode?: string;
  error?: string;
  regions?: {
    x: number;
    y: number;
    width: number;
    height: number;
    confidence: number;
  }[];
}

export interface VideoDetails {
  url: string;
  file?: File;
  thumbnail?: string;
  status: 'idle' | 'analyzing' | 'completed' | 'error';
  result?: DetectionResult;
}