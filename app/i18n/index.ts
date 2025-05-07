/*import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import all language files
import en from './locales/en.json';
import nl from './locales/nl.json';
import fr from './locales/fr.json';
import de from './locales/de.json';
import es from './locales/es.json';

// List of supported languages
export const LANGUAGES = {
  en: { nativeName: 'English' },
  nl: { nativeName: 'Nederlands' },
  fr: { nativeName: 'Français' },
  de: { nativeName: 'Deutsch' },
  es: { nativeName: 'Español' }
};

// Initialize i18next
i18n
  .use(LanguageDetector) // Detect user language
  .use(initReactI18next) // Pass i18n down to react-i18next
  .init({
    resources: {
      en: { translation: en },
      nl: { translation: nl },
      fr: { translation: fr },
      de: { translation: de },
      es: { translation: es }
    },
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false // React already safes from XSS
    },
    detection: {
      order: ['localStorage', 'navigator'], 
      caches: ['localStorage']
    }
  });

export default i18n;*/
