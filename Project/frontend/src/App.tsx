import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { LandingPage } from './pages/LandingPage';
import { AuthPage } from './pages/AuthPage';
import { DashboardPage } from './pages/DashboardPage';
import { DiagnosisPage } from './pages/DiagnosisPage';
import { PestLibraryPage } from './pages/PestLibraryPage';
import { HistoryPage } from './pages/HistoryPage';
import { PestGuidePage } from './pages/PestGuidePage';
import { KuralAssistantPage } from './pages/KuralAssistantPage';
import { ProfilePage } from './pages/ProfilePage';
import { AuthModal } from './components/AuthModal';
import { ProfileModal } from './components/ProfileModal';
import { AuthProvider, useAuth } from './context/AuthContext';
import { fetchHealth } from './services/api';
import type { HealthStatus } from './types';

export type PageRoute = 
  | 'landing' 
  | 'login' 
  | 'signup' 
  | 'dashboard' 
  | 'diagnose' 
  | 'kural' 
  | 'library' 
  | 'history' 
  | 'field-guide' 
  | 'profile';

export const PROTECTED_ROUTES: PageRoute[] = [
  'dashboard', 
  'diagnose', 
  'kural', 
  'history', 
  'library',
  'field-guide', 
  'profile'
];

export function getPathForRoute(route: string): string {
  switch (route) {
    case 'landing': return '/';
    case 'login': return '/login';
    case 'signup': return '/signup';
    case 'dashboard': return '/dashboard';
    case 'diagnose': return '/diagnosis';
    case 'kural': return '/kural';
    case 'library': return '/pest-library';
    case 'history': return '/history';
    case 'field-guide': return '/field-guide';
    case 'profile': return '/profile';
    default: return '/';
  }
}

export function getRouteForPath(pathname: string): PageRoute {
  const cleanPath = pathname.toLowerCase().replace(/\/+$/, '') || '/';
  if (cleanPath === '/' || cleanPath === '') return 'landing';
  if (cleanPath === '/login') return 'login';
  if (cleanPath === '/signup') return 'signup';
  if (cleanPath === '/dashboard') return 'dashboard';
  if (cleanPath === '/diagnosis' || cleanPath === '/diagnose') return 'diagnose';
  if (cleanPath === '/kural') return 'kural';
  if (cleanPath === '/pest-library' || cleanPath === '/library') return 'library';
  if (cleanPath === '/history') return 'history';
  if (cleanPath === '/field-guide' || cleanPath === '/guide' || cleanPath === '/assistant') return 'field-guide';
  if (cleanPath === '/profile') return 'profile';
  return 'landing';
}

const MainApp: React.FC = () => {
  const { user, isLoading: authLoading, setRedirectTarget } = useAuth();
  const [currentPage, setCurrentPage] = useState<PageRoute>('landing');
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [kuralContext, setKuralContext] = useState<{ pestName?: string; diagnosisId?: string } | null>(null);

  // Initialize route from current URL path
  useEffect(() => {
    if (authLoading) return;

    const initialRoute = getRouteForPath(window.location.pathname);
    if (!user && PROTECTED_ROUTES.includes(initialRoute)) {
      setRedirectTarget(initialRoute);
      setCurrentPage('login');
      if (window.location.pathname !== '/login') {
        window.history.replaceState({}, '', '/login');
      }
    } else {
      setCurrentPage(initialRoute);
    }
  }, [user, authLoading, setRedirectTarget]);

  // Synchronize browser forward / back button navigation
  useEffect(() => {
    const handlePopState = () => {
      const route = getRouteForPath(window.location.pathname);
      if (!user && PROTECTED_ROUTES.includes(route)) {
        setRedirectTarget(route);
        setCurrentPage('login');
        window.history.replaceState({}, '', '/login');
      } else {
        setCurrentPage(route);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [user, setRedirectTarget]);

  // Periodic health check
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const data = await fetchHealth();
        setHealth(data);
      } catch (err) {
        console.warn('Backend health check warning:', err);
      }
    };

    checkHealth();
    const timer = setInterval(checkHealth, 30000);
    return () => clearInterval(timer);
  }, []);

  // Central navigation handler
  const handleNavigate = (page: string, context?: { pestName?: string; diagnosisId?: string }) => {
    if (context) {
      setKuralContext(context);
    }

    let targetRoute = getRouteForPath(page);
    if (
      page === 'diagnose' || 
      page === 'dashboard' || 
      page === 'kural' || 
      page === 'library' || 
      page === 'history' || 
      page === 'field-guide' || 
      page === 'profile' || 
      page === 'login' || 
      page === 'signup' || 
      page === 'landing'
    ) {
      targetRoute = page as PageRoute;
    }

    // Protect private authenticated routes
    if (!user && PROTECTED_ROUTES.includes(targetRoute)) {
      setRedirectTarget(targetRoute);
      targetRoute = 'login';
    }

    setCurrentPage(targetRoute);
    const newPath = getPathForRoute(targetRoute);
    if (window.location.pathname !== newPath) {
      window.history.pushState({}, '', newPath);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAuthSuccess = (target: string | null) => {
    // Phase 1 requirement: redirect to user's profile page after login/signup
    const destination = target || 'profile';
    handleNavigate(destination);
  };

  return (
    <div className="min-h-screen flex flex-col bg-agri-cream selection:bg-agri-leaf selection:text-white">
      {/* Top Navigation */}
      <Navbar
        currentPage={currentPage}
        onNavigate={handleNavigate}
        health={health}
      />

      {/* Main Pages */}
      <main className="flex-1">
        {currentPage === 'landing' && <LandingPage onNavigate={handleNavigate} />}
        {currentPage === 'login' && (
          <AuthPage
            initialTab="login"
            onNavigate={handleNavigate}
            onSuccess={handleAuthSuccess}
          />
        )}
        {currentPage === 'signup' && (
          <AuthPage
            initialTab="signup"
            onNavigate={handleNavigate}
            onSuccess={handleAuthSuccess}
          />
        )}
        {currentPage === 'dashboard' && <DashboardPage onNavigate={handleNavigate} />}
        {currentPage === 'diagnose' && (
          <DiagnosisPage
            onAskKural={(pestName, diagnosisId) =>
              handleNavigate('kural', { pestName, diagnosisId })
            }
          />
        )}
        {currentPage === 'library' && (
          <PestLibraryPage
            onAskKural={(pestName) => handleNavigate('kural', { pestName })}
          />
        )}
        {currentPage === 'history' && (
          <HistoryPage onNavigateToDiagnose={() => handleNavigate('diagnose')} />
        )}
        {currentPage === 'kural' && (
          <KuralAssistantPage
            initialContext={kuralContext}
            onClearContext={() => setKuralContext(null)}
          />
        )}
        {currentPage === 'field-guide' && <PestGuidePage />}
        {currentPage === 'profile' && <ProfilePage onNavigate={handleNavigate} />}
      </main>

      {/* Auth Modal & Profile Modal for fallback popup actions */}
      <AuthModal onSuccess={handleAuthSuccess} />
      <ProfileModal onNavigateToHistory={() => handleNavigate('history')} />

      {/* Footer */}
      <Footer onNavigate={handleNavigate} />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
};

export default App;
