import React from "react";

const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <div className="footer-logo">DeepGuard AI</div>
          <p className="footer-description">
            Advanced deepfake detection technology to protect against synthetic media threats.
          </p>
        </div>

        <div className="footer-section">
          <h4 className="footer-heading">Quick Links</h4>
          <ul className="footer-links">
            <li><a href="#">Home</a></li>
            <li><a href="#">Check Video</a></li>
            <li><a href="#">How It Works</a></li>
            <li><a href="#">Privacy Policy</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4 className="footer-heading">Resources</h4>
          <ul className="footer-links">
            <li><a href="#">About Deepfakes</a></li>
            <li><a href="#">Research Papers</a></li>
            <li><a href="#">API Access</a></li>
            <li><a href="#">Help Center</a></li>
          </ul>
        </div>
      </div>

      <div className="copyright">
        <p>© 2025 DeepGuard AI. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
