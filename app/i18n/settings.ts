// T:\Development\LoanBrowser\app\i18n\settings.ts

export const LANGUAGES = {
    en: { nativeName: 'English' },
    nl: { nativeName: 'Nederlands' },
    fr: { nativeName: 'Français' },
    de: { nativeName: 'Deutsch' },
    es: { nativeName: 'Español' }
  };
  
  export const defaultNS = 'translation';
  export const cookieName = 'i18next';
  
  export function getOptions(lng = 'en', ns = defaultNS) {
    return {
      // debug: true, // Set to true for debugging
      supportedLngs: Object.keys(LANGUAGES),
      fallbackLng: 'en',
      lng,
      fallbackNS: defaultNS,
      defaultNS,
      ns,
      interpolation: {
        escapeValue: false
      }
    };
  }