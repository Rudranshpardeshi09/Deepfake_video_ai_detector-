/**
 * Main App component for the AI-generated video detection system.
 *
 * This is the root component that:
 * - Wraps the app with context providers
 * - Manages top-level routing/tabs
 * - Coordinates detection workflow
 */

import React, { useState } from 'react';
import { AppProvider } from './context/AppContext';
import Navbar from './components/layout/Navbar/Navbar';
import Footer from './components/layout/Footer/Footer';
import Home from './components/features/home/Home';
import Detection from './components/features/detection/Detection';
import Toast from './components/common/Toast/Toast';
import { useApp } from './context/AppContext';
import './styles/global.css';

/**
 * Main application content component.
 *
 * Separated from App to use context hooks (context must exist in parent).
 */
const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'home' | 'detection'>('home');
  const { toasts } = useApp();

  return (
    <div className="app" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Navigation */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main content */}
      <main
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: activeTab === 'home' ? 'flex-start' : 'center',
        }}
      >
        {activeTab === 'home' ? (
          <Home onNavigate={() => setActiveTab('detection')} />
        ) : (
          <Detection />
        )}
      </main>

      {/* Footer */}
      <Footer />

      {/* Toast notifications container */}
      <div className="toast-container" style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 1000,
        maxWidth: '400px',
        pointerEvents: 'none',
      }}>
        {toasts.map((toast) => (
          <Toast key={toast.id} {...toast} />
        ))}
      </div>
    </div>
  );
};

/**
 * Root App component with all providers.
 *
 * Wraps the entire application with necessary context providers.
 */
const App: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;
