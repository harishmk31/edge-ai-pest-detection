import React, { useState, useEffect } from 'react';
import { 
  History, 
  Database, 
  RefreshCw, 
  AlertCircle, 
  Calendar, 
  Bug, 
  CheckCircle2,
  User as UserIcon,
  LogIn,
  ShieldCheck
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { fetchHistory } from '../services/api';
import type { HistoryResponse } from '../types';
import { useAuth } from '../context/AuthContext';
import { getLocalizedPestName } from '../services/pestTranslations';

interface HistoryPageProps {
  onNavigateToDiagnose: () => void;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({ onNavigateToDiagnose }) => {
  const { t, i18n } = useTranslation();
  const [historyData, setHistoryData] = useState<HistoryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { user, openAuthModal } = useAuth();

  useEffect(() => {
    loadHistory();
  }, [user]);

  const loadHistory = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchHistory();
      setHistoryData(data);
    } catch (err: any) {
      console.error('Failed to load diagnosis history:', err);
      setError(err.message || 'Could not retrieve history from backend.');
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="border-b border-agri-border pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-agri-leaf font-display">
            {t('history.header_sub')}
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold text-forest-950 mt-1 font-display">
            {t('history.header_title')}
          </h1>
          <p className="text-sm text-gray-600 mt-2 max-w-2xl leading-relaxed">
            {t('history.header_desc')}
          </p>
        </div>

        <button
          onClick={loadHistory}
          disabled={isLoading}
          className="px-4 py-2 rounded-xl bg-white border border-agri-border hover:bg-agri-cream text-forest-950 text-xs font-semibold shadow-soft flex items-center gap-1.5 transition self-start md:self-auto disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh History</span>
        </button>
      </div>

      {/* User Session Banner */}
      {user ? (
        <div className="p-4 rounded-2xl bg-forest-950 text-white border border-forest-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-soft">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-agri-leaf flex items-center justify-center text-white text-xs font-bold font-display shadow-sm">
              <ShieldCheck className="w-5 h-5 text-agri-lime" />
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-2">
                <span>Personal Diagnosis History: {user.name}</span>
                <span className="px-2 py-0.2 rounded-full bg-forest-800 text-agri-lime text-[10px] font-mono">
                  {user.email}
                </span>
              </div>
              <p className="text-[11px] text-gray-400">
                Your past pest inspection records are securely isolated and preserved.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200 text-sky-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-soft">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-sky-600 text-white flex items-center justify-center shrink-0">
              <UserIcon className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-xs block">Viewing Public / Guest Scan Log</span>
              <span className="text-[11px] text-sky-800">
                Sign in to automatically link diagnoses to your account and keep a private historical audit log.
              </span>
            </div>
          </div>
          <button
            onClick={() => openAuthModal('login')}
            className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold shadow-sm transition flex items-center gap-1.5 shrink-0 self-start sm:self-auto"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In to Your Account</span>
          </button>
        </div>
      )}

      {/* Database Status Alert Banner */}
      {historyData && (
        <div
          className={`p-4 rounded-2xl border text-xs flex items-center justify-between gap-4 shadow-soft ${
            historyData.is_database_connected
              ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
              : 'bg-agri-cream border-agri-border text-forest-900'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${historyData.is_database_connected ? 'bg-emerald-600 text-white' : 'bg-forest-900 text-agri-lime'}`}>
              <Database className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold block">
                {historyData.is_database_connected
                  ? 'Connected to MongoDB Atlas'
                  : 'Development Local Storage Mode'}
              </span>
              <span className="text-gray-600">
                {historyData.is_database_connected
                  ? 'Diagnoses and metadata are persistently replicated to cloud database cluster.'
                  : 'MongoDB URI is not configured in .env. History is safely stored on local filesystem.'}
              </span>
            </div>
          </div>

          <span className="font-mono uppercase font-bold text-[11px] px-2.5 py-1 rounded bg-white border border-agri-border shrink-0">
            {historyData.storage_mode}
          </span>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Loading & Content View */}
      {isLoading ? (
        <div className="py-20 text-center space-y-3">
          <RefreshCw className="w-8 h-8 animate-spin text-agri-leaf mx-auto" />
          <p className="text-sm text-gray-600 font-medium">Fetching historical records...</p>
        </div>
      ) : !historyData || historyData.items.length === 0 ? (
        <div className="bg-white p-16 rounded-3xl border border-agri-border text-center space-y-4 shadow-soft max-w-xl mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-agri-cream text-agri-leaf flex items-center justify-center mx-auto border border-agri-border">
            <History className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-forest-950 font-display">{t('history.empty_title')}</h3>
          <p className="text-xs text-gray-500 leading-relaxed">
            {t('history.empty_desc')}
          </p>
          <button
            onClick={onNavigateToDiagnose}
            className="px-5 py-2.5 bg-agri-leaf hover:bg-agri-leaf/90 text-white rounded-xl text-xs font-semibold inline-flex items-center gap-2 shadow-sm transition"
          >
            <Bug className="w-4 h-4 text-agri-lime" />
            <span>{t('history.diagnose_now')}</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {historyData.items.map((record) => (
            <div
              key={record.id}
              className="bg-white rounded-2xl border border-agri-border overflow-hidden shadow-soft hover:shadow-card transition flex flex-col justify-between"
            >
              <div>
                {/* Thumbnail Header */}
                <div className="relative aspect-video bg-stone-900 overflow-hidden flex items-center justify-center">
                  {record.thumbnail_url ? (
                    <img
                      src={record.thumbnail_url}
                      alt={record.top_pest || 'Scanned crop'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Bug className="w-10 h-10 text-gray-500" />
                  )}
                  <div className="absolute top-3 left-3 bg-forest-950/90 text-white text-[11px] px-2.5 py-1 rounded-full border border-forest-800 flex items-center gap-1.5 font-medium">
                    <Calendar className="w-3 h-3 text-agri-lime" />
                    <span>{formatDate(record.timestamp)}</span>
                  </div>
                  <div className="absolute bottom-3 right-3 bg-black/80 text-white text-[10px] font-mono px-2 py-0.5 rounded">
                    {record.status === 'detected' ? `${record.total_detections} boxes` : 'Clean'}
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-5 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-base font-bold text-forest-950 font-display">
                        {record.top_pest ? getLocalizedPestName(record.top_pest, i18n.language) : t('history.no_detections')}
                      </h3>
                      <div className="text-[11px] text-gray-500 font-mono truncate max-w-[200px]">
                        {record.filename}
                      </div>
                    </div>
                    {record.top_confidence !== null && record.top_confidence !== undefined && (
                      <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-agri-cream text-forest-900 border border-agri-border shrink-0">
                        {record.top_confidence.toFixed(1)}%
                      </span>
                    )}
                  </div>

                  {record.detections_summary && record.detections_summary.length > 0 && (
                    <div className="space-y-1 pt-1">
                      <span className="text-[11px] font-semibold text-gray-600 block">Identified:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {record.detections_summary.map((summary, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] px-2 py-0.5 rounded bg-agri-cream text-forest-900 border border-agri-border"
                          >
                            {getLocalizedPestName(summary, i18n.language)}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Card Footer */}
              <div className="p-4 bg-agri-cream/40 border-t border-agri-border flex items-center justify-between text-[11px] text-gray-500">
                <span className="font-mono text-[10px]">ID: {record.id.slice(0, 8)}...</span>
                <span className="flex items-center gap-1 text-emerald-700 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Recorded
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
