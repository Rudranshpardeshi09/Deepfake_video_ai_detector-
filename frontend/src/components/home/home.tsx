// import React from "react";
// import { motion } from "framer-motion";
// import { Home, Upload, Play } from "lucide-react";
// import { Button } from "../ui/button";
// import { Card, CardContent } from "../ui/card";

// export function HomeSection() {
//   return (
//     <section
//       id="home"
//       className="flex flex-col md:flex-row justify-between items-center px-10 py-20"
//     >
//       {/* Left Animated Icon */}
//       <motion.div
//         initial={{ x: -100, opacity: 0 }}
//         animate={{ x: 0, opacity: 1 }}
//         transition={{ duration: 1 }}
//         className="flex flex-col items-center gap-4"
//       >
//         <Upload className="w-28 h-28 text-yellow-300 drop-shadow-lg animate-bounce" />
//         <h2 className="text-2xl font-bold">Detect Fake Videos Easily</h2>
//       </motion.div>

//       {/* Right Button */}
//       <motion.div
//         initial={{ x: 100, opacity: 0 }}
//         animate={{ x: 0, opacity: 1 }}
//         transition={{ duration: 1 }}
//         className="mt-10 md:mt-0"
//       >
//         <a href="#check">
//           <Button className="px-8 py-4 text-lg bg-yellow-400 hover:bg-yellow-500 rounded-2xl shadow-xl animate-pulse">
//             Check
//           </Button>
//         </a>
//       </motion.div>
//     </section>
//   );
// }

// export function InfoSection() {
//   const steps = [
//     {
//       title: "Step 1: Go to Home Page",
//       desc: "On the home page, you'll find a Check button to proceed.",
//       icon: <Home className="w-12 h-12 text-purple-600" />,
//     },
//     {
//       title: "Step 2: Upload Your Video",
//       desc: "Click on Check, and you'll be taken to the Upload page where you can upload your video.",
//       icon: <Upload className="w-12 h-12 text-pink-600" />,
//     },
//     {
//       title: "Step 3: Get Results",
//       desc: "After uploading, the system will analyze your video and tell you if it's fake or real.",
//       icon: <Play className="w-12 h-12 text-orange-600" />,
//     },
//   ];

//   return (
//     <section className="px-10 py-20 bg-white text-gray-800">
//       <h2 className="text-3xl font-bold text-center mb-12">
//         How to Use Deepfake Video Detector
//       </h2>

//       <div className="grid md:grid-cols-3 gap-10">
//         {steps.map((item, i) => (
//           <motion.div
//             key={i}
//             initial={{ opacity: 0, y: 50 }}
//             whileInView={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.8, delay: i * 0.3 }}
//             viewport={{ once: true }}
//           >
//             {/* <Card className="rounded-2xl shadow-xl hover:shadow-2xl transition cursor-pointer">
//               <CardContent className="flex flex-col items-center p-6 gap-4">
//                 {item.icon}
//                 <h3 className="text-xl font-bold text-center">{item.title}</h3>
//                 <p className="text-center text-gray-600">{item.desc}</p>
//               </CardContent>
//             </Card> */}
//           </motion.div>
//         ))}
//       </div>
//     </section>
//   );
// }
import React from "react";
import Hero from "./hero";
import InfoSection from "./info";

interface HomeProps {
  setActiveTab: (tab: "home" | "check") => void;
}

const Home: React.FC<HomeProps> = ({ setActiveTab }) => {
  return (
    <div className="home-section">
      <Hero setActiveTab={setActiveTab} />
      <InfoSection />
    </div>
  );
};

export default Home;

