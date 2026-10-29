import React, { useState, useRef, useEffect } from 'react';
import { 
  Sprout, 
  Scan, 
  BookOpen, 
  History, 
  HelpCircle, 
  Menu, 
  X,
  User as UserIcon,
  ChevronDown,
  LogOut,
  LogIn,
  UserPlus,
  Globe,
  LayoutDashboard,
  Sparkles
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { HealthStatus } from '../types';
import { useAuth } from '../context/AuthContext';
import { SUPPORTED_LANGUAGES } from '../i18n';
import { KuralIcon } from './KuralIcon';

interface NavbarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  health: HealthStatus | null;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPage, onNavigate, health }) => {
  const { t, i18n } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const langDropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const hamburgerBtnRef = useRef<HTMLButtonElement>(null);

  const { user, logout } = useAuth();

  // Close dropdowns and mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (dropdownRef.current && !dropdownRef.current.contains(target)) {
        setUserDropdownOpen(false);
      }
      if (langDropdownRef.current && !langDropdownRef.current.contains(target)) {
        setLangDropdownOpen(false);
      }
      if (
        mobileMenuOpen &&
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(target) &&
        hamburgerBtnRef.current &&
        !hamburgerBtnRef.current.contains(target)
      ) {
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [mobileMenuOpen]);

  // Handle ESC key to close open menus
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (mobileMenuOpen) {
          setMobileMenuOpen(false);
          hamburgerBtnRef.current?.focus();
        }
        setUserDropdownOpen(false);
        setLangDropdownOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  // Dynamic navigation items based on authentication state
  const navItems = user
    ? [
        { id: 'profile', label: t('nav.profile', 'Profile'), icon: UserIcon },
        { id: 'dashboard', label: t('nav.dashboard'), icon: LayoutDashboard },
        { id: 'diagnose', label: t('nav.diagnose'), icon: Scan },
        { id: 'kural', label: t('nav.kural'), icon: KuralIcon },
        { id: 'history', label: t('nav.history'), icon: History },
        { id: 'library', label: t('nav.library'), icon: BookOpen },
        { id: 'field-guide', label: t('nav.guide'), icon: HelpCircle },
      ]
    : [
        { id: 'landing', label: t('nav.home'), icon: Sprout },
        { id: 'features', label: t('nav.features'), icon: Sparkles },
      ];

  const handleNav = (id: string) => {
    if (id === 'features') {
      onNavigate('landing');
      setTimeout(() => {
        const workflowEl = document.getElementById('workflow-section');
        if (workflowEl) {
          workflowEl.scrollIntoView({ behavior: 'smooth' });
        }
      }, 50);
      setMobileMenuOpen(false);
      return;
    }

    if (!user && (id === 'diagnose' || id === 'history' || id === 'dashboard' || id === 'kural' || id === 'field-guide' || id === 'profile' || id === 'library')) {
      setMobileMenuOpen(false);
      setUserDropdownOpen(false);
      onNavigate('login');
      return;
    }

    onNavigate(id);
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
    setLangDropdownOpen(false);
  };

  const handleLanguageChange = (langCode: string) => {
    i18n.changeLanguage(langCode);
    setLangDropdownOpen(false);
  };

  const currentLang = SUPPORTED_LANGUAGES.find((l) => l.code === i18n.language) || SUPPORTED_LANGUAGES[0];

  const isModelOnline = health?.model?.loaded ?? false;
  const isDbConnected = health?.database?.connected ?? false;

  const userInitials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'U';

  return (
    <header className="sticky top-0 z-40 bg-forest-950/95 backdrop-blur-md border-b border-forest-800 text-white shadow-soft">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Brand */}
          <div 
            onClick={() => handleNav(user ? 'dashboard' : 'landing')}
            className="flex items-center gap-2.5 cursor-pointer group shrink-0"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                handleNav(user ? 'dashboard' : 'landing');
              }
            }}
            aria-label="AgriVision AI Home"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-agri-leaf to-forest-700 flex items-center justify-center shadow-md border border-forest-600/50 group-hover:scale-105 transition-transform">
              <Sprout className="w-5 h-5 text-agri-lime" />
            </div>
            <div>
              <span className="text-lg sm:text-xl font-display font-bold tracking-tight text-white flex items-center gap-1.5 whitespace-nowrap">
                AgriVision <span className="text-agri-lime font-mono text-xs px-1.5 py-0.5 rounded bg-forest-900 border border-forest-700">AI</span>
              </span>
              <p className="text-[10px] text-gray-400 font-medium tracking-wide uppercase hidden sm:block truncate">
                {t('nav.brand_sub')}
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNav(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-forest-800 text-agri-lime shadow-sm border border-forest-700/60'
                      : 'text-gray-300 hover:text-white hover:bg-forest-900/60'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-agri-lime' : 'text-gray-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Desktop Right Controls: Language Selector, Status & Auth */}
          <div className="hidden lg:flex items-center gap-2.5 xl:gap-3 shrink-0">
            {/* Language Selector Dropdown */}
            <div className="relative" ref={langDropdownRef}>
              <button
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-forest-900/90 border border-forest-700 hover:border-forest-600 hover:bg-forest-800 text-xs text-gray-200 transition shadow-sm whitespace-nowrap"
                aria-label="Select website language"
                aria-expanded={langDropdownOpen}
              >
                <Globe className="w-3.5 h-3.5 text-agri-lime" />
                <span className="font-medium text-xs">{currentLang.nativeName}</span>
                <ChevronDown className="w-3 h-3 text-gray-400" />
              </button>

              {langDropdownOpen && (
                <div className="absolute right-0 mt-2 w-36 bg-forest-900 border border-forest-700 rounded-xl shadow-xl py-1 z-50 text-xs animate-fadeIn">
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => handleLanguageChange(lang.code)}
                      className={`w-full px-3 py-2 text-left flex items-center justify-between transition ${
                        i18n.language === lang.code
                          ? 'bg-forest-800 text-agri-lime font-bold'
                          : 'text-gray-300 hover:bg-forest-800 hover:text-white'
                      }`}
                    >
                      <span>{lang.nativeName}</span>
                      {i18n.language === lang.code && (
                        <span className="w-1.5 h-1.5 rounded-full bg-agri-lime"></span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* System Status Pill */}
            <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-full bg-forest-900/80 border border-forest-800 text-[11px] whitespace-nowrap">
              <span className="relative flex h-2 w-2">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isModelOnline ? 'bg-agri-lime' : 'bg-amber-400'}`}></span>
                <span className={`relative inline-flex rounded-full h-2 w-2 ${isModelOnline ? 'bg-agri-lime' : 'bg-amber-500'}`}></span>
              </span>
              <span className="text-gray-300">
                {isModelOnline ? t('nav.model_online') : t('nav.model_offline')}
              </span>
            </div>

            {/* Authentication Area */}
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-forest-900/90 border border-forest-700 hover:border-forest-600 hover:bg-forest-800 transition shadow-sm"
                  aria-expanded={userDropdownOpen}
                  aria-label="User account menu"
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-agri-leaf to-forest-700 flex items-center justify-center text-[10px] font-bold font-display text-white border border-agri-lime/40">
                    {userInitials}
                  </div>
                  <span className="text-xs font-semibold text-gray-200 max-w-[90px] xl:max-w-[120px] truncate">
                    {user.name}
                  </span>
                  <ChevronDown className="w-3 h-3 text-gray-400" />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-xl border border-agri-border py-2 text-forest-950 animate-fadeIn z-50">
                    <div className="px-4 py-3 border-b border-agri-border/70">
                      <p className="text-xs font-bold text-forest-950 truncate">{user.name}</p>
                      <p className="text-[11px] text-gray-500 truncate">{user.email}</p>
                    </div>

                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        onNavigate('profile');
                      }}
                      className="w-full px-4 py-2 text-left text-xs font-medium text-gray-700 hover:bg-agri-cream flex items-center gap-2.5 transition"
                    >
                      <UserIcon className="w-4 h-4 text-agri-leaf" />
                      <span>{t('nav.profile')}</span>
                    </button>

                    <button
                      onClick={() => handleNav('dashboard')}
                      className="w-full px-4 py-2 text-left text-xs font-medium text-gray-700 hover:bg-agri-cream flex items-center gap-2.5 transition"
                    >
                      <LayoutDashboard className="w-4 h-4 text-agri-leaf" />
                      <span>{t('nav.dashboard')}</span>
                    </button>

                    <button
                      onClick={() => handleNav('history')}
                      className="w-full px-4 py-2 text-left text-xs font-medium text-gray-700 hover:bg-agri-cream flex items-center gap-2.5 transition"
                    >
                      <History className="w-4 h-4 text-agri-leaf" />
                      <span>{t('nav.diagnosis_history')}</span>
                    </button>

                    <div className="border-t border-agri-border/70 my-1"></div>

                    <button
                      onClick={async () => {
                        setUserDropdownOpen(false);
                        await logout();
                        onNavigate('landing');
                      }}
                      className="w-full px-4 py-2 text-left text-xs font-medium text-red-600 hover:bg-red-50 flex items-center gap-2.5 transition"
                    >
                      <LogOut className="w-4 h-4 text-red-500" />
                      <span>{t('nav.logout')}</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onNavigate('login')}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-200 hover:text-white hover:bg-forest-900 border border-transparent transition flex items-center gap-1.5"
                >
                  <LogIn className="w-3.5 h-3.5 text-gray-400" />
                  <span>{t('nav.login')}</span>
                </button>
                <button
                  onClick={() => onNavigate('signup')}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-agri-leaf hover:bg-forest-700 text-white shadow-sm border border-forest-600 transition flex items-center gap-1.5"
                >
                  <UserPlus className="w-3.5 h-3.5 text-agri-lime" />
                  <span>{t('nav.signup')}</span>
                </button>
              </div>
            )}
          </div>

          {/* Accessible Hamburger Menu Button (Tablet & Mobile) */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={() => {
                const nextLang = i18n.language === 'en' ? 'ta' : i18n.language === 'ta' ? 'hi' : 'en';
                handleLanguageChange(nextLang);
              }}
              className="p-1.5 rounded-lg text-xs bg-forest-900 border border-forest-700 text-agri-lime flex items-center gap-1"
              aria-label="Cycle language"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{currentLang.nativeName}</span>
            </button>

            <button
              ref={hamburgerBtnRef}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-gray-300 hover:text-white hover:bg-forest-800 transition focus:outline-none focus:ring-2 focus:ring-agri-leaf"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-navigation-menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Accessible Responsive Mobile Drawer */}
      {mobileMenuOpen && (
        <div 
          id="mobile-navigation-menu"
          ref={mobileMenuRef}
          className="lg:hidden border-t border-forest-800 bg-forest-950 px-4 pt-3 pb-6 space-y-4 shadow-2xl animate-fadeIn"
        >
          {/* Mobile Language Switcher Row */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-forest-900 border border-forest-800">
            <div className="flex items-center gap-2 text-xs text-gray-300 font-medium">
              <Globe className="w-4 h-4 text-agri-lime" />
              <span>{t('nav.language')}:</span>
            </div>
            <div className="flex items-center gap-1">
              {SUPPORTED_LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleLanguageChange(lang.code)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                    i18n.language === lang.code
                      ? 'bg-agri-leaf text-white shadow-xs'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {lang.nativeName}
                </button>
              ))}
            </div>
          </div>

          {/* User Profile or Sign-in Row */}
          {user ? (
            <div className="p-3.5 bg-forest-900/90 rounded-2xl border border-forest-700 flex items-center justify-between">
              <div 
                onClick={() => {
                  setMobileMenuOpen(false);
                  onNavigate('profile');
                }}
                className="flex items-center gap-2.5 cursor-pointer group"
              >
                <div className="w-9 h-9 rounded-full bg-agri-leaf flex items-center justify-center text-xs font-bold text-white border border-agri-lime/30">
                  {userInitials}
                </div>
                <div>
                  <div className="text-xs font-bold text-white group-hover:text-agri-lime transition-colors">
                    {user.name}
                  </div>
                  <div className="text-[10px] text-gray-400">{user.email}</div>
                </div>
              </div>
              <button
                onClick={async () => {
                  setMobileMenuOpen(false);
                  await logout();
                  onNavigate('landing');
                }}
                className="text-xs text-red-400 hover:text-red-300 font-medium px-2.5 py-1.5 rounded-lg bg-forest-950 border border-forest-800 transition"
              >
                {t('nav.logout')}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onNavigate('login');
                }}
                className="w-full py-2.5 rounded-xl text-xs font-semibold bg-forest-900 text-white border border-forest-700 hover:bg-forest-800 transition text-center flex items-center justify-center gap-1.5"
              >
                <LogIn className="w-3.5 h-3.5 text-gray-400" />
                <span>{t('nav.login')}</span>
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onNavigate('signup');
                }}
                className="w-full py-2.5 rounded-xl text-xs font-semibold bg-agri-leaf text-white border border-forest-600 hover:bg-forest-700 transition text-center flex items-center justify-center gap-1.5"
              >
                <UserPlus className="w-3.5 h-3.5 text-agri-lime" />
                <span>{t('nav.signup')}</span>
              </button>
            </div>
          )}

          {/* Mobile Nav Links */}
          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNav(item.id)}
                  className={`flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm font-medium transition ${
                    isActive
                      ? 'bg-forest-800 text-agri-lime border border-forest-700 shadow-sm'
                      : 'text-gray-300 hover:bg-forest-900 hover:text-white'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-agri-lime' : 'text-gray-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Mobile Footer Status */}
          <div className="pt-3 border-t border-forest-800 flex items-center justify-between text-xs text-gray-400">
            <span className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${isModelOnline ? 'bg-agri-lime' : 'bg-amber-400'}`} />
              {isModelOnline ? t('nav.model_classes') : t('nav.model_offline')}
            </span>
            <span>{isDbConnected ? t('nav.db_atlas') : t('nav.db_local')}</span>
          </div>
        </div>
      )}
    </header>
  );
};
