import React from "react";

interface HeroProps {
  setActiveTab: (tab: "home" | "check") => void;
}

const Hero: React.FC<HeroProps> = ({ setActiveTab }) => {
  return (
    <section className="hero">
      <div className="hero-content">
        <h1 className="hero-title">Detect Deepfake Videos with AI Precision</h1>
        <p className="hero-subtitle">
          Our advanced AI technology analyzes videos to detect manipulation with
          high accuracy. Protect yourself from synthetic media threats.
        </p>
        <button className="check-btn" onClick={() => setActiveTab("check")}>
          Check Video Now
        </button>
      </div>

      <div className="hero-image">
        <div className="animated-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
          <div className="main-icon">
            <i className="fas fa-film"></i>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
