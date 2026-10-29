import React, { useEffect } from 'react';
import { X, Mail, Calendar, Scan, LogOut, Shield } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';

interface ProfileModalProps {
  onNavigateToHistory: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ onNavigateToHistory }) => {
  const { t } = useTranslation();
  const { user, isProfileModalOpen, closeProfileModal, logout } = useAuth();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeProfileModal();
    };
    if (isProfileModalOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isProfileModalOpen, closeProfileModal]);

  if (!isProfileModalOpen || !user) return null;

  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const formattedDate = user.created_at
    ? new Date(user.created_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Recent';

  const handleGoToHistory = () => {
    closeProfileModal();
    onNavigateToHistory();
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div 
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-agri-border overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative bg-gradient-to-r from-forest-950 via-forest-900 to-forest-800 p-6 text-white text-center">
          <button
            onClick={closeProfileModal}
            className="absolute top-4 right-4 p-2 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>

          {/* User Initials Avatar */}
          <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-agri-leaf to-forest-700 flex items-center justify-center shadow-xl border-2 border-agri-lime/40 text-xl font-bold font-display text-white mb-3">
            {initials}
          </div>

          <h2 className="text-lg font-bold font-display text-white tracking-tight">
            {user.name}
          </h2>
          <p className="text-xs text-agri-lime font-mono flex items-center justify-center gap-1.5 mt-0.5">
            <Shield className="w-3.5 h-3.5" />
            <span>Authenticated Farmer Account</span>
          </p>
        </div>

        {/* Content Details */}
        <div className="p-6 space-y-4">
          <div className="bg-agri-cream/40 rounded-2xl p-4 border border-agri-border space-y-3 text-xs">
            <div className="flex items-center justify-between pb-2.5 border-b border-agri-border">
              <span className="text-gray-500 flex items-center gap-2">
                <Mail className="w-4 h-4 text-agri-leaf" />
                <span>{t('auth.email_label')}</span>
              </span>
              <span className="font-semibold text-forest-950 font-mono">{user.email}</span>
            </div>

            <div className="flex items-center justify-between pb-2.5 border-b border-agri-border">
              <span className="text-gray-500 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-agri-leaf" />
                <span>{t('profile.member_since')}</span>
              </span>
              <span className="font-semibold text-forest-950">{formattedDate}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-500 flex items-center gap-2">
                <Scan className="w-4 h-4 text-agri-leaf" />
                <span>{t('profile.scans_count')}</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-forest-900 text-agri-lime font-bold font-mono">
                {user.total_diagnoses ?? 0}
              </span>
            </div>
          </div>

          <button
            onClick={handleGoToHistory}
            className="w-full py-3 px-4 rounded-xl bg-forest-900 hover:bg-forest-800 text-white font-semibold text-xs shadow-sm hover:shadow transition flex items-center justify-center gap-2"
          >
            <Scan className="w-4 h-4 text-agri-lime" />
            <span>{t('profile.history_btn')}</span>
          </button>

          <button
            onClick={handleLogout}
            className="w-full py-2.5 px-4 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 font-semibold text-xs border border-red-200 transition flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            <span>{t('profile.logout_btn')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
