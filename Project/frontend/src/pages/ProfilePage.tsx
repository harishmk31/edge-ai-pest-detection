import React from 'react';
import { 
  User as UserIcon, 
  Mail, 
  Calendar, 
  Scan, 
  History, 
  LogOut, 
  ShieldCheck, 
  Globe, 
  ArrowRight
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { SUPPORTED_LANGUAGES } from '../i18n';
import { KuralIcon } from '../components/KuralIcon';

interface ProfilePageProps {
  onNavigate: (page: string) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ onNavigate }) => {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();

  if (!user) {
    return (
      <div className="max-w-md mx-auto py-16 px-4 text-center">
        <p className="text-sm text-gray-500">Please sign in to view your profile.</p>
        <button
          onClick={() => onNavigate('login')}
          className="mt-4 px-4 py-2 bg-agri-leaf text-white text-xs font-semibold rounded-xl"
        >
          Sign In
        </button>
      </div>
    );
  }

  const initials = user.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'U';

  const formattedDate = user.created_at
    ? new Date(user.created_at).toLocaleDateString(undefined, {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Recent';

  const handleLogout = async () => {
    await logout();
    onNavigate('landing');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="bg-gradient-to-r from-forest-950 via-forest-900 to-forest-800 rounded-3xl p-6 sm:p-8 text-white border border-forest-700/80 shadow-lifted relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-agri-leaf to-forest-700 flex items-center justify-center text-2xl font-bold font-display text-white border-2 border-agri-lime/40 shadow-xl shrink-0">
            {initials}
          </div>
          <div className="space-y-1.5 text-center sm:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-forest-800 text-xs font-semibold text-agri-lime border border-forest-700">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{t('profile.title')}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-display tracking-tight text-white">
              {user.name}
            </h1>
            <p className="text-xs text-gray-300 font-mono">
              {user.email}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Account Details */}
        <div className="md:col-span-2 bg-white rounded-2xl border border-agri-border p-6 shadow-soft space-y-6">
          <h2 className="text-base font-bold font-display text-forest-950 flex items-center gap-2">
            <UserIcon className="w-4 h-4 text-agri-leaf" />
            <span>Account Details</span>
          </h2>

          <div className="divide-y divide-agri-border/60 text-xs text-gray-700">
            <div className="py-3 flex items-center justify-between">
              <span className="text-gray-500 flex items-center gap-2">
                <UserIcon className="w-4 h-4 text-agri-leaf" />
                <span>Full Name</span>
              </span>
              <strong className="text-forest-950">{user.name}</strong>
            </div>

            <div className="py-3 flex items-center justify-between">
              <span className="text-gray-500 flex items-center gap-2">
                <Mail className="w-4 h-4 text-agri-leaf" />
                <span>Email Address</span>
              </span>
              <strong className="text-forest-950 font-mono">{user.email}</strong>
            </div>

            <div className="py-3 flex items-center justify-between">
              <span className="text-gray-500 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-agri-leaf" />
                <span>{t('profile.member_since')}</span>
              </span>
              <strong className="text-forest-950">{formattedDate}</strong>
            </div>

            <div className="py-3 flex items-center justify-between">
              <span className="text-gray-500 flex items-center gap-2">
                <Scan className="w-4 h-4 text-agri-leaf" />
                <span>{t('profile.scans_count')}</span>
              </span>
              <strong className="text-agri-leaf font-bold font-mono">{user.total_diagnoses ?? 0} scans</strong>
            </div>
          </div>

          {/* Language Preference Section */}
          <div className="pt-4 border-t border-agri-border space-y-3">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-agri-leaf" />
              <h3 className="text-xs font-bold text-forest-950 uppercase tracking-wider">
                Language Preference
              </h3>
            </div>
            <p className="text-xs text-gray-500">
              Select your preferred language for pest diagnosis, IPM guidance, and Kural AI responses.
            </p>
            <div className="grid grid-cols-3 gap-2.5 pt-1">
              {SUPPORTED_LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => i18n.changeLanguage(lang.code)}
                  className={`p-2.5 rounded-xl border text-xs font-semibold text-center transition flex flex-col items-center gap-1 ${
                    i18n.language === lang.code
                      ? 'bg-forest-950 text-white border-forest-950 shadow-xs'
                      : 'bg-agri-cream/60 hover:bg-agri-cream text-forest-950 border-agri-border'
                  }`}
                >
                  <span className="font-bold text-sm text-agri-lime">{lang.nativeName}</span>
                  <span className="text-[11px] opacity-80">{lang.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions & Logout */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-agri-border p-6 shadow-soft space-y-4">
            <h2 className="text-sm font-bold font-display text-forest-950">
              Quick Shortcuts
            </h2>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => onNavigate('diagnose')}
                className="w-full p-3 rounded-xl bg-forest-950 text-white hover:bg-forest-900 text-xs font-bold transition flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <Scan className="w-4 h-4 text-agri-lime" />
                  <span>Start New Diagnosis</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => onNavigate('history')}
                className="w-full p-3 rounded-xl bg-agri-cream hover:bg-agri-sand text-forest-950 text-xs font-semibold transition flex items-center justify-between border border-agri-border"
              >
                <div className="flex items-center gap-2">
                  <History className="w-4 h-4 text-agri-leaf" />
                  <span>{t('profile.history_btn')}</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => onNavigate('kural')}
                className="w-full p-3 rounded-xl bg-agri-cream hover:bg-agri-sand text-forest-950 text-xs font-semibold transition flex items-center justify-between border border-agri-border"
              >
                <div className="flex items-center gap-2">
                  <KuralIcon className="w-4 h-4 text-agri-leaf" />
                  <span>Ask Kural AI</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-agri-border p-6 shadow-soft space-y-3">
            <h2 className="text-sm font-bold font-display text-forest-950">
              Session Management
            </h2>
            <p className="text-xs text-gray-500">
              Your session is secured using standard JSON Web Tokens.
            </p>
            <button
              type="button"
              onClick={handleLogout}
              className="w-full py-2.5 px-4 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-bold transition flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span>{t('profile.logout_btn')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
