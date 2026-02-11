/**
 * Footer component with multiple sections.
 *
 * Features:
 * - Product/company information
 * - Quick links
 * - Social media links
 * - Copyright and credits
 * - Responsive multi-column layout on desktop, stacked on mobile
 */

import React from 'react';
import { Github, Linkedin, Twitter } from 'lucide-react';

/**
 * Footer component for the application.
 *
 * Displays company info, links, and social media.
 * Responsive design stacks vertically on mobile.
 */
const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      style={{
        backgroundColor: 'rgba(10, 14, 39, 0.8)',
        borderTop: '1px solid rgba(59, 130, 246, 0.2)',
        color: '#e5e7eb',
        marginTop: 'auto',
      }}
    >
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '3rem 1.5rem 2rem',
        }}
      >
        {/* Main footer content - responsive grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '2rem',
            marginBottom: '2rem',
          }}
        >
          {/* Brand Section */}
          <div>
            <h3
              style={{
                fontSize: '1.25rem',
                fontWeight: '700',
                marginBottom: '1rem',
                background: 'linear-gradient(135deg, #3b82f6 0%, #ec4899 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              VideoDetect AI
            </h3>
            <p style={{ fontSize: '0.875rem', lineHeight: '1.6', color: '#9ca3af' }}>
              Advanced AI-generated video detection technology to protect against synthetic media threats.
            </p>
          </div>

          {/* Product Links */}
          <div>
            <h4
              style={{
                fontSize: '1rem',
                fontWeight: '600',
                marginBottom: '1rem',
                color: '#ffffff',
              }}
            >
              Product
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {['Features', 'Pricing', 'API', 'Documentation'].map((link) => (
                <li key={link} style={{ marginBottom: '0.5rem' }}>
                  <a
                    href="#"
                    style={{
                      color: '#9ca3af',
                      fontSize: '0.875rem',
                      textDecoration: 'none',
                      transition: 'color 0.3s ease-out',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#ec4899';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = '#9ca3af';
                    }}
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4
              style={{
                fontSize: '1rem',
                fontWeight: '600',
                marginBottom: '1rem',
                color: '#ffffff',
              }}
            >
              Company
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {['About', 'Blog', 'Careers', 'Contact'].map((link) => (
                <li key={link} style={{ marginBottom: '0.5rem' }}>
                  <a
                    href="#"
                    style={{
                      color: '#9ca3af',
                      fontSize: '0.875rem',
                      textDecoration: 'none',
                      transition: 'color 0.3s ease-out',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#ec4899';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = '#9ca3af';
                    }}
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4
              style={{
                fontSize: '1rem',
                fontWeight: '600',
                marginBottom: '1rem',
                color: '#ffffff',
              }}
            >
              Legal
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {['Privacy', 'Terms', 'Security', 'Cookies'].map((link) => (
                <li key={link} style={{ marginBottom: '0.5rem' }}>
                  <a
                    href="#"
                    style={{
                      color: '#9ca3af',
                      fontSize: '0.875rem',
                      textDecoration: 'none',
                      transition: 'color 0.3s ease-out',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#ec4899';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = '#9ca3af';
                    }}
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Social Links */}
          <div>
            <h4
              style={{
                fontSize: '1rem',
                fontWeight: '600',
                marginBottom: '1rem',
                color: '#ffffff',
              }}
            >
              Follow
            </h4>
            <div
              style={{
                display: 'flex',
                gap: '1rem',
              }}
            >
              <a
                href="#"
                style={{
                  color: '#9ca3af',
                  transition: 'color 0.3s ease-out',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#ec4899';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#9ca3af';
                }}
                aria-label="GitHub"
              >
                <Github size={20} />
              </a>
              <a
                href="#"
                style={{
                  color: '#9ca3af',
                  transition: 'color 0.3s ease-out',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#ec4899';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#9ca3af';
                }}
                aria-label="Twitter"
              >
                <Twitter size={20} />
              </a>
              <a
                href="#"
                style={{
                  color: '#9ca3af',
                  transition: 'color 0.3s ease-out',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#ec4899';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#9ca3af';
                }}
                aria-label="LinkedIn"
              >
                <Linkedin size={20} />
              </a>
            </div>
          </div>
        </div>

        {/* Footer divider */}
        <div
          style={{
            borderTop: '1px solid rgba(59, 130, 246, 0.1)',
            paddingTop: '2rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            alignItems: 'center',
          }}
        >
          {/* Copyright */}
          <p
            style={{
              fontSize: '0.875rem',
              color: '#6b7280',
              margin: 0,
              textAlign: 'center',
            }}
          >
            © {currentYear} VideoDetect AI. All rights reserved.
          </p>

          {/* Built with */}
          <p
            style={{
              fontSize: '0.75rem',
              color: '#4b5563',
              margin: 0,
              textAlign: 'center',
            }}
          >
            Built with React, TypeScript, and FastAPI for modern AI detection
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
