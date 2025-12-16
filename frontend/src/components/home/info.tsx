import React, { useEffect } from "react";

const InfoSection: React.FC = () => {
  useEffect(() => {
    const cards = document.querySelectorAll(".info-card");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate");
          }
        });
      },
      { threshold: 0.1 }
    );

    cards.forEach((card) => observer.observe(card));

    return () => {
      cards.forEach((card) => observer.unobserve(card));
    };
  }, []);

  return (
    <section className="info-section">
      <h2 className="section-title">How It Works</h2>
      <div className="cards-container">
        <div className="info-card">
          <div className="card-icon">
            <i className="fas fa-upload"></i>
          </div>
          <h3 className="card-title">Upload Your Video</h3>
          <p className="card-content">
            Click the Check button and upload your video file. We support MP4,
            WebM, and MOV formats up to 100MB.
          </p>
        </div>

        <div className="info-card">
          <div className="card-icon">
            <i className="fas fa-brain"></i>
          </div>
          <h3 className="card-title">AI Analysis</h3>
          <p className="card-content">
            Our advanced neural networks analyze facial movements, audio sync,
            and visual artifacts to detect manipulations.
          </p>
        </div>

        <div className="info-card">
          <div className="card-icon">
            <i className="fas fa-chart-pie"></i>
          </div>
          <h3 className="card-title">Get Results</h3>
          <p className="card-content">
            Receive a detailed report with confidence scores showing the
            likelihood of the video being a deepfake.
          </p>
        </div>
      </div>
    </section>
  );
};

export default InfoSection;
