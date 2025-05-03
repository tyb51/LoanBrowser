"use client";

import React, { useEffect, ReactNode } from 'react';
import './index'; // Initialize i18next

interface I18nProviderProps {
  children: ReactNode;
}

export function I18nProvider({ children }: I18nProviderProps) {
  useEffect(() => {
    // This is needed to ensure i18next initializes properly in the client
    // in the Next.js App Router environment
  }, []);

  return <>{children}</>;
}
