import React, { useState } from 'react';
import { 
  Sprout, 
  Bug, 
  ShieldAlert, 
  Leaf, 
  AlertTriangle, 
  CheckCircle2, 
  HelpCircle, 
  FileCheck, 
  Bookmark, 
  Info,
  ShieldCheck,
  Search,
  PhoneCall,
  AlertCircle
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { PestManagementDetails } from '../types';
import { 
  getLocalizedPestName, 
  getLocalizedCropName, 
  getLocalizedGroupName 
} from '../services/pestTranslations';
import { KuralIcon } from './KuralIcon';

interface PestManagementCardProps {
  pest: PestManagementDetails;
  isSingleSpecies?: boolean;
  onAskKural?: (pestName: string) => void;
}

function parseBulletPoints(text: string, defaultPoints: string[]): string[] {
  if (!text) return defaultPoints;
  const lines = text
    .split('\n')
    .map((l) => l.trim().replace(/^[-*•\d.]+\s*/, ''))
    .filter((l) => l.length > 0);
  if (lines.length >= 2) {
    return lines.slice(0, 4);
  }
  const sentences = text
    .split(/(?<=[.?!])\s+/)
    .map((s) => s.trim().replace(/^[-*•\d.]+\s*/, ''))
    .filter((s) => s.length > 5);
  if (sentences.length >= 2) {
    return sentences.slice(0, 4);
  }
  return defaultPoints;
}

export const PestManagementCard: React.FC<PestManagementCardProps> = ({ 
  pest, 
  isSingleSpecies: _isSingleSpecies = true,
  onAskKural,
}) => {
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState<'ipm' | 'biology' | 'protocol'>('ipm');

  const { ipm_recommendations } = pest;

  // Retrieve localized bullet defaults for non-English or fallback
  const card1Defaults = (t('ipm.card1_default', { returnObjects: true }) as string[]) || [];
  const card2Defaults = (t('ipm.card2_default', { returnObjects: true }) as string[]) || [];
  const card3Defaults = (t('ipm.card3_default', { returnObjects: true }) as string[]) || [];
  const card4Defaults = (t('ipm.card4_default', { returnObjects: true }) as string[]) || [];

  // When viewing in Tamil or Hindi, use translated bullet guidance so farmers get immediate native recommendations
  const isNonEnglish = i18n.language !== 'en';

  const monitoringBullets = isNonEnglish
    ? card1Defaults
    : parseBulletPoints(ipm_recommendations?.monitoring, card1Defaults);

  const culturalBullets = isNonEnglish
    ? card2Defaults
    : parseBulletPoints(ipm_recommendations?.cultural_mechanical, card2Defaults);

  const biologicalBullets = isNonEnglish
    ? card3Defaults
    : parseBulletPoints(ipm_recommendations?.biological, card3Defaults);

  const chemicalBullets = isNonEnglish
    ? card4Defaults
    : parseBulletPoints(ipm_recommendations?.chemical, card4Defaults);

  const isUncertain = !pest.scientific_name;

  const localizedCommonName = getLocalizedPestName(pest.common_name, i18n.language);
  const localizedGroup = getLocalizedGroupName(pest.group, i18n.language);

  return (
    <div className="bg-white rounded-3xl border border-agri-border shadow-soft overflow-hidden transition-all hover:shadow-md">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-forest-950 via-forest-900 to-forest-800 p-6 text-white">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-forest-800 text-agri-lime text-xs font-mono font-bold border border-forest-700">
                {localizedGroup}
              </span>

              {pest.instance_count > 1 ? (
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold border border-amber-500/40 flex items-center gap-1">
                  <span>🎯 {pest.instance_count} {t('diagnosis.instances_localized')}</span>
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full bg-agri-leaf/20 text-agri-lime text-xs font-semibold border border-agri-leaf/40">
                  {t('diagnosis.single_instance')}
                </span>
              )}

              <span className="text-[11px] text-gray-400 font-mono">
                Class #{pest.class_id}
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-bold font-display tracking-tight text-white flex items-baseline gap-2">
              {localizedCommonName}
            </h3>

            {pest.scientific_name ? (
              <p className="text-sm text-agri-lime/90 italic font-serif">
                {pest.scientific_name}
              </p>
            ) : (
              <p className="text-xs text-gray-400 italic">
                Scientific taxonomy verified at genus/group level
              </p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2">
            {onAskKural && (
              <button
                type="button"
                onClick={() => onAskKural(pest.common_name)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-agri-lime text-forest-950 font-bold text-xs hover:bg-white transition-all shadow-sm"
              >
                <KuralIcon className="w-3.5 h-3.5" />
                <span>{t('kural.ask_kural_btn')}</span>
              </button>
            )}
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-forest-900/90 text-xs text-gray-300 border border-forest-700">
              <FileCheck className="w-3.5 h-3.5 text-agri-lime" />
              <span>{pest.source.split('/')[0].trim()}</span>
            </span>
          </div>
        </div>

        {/* Crops Affected Chips */}
        {pest.crops_affected && pest.crops_affected.length > 0 && (
          <div className="mt-4 pt-3 border-t border-forest-800/80 flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-gray-300 font-medium mr-1 flex items-center gap-1">
              <Leaf className="w-3.5 h-3.5 text-agri-lime" />
              <span>{t('ipm.host_crops')}</span>
            </span>
            {pest.crops_affected.map((crop, i) => (
              <span
                key={i}
                className="px-2.5 py-0.5 rounded-lg bg-forest-800/90 text-[11px] font-medium text-gray-200 border border-forest-700/60"
              >
                {getLocalizedCropName(crop, i18n.language)}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-agri-border bg-agri-cream/30 px-6 pt-3 gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('ipm')}
          className={`pb-3 px-3 text-xs font-bold transition-all relative whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'ipm'
              ? 'text-forest-950 border-b-2 border-agri-leaf'
              : 'text-gray-500 hover:text-forest-900'
          }`}
        >
          <Sprout className={`w-3.5 h-3.5 ${activeTab === 'ipm' ? 'text-agri-leaf' : 'text-gray-400'}`} />
          <span>{t('ipm.ipm_tab')}</span>
        </button>

        <button
          onClick={() => setActiveTab('biology')}
          className={`pb-3 px-3 text-xs font-bold transition-all relative whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'biology'
              ? 'text-forest-950 border-b-2 border-agri-leaf'
              : 'text-gray-500 hover:text-forest-900'
          }`}
        >
          <Bug className={`w-3.5 h-3.5 ${activeTab === 'biology' ? 'text-agri-leaf' : 'text-gray-400'}`} />
          <span>{t('ipm.biology_tab')}</span>
        </button>

        <button
          onClick={() => setActiveTab('protocol')}
          className={`pb-3 px-3 text-xs font-bold transition-all relative whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'protocol'
              ? 'text-forest-950 border-b-2 border-agri-leaf'
              : 'text-gray-500 hover:text-forest-900'
          }`}
        >
          <ShieldAlert className={`w-3.5 h-3.5 ${activeTab === 'protocol' ? 'text-agri-leaf' : 'text-gray-400'}`} />
          <span>{t('ipm.protocol_tab')}</span>
        </button>
      </div>

      {/* Tab Panels */}
      <div className="p-6">
        {/* IPM Tab */}
        {activeTab === 'ipm' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Uncertainty Warning if general / low confidence */}
            {isUncertain && (
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <strong>{t('ipm.general_warning_title')}</strong> {t('ipm.general_warning_desc')}
                </div>
              </div>
            )}

            {/* 4 Simple Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Card 1: Check Your Field */}
              <div className="p-5 rounded-2xl bg-sky-50/70 border border-sky-200/90 shadow-xs flex flex-col justify-between space-y-3">
                <div className="space-y-3">
                  <div className="flex items-center gap-2.5 text-sky-900 font-bold text-sm font-display pb-2 border-b border-sky-200/70">
                    <div className="w-8 h-8 rounded-xl bg-sky-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                      <Search className="w-4 h-4" />
                    </div>
                    <h4>{t('ipm.card1_title')}</h4>
                  </div>
                  <ul className="space-y-2 text-xs text-sky-950 leading-relaxed">
                    {monitoringBullets.map((bullet, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-sky-600 shrink-0 mt-1.5"></span>
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Card 2: Keep Crops Healthy */}
              <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200/90 shadow-xs flex flex-col justify-between space-y-3">
                <div className="space-y-3">
                  <div className="flex items-center gap-2.5 text-emerald-900 font-bold text-sm font-display pb-2 border-b border-emerald-200/70">
                    <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                      <Sprout className="w-4 h-4" />
                    </div>
                    <h4>{t('ipm.card2_title')}</h4>
                  </div>
                  <ul className="space-y-2 text-xs text-emerald-950 leading-relaxed">
                    {culturalBullets.map((bullet, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0 mt-1.5"></span>
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Card 3: Protect Helpful Insects */}
              <div className="p-5 rounded-2xl bg-purple-50/70 border border-purple-200/90 shadow-xs flex flex-col justify-between space-y-3">
                <div className="space-y-3">
                  <div className="flex items-center gap-2.5 text-purple-900 font-bold text-sm font-display pb-2 border-b border-purple-200/70">
                    <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                      <Bug className="w-4 h-4" />
                    </div>
                    <h4>{t('ipm.card3_title')}</h4>
                  </div>
                  <ul className="space-y-2 text-xs text-purple-950 leading-relaxed">
                    {biologicalBullets.map((bullet, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-600 shrink-0 mt-1.5"></span>
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Card 4: Control Pests Safely */}
              <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200/90 shadow-xs flex flex-col justify-between space-y-3">
                <div className="space-y-3">
                  <div className="flex items-center gap-2.5 text-amber-900 font-bold text-sm font-display pb-2 border-b border-amber-200/70">
                    <div className="w-8 h-8 rounded-xl bg-amber-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <h4>{t('ipm.card4_title')}</h4>
                  </div>
                  <ul className="space-y-2 text-xs text-amber-950 leading-relaxed">
                    {chemicalBullets.map((bullet, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-600 shrink-0 mt-1.5"></span>
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* What should I do next? Section */}
            <div className="pt-6 border-t border-agri-border space-y-3">
              <div className="flex items-center gap-2 text-forest-950">
                <CheckCircle2 className="w-5 h-5 text-agri-leaf" />
                <h4 className="text-sm font-bold font-display">
                  {t('ipm.what_next_title')}
                </h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Action 1 */}
                <div className="p-4 rounded-2xl bg-sky-50/60 border border-sky-200/70 space-y-1.5">
                  <div className="flex items-center gap-2 text-sky-900 font-bold text-xs">
                    <span className="w-5 h-5 rounded-full bg-sky-600 text-white flex items-center justify-center text-[10px] font-mono">1</span>
                    <span>{t('ipm.step1_title')}</span>
                  </div>
                  <p className="text-xs text-sky-950 leading-relaxed">
                    {t('ipm.step1_desc')}
                  </p>
                </div>

                {/* Action 2 */}
                <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/70 space-y-1.5">
                  <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-mono">2</span>
                    <span>{t('ipm.step2_title')}</span>
                  </div>
                  <p className="text-xs text-emerald-950 leading-relaxed">
                    {t('ipm.step2_desc')}
                  </p>
                </div>

                {/* Action 3 */}
                <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/70 space-y-1.5">
                  <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                    <span className="w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center text-[10px] font-mono">3</span>
                    <span>{t('ipm.step3_title')}</span>
                  </div>
                  <p className="text-xs text-amber-950 leading-relaxed">
                    {t('ipm.step3_desc')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Biology & Symptoms Tab */}
        {activeTab === 'biology' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="space-y-3">
              <div>
                <h4 className="text-xs font-bold text-forest-950 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-agri-leaf" />
                  <span>{t('ipm.species_overview')}</span>
                </h4>
                <p className="text-xs text-gray-700 bg-agri-cream/50 p-3.5 rounded-xl border border-agri-border leading-relaxed">
                  {pest.description}
                </p>
              </div>

              <div>
                <h4 className="text-xs font-bold text-forest-950 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Bug className="w-3.5 h-3.5 text-agri-leaf" />
                  <span>{t('ipm.diagnostic_symptoms')}</span>
                </h4>
                <p className="text-xs text-gray-700 bg-agri-cream/50 p-3.5 rounded-xl border border-agri-border leading-relaxed">
                  {pest.symptoms}
                </p>
              </div>

              {pest.life_cycle && (
                <div>
                  <h4 className="text-xs font-bold text-forest-950 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <Bookmark className="w-3.5 h-3.5 text-agri-leaf" />
                    <span>{t('ipm.life_cycle')}</span>
                  </h4>
                  <p className="text-xs text-gray-700 bg-agri-cream/50 p-3.5 rounded-xl border border-agri-border leading-relaxed">
                    {pest.life_cycle}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Protocol & Expert Triggers Tab */}
        {activeTab === 'protocol' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-agri-cream/60 border border-agri-border space-y-2">
                <div className="flex items-center gap-2 text-forest-950 font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4 text-agri-leaf" />
                  <h4>{t('ipm.prevention_sanitation')}</h4>
                </div>
                <p className="text-xs text-gray-700 leading-relaxed">
                  {pest.prevention_monitoring}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 space-y-2">
                <div className="flex items-center gap-2 text-rose-950 font-bold text-xs">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <h4>{t('ipm.expert_triggers')}</h4>
                </div>
                <p className="text-xs text-rose-900 leading-relaxed">
                  {pest.when_to_consult_expert}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Verification & Disclaimer Footer */}
        <div className="mt-6 pt-4 border-t border-agri-border space-y-2 text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between text-gray-500 text-[11px] gap-2">
            <span>
              {t('ipm.citations')} <strong>{pest.source}</strong> ({pest.last_reviewed})
            </span>
            <span className="text-forest-900 font-medium flex items-center gap-1">
              <PhoneCall className="w-3.5 h-3.5 text-agri-leaf" />
              <span>{t('ipm.kisan_call_center')}</span>
            </span>
          </div>

          <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-900 text-[11px] leading-relaxed flex items-start gap-2">
            <HelpCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              <strong>{t('ipm.scientific_notice_title')}</strong> {pest.disclaimer}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
