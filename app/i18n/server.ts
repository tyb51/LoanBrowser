// T:\Development\LoanLogic\app\i18n\server.ts

import { createInstance } from 'i18next';
import resourcesToBackend from 'i18next-resources-to-backend';
import { initReactI18next } from 'react-i18next/initReactI18next';
import { getOptions } from './settings';
import { cookies } from 'next/headers';
import { cookieName } from './settings';

// This function gets a unique i18next instance for SSR on server
export const initI18next = async (lng: string, ns: string) => {
  const i18nInstance = createInstance();
  await i18nInstance
    .use(initReactI18next)
    .use(resourcesToBackend((language: string, namespace: string) => 
      import(`./locales/${language}/${namespace}.json`)))
    .init(getOptions(lng, ns));

  return i18nInstance;
};

// Helper function to get the preferred language from cookies or headers
export async function getTranslation(ns = 'translation') {
  const cookieStore = await cookies();
  const languageCookie = cookieStore.get(cookieName);
  
  const lng = languageCookie?.value || 'en';
  const i18nextInstance = await initI18next(lng, ns);
  
  return {
    t: i18nextInstance.getFixedT(lng, ns),
    i18n: i18nextInstance,
    lng
  };
}