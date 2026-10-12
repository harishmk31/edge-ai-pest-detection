import React, { useState } from 'react';
import { 
  Sprout, 
  Scan, 
  BookOpen, 
  History, 
  HelpCircle, 
  Menu, 
  X
} from 'lucide-react';
import type { HealthStatus } from '../types';

interface NavbarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  health: HealthStatus | null;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPage, onNavigate, health }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'landing', label: 'Home', icon: Sprout },
    { id: 'diagnose', label: 'AI Diagnosis', icon: Scan },
    { id: 'library', label: 'Pest Library', icon: BookOpen },
    { id: 'history', label: 'History', icon: History },
    { id: 'assistant', label: 'Field Guide', icon: HelpCircle },
  ];

  const handleNav = (id: string) => {
    onNavigate(id);
    setMobileMenuOpen(false);
  };

  const isModelOnline = health?.model?.loaded ?? false;
  const isDbConnected = health?.database?.connected ?? false;

  return (
    <header className="sticky top-0 z-50 bg-forest-950/95 backdrop-blur-md border-b border-forest-800 text-white shadow-soft">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div 
            onClick={() => handleNav('landing')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-agri-leaf to-forest-700 flex items-center justify-center shadow-md border border-forest-600/50 group-hover:scale-105 transition-transform">
              <Sprout className="w-6 h-6 text-agri-lime" />
            </div>
            <div>
              <span className="text-xl font-display font-bold tracking-tight text-white flex items-center gap-1.5">
                AgriVision <span className="text-agri-lime font-mono text-sm px-1.5 py-0.5 rounded bg-forest-900 border border-forest-700">AI</span>
              </span>
              <p className="text-[11px] text-gray-400 font-medium tracking-wide uppercase">Intelligent Pest Detection</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNav(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-forest-800 text-agri-lime shadow-sm border border-forest-700/60'
                      : 'text-gray-300 hover:text-white hover:bg-forest-900/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-agri-lime' : 'text-gray-400'}`} />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* System Status Pill */}
          <div className="hidden lg:flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-forest-900/80 border border-forest-800 text-xs">
              <span className="relative flex h-2 w-2">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isModelOnline ? 'bg-agri-lime' : 'bg-amber-400'}`}></span>
                <span className={`relative inline-flex rounded-full h-2 w-2 ${isModelOnline ? 'bg-agri-lime' : 'bg-amber-500'}`}></span>
              </span>
              <span className="text-gray-300">
                {isModelOnline ? 'YOLO11 Online' : 'Model Offline'}
              </span>
              <span className="text-gray-600">|</span>
              <span className="text-gray-400">
                {isDbConnected ? 'Atlas DB' : 'Local Storage'}
              </span>
            </div>

            <button
              onClick={() => handleNav('diagnose')}
              className="bg-agri-leaf hover:bg-agri-leaf/90 text-white font-medium text-xs px-3.5 py-2 rounded-lg shadow-sm hover:shadow transition flex items-center gap-1.5 border border-forest-600"
            >
              <Scan className="w-3.5 h-3.5 text-agri-lime" />
              <span>Diagnose Pest</span>
            </button>
          </div>

          {/* Mobile menu trigger */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-gray-300 hover:text-white hover:bg-forest-800"
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-forest-800 bg-forest-950 px-4 pt-3 pb-5 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={`flex items-center gap-3 w-full px-4 py-2.5 rounded-lg text-base font-medium transition ${
                  isActive
                    ? 'bg-forest-800 text-agri-lime border border-forest-700'
                    : 'text-gray-300 hover:bg-forest-900'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-agri-lime' : 'text-gray-400'}`} />
                {item.label}
              </button>
            );
          })}
          <div className="pt-3 border-t border-forest-800 flex items-center justify-between text-xs text-gray-400">
            <span className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${isModelOnline ? 'bg-agri-lime' : 'bg-amber-400'}`} />
              {isModelOnline ? 'Model Online (102 Classes)' : 'Model Offline'}
            </span>
            <span>{isDbConnected ? 'MongoDB Connected' : 'Local Dev Storage'}</span>
          </div>
        </div>
      )}
    </header>
  );
};
