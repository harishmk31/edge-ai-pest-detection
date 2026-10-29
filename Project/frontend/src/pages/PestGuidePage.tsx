import React from 'react';
import { 
  ShieldCheck, 
  Eye, 
  Sun, 
  Layers, 
  PhoneCall
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const PestGuidePage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Header */}
      <div className="border-b border-agri-border pb-6">
        <span className="text-xs font-semibold uppercase tracking-wider text-agri-leaf font-display">
          {t('guide.header_sub')}
        </span>
        <h1 className="text-3xl sm:text-4xl font-bold text-forest-950 mt-1 font-display">
          {t('guide.header_title')}
        </h1>
        <p className="text-sm text-gray-600 mt-2 max-w-2xl leading-relaxed">
          {t('guide.header_desc')}
        </p>
      </div>

      {/* Core Principle Callout */}
      <div className="bg-forest-950 text-white rounded-3xl p-8 sm:p-10 border border-forest-800 shadow-lifted">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-forest-800 text-agri-lime text-xs font-semibold">
            <ShieldCheck className="w-4 h-4" />
            <span>{t('guide.eil_title')}</span>
          </div>
          <h2 className="text-2xl font-bold font-display text-white">
            {t('guide.eil_heading')}
          </h2>
          <p className="text-sm text-gray-300 leading-relaxed font-light">
            {t('guide.eil_desc')}
          </p>
        </div>
      </div>

      {/* Field Scouting Best Practices Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-7 rounded-2xl border border-agri-border shadow-soft space-y-3">
          <div className="w-12 h-12 rounded-xl bg-agri-cream flex items-center justify-center text-agri-leaf border border-agri-border">
            <Sun className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-forest-950 font-display">
            {t('guide.tip1_title')}
          </h3>
          <p className="text-xs text-gray-600 leading-relaxed">
            {t('guide.tip1_desc')}
          </p>
        </div>

        <div className="bg-white p-7 rounded-2xl border border-agri-border shadow-soft space-y-3">
          <div className="w-12 h-12 rounded-xl bg-agri-cream flex items-center justify-center text-agri-leaf border border-agri-border">
            <Eye className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-forest-950 font-display">
            {t('guide.tip2_title')}
          </h3>
          <p className="text-xs text-gray-600 leading-relaxed">
            {t('guide.tip2_desc')}
          </p>
        </div>

        <div className="bg-white p-7 rounded-2xl border border-agri-border shadow-soft space-y-3">
          <div className="w-12 h-12 rounded-xl bg-agri-cream flex items-center justify-center text-agri-leaf border border-agri-border">
            <Layers className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-forest-950 font-display">
            {t('guide.tip3_title')}
          </h3>
          <p className="text-xs text-gray-600 leading-relaxed">
            {t('guide.tip3_desc')}
          </p>
        </div>
      </div>

      {/* Common False Positive Traps */}
      <div className="bg-white rounded-3xl border border-agri-border p-8 shadow-card space-y-6">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-agri-leaf">
            Diagnostic Caution
          </span>
          <h3 className="text-xl font-bold text-forest-950 mt-1 font-display">
            Common Vision Model Confusion Traps in IP102
          </h3>
          <p className="text-xs text-gray-600 mt-1">
            Knowing the detector's known failure modes prevents costly management mistakes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 text-xs space-y-2">
            <span className="font-bold text-amber-950 block">
              Armyworm Sibling Confusion (Spodoptera spp.)
            </span>
            <p className="text-gray-700 leading-relaxed">
              Cabbage armyworm (Class 38), beet armyworm (Class 39), and ordinary armyworm (Class 23) have overlapping larval color morphs ranging from green to brownish-black. Model confidence between sibling caterpillars often splits.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 text-xs space-y-2">
            <span className="font-bold text-amber-950 block">
              Leaf Spot Necrosis vs. Hopper Nymphs
            </span>
            <p className="text-gray-700 leading-relaxed">
              Small dark necrotic lesions caused by Cercospora or Alternaria fungal leaf spots can trigger low-confidence planthopper or beetle detections when photographed from distant, blurry perspectives.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 text-xs space-y-2">
            <span className="font-bold text-amber-950 block">
              Beneficial Predators vs. Harmful Pests
            </span>
            <p className="text-gray-700 leading-relaxed">
              IP102 is trained primarily on crop pest classes. Beneficial predatory ladybird beetle larvae or syrphid fly maggots that feed on aphids can occasionally trigger an out-of-distribution pest label.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 text-xs space-y-2">
            <span className="font-bold text-amber-950 block">
              Unrelated Background Textures
            </span>
            <p className="text-gray-700 leading-relaxed">
              Human fingers, rough bark textures, or gravel backgrounds may cause the model to speculate a classification if the confidence threshold is set too low (&lt;15%). Always use the default 35%+ filter.
            </p>
          </div>
        </div>
      </div>

      {/* Extension Officer Notice Banner */}
      <div className="bg-agri-cream p-8 rounded-2xl border border-agri-border flex flex-col md:flex-row items-center justify-between gap-6 shadow-soft">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-forest-900 text-agri-lime flex items-center justify-center shrink-0">
            <PhoneCall className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-base font-bold text-forest-950 font-display">
              {t('guide.helpline_title')}
            </h4>
            <p className="text-xs text-gray-600 mt-1 max-w-xl">
              {t('guide.helpline_desc')}
            </p>
          </div>
        </div>
        <div className="px-4 py-2 rounded-xl bg-forest-950 text-agri-lime text-xs font-mono font-bold whitespace-nowrap shadow-sm border border-forest-800">
          {t('guide.helpline_call')}
        </div>
      </div>
    </div>
  );
};
