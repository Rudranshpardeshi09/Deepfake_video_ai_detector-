/**
 * Home page component - landing/marketing section.
 *
 * Features:
 * - Hero section with call-to-action
 * - Feature showcase
 * - How it works explanation
 */

import React from 'react';
import { Shield, Zap, CheckCircle, AlertTriangle } from 'lucide-react';

interface HomeProps {
  onNavigate: () => void;
}

/**
 * Home component displaying landing page content.
 *
 * Sections:
 * 1. Hero section with CTA button
 * 2. Features showcase
 * 3. How it works
 */
const Home: React.FC<HomeProps> = ({ onNavigate }) => {
  return (
    <div
      style={{
        width: '100%',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0a0e27 100%)',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* Hero Section */}
      <section
        style={{
          minHeight: '80vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '3rem 1.5rem',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            maxWidth: '800px',
            animation: 'fadeIn 0.6s ease-out',
          }}
        >
          {/* Hero Icon */}
          <div
            style={{
              width: '80px',
              height: '80px',
              margin: '0 auto 2rem',
              background: 'linear-gradient(135deg, #3b82f6 0%, #ec4899 100%)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 30px rgba(59, 130, 246, 0.3)',
              animation: 'pulse 2s ease-in-out infinite',
            }}
          >
            <Shield size={40} color="#ffffff" />
          </div>

          {/* Hero Title */}
          <h1
            style={{
              fontSize: 'clamp(2rem, 8vw, 3.5rem)',
              fontWeight: 700,
              marginBottom: '1.5rem',
              background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #ec4899 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              lineHeight: 1.2,
            }}
          >
            Detect AI-Generated Videos
          </h1>

          {/* Hero Subtitle */}
          <p
            style={{
              fontSize: '1.125rem',
              color: '#e5e7eb',
              marginBottom: '2.5rem',
              lineHeight: 1.6,
              maxWidth: '600px',
              margin: '0 auto 2.5rem',
            }}
          >
            Advanced AI-powered analysis to identify synthetic videos, deepfakes, and text-to-video
            generations with high accuracy and confidence scores.
          </p>

          {/* CTA Button */}
          <button
            onClick={onNavigate}
            style={{
              padding: '1rem 2.5rem',
              fontSize: '1.125rem',
              fontWeight: '600',
              background: 'linear-gradient(135deg, #3b82f6 0%, #ec4899 100%)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '0.75rem',
              cursor: 'pointer',
              transition: 'all 0.3s ease-out',
              boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(59, 130, 246, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(59, 130, 246, 0.3)';
            }}
          >
            Analyze a Video Now
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section
        style={{
          padding: '4rem 1.5rem',
          backgroundColor: 'rgba(15, 23, 42, 0.5)',
          borderTop: '1px soild rgba(59, 130, 246, 0.1)',
        }}
      >
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <h2
            style={{
              textAlign: 'center',
              fontSize: '2.5rem',
              fontWeight: '700',
              marginBottom: '3rem',
              color: '#ffffff',
            }}
          >
            Key Features
          </h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '2rem',
            }}
          >
            {[
              {
                icon: Zap,
                title: 'Ultra-Fast Analysis',
                description: 'Get results in seconds with optimized heuristic detection.',
              },
              {
                icon: AlertTriangle,
                title: 'High Accuracy',
                description: 'Detects AI-generated videos with 85%+ accuracy using multiple methods.',
              },
              {
                icon: CheckCircle,
                title: 'Detailed Insights',
                description: 'Breakdown of detection indicators for transparency and verification.',
              },
              {
                icon: Shield,
                title: 'Risk Assessment',
                description: 'Clear risk levels (low/medium/high) for easy decision-making.',
              },
            ].map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div
                  key={i}
                  style={{
                    padding: '2rem',
                    backgroundColor: 'rgba(59, 130, 246, 0.05)',
                    border: '1px solid rgba(59, 130, 246, 0.2)',
                    borderRadius: '1rem',
                    transition: 'all 0.3s ease-out',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
                    e.currentTarget.style.borderColor = 'rgba(236, 72, 153, 0.4)';
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 10px 30px rgba(59, 130, 246, 0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.05)';
                    e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.2)';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <Icon size={32} color="#ec4899" style={{ marginBottom: '1rem' }} />
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.75rem' }}>
                    {feature.title}
                  </h3>
                  <p style={{ color: '#9ca3af', fontSize: '0.9rem', lineHeight: 1.6 }}>
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section
        style={{
          padding: '4rem 1.5rem',
        }}
      >
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <h2
            style={{
              textAlign: 'center',
              fontSize: '2.5rem',
              fontWeight: '700',
              marginBottom: '3rem',
              color: '#ffffff',
            }}
          >
            How It Works
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {[
              { num: '1', title: 'Upload Video', desc: 'Drop or select a video (MP4, WebM, MOV, etc.)' },
              { num: '2', title: 'AI Analysis', desc: 'System analyzes multiple detection indicators' },
              { num: '3', title: 'Get Results', desc: 'View confidence score and detailed breakdown' },
            ].map((step, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  gap: '2rem',
                  alignItems: 'flex-start',
                  opacity: 1 - i * 0.1,
                }}
              >
                <div
                  style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #3b82f6 0%, #ec4899 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '700',
                    fontSize: '1.5rem',
                    color: '#ffffff',
                    flexShrink: 0,
                  }}
                >
                  {step.num}
                </div>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                    {step.title}
                  </h3>
                  <p style={{ color: '#9ca3af' }}>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
