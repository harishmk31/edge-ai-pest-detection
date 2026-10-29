import React, { useState, useEffect } from 'react';
import { 
  Lock, 
  Mail, 
  User as UserIcon, 
  Eye, 
  EyeOff, 
  Loader2, 
  Sprout, 
  AlertCircle, 
  ShieldCheck, 
  ArrowLeft,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';

interface AuthPageProps {
  initialTab?: 'login' | 'signup';
  onNavigate: (page: string) => void;
  onSuccess: (target: string | null) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({
  initialTab = 'login',
  onNavigate,
  onSuccess,
}) => {
  const { t } = useTranslation();
  const { 
    login, 
    register, 
    redirectTarget, 
    clearRedirectTarget 
  } = useAuth();

  const [activeTab, setActiveTab] = useState<'login' | 'signup'>(initialTab);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync active tab if initialTab changes
  useEffect(() => {
    setActiveTab(initialTab);
    setError(null);
  }, [initialTab]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!email.trim() || !email.includes('@')) {
      setError(t('auth.invalid_email') || 'Please enter a valid email address.');
      return;
    }

    if (activeTab === 'signup') {
      if (!name.trim()) {
        setError(t('auth.name_required') || 'Please enter your full name or farm name.');
        return;
      }
      if (password.length < 6) {
        setError(t('auth.password_min') || 'Password must be at least 6 characters long.');
        return;
      }
      if (password !== confirmPassword) {
        setError(t('auth.passwords_dont_match') || 'Passwords do not match. Please re-enter.');
        return;
      }
    } else {
      if (!password) {
        setError(t('auth.password_required') || 'Please enter your password.');
        return;
      }
    }

    setLoading(true);
    try {
      const target = redirectTarget;
      if (activeTab === 'login') {
        await login(email.trim(), password);
      } else {
        await register(name.trim(), email.trim(), password);
      }
      clearRedirectTarget();
      onSuccess(target);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Authentication failed. Please check credentials.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        {/* Back Link */}
        <div className="mb-6">
          <button
            type="button"
            onClick={() => onNavigate('landing')}
            className="inline-flex items-center gap-2 text-xs font-semibold text-agri-gray hover:text-agri-green transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t('auth.back_to_home') || 'Back to AgriVision Home'}</span>
          </button>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl border border-agri-border shadow-lifted p-6 sm:p-8 space-y-6">
          {/* Logo & Header */}
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-forest-950 to-agri-leaf text-white flex items-center justify-center mx-auto shadow-md">
              <Sprout className="w-8 h-8 text-agri-lime" />
            </div>
            <h1 className="text-2xl font-bold font-display text-forest-950 tracking-tight">
              {activeTab === 'login' ? t('auth.login_title') : t('auth.signup_title')}
            </h1>
            <p className="text-xs text-gray-500 max-w-xs mx-auto">
              {activeTab === 'login' ? t('auth.login_subtitle') : t('auth.signup_subtitle')}
            </p>
          </div>

          {/* Intended Destination Notice */}
          {redirectTarget && (
            <div className="p-3 bg-agri-cream/80 border border-agri-border rounded-xl text-xs text-forest-900 flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-agri-leaf shrink-0 mt-0.5" />
              <div>
                <strong>Destination:</strong>{' '}
                {redirectTarget === 'diagnose' || redirectTarget === 'dashboard'
                  ? 'Sign in to access your dashboard and start a new pest diagnosis.'
                  : redirectTarget === 'kural'
                  ? 'Sign in to consult Kural, your AI agricultural assistant.'
                  : redirectTarget === 'history'
                  ? 'Sign in to view your personal diagnosis history.'
                  : 'Sign in to continue to your requested page.'}
              </div>
            </div>
          )}

          {/* Tab Selector */}
          <div className="flex p-1 bg-forest-950/5 rounded-2xl border border-agri-border">
            <button
              type="button"
              onClick={() => {
                setActiveTab('login');
                setError(null);
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-xl transition ${
                activeTab === 'login'
                  ? 'bg-white text-forest-950 shadow-xs'
                  : 'text-gray-500 hover:text-forest-950'
              }`}
            >
              {t('auth.tab_login')}
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('signup');
                setError(null);
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-xl transition ${
                activeTab === 'signup'
                  ? 'bg-white text-forest-950 shadow-xs'
                  : 'text-gray-500 hover:text-forest-950'
              }`}
            >
              {t('auth.tab_signup')}
            </button>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {activeTab === 'signup' && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700 block">
                  {t('auth.name_label')}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <UserIcon className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t('auth.name_placeholder')}
                    className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-agri-border focus:border-agri-leaf focus:bg-white rounded-xl text-xs text-forest-950 focus:outline-hidden transition"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700 block">
                {t('auth.email_label')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('auth.email_placeholder')}
                  className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-agri-border focus:border-agri-leaf focus:bg-white rounded-xl text-xs text-forest-950 focus:outline-hidden transition"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700 block">
                {t('auth.password_label')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('auth.password_placeholder')}
                  className="w-full pl-10 pr-10 py-2.5 bg-stone-50 border border-agri-border focus:border-agri-leaf focus:bg-white rounded-xl text-xs text-forest-950 focus:outline-hidden transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {activeTab === 'signup' && (
                <p className="text-[11px] text-gray-400">{t('auth.min_chars')}</p>
              )}
            </div>

            {activeTab === 'signup' && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700 block">
                  {t('auth.confirm_password_label')}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder={t('auth.password_placeholder')}
                    className="w-full pl-10 pr-10 py-2.5 bg-stone-50 border border-agri-border focus:border-agri-leaf focus:bg-white rounded-xl text-xs text-forest-950 focus:outline-hidden transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 py-3 bg-agri-leaf hover:bg-forest-900 disabled:bg-gray-300 text-white font-bold rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>{activeTab === 'login' ? t('auth.login_btn') : t('auth.signup_btn')}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer Switch */}
          <div className="text-center pt-2 text-xs text-gray-500 border-t border-agri-border/60">
            {activeTab === 'login' ? (
              <p>
                {t('auth.dont_have_acc')}{' '}
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('signup');
                    setError(null);
                  }}
                  className="font-bold text-agri-leaf hover:underline"
                >
                  {t('auth.switch_signup')}
                </button>
              </p>
            ) : (
              <p>
                {t('auth.already_have_acc')}{' '}
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('login');
                    setError(null);
                  }}
                  className="font-bold text-agri-leaf hover:underline"
                >
                  {t('auth.switch_login')}
                </button>
              </p>
            )}
          </div>

          <div className="flex items-center justify-center gap-1.5 text-[11px] text-gray-400">
            <ShieldCheck className="w-3.5 h-3.5 text-agri-leaf" />
            <span>Secure JWT authentication & isolated data storage</span>
          </div>
        </div>
      </div>
    </div>
  );
};
