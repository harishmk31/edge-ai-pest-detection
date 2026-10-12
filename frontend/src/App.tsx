import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { LandingPage } from './pages/LandingPage';
import { DiagnosisPage } from './pages/DiagnosisPage';
import { PestLibraryPage } from './pages/PestLibraryPage';
import { HistoryPage } from './pages/HistoryPage';
import { PestGuidePage } from './pages/PestGuidePage';
import { fetchHealth } from './services/api';
import type { HealthStatus } from './types';

export const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<string>('landing');
  const [health, setHealth] = useState<HealthStatus | null>(null);

  useEffect(() => {
    // Initial health check
    checkHealth();

    // Poll health every 30s
    const timer = setInterval(checkHealth, 30000);
    return () => clearInterval(timer);
  }, []);

  const checkHealth = async () => {
    try {
      const data = await fetchHealth();
      setHealth(data);
    } catch (err) {
      console.warn('Backend health check warning:', err);
    }
  };

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-agri-cream selection:bg-agri-leaf selection:text-white">
      {/* Top Navbar */}
      <Navbar
        currentPage={currentPage}
        onNavigate={handleNavigate}
        health={health}
      />

      {/* Main Page Content */}
      <main className="flex-1">
        {currentPage === 'landing' && <LandingPage onNavigate={handleNavigate} />}
        {currentPage === 'diagnose' && <DiagnosisPage />}
        {currentPage === 'library' && <PestLibraryPage />}
        {currentPage === 'history' && <HistoryPage onNavigateToDiagnose={() => handleNavigate('diagnose')} />}
        {currentPage === 'assistant' && <PestGuidePage />}
      </main>

      {/* Footer */}
      <Footer onNavigate={handleNavigate} />
    </div>
  );
};

export default App;
