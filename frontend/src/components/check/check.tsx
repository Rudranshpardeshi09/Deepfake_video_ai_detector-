// import React, { useState } from "react";
// import VideoUploader from "./video_uploader/VideoUploader";
// import VideoAnalyzer from "./video_analyzer/VideoAnalyzer";

// const CheckSection: React.FC = () => {
//   const [uploadedFile, setUploadedFile] = useState<File | null>(null);
//   const [analysisResult, setAnalysisResult] = useState<any>(null);
//   const [loading, setLoading] = useState(false);

//   // This function will run after upload
//   const handleFileUpload = async (file: File) => {
//     setUploadedFile(file);
//     setLoading(true);
//     setAnalysisResult(null);

//     try {
//       // Example: call your backend API to analyze video
//       const formData = new FormData();
//       formData.append("video", file);

//       const response = await fetch("http://localhost:5000/analyze", {
//         method: "POST",
//         body: formData,
//       });

//       const result = await response.json();
//       setAnalysisResult(result);
//     } catch (error) {
//       console.error("Error analyzing video:", error);
//       setAnalysisResult({ error: "Failed to analyze video." });
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <section className="check-section">
//       <h2 className="section-title">Detect Manipulated Videos</h2>
//       <p className="section-subtitle">
//         Upload a video to analyze it for potential deepfake manipulation. Our AI-powered system will provide you with a detailed analysis and confidence score.
//       </p>

//       {/* Step 1: Upload */}
//       {!uploadedFile && <VideoUploader onUpload={handleFileUpload} />}

//       {/* Step 2: Loading */}
//       {loading && (
//         <div className="loading">
//           <i className="fas fa-spinner fa-spin"></i>
//           <p>Analyzing video... please wait.</p>
//         </div>
//       )}

//       {/* Step 3: Show Analysis */}
//       {analysisResult && <VideoAnalyzer result={analysisResult} />}
//     </section>
//   );
// };

// export default CheckSection;

// import React, { useState } from "react";
// import { VideoUploader } from "../video_uploader/VideoUploader";
// import { VideoAnalyzer } from "../video_analyzer/VideoAnalyzer";
// import type { VideoDetails } from "../../types";

// const CheckSection: React.FC = () => {
//   const [video, setVideo] = useState<VideoDetails | null>(null);

//   // When user uploads a file
//   const handleVideoSelect = (url: string, file: File) => {
//     setVideo({
//       url,
//       file,
//       status: "idle",
//     });
//   };

//   // When user clicks "Analyze"
//   const handleAnalyze = async () => {
//     if (!video?.file) return;

//     setVideo((prev) => prev && { ...prev, status: "analyzing" });

//     try {
//       const formData = new FormData();
//       formData.append("video", video.file);

//       const response = await fetch("http://localhost:3000/api/analyze", {
//         method: "POST",
//         body: formData,
//       });

//       const result = await response.json();

//       setVideo((prev) =>
//         prev && {
//           ...prev,
//           status: "completed",
//           result,
//         }
//       );
//     } catch (error) {
//       console.error("Error analyzing video:", error);
//       setVideo((prev) => prev && { ...prev, status: "error" });
//     }
//   };

//   return (
//     <section className="check-section">
//       <h2 className="section-title">Detect Manipulated Videos</h2>
//       <p className="section-subtitle">
//         Upload a video to analyze it for potential deepfake manipulation. Our
//         AI-powered system will provide you with a detailed analysis and
//         confidence score.
//       </p>

//       {/* Step 1: Upload */}
//       {!video && <VideoUploader onVideoSelect={handleVideoSelect} />}

//       {/* Step 2: Analyze + Show Results */}
//       {video && <VideoAnalyzer video={video} onAnalyze={handleAnalyze} />}
//     </section>
//   );
// };

// export default CheckSection;

// import React, { useState } from "react";
// import { VideoUploader } from "../video_uploader/VideoUploader";
// import { VideoAnalyzer } from "../video_analyzer/VideoAnalyzer";
// import type { VideoDetails } from "../../types";

// const CheckSection: React.FC = () => {
//   const [video, setVideo] = useState<VideoDetails | null>(null);

//   // Step 1: When user uploads a file
//   const handleVideoSelect = (url: string, file: File) => {
//     setVideo({
//       url,
//       file,
//       status: "idle",
//     });
//   };

//   // Step 2: When user clicks "Analyze"
//   const handleAnalyze = async () => {
//     if (!video?.file) return;

//     setVideo((prev) => prev && { ...prev, status: "analyzing" });

//     try {
//       const formData = new FormData();
//       formData.append("video", video.file);

//       // ✅ Send to Node backend, which forwards to Python service
//       const response = await fetch("http://localhost:3000/api/analyze", {
//         method: "POST",
//         body: formData,
//       });

//       if (!response.ok) {
//         throw new Error(`Server error: ${response.statusText}`);
//       }

//       const result = await response.json();

//       setVideo((prev) =>
//         prev && {
//           ...prev,
//           status: "completed",
//           result, // { isDeepfake, confidence, analyzedAt, regions? }
//         }
//       );
//     } catch (error) {
//       console.error("Error analyzing video:", error);
//       setVideo((prev) => prev && { ...prev, status: "error" });
//     }
//   };

//   return (
//     <section className="check-section">
//       <h2 className="section-title">Detect Manipulated Videos</h2>
//       <p className="section-subtitle">
//         Upload a video to analyze it for potential deepfake manipulation.
//         Our AI-powered system will provide you with a detailed analysis and
//         confidence score.
//       </p>

//       {/* Step 1: Upload */}
//       {!video && <VideoUploader onVideoSelect={handleVideoSelect} />}

//       {/* Step 2: Analyze + Results */}
//       {video && (
//         <VideoAnalyzer
//           video={video}
//           onAnalyze={handleAnalyze}
//         />
//       )}
//     </section>
//   );
// };

// export default CheckSection;

import React, { useState, useCallback } from "react";
import { VideoAnalyzer } from "../video_analyzer/VideoAnalyzer";
import { VideoUploader } from "../video_uploader/VideoUploader";
import { getAnalyzeUrl } from "../../config";
import type { VideoDetails, DetectionResult } from "../../types";

const CheckSection: React.FC = () => {
  const [video, setVideo] = useState<VideoDetails | null>(null);

  const handleVideoSelect = useCallback((url: string, file: File) => {
    setVideo({ url, file, status: "idle" });
  }, []);

  const handleAnalyze = useCallback(async () => {
    if (!video?.file) return;
    setVideo((prev) => prev ? { ...prev, status: "analyzing" } : null);

    try {
      const formData = new FormData();
      formData.append("video", video.file);

      const response = await fetch(getAnalyzeUrl(), {
        method: "POST",
        body: formData,
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const errorMessage =
          typeof data?.error === "string"
            ? data.error
            : typeof data?.detail === "string"
              ? data.detail
              : Array.isArray(data?.detail)
                ? data.detail.map((d: { msg?: string }) => d.msg).join(", ")
                : "Analysis failed. Please try again.";
        setVideo((prev) =>
          prev ? { ...prev, status: "error", result: { error: errorMessage } as DetectionResult } : null
        );
        return;
      }

      if (data?.error) {
        setVideo((prev) =>
          prev ? { ...prev, status: "error", result: { ...data } as DetectionResult } : null
        );
        return;
      }

      setVideo((prev) =>
        prev ? { ...prev, status: "completed", result: data as DetectionResult } : null
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : "Network error. Please try again.";
      setVideo((prev) =>
        prev
          ? { ...prev, status: "error", result: { error: message } as DetectionResult }
          : null
      );
    }
  }, [video?.file]);

  return (
    <section className="check-section">
      <h2 className="section-title">Detect Manipulated Videos</h2>
      <p className="section-subtitle">
        Upload a video to analyze it for potential deepfake manipulation.
      </p>

      {!video && <VideoUploader onVideoSelect={handleVideoSelect} />}
      {video && <VideoAnalyzer video={video} onAnalyze={handleAnalyze} />}
    </section>
  );
};

export default CheckSection;
