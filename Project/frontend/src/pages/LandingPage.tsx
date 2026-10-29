import React from 'react';
import { 
  Scan, 
  BookOpen, 
  ArrowRight, 
  CheckCircle2, 
  Bug, 
  Sparkles
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { 
  getLocalizedPestName, 
  getLocalizedCropName 
} from '../services/pestTranslations';

interface LandingPageProps {
  onNavigate: (page: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const { t, i18n } = useTranslation();
  const { user, openAuthModal } = useAuth();

  const handleDiagnoseAction = () => {
    if (user) {
      onNavigate('diagnose');
    } else {
      openAuthModal('login', 'profile');
    }
  };

  const sampleDemos = [
    {
      title: 'Rice Leaf Roller',
      image: 'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?auto=format&fit=crop&w=600&q=80',
      badge: 'Caterpillar Larva',
      confidence: 81.7,
      crop: 'Rice / Paddy',
      status: 'High Confidence',
      description: 'Larvae fold leaves longitudinally and feed within, creating white scorched streaks on the leaf blades.',
    },
    {
      title: 'White Grub',
      image: 'https://images.unsplash.com/photo-1492496913980-501348b61469?auto=format&fit=crop&w=600&q=80',
      badge: 'Soil Pest',
      confidence: 72.9,
      crop: 'Sugarcane, Groundnut',
      status: 'Moderate Confidence',
      description: 'Root-feeding scarab larvae that stunt plants and cause lodging during vegetative growth.',
    },
    {
      title: 'Field Aphid Colony',
      image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=600&q=80',
      badge: 'Sap-Sucker',
      confidence: 60.7,
      crop: 'Wheat, Mustard, Cotton',
      status: 'Moderate Confidence',
      description: 'Dense sap-sucking clusters causing leaf curling, honeydew excretion, and sooty mold.',
    },
  ];

  const pestCategories = [
    { name: 'Stem & Shoot Borers', count: '18 classes', desc: 'Asiatic borer, yellow stem borer, peach borer' },
    { name: 'Planthoppers & Cicadas', count: '14 classes', desc: 'Brown planthopper, white-backed hopper, leafhopper' },
    { name: 'Foliage Caterpillars', count: '22 classes', desc: 'Armyworms, cabbage caterpillars, cutworms' },
    { name: 'Root & Soil Pests', count: '9 classes', desc: 'Grubs, mole crickets, wireworms' },
    { name: 'Mites & Thrips', count: '15 classes', desc: 'Red spiders, yellow tea mites, grain thrips' },
    { name: 'Beetles & Weevils', count: '16 classes', desc: 'Flea beetles, blister beetles, rice water weevils' },
    { name: 'Scale Insects & Flies', count: '8 classes', desc: 'Citrus scales, gall midges, fruit flies' },
  ];

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      {/* 1. Hero Section with Enhanced Responsive Spacing */}
      <section className="relative overflow-hidden pt-10 sm:pt-16 pb-16 sm:pb-24 bg-gradient-to-b from-forest-950 via-forest-900 to-forest-950 text-white border-b border-forest-800">
        <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#2E7D4F_1px,transparent_1px)] [background-size:24px_24px]"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl space-y-6 sm:space-y-7">
            {/* Project Capability Label */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-forest-800/90 border border-forest-700 text-xs font-semibold text-agri-lime shadow-inner">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t('landing.hero_pill')}</span>
            </div>

            {/* Main Hero Headline: Natural Wrap Across Breakpoints */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-extrabold text-white tracking-tight leading-tight sm:leading-[1.15]">
              {t('landing.hero_title_1')}{' '}
              <span className="text-agri-lime block sm:inline">{t('landing.hero_title_2')}</span>
            </h1>

            {/* Subtitle Description */}
            <p className="text-sm sm:text-base md:text-lg text-gray-300 leading-relaxed font-light max-w-2xl">
              {t('landing.hero_desc')}
            </p>

            {/* Primary Calls to Action (Consistent Responsive Heights & Alignment) */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2">
              <button
                onClick={handleDiagnoseAction}
                className="px-6 py-3.5 rounded-xl bg-agri-leaf hover:bg-agri-leaf/90 text-white font-semibold text-sm shadow-lifted hover:shadow-lg transition flex items-center justify-center gap-2.5 border border-forest-600 group"
              >
                <Scan className="w-4 h-4 text-agri-lime group-hover:scale-110 transition-transform" />
                <span>{t('landing.diagnose_btn')}</span>
                <ArrowRight className="w-4 h-4 text-white/80 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Quick Metrics Bar: Clean Card Alignment */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 pt-8 mt-6 border-t border-forest-800/80">
              <div className="p-3.5 rounded-xl bg-forest-900/60 border border-forest-800/80">
                <div className="text-2xl font-bold font-display text-white">102</div>
                <div className="text-xs text-gray-400 mt-0.5">{t('landing.stat_classes')}</div>
              </div>
              <div className="p-3.5 rounded-xl bg-forest-900/60 border border-forest-800/80">
                <div className="text-2xl font-bold font-display text-agri-lime">YOLO11</div>
                <div className="text-xs text-gray-400 mt-0.5">{t('landing.stat_detector')}</div>
              </div>
              <div className="p-3.5 rounded-xl bg-forest-900/60 border border-forest-800/80">
                <div className="text-2xl font-bold font-display text-white">&lt;100 ms</div>
                <div className="text-xs text-gray-400 mt-0.5">{t('landing.stat_latency')}</div>
              </div>
              <div className="p-3.5 rounded-xl bg-forest-900/60 border border-forest-800/80">
                <div className="text-2xl font-bold font-display text-agri-leaf">RGB Norm</div>
                <div className="text-xs text-gray-400 mt-0.5">{t('landing.stat_pipeline')}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Streamlined Field Workflow */}
      <section id="workflow-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
          <span className="text-xs font-semibold uppercase tracking-wider text-agri-leaf font-display">
            {t('landing.workflow_sub')}
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-forest-950 mt-1 font-display">
            {t('landing.workflow_title')}
          </h2>
          <p className="text-sm text-gray-600 mt-2">
            {t('landing.workflow_desc')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          <div className="bg-white p-6 sm:p-7 rounded-2xl border border-agri-border shadow-card relative">
            <div className="w-12 h-12 rounded-xl bg-forest-900 text-agri-lime flex items-center justify-center font-bold font-display text-lg mb-4 shadow-sm">
              01
            </div>
            <h3 className="text-base sm:text-lg font-bold text-forest-950 mb-2">{t('landing.step1_title')}</h3>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              {t('landing.step1_desc')}
            </p>
          </div>

          <div className="bg-white p-6 sm:p-7 rounded-2xl border border-agri-border shadow-card relative">
            <div className="w-12 h-12 rounded-xl bg-agri-leaf text-white flex items-center justify-center font-bold font-display text-lg mb-4 shadow-sm">
              02
            </div>
            <h3 className="text-base sm:text-lg font-bold text-forest-950 mb-2">{t('landing.step2_title')}</h3>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              {t('landing.step2_desc')}
            </p>
          </div>

          <div className="bg-white p-6 sm:p-7 rounded-2xl border border-agri-border shadow-card relative">
            <div className="w-12 h-12 rounded-xl bg-forest-800 text-agri-lime flex items-center justify-center font-bold font-display text-lg mb-4 shadow-sm">
              03
            </div>
            <h3 className="text-base sm:text-lg font-bold text-forest-950 mb-2">{t('landing.step3_title')}</h3>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              {t('landing.step3_desc')}
            </p>
          </div>
        </div>
      </section>

      {/* 3. Interactive Benchmark Detections Demo */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-forest-950 text-white rounded-3xl p-6 sm:p-10 lg:p-12 border border-forest-800 shadow-lifted">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 sm:mb-10 pb-6 border-b border-forest-800">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-agri-lime">
                {t('landing.demo_sub')}
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1 font-display">
                {t('landing.demo_title')}
              </h2>
              <p className="text-xs sm:text-sm text-gray-400 mt-2 max-w-xl">
                {t('landing.demo_desc')}
              </p>
            </div>
            <button
              onClick={handleDiagnoseAction}
              className="px-5 py-2.5 bg-agri-leaf hover:bg-agri-leaf/90 text-white rounded-xl text-xs font-semibold flex items-center gap-2 border border-forest-700 w-fit shrink-0 transition"
            >
              <Scan className="w-4 h-4 text-agri-lime" />
              <span>{t('landing.demo_test_btn')}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {sampleDemos.map((demo, idx) => (
              <div 
                key={idx}
                className="bg-forest-900/80 rounded-2xl border border-forest-800 overflow-hidden flex flex-col hover:border-forest-700 transition"
              >
                <div className="relative aspect-video bg-black overflow-hidden">
                  <img
                    src={demo.image}
                    alt={demo.title}
                    className="w-full h-full object-cover opacity-85"
                  />
                  <div className="absolute top-3 left-3 bg-forest-950/90 text-white text-[11px] px-2.5 py-1 rounded-full border border-forest-700">
                    {demo.badge}
                  </div>
                  <div className="absolute bottom-3 right-3 bg-agri-leaf/90 text-white text-[11px] px-2.5 py-1 rounded-full font-mono font-semibold">
                    {demo.confidence}% Conf.
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h3 className="text-base font-bold text-white font-display">
                      {getLocalizedPestName(demo.title, i18n.language)}
                    </h3>
                    <div className="text-xs text-agri-lime font-medium mt-0.5">
                      {t('landing.host_label')}: {getLocalizedCropName(demo.crop, i18n.language)}
                    </div>
                    <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                      {demo.description}
                    </p>
                  </div>
                  <div className="pt-3 border-t border-forest-800/80 flex items-center justify-between text-[11px] text-gray-400">
                    <span className="flex items-center gap-1 text-emerald-400 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" /> {demo.status}
                    </span>
                    <span className="italic">{t('landing.benchmark_validation')}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Supported Pest Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
          <span className="text-xs font-semibold uppercase tracking-wider text-agri-leaf font-display">
            {t('landing.categories_sub')}
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-forest-950 mt-1 font-display">
            {t('landing.categories_title')}
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 mt-2">
            {t('landing.categories_desc')}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {pestCategories.map((cat, idx) => (
            <div
              key={idx}
              className="bg-white p-5 rounded-xl border border-agri-border shadow-soft hover:shadow-card transition hover:border-forest-700/40"
            >
              <div className="flex items-center justify-between mb-2">
                <Bug className="w-5 h-5 text-agri-leaf" />
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-agri-cream text-forest-900 border border-agri-border">
                  {cat.count}
                </span>
              </div>
              <h4 className="text-sm font-bold text-forest-950 font-display">{cat.name}</h4>
              <p className="text-xs text-gray-600 mt-1.5 leading-relaxed">{cat.desc}</p>
            </div>
          ))}

          <div
            onClick={() => {
              if (user) {
                onNavigate('library');
              } else {
                openAuthModal('login', 'profile');
              }
            }}
            className="bg-agri-cream/60 p-5 rounded-xl border border-dashed border-agri-leaf/40 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-agri-cream transition group"
          >
            <BookOpen className="w-6 h-6 text-agri-leaf mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-bold text-forest-950">{t('landing.search_full_catalog')}</span>
            <span className="text-xs text-gray-600 mt-0.5">{user ? t('landing.search_catalog_sub') : 'Sign in to access library'}</span>
          </div>
        </div>
      </section>

      {/* 5. Call to Action Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-forest-900 via-forest-800 to-forest-900 rounded-3xl p-6 sm:p-10 lg:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-card border border-forest-700">
          <div className="space-y-2 max-w-xl text-center md:text-left">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold font-display">{t('landing.cta_title')}</h2>
            <p className="text-xs sm:text-sm text-gray-300">
              {t('landing.cta_desc')}
            </p>
          </div>
          <button
            onClick={handleDiagnoseAction}
            className="px-6 py-3.5 bg-agri-lime text-forest-950 hover:bg-agri-lime/90 font-bold rounded-xl text-sm shadow-md flex items-center gap-2 whitespace-nowrap transition"
          >
            <Scan className="w-4 h-4" />
            <span>{t('landing.cta_btn')}</span>
          </button>
        </div>
      </section>
    </div>
  );
};
