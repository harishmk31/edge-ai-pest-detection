import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en.json';
import ta from './locales/ta.json';
import hi from './locales/hi.json';

export const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English', nativeName: 'English' },
  { code: 'ta', label: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'hi', label: 'Hindi', nativeName: 'हिन्दी' },
] as const;

export type SupportedLanguageCode = typeof SUPPORTED_LANGUAGES[number]['code'];

const STORAGE_KEY = 'agrivision_language';

const getInitialLanguage = (): SupportedLanguageCode => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && ['en', 'ta', 'hi'].includes(saved)) {
      return saved as SupportedLanguageCode;
    }
  } catch {
    // Fall back to default
  }
  return 'en';
};

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      ta: { translation: ta },
      hi: { translation: hi },
    },
    lng: getInitialLanguage(),
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // React already escapes values
    },
  });

// Listen to language changes to persist to localStorage
i18n.on('languageChanged', (lng: string) => {
  try {
    localStorage.setItem(STORAGE_KEY, lng);
    document.documentElement.lang = lng;
  } catch (err) {
    console.warn('Could not persist language to localStorage:', err);
  }
});

export default i18n;
