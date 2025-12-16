import React from "react";
import { motion } from "framer-motion";
import { Shield, Upload, CheckCircle } from "lucide-react";

interface CardProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  className?: string;
}

export function Card({ title, description, icon, className = "" }: CardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.97 }}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      viewport={{ once: true }}
      className={`p-6 bg-white/10 backdrop-blur-lg rounded-2xl shadow-lg text-center ${className}`}
    >
      {icon && <div className="text-4xl mb-4">{icon}</div>}
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-200">{description}</p>
    </motion.div>
  );
}

// ✅ Integrated Card Section
export function CardContent() {
  return (
    <section id="info" className="py-20 px-6 text-center bg-black/20 backdrop-blur-lg">
      <h2 className="text-4xl font-bold mb-10 text-white">
        How to Use Deepfake Detector
      </h2>

      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        <Card
          icon={<Upload className="text-blue-400 w-10 h-10" />}
          title="Upload Video"
          description="Go to the Check section, upload a video file you want to verify."
        />
        <Card
          icon={<Shield className="text-purple-400 w-10 h-10" />}
          title="AI Analysis"
          description="Our system processes the video and checks for deepfake traces."
        />
        <Card
          icon={<CheckCircle className="text-green-400 w-10 h-10" />}
          title="Get Results"
          description="See if the video is real or fake, with a confidence score."
        />
      </div>
    </section>
  );
}
