import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import enUS from './locales/en-US.json';
import zhCN from './locales/zh-CN.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en-US',
    debug: false, // Will be set to true in development

    interpolation: {
      escapeValue: false, // React already does escaping
    },

    resources: {
      'en-US': {
        translation: enUS,
      },
      'zh-CN': {
        translation: zhCN,
      },
    },
  });

export default i18n;
