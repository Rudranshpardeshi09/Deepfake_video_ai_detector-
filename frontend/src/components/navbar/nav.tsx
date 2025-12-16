import React from "react";

interface NavBarProps {
  activeTab: "home" | "check";
  setActiveTab: (tab: "home" | "check") => void;
}

const NavBar: React.FC<NavBarProps> = ({ activeTab, setActiveTab }) => {
  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="logo">
          <i className="fas fa-shield-alt"></i>
          <span>DeepGuard AI</span>
        </div>
        <div className="nav-links">
          <button
            className={`nav-link ${activeTab === "home" ? "active" : ""}`}
            onClick={() => setActiveTab("home")}
          >
            Homeee
          </button>
          <button
            className={`nav-link ${activeTab === "check" ? "active" : ""}`}
            onClick={() => setActiveTab("check")}
          >
            Check
          </button>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
