import React, { useState, useEffect } from 'react';
import { X, Lock, Mail, User as UserIcon, Eye, EyeOff, Loader2, Sprout, AlertCircle, ShieldAlert } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';

interface AuthModalProps {
  onSuccess?: (target: string | null) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onSuccess }) => {
  const { t } = useTranslation();
  const { 
    isAuthModalOpen, 
    closeAuthModal, 
    authModalTab, 
    setAuthModalTab, 
    login, 
    register, 
    redirectTarget,
    clearRedirectTarget
  } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset form when modal opens or tab changes
  useEffect(() => {
    if (isAuthModalOpen) {
      setError(null);
      setPassword('');
      setConfirmPassword('');
    }
  }, [isAuthModalOpen, authModalTab]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeAuthModal();
        clearRedirectTarget();
      }
    };
    if (isAuthModalOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAuthModalOpen, closeAuthModal, clearRedirectTarget]);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (authModalTab === 'signup') {
      if (!name.trim()) {
        setError('Please enter your full name or farm title.');
        return;
      }
      if (password.length < 6) {
        setError('Password must contain at least 6 characters.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match. Please verify and try again.');
        return;
      }
    }

    setLoading(true);
    try {
      const target = redirectTarget;
      if (authModalTab === 'login') {
        await login(email.trim(), password);
      } else {
        await register(name.trim(), email.trim(), password);
      }
      clearRedirectTarget();
      closeAuthModal();
      if (onSuccess) {
        onSuccess(target);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const getRedirectNotice = () => {
    if (redirectTarget === 'diagnose') {
      return t('auth.redirect_diagnose_notice');
    }
    if (redirectTarget === 'history') {
      return t('auth.redirect_history_notice');
    }
    if (redirectTarget === 'dashboard') {
      return t('auth.redirect_dashboard_notice');
    }
    return null;
  };

  const redirectNotice = getRedirectNotice();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div 
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-agri-border overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Banner */}
        <div className="relative bg-gradient-to-r from-forest-950 via-forest-900 to-forest-800 p-6 text-white text-center">
          <button
            onClick={() => {
              closeAuthModal();
              clearRedirectTarget();
            }}
            className="absolute top-4 right-4 p-2 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="mx-auto w-12 h-12 rounded-2xl bg-gradient-to-br from-agri-leaf to-forest-700 flex items-center justify-center shadow-lg border border-agri-lime/30 mb-3">
            <Sprout className="w-7 h-7 text-agri-lime" />
          </div>

          <h2 className="text-xl font-bold font-display tracking-tight text-white">
            {authModalTab === 'login' ? t('auth.login_title') : t('auth.signup_title')}
          </h2>
          <p className="text-xs text-gray-300 mt-1">
            {authModalTab === 'login' ? t('auth.login_subtitle') : t('auth.signup_subtitle')}
          </p>

          {/* Contextual Protected Route Notice */}
          {redirectNotice && (
            <div className="mt-3 py-1.5 px-3 bg-agri-lime/20 border border-agri-lime/40 rounded-xl text-[11px] text-agri-lime font-medium flex items-center justify-center gap-1.5 animate-fadeIn">
              <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
              <span>{redirectNotice}</span>
            </div>
          )}

          {/* Tab Selector */}
          <div className="flex bg-forest-950/80 p-1 rounded-xl mt-4 border border-forest-700/60 max-w-xs mx-auto">
            <button
              type="button"
              onClick={() => { setAuthModalTab('login'); setError(null); }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                authModalTab === 'login'
                  ? 'bg-agri-leaf text-white shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {t('auth.login_tab')}
            </button>
            <button
              type="button"
              onClick={() => { setAuthModalTab('signup'); setError(null); }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                authModalTab === 'signup'
                  ? 'bg-agri-leaf text-white shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {t('auth.signup_tab')}
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5 animate-fadeIn">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
              <div className="leading-relaxed">{error}</div>
            </div>
          )}

          {authModalTab === 'signup' && (
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                {t('auth.name_label')}
              </label>
              <div className="relative">
                <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t('auth.name_placeholder')}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-agri-border bg-agri-cream/30 focus:bg-white text-xs font-medium text-forest-950 focus:outline-none focus:ring-2 focus:ring-agri-leaf focus:border-transparent transition"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              {t('auth.email_label')}
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('auth.email_placeholder')}
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-agri-border bg-agri-cream/30 focus:bg-white text-xs font-medium text-forest-950 focus:outline-none focus:ring-2 focus:ring-agri-leaf focus:border-transparent transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              {t('auth.password_label')}
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('auth.password_placeholder')}
                className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-agri-border bg-agri-cream/30 focus:bg-white text-xs font-medium text-forest-950 focus:outline-none focus:ring-2 focus:ring-agri-leaf focus:border-transparent transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {authModalTab === 'signup' && (
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                {t('auth.confirm_password_label')}
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={t('auth.password_placeholder')}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-agri-border bg-agri-cream/30 focus:bg-white text-xs font-medium text-forest-950 focus:outline-none focus:ring-2 focus:ring-agri-leaf focus:border-transparent transition"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-4 rounded-xl bg-agri-leaf hover:bg-forest-700 text-white font-semibold text-xs shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-agri-lime" />
                <span>{authModalTab === 'login' ? 'Signing In...' : 'Creating Account...'}</span>
              </>
            ) : (
              <span>{authModalTab === 'login' ? t('auth.login_btn') : t('auth.signup_btn')}</span>
            )}
          </button>

          <p className="text-center text-[11px] text-gray-500 pt-1">
            Protected with PBKDF2 encryption & JWT session tokens.
          </p>
        </form>
      </div>
    </div>
  );
};
