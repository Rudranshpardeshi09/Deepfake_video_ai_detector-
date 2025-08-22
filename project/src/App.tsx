// // import React, { useState, useCallback } from 'react';
// // import { Shield } from 'lucide-react';
// // import { VideoUploader } from './components/VideoUploader';
// // import { VideoAnalyzer } from './components/VideoAnalyzer';
// // import { HomeSection, InfoSection } from "./components/home";
// // import type { VideoDetails } from './types';

// // function App() {
// //   const [video, setVideo] = useState<VideoDetails | null>(null);

// //   const handleVideoSelect = useCallback((url: string, file: File) => {
// //     setVideo({
// //       url,
// //       file,
// //       status: 'idle',
// //     });
// //   }, []);

// //   const handleAnalyze = useCallback(async () => {
// //     if (!video?.file) return;

// //     setVideo(prev => ({
// //       ...prev!,
// //       status: 'analyzing',
// //     }));

// //     try {
// //       const formData = new FormData();
// //       formData.append('video', video.file);

// //       const response = await fetch('http://localhost:3000/api/analyze', {
// //         method: 'POST',
// //         body: formData,
// //       });

// //       if (!response.ok) {
// //         throw new Error('Analysis failed');
// //       }

// //       const result = await response.json();

// //       setVideo(prev => ({
// //         ...prev!,
// //         status: 'completed',
// //         result: {
// //           isDeepfake: result.isDeepfake,
// //           confidence: result.confidence,
// //           analyzedAt: result.analyzedAt,
// //         },
// //       }));
// //     } catch (error) {
// //       console.error('Analysis error:', error);
// //       setVideo(prev => ({
// //         ...prev!,
// //         status: 'error',
// //       }));
// //     }
// //   }, [video]);

// //   return (
// //     <div className="min-h-screen bg-gray-50">
// //       <header className="bg-white shadow">
// //         <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
// //           <div className="flex items-center space-x-3">
// //             <Shield className="h-8 w-8 text-blue-500" />
// //             <h1 className="text-2xl font-bold tracking-tight text-gray-900">
// //               Deepfake Video Detector
// //             </h1>
// //           </div>
// //         </div>
// //       </header>

// //       <main>
// //         <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
// //           <div className="space-y-8">
// //             <div className="prose">
// //               <h2>Detect Manipulated Videos</h2>
// //               <p>
// //                 Upload a video to analyze it for potential deepfake manipulation.
// //                 Our AI-powered system will provide you with a detailed analysis and
// //                 confidence score.
// //               </p>
// //             </div>

// //             <div className="grid gap-8 lg:grid-cols-2">
// //               <div>
// //                 <h3 className="mb-4 text-lg font-medium text-gray-900">
// //                   Upload Video
// //                 </h3>
// //                 <VideoUploader onVideoSelect={handleVideoSelect} />
// //               </div>

// //               {video && (
// //                 <div>
// //                   <h3 className="mb-4 text-lg font-medium text-gray-900">
// //                     Analysis Results
// //                   </h3>
// //                   <VideoAnalyzer video={video} onAnalyze={handleAnalyze} />
// //                 </div>
// //               )}
// //             </div>
// //           </div>
// //         </div>
// //       </main>
// //     </div>
// //   );
// // }

// // export default App

// import React, { useState, useCallback } from 'react';
// import { Shield } from 'lucide-react';
// import { VideoUploader } from './components/VideoUploader';
// import { VideoAnalyzer } from './components/VideoAnalyzer';
// import { HomeSection, InfoSection } from "./components/home";
// import type { VideoDetails } from './types';

// function App() {
//   const [video, setVideo] = useState<VideoDetails | null>(null);

//   const handleVideoSelect = useCallback((url: string, file: File) => {
//     setVideo({
//       url,
//       file,
//       status: 'idle',
//     });
//   }, []);

//   const handleAnalyze = useCallback(async () => {
//     if (!video?.file) return;

//     setVideo(prev => ({
//       ...prev!,
//       status: 'analyzing',
//     }));

//     try {
//       const formData = new FormData();
//       formData.append('video', video.file);

//       const response = await fetch('http://localhost:3000/api/analyze', {
//         method: 'POST',
//         body: formData,
//       });

//       if (!response.ok) {
//         throw new Error('Analysis failed');
//       }

//       const result = await response.json();

//       setVideo(prev => ({
//         ...prev!,
//         status: 'completed',
//         result: {
//           isDeepfake: result.isDeepfake,
//           confidence: result.confidence,
//           analyzedAt: result.analyzedAt,
//         },
//       }));
//     } catch (error) {
//       console.error('Analysis error:', error);
//       setVideo(prev => ({
//         ...prev!,
//         status: 'error',
//       }));
//     }
//   }, [video]);

//   return (
//     <div className="min-h-screen flex flex-col bg-gradient-to-b from-purple-600 via-pink-500 to-orange-400 text-white">

//       {/* Navbar */}
//       <nav className="flex justify-between items-center px-10 py-5 bg-black/30 backdrop-blur-md shadow-lg">
//         <div className="flex items-center gap-2">
//           <Shield className="w-6 h-6 text-blue-400" />
//           <h1 className="text-xl font-bold">Deepfake Video Detector</h1>
//         </div>
//         <div className="flex gap-5">
//           <a href="#home" className="hover:text-yellow-300 transition">Home</a>
//           <a href="#check" className="hover:text-yellow-300 transition">Check</a>
//         </div>
//       </nav>

//       {/* Home Section */}
//       <HomeSection />

//       {/* Info Section */}
//       <InfoSection />

//       {/* Upload & Analyzer Section */}
//       <main id="check">
//         <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
//           <div className="space-y-8 bg-white text-gray-800 p-8 rounded-2xl shadow-xl">
//             <div className="prose">
//               <h2 className="text-3xl font-bold">Detect Manipulated Videos</h2>
//               <p>
//                 Upload a video to analyze it for potential deepfake manipulation.
//                 Our AI-powered system will provide you with a detailed analysis and
//                 confidence score.
//               </p>
//             </div>

//             <div className="grid gap-8 lg:grid-cols-2">
//               <div>
//                 <h3 className="mb-4 text-lg font-medium text-gray-900">
//                   Upload Video
//                 </h3>
//                 <VideoUploader onVideoSelect={handleVideoSelect} />
//               </div>

//               {video && (
//                 <div>
//                   <h3 className="mb-4 text-lg font-medium text-gray-900">
//                     Analysis Results
//                   </h3>
//                   <VideoAnalyzer video={video} onAnalyze={handleAnalyze} />
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       </main>

//       {/* Footer */}
//       <footer className="bg-black/80 text-gray-300 py-10 px-10 mt-auto">
//         <div className="grid md:grid-cols-2 gap-10">
//           <div>
//             <h4 className="text-lg font-bold mb-2">Deepfake Video Detector</h4>
//             <p>© {new Date().getFullYear()} All rights reserved.</p>
//           </div>
//           <div>
//             <h4 className="text-lg font-bold mb-2">Quick Links</h4>
//             <ul className="space-y-2">
//               <li><a href="#home" className="hover:text-yellow-400 transition">Home</a></li>
//               <li><a href="#check" className="hover:text-yellow-400 transition">Check</a></li>
//             </ul>
//           </div>
//         </div>
//       </footer>
//     </div>
//   );
// }

// export default App;
// App.tsx
// import React, { useState, useEffect } from 'react';
// import './App.css';

// const App: React.FC = () => {
//   const [activeTab, setActiveTab] = useState<'home' | 'check'>('home');

//   return (
//     <div className="app">
//       <NavBar activeTab={activeTab} setActiveTab={setActiveTab} />
//       <main className="main-content">
//         {/* {activeTab === 'home' ? <HomeSection /> : <CheckSection />} */}
//         {activeTab === 'home' ? (
//           <HomeSection setActiveTab={setActiveTab} />
//         ) : (
//           <CheckSection />
//         )}
//       </main>
//       <Footer />
//     </div>
//   );
// };

// // NavBar Component
// const NavBar: React.FC<{ activeTab: string; setActiveTab: (tab: 'home' | 'check') => void }> = ({ activeTab, setActiveTab }) => {
//   return (
//     <nav className="navbar">
//       <div className="nav-container">
//         <div className="logo">
//           <i className="fas fa-shield-alt"></i>
//           <span>DeepGuard AI</span>
//         </div>
//         <div className="nav-links">
//           <button 
//             className={`nav-link ${activeTab === 'home' ? 'active' : ''}`}
//             onClick={() => setActiveTab('home')}
//           >
//             Home
//           </button>
//           <button 
//             className={`nav-link ${activeTab === 'check' ? 'active' : ''}`}
//             onClick={() => setActiveTab('check')}
//           >
//             Check
//           </button>
//         </div>
//       </div>
//     </nav>
//   );
// };

// // HomeSection Component
// // const HomeSection: React.FC = () => {
// //   return (
// //     <div className="home-section">
// //       <Hero />
// //       <InfoSection />
// //     </div>
// //   );
// // };
// const HomeSection: React.FC<{ setActiveTab: (tab: 'home' | 'check') => void }> = ({ setActiveTab }) => {
//   return (
//     <div className="home-section">
//       <Hero setActiveTab={setActiveTab} />
//       <InfoSection />
//     </div>
//   );
// };

// // Hero Component
// // const Hero: React.FC = () => {
// //   return (
// //     <section className="hero">
// //       <div className="hero-content">
// //         <h1 className="hero-title">Detect Deepfake Videos with AI Precision</h1>
// //         <p className="hero-subtitle">
// //           Our advanced AI technology analyzes videos to detect manipulation with high accuracy. 
// //           Protect yourself from synthetic media threats.
// //         </p>
// //         <button className="check-btn">Check Video Now</button>
// //       </div>
// //       <div className="hero-image">
// //         <div className="animated-shapes">
// //           <div className="shape shape-1"></div>
// //           <div className="shape shape-2"></div>
// //           <div className="shape shape-3"></div>
// //           <div className="main-icon">
// //             <i className="fas fa-film"></i>
// //           </div>
// //         </div>
// //       </div>
// //     </section>
// //   );
// // };
// const Hero: React.FC<{ setActiveTab: (tab: 'home' | 'check') => void }> = ({ setActiveTab }) => {
//   return (
//     <section className="hero">
//       <div className="hero-content">
//         <h1 className="hero-title">Detect Deepfake Videos with AI Precision</h1>
//         <p className="hero-subtitle">
//           Our advanced AI technology analyzes videos to detect manipulation with high accuracy. 
//           Protect yourself from synthetic media threats.
//         </p>
//         <button className="check-btn" onClick={() => setActiveTab('check')}>
//           Check Video Now
//         </button>
//       </div>
//       <div className="hero-image">
//         <div className="animated-shapes">
//           <div className="shape shape-1"></div>
//           <div className="shape shape-2"></div>
//           <div className="shape shape-3"></div>
//           <div className="main-icon">
//             <i className="fas fa-film"></i>
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// }

// // InfoSection Component
// const InfoSection: React.FC = () => {
//   useEffect(() => {
//     const cards = document.querySelectorAll('.info-card');
//     const observer = new IntersectionObserver((entries) => {
//       entries.forEach(entry => {
//         if (entry.isIntersecting) {
//           entry.target.classList.add('animate');
//         }
//       });
//     }, { threshold: 0.1 });
    
//     cards.forEach(card => observer.observe(card));
    
//     return () => {
//       cards.forEach(card => observer.unobserve(card));
//     };
//   }, []);

//   return (
//     <section className="info-section">
//       <h2 className="section-title">How It Works</h2>
//       <div className="cards-container">
//         <div className="info-card">
//           <div className="card-icon">
//             <i className="fas fa-upload"></i>
//           </div>
//           <h3 className="card-title">Upload Your Video</h3>
//           <p className="card-content">
//             Click the Check button and upload your video file. We support MP4, WebM, and MOV formats up to 100MB.
//           </p>
//         </div>
//         <div className="info-card">
//           <div className="card-icon">
//             <i className="fas fa-brain"></i>
//           </div>
//           <h3 className="card-title">AI Analysis</h3>
//           <p className="card-content">
//             Our advanced neural networks analyze facial movements, audio sync, and visual artifacts to detect manipulations.
//           </p>
//         </div>
//         <div className="info-card">
//           <div className="card-icon">
//             <i className="fas fa-chart-pie"></i>
//           </div>
//           <h3 className="card-title">Get Results</h3>
//           <p className="card-content">
//             Receive a detailed report with confidence scores showing the likelihood of the video being a deepfake.
//           </p>
//         </div>
//       </div>
//     </section>
//   );
// };

// // CheckSection Component
// const CheckSection: React.FC = () => {
//   const [isDragging, setIsDragging] = useState(false);
//   const [uploadedFile, setUploadedFile] = useState<File | null>(null);

//   const handleDragOver = (e: React.DragEvent) => {
//     e.preventDefault();
//     setIsDragging(true);
//   };

//   const handleDragLeave = () => {
//     setIsDragging(false);
//   };

//   const handleDrop = (e: React.DragEvent) => {
//     e.preventDefault();
//     setIsDragging(false);
//     const files = e.dataTransfer.files;
//     if (files.length) {
//       setUploadedFile(files[0]);
//     }
//   };

//   const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (e.target.files && e.target.files.length) {
//       setUploadedFile(e.target.files[0]);
//     }
//   };

//   return (
//     <section className="check-section">
//       <h2 className="section-title">Detect Manipulated Videos</h2>
//       <p className="section-subtitle">
//         Upload a video to analyze it for potential deepfake manipulation. Our AI-powered system will provide you with a detailed analysis and confidence score.
//       </p>
      
//       <div 
//         className={`upload-area ${isDragging ? 'dragging' : ''} ${uploadedFile ? 'has-file' : ''}`}
//         onDragOver={handleDragOver}
//         onDragLeave={handleDragLeave}
//         onDrop={handleDrop}
//       >
//         <div className="upload-content">
//           <i className="fas fa-cloud-upload-alt"></i>
//           <h3>Drag and drop your video here</h3>
//           <p>or</p>
//           <label htmlFor="file-input" className="file-input-label">
//             Select video
//           </label>
//           <input 
//             id="file-input"
//             type="file" 
//             accept="video/mp4,video/webm,video/quicktime"
//             onChange={handleFileSelect}
//             className="file-input"
//           />
//           <p className="supported-formats">Supported formats: MP4, WebM, MOV (max 100MB)</p>
//         </div>
//       </div>
//     </section>
//   );
// };

// // Footer Component
// const Footer: React.FC = () => {
//   return (
//     <footer className="footer">
//       <div className="footer-content">
//         <div className="footer-section">
//           <div className="footer-logo">DeepGuard AI</div>
//           <p className="footer-description">
//             Advanced deepfake detection technology to protect against synthetic media threats.
//           </p>
//         </div>
        
//         <div className="footer-section">
//           <h4 className="footer-heading">Quick Links</h4>
//           <ul className="footer-links">
//             <li><a href="#">Home</a></li>
//             <li><a href="#">Check Video</a></li>
//             <li><a href="#">How It Works</a></li>
//             <li><a href="#">Privacy Policy</a></li>
//           </ul>
//         </div>
        
//         <div className="footer-section">
//           <h4 className="footer-heading">Resources</h4>
//           <ul className="footer-links">
//             <li><a href="#">About Deepfakes</a></li>
//             <li><a href="#">Research Papers</a></li>
//             <li><a href="#">API Access</a></li>
//             <li><a href="#">Help Center</a></li>
//           </ul>
//         </div>
//       </div>
      
//       <div className="copyright">
//         <p>© 2025 DeepGuard AI. All rights reserved.</p>
//       </div>
//     </footer>
//   );
// };

// export default App;
import React, { useState } from "react";
import "./App.css";
import NavBar from "./components/navbar/nav";
import Footer from "./components/footer/footer";
import Home from "./components/home/home";
import {VideoUploader} from "./components/video_uploader/VideoUploader";


const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"home" | "check">("home");

  return (
    <div className="app">
      <NavBar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="main-content">
        {activeTab === "home" ? (
          <Home setActiveTab={setActiveTab} />
        ) : (
          <div className="check-section">
            <VideoUploader onVideoSelect={(url, file) => {
  // handle the selected video here
}} />
            <h2>Check Video Section</h2>
            <p>Upload and analyze your video here.</p>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default App;
