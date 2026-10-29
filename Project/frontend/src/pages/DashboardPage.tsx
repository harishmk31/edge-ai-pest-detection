import React, { useState, useEffect } from 'react';
import { 
  Scan, 
  BookOpen, 
  History, 
  HelpCircle, 
  ArrowRight, 
  Bug, 
  Calendar, 
  RefreshCw, 
  Sparkles,
  Camera,
  AlertCircle
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { fetchHistory } from '../services/api';
import type { HistoryResponse } from '../types';
import { getLocalizedPestName } from '../services/pestTranslations';
import { KuralIcon } from '../components/KuralIcon';

interface DashboardPageProps {
  onNavigate: (page: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const [historyData, setHistoryData] = useState<HistoryResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadUserHistory();
  }, [user]);

  const loadUserHistory = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchHistory();
      setHistoryData(data);
    } catch (err: any) {
      console.warn('Could not load user history for dashboard:', err);
      setError(err.message || 'Unable to load diagnosis history.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoStr;
    }
  };

  // Real derived metrics
  const totalScans = historyData?.total ?? user?.total_diagnoses ?? 0;
  const recentItems = historyData?.items ? historyData.items.slice(0, 4) : [];
  const detectedPestsCount = historyData?.items
    ? historyData.items.filter((item) => item.status === 'detected').length
    : 0;
  const lastScanDate = historyData?.items && historyData.items.length > 0
    ? formatDate(historyData.items[0].timestamp)
    : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-10 animate-fadeIn">
      {/* 1. Personalized Welcome Header & Primary CTA */}
      <div className="bg-gradient-to-r from-forest-950 via-forest-900 to-forest-800 rounded-3xl p-6 sm:p-10 text-white shadow-lifted border border-forest-700/80 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#2E7D4F_1px,transparent_1px)] [background-size:24px_24px]"></div>
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-forest-800/90 border border-forest-700 text-xs font-semibold text-agri-lime shadow-inner">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t('dashboard.authenticated_badge')}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold font-display tracking-tight text-white">
              {t('dashboard.welcome_prefix')}, <span className="text-agri-lime">{user?.name || 'Farmer'}</span>!
            </h1>

            <p className="text-sm text-gray-300 leading-relaxed font-light">
              {t('dashboard.welcome_subtitle')}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400 pt-1">
              <span>{t('dashboard.account_label')}: <strong className="text-gray-200">{user?.email}</strong></span>
              <span>•</span>
              <span>{t('dashboard.model_status_label')}: <strong className="text-agri-lime">YOLO11 (102 Classes)</strong></span>
            </div>
          </div>

          {/* Prominent Action Button */}
          <div className="shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              onClick={() => onNavigate('diagnose')}
              className="px-6 py-4 rounded-2xl bg-agri-leaf hover:bg-agri-leaf/90 text-white font-bold text-sm shadow-lifted hover:shadow-xl transition-all flex items-center justify-center gap-3 border border-forest-600 group"
            >
              <Scan className="w-5 h-5 text-agri-lime group-hover:scale-110 transition-transform" />
              <span>{t('dashboard.start_diagnosis_btn')}</span>
              <ArrowRight className="w-4 h-4 text-white/80 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* Real Summary Metrics Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-6 border-t border-forest-800/80">
          <div className="p-3.5 bg-forest-900/60 rounded-xl border border-forest-700/60">
            <span className="text-xs text-gray-400 block">{t('dashboard.metric_total_scans')}</span>
            <span className="text-2xl font-bold font-display text-white mt-1 block">{totalScans}</span>
          </div>

          <div className="p-3.5 bg-forest-900/60 rounded-xl border border-forest-700/60">
            <span className="text-xs text-gray-400 block">{t('dashboard.metric_pests_detected')}</span>
            <span className="text-2xl font-bold font-display text-amber-300 mt-1 block">{detectedPestsCount}</span>
          </div>

          <div className="p-3.5 bg-forest-900/60 rounded-xl border border-forest-700/60">
            <span className="text-xs text-gray-400 block">{t('dashboard.metric_storage_mode')}</span>
            <span className="text-xs font-mono font-bold text-agri-lime uppercase mt-2 block">
              {historyData?.storage_mode || 'LOCAL_DEV'}
            </span>
          </div>

          <div className="p-3.5 bg-forest-900/60 rounded-xl border border-forest-700/60">
            <span className="text-xs text-gray-400 block">{t('dashboard.metric_last_scan')}</span>
            <span className="text-xs font-medium text-gray-200 mt-2 block truncate">
              {lastScanDate || t('dashboard.no_scans_yet')}
            </span>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 2. Quick Navigation Hub */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div
          onClick={() => onNavigate('diagnose')}
          className="bg-white p-6 rounded-2xl border border-agri-border shadow-soft hover:shadow-card hover:border-forest-700/50 transition cursor-pointer group flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-xl bg-forest-900 text-agri-lime flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
              <Camera className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-forest-950 font-display">
              {t('dashboard.quick_diagnose_title')}
            </h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              {t('dashboard.quick_diagnose_desc')}
            </p>
          </div>
          <div className="pt-4 mt-3 border-t border-agri-border/60 flex items-center justify-between text-xs font-semibold text-agri-leaf group-hover:underline">
            <span>{t('dashboard.quick_launch')}</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>

        <div
          onClick={() => onNavigate('kural')}
          className="bg-gradient-to-br from-white to-agri-cream/60 p-6 rounded-2xl border-2 border-agri-green/30 shadow-soft hover:shadow-card hover:border-agri-green transition cursor-pointer group flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-xl bg-forest-900 text-agri-lime flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform p-2.5">
              <KuralIcon className="w-full h-full text-agri-lime" />
            </div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-base font-bold text-forest-950 font-display">
                {t('kural.quick_action_title')}
              </h3>
              <span className="px-1.5 py-0.5 rounded bg-agri-green/10 text-agri-green text-[10px] font-bold">
                AI
              </span>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              {t('kural.quick_action_desc')}
            </p>
          </div>
          <div className="pt-4 mt-3 border-t border-agri-border/60 flex items-center justify-between text-xs font-semibold text-agri-green group-hover:underline">
            <span>{t('nav.kural')}</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>

        <div
          onClick={() => onNavigate('library')}
          className="bg-white p-6 rounded-2xl border border-agri-border shadow-soft hover:shadow-card hover:border-forest-700/50 transition cursor-pointer group flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-xl bg-forest-800 text-agri-lime flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-forest-950 font-display">
              {t('dashboard.quick_library_title')}
            </h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              {t('dashboard.quick_library_desc')}
            </p>
          </div>
          <div className="pt-4 mt-3 border-t border-agri-border/60 flex items-center justify-between text-xs font-semibold text-agri-leaf group-hover:underline">
            <span>{t('dashboard.quick_explore')}</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>

        <div
          onClick={() => onNavigate('assistant')}
          className="bg-white p-6 rounded-2xl border border-agri-border shadow-soft hover:shadow-card hover:border-forest-700/50 transition cursor-pointer group flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-xl bg-agri-cream text-agri-leaf flex items-center justify-center shadow-xs border border-agri-border group-hover:scale-105 transition-transform">
              <HelpCircle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-forest-950 font-display">
              {t('dashboard.quick_guide_title')}
            </h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              {t('dashboard.quick_guide_desc')}
            </p>
          </div>
          <div className="pt-4 mt-3 border-t border-agri-border/60 flex items-center justify-between text-xs font-semibold text-agri-leaf group-hover:underline">
            <span>{t('dashboard.quick_read')}</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* 3. Recent Diagnoses Section (User-Isolated Real Records) */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-agri-border pb-3">
          <div>
            <h2 className="text-xl font-bold font-display text-forest-950 flex items-center gap-2">
              <History className="w-5 h-5 text-agri-leaf" />
              <span>{t('dashboard.recent_diagnoses_title')}</span>
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {t('dashboard.recent_diagnoses_subtitle')}
            </p>
          </div>

          {recentItems.length > 0 && (
            <button
              onClick={() => onNavigate('history')}
              className="text-xs font-semibold text-agri-leaf hover:underline flex items-center gap-1 self-start sm:self-auto"
            >
              <span>{t('dashboard.view_all_history')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="py-12 bg-white rounded-2xl border border-agri-border text-center space-y-2">
            <RefreshCw className="w-6 h-6 animate-spin text-agri-leaf mx-auto" />
            <p className="text-xs text-gray-500">{t('dashboard.loading_records')}</p>
          </div>
        ) : recentItems.length === 0 ? (
          /* Clear Empty State */
          <div className="bg-white rounded-3xl border border-dashed border-agri-border p-10 sm:p-14 text-center space-y-4 shadow-soft">
            <div className="w-16 h-16 rounded-2xl bg-agri-cream text-agri-leaf flex items-center justify-center mx-auto border border-agri-border shadow-xs">
              <Bug className="w-8 h-8" />
            </div>
            <div className="max-w-md mx-auto space-y-1.5">
              <h3 className="text-base font-bold text-forest-950 font-display">
                {t('dashboard.empty_history_title')}
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                {t('dashboard.empty_history_desc')}
              </p>
            </div>
            <button
              onClick={() => onNavigate('diagnose')}
              className="px-5 py-2.5 rounded-xl bg-agri-leaf hover:bg-forest-700 text-white text-xs font-semibold shadow-sm inline-flex items-center gap-2 transition"
            >
              <Scan className="w-4 h-4 text-agri-lime" />
              <span>{t('dashboard.run_first_scan_btn')}</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {recentItems.map((record) => (
              <div
                key={record.id}
                onClick={() => onNavigate('history')}
                className="bg-white rounded-2xl border border-agri-border overflow-hidden shadow-soft hover:shadow-card hover:border-forest-700/50 transition cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  <div className="relative aspect-video bg-stone-900 overflow-hidden flex items-center justify-center">
                    {record.thumbnail_url ? (
                      <img
                        src={record.thumbnail_url}
                        alt={record.top_pest || 'Pest scan'}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <Bug className="w-8 h-8 text-gray-500" />
                    )}
                    <div className="absolute top-2 left-2 bg-forest-950/90 text-white text-[10px] px-2 py-0.5 rounded-full border border-forest-800 flex items-center gap-1 font-mono">
                      <Calendar className="w-2.5 h-2.5 text-agri-lime" />
                      <span>{formatDate(record.timestamp).split(',')[0]}</span>
                    </div>
                    <div className="absolute bottom-2 right-2 bg-black/80 text-white text-[10px] font-mono px-2 py-0.5 rounded">
                      {record.status === 'detected' ? `${record.total_detections} boxes` : 'Clean'}
                    </div>
                  </div>

                  <div className="p-4 space-y-1.5">
                    <h4 className="text-sm font-bold text-forest-950 truncate group-hover:text-agri-leaf transition-colors font-display">
                      {record.top_pest
                        ? getLocalizedPestName(record.top_pest, i18n.language)
                        : t('history.no_detections')}
                    </h4>
                    <p className="text-[11px] text-gray-500 font-mono truncate">
                      {record.filename}
                    </p>
                  </div>
                </div>

                <div className="px-4 py-2.5 bg-agri-cream/40 border-t border-agri-border flex items-center justify-between text-[11px] text-gray-500">
                  <span>{record.top_confidence ? `${record.top_confidence.toFixed(0)}% Conf.` : '--'}</span>
                  <span className="text-agri-leaf font-semibold flex items-center gap-0.5">
                    <span>{t('dashboard.details_link')}</span>
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4. First-Time Guidance / Field Scouting Best Practices */}
      <div className="bg-white rounded-3xl border border-agri-border p-6 sm:p-8 shadow-soft space-y-6">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-agri-leaf font-display">
            {t('dashboard.guide_section_badge')}
          </span>
          <h3 className="text-lg sm:text-xl font-bold font-display text-forest-950 mt-1">
            {t('dashboard.guide_section_title')}
          </h3>
          <p className="text-xs text-gray-600 mt-1">
            {t('dashboard.guide_section_subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-5 rounded-2xl bg-sky-50/60 border border-sky-200/80 space-y-2.5">
            <div className="w-8 h-8 rounded-xl bg-sky-600 text-white flex items-center justify-center text-xs font-bold font-mono">
              1
            </div>
            <h4 className="text-sm font-bold text-sky-950 font-display">
              {t('dashboard.guide_step1_title')}
            </h4>
            <p className="text-xs text-sky-900 leading-relaxed">
              {t('dashboard.guide_step1_desc')}
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 space-y-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center text-xs font-bold font-mono">
              2
            </div>
            <h4 className="text-sm font-bold text-emerald-950 font-display">
              {t('dashboard.guide_step2_title')}
            </h4>
            <p className="text-xs text-emerald-900 leading-relaxed">
              {t('dashboard.guide_step2_desc')}
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-purple-50/60 border border-purple-200/80 space-y-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center text-xs font-bold font-mono">
              3
            </div>
            <h4 className="text-sm font-bold text-purple-950 font-display">
              {t('dashboard.guide_step3_title')}
            </h4>
            <p className="text-xs text-purple-900 leading-relaxed">
              {t('dashboard.guide_step3_desc')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
