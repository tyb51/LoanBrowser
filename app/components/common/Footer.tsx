"use client";

import React from 'react';
import { useTranslation } from 'react-i18next';

export function Footer() {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-100 p-4 text-center text-gray-600">
      <div className="container mx-auto">
        <p>{t('common.copyright', { year: currentYear })}</p>
      </div>
    </footer>
  );
}
