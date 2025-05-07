// T:\Development\LoanLogic\app\i18n\I18nProvider.tsx
"use client";

import { ReactNode, useEffect } from 'react';
import i18next from 'i18next';
import { I18nextProvider } from 'react-i18next';
import { cookieName } from './settings';
import { useParams } from 'next/navigation';

interface I18nProviderProps {
  children: ReactNode;
  lang: string;
}

// This component is responsible for initializing i18next on the client side
export function I18nProvider({
  children,
  lang,
}: {
  children: ReactNode;
  lang: string;
}) {
  const params = useParams();
  
  useEffect(() => {
    const locale = params?.lang as string || lang 
    
    if (i18next.resolvedLanguage !== locale) {
      i18next.changeLanguage(locale);
    }
    
    // Store the selected language in cookie
    document.cookie = `${cookieName}=${locale}; path=/; max-age=31536000; SameSite=Lax`;
  }, [params, lang]);

  return <I18nextProvider i18n={i18next}>{children}</I18nextProvider>;
}