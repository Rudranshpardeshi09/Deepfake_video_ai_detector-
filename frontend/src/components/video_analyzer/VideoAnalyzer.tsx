// //import React from 'react';

// import { Play, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
// import type { VideoDetails } from '../../types';

// interface VideoAnalyzerProps {
//   video: VideoDetails;
//   onAnalyze: () => void;
// }

// export function VideoAnalyzer({ video, onAnalyze }: VideoAnalyzerProps) {
//   return (
//     <div className="overflow-hidden rounded-lg bg-white shadow">
//       <div className="relative aspect-video w-full">
//         <video
//           src={video.url}
//           className="h-full w-full object-cover"
//           controls
//         />
//       </div>
//       <div className="p-4">
//         {video.status === 'idle' && (
//           <button
//             onClick={onAnalyze}
//             className="flex w-full items-center justify-center space-x-2 rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
//           >
//             <Play className="h-5 w-5" />
//             <span>Analyze Video</span>
//           </button>
//         )}

//         {video.status === 'analyzing' && (
//           <div className="flex items-center justify-center space-x-2 text-blue-500">
//             <Loader2 className="h-5 w-5 animate-spin" />
//             <span>Analyzing video...</span>
//           </div>
//         )}

//         {video.status === 'completed' && video.result && (
//           <div className="space-y-4">
//             <div
//               className={`flex items-center space-x-2 ${
//                 video.result.isDeepfake ? 'text-red-500' : 'text-green-500'
//               }`}
//             >
//               {video.result.isDeepfake ? (
//                 <AlertTriangle className="h-6 w-6" />
//               ) : (
//                 <CheckCircle className="h-6 w-6" />
//               )}
//               <span className="text-lg font-medium">
//                 {video.result.isDeepfake
//                   ? 'Likely Deepfake Detected'
//                   : 'Likely Authentic Video'}
//               </span>
//             </div>
//             <div className="space-y-2">
//               <p className="text-sm text-gray-500">Confidence Score</p>
//               <div className="h-4 w-full overflow-hidden rounded-full bg-gray-200">
//                 <div
//                   className={`h-full ${
//                     video.result.isDeepfake
//                       ? 'bg-red-500'
//                       : 'bg-green-500'
//                   }`}
//                   style={{ width: `${video.result.confidence * 100}%` }}
//                 />
//               </div>
//               <p className="text-right text-sm text-gray-500">
//                 {Math.round(video.result.confidence * 100)}%
//               </p>
//             </div>
//             <p className="text-sm text-gray-500">
//               Analyzed at: {new Date(video.result.analyzedAt).toLocaleString()}
//             </p>
//           </div>
//         )}

//         {video.status === 'error' && (
//           <div className="flex items-center justify-center space-x-2 text-red-500">
//             <AlertTriangle className="h-5 w-5" />
//             <span>Error analyzing video. Please try again.</span>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

//import React from 'react';

import { Play, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import type { VideoDetails } from '../../types';

interface VideoAnalyzerProps {
  video: VideoDetails;
  onAnalyze: () => void;
}

export function VideoAnalyzer({ video, onAnalyze }: VideoAnalyzerProps) {
  return (
    // The main container is now transparent to blend with the page background.
    // We keep a max-width and margin for centering, similar to the screenshot.
    <div className="w-full max-w-2xl mx-auto">
      {/* Rounded corners are applied to the video container */}
      <div className="relative aspect-video w-full overflow-hidden rounded-lg">
        <video
          src={video.url}
          className="h-full w-full object-cover"
          controls
        />
      </div>

      {/* The controls/results section with top margin for spacing */}
      <div className="mt-4">
        {video.status === 'idle' && (
          <button
            onClick={onAnalyze}
            className="flex w-full items-center justify-center space-x-2 rounded-md bg-blue-600 px-4 py-2.5 font-semibold text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900"
          >
            <Play className="h-5 w-5" />
            <span>Analyze Video</span>
          </button>
        )}

        {video.status === 'analyzing' && (
          <div className="flex items-center justify-center space-x-2 text-slate-300">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Analyzing video...</span>
          </div>
        )}

        {video.status === 'completed' && video.result && (
          <div className="space-y-4 rounded-lg bg-slate-800/50 p-4">
            <div
              className={`flex items-center space-x-2 ${
                video.result.isDeepfake ? 'text-red-400' : 'text-green-400'
              }`}
            >
              {video.result.isDeepfake ? (
                <AlertTriangle className="h-6 w-6" />
              ) : (
                <CheckCircle className="h-6 w-6" />
              )}
              <span className="text-lg font-medium">
                {video.result.isDeepfake
                  ? 'Likely Deepfake Detected'
                  : 'Likely Authentic Video'}
              </span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm text-slate-400">
                <p>Confidence Score</p>
                <p>{Math.round(video.result.confidence * 100)}%</p>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-700">
                <div
                  className={`h-full ${
                    video.result.isDeepfake
                      ? 'bg-red-500'
                      : 'bg-green-500'
                  }`}
                  style={{ width: `${video.result.confidence * 100}%` }}
                />
              </div>
            </div>
            <p className="text-xs text-center text-slate-500 pt-2">
              Analyzed at: {new Date(video.result.analyzedAt).toLocaleString()}
            </p>
          </div>
        )}

        {video.status === 'error' && (
          <div className="flex items-center justify-center space-x-2 text-red-400">
            <AlertTriangle className="h-5 w-5" />
            <span>Error analyzing video. Please try again.</span>
          </div>
        )}
      </div>
    </div>
  );
}