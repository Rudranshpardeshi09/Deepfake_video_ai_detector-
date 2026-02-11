/**
 * Navigation bar component with responsive mobile menu.
 *
 * Features:
 * - Logo and branding
 * - Tab navigation
 * - Mobile hamburger menu
 * - Sticky positioning on scroll
 */

import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';

interface NavbarProps {
  activeTab: 'home' | 'detection';
  setActiveTab: (tab: 'home' | 'detection') => void;
}

/**
 * Navbar component for main application navigation.
 *
 * Provides responsive design with hamburger menu on mobile devices.
 * Uses Gradient Vibrant theme colors.
 */
const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleTabClick = (tab: 'home' | 'detection') => {
    setActiveTab(tab);
    setMobileMenuOpen(false); // Close mobile menu after selection
  };

  return (
    <nav
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backgroundColor: 'rgba(15, 23, 42, 0.8)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(59, 130, 246, 0.2)',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      }}
    >
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '1rem 1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        {/* Logo / Branding */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            cursor: 'pointer',
            fontSize: '1.5rem',
            fontWeight: 700,
            background: 'linear-gradient(135deg, #3b82f6 0%, #ec4899 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
          onClick={() => handleTabClick('home')}
        >
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #3b82f6 0%, #ec4899 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontWeight: 'bold',
            }}
          >
            AI
          </div>
          <span>VideoDetect</span>
        </div>

        {/* Desktop Navigation */}
        <div
          style={{
            display: 'none',
            gap: '2rem',
            '@media (min-width: 768px)': {
              display: 'flex',
            },
          } as React.CSSProperties & { '@media (min-width: 768px)'?: Record<string, string> }}
        >
          <button
            onClick={() => handleTabClick('home')}
            style={{
              background: 'none',
              border: 'none',
              color: activeTab === 'home' ? '#ec4899' : '#e5e7eb',
              fontSize: '1rem',
              fontWeight: activeTab === 'home' ? '600' : '400',
              cursor: 'pointer',
              transition: 'color 0.3s ease-out',
              textDecoration: activeTab === 'home' ? 'underline' : 'none',
            }}
            onMouseEnter={(e) => {
              if (activeTab !== 'home') e.currentTarget.style.color = '#ffffff';
            }}
            onMouseLeave={(e) => {
              if (activeTab !== 'home') e.currentTarget.style.color = '#e5e7eb';
            }}
          >
            Home
          </button>

          <button
            onClick={() => handleTabClick('detection')}
            style={{
              background: 'none',
              border: 'none',
              color: activeTab === 'detection' ? '#ec4899' : '#e5e7eb',
              fontSize: '1rem',
              fontWeight: activeTab === 'detection' ? '600' : '400',
              cursor: 'pointer',
              transition: 'color 0.3s ease-out',
              textDecoration: activeTab === 'detection' ? 'underline' : 'none',
            }}
            onMouseEnter={(e) => {
              if (activeTab !== 'detection') e.currentTarget.style.color = '#ffffff';
            }}
            onMouseLeave={(e) => {
              if (activeTab !== 'detection') e.currentTarget.style.color = '#e5e7eb';
            }}
          >
            Detect
          </button>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          style={{
            display: 'block',
            background: 'none',
            border: 'none',
            color: '#ffffff',
            cursor: 'pointer',
            fontSize: '1.5rem',
            '@media (min-width: 768px)': {
              display: 'none',
            },
          } as React.CSSProperties & { '@media (min-width: 768px)'?: Record<string, string> }}
          aria-label="Toggle mobile menu"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div
          style={{
            backgroundColor: 'rgba(15, 23, 42, 0.95)',
            padding: '1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            borderTop: '1px solid rgba(59, 130, 246, 0.2)',
            animation: 'slideInDown 0.3s ease-out',
          }}
        >
          <button
            onClick={() => handleTabClick('home')}
            style={{
              width: '100%',
              padding: '0.75rem',
              background: activeTab === 'home'
                ? 'linear-gradient(135deg, #3b82f6 0%, #ec4899 100%)'
                : 'rgba(59, 130, 246, 0.1)',
              border: 'none',
              borderRadius: '0.5rem',
              color: '#ffffff',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease-out',
            }}
          >
            Home
          </button>

          <button
            onClick={() => handleTabClick('detection')}
            style={{
              width: '100%',
              padding: '0.75rem',
              background: activeTab === 'detection'
                ? 'linear-gradient(135deg, #3b82f6 0%, #ec4899 100%)'
                : 'rgba(59, 130, 246, 0.1)',
              border: 'none',
              borderRadius: '0.5rem',
              color: '#ffffff',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease-out',
            }}
          >
            Detect Video
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
