// T:\Development\LoanBrowser\app\components\common\LanguageSwitcher.tsx
"use client";

import React, { useState } from 'react';
import { useTranslation } from '@/app/i18n/client';
import { LANGUAGES } from '@/app/i18n/settings';

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  
  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        type="button"
        className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        onClick={() => setIsOpen(!isOpen)}
      >
        {LANGUAGES[i18n.resolvedLanguage as keyof typeof LANGUAGES]?.nativeName || LANGUAGES.en.nativeName}
        <svg
          className="w-5 h-5 ml-2 -mr-1"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 z-10 mt-2 origin-top-right bg-white border border-gray-200 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="py-1">
            {Object.keys(LANGUAGES).map((lng) => (
              <button
                key={lng}
                className={`block px-4 py-2 text-sm text-left w-full ${
                  i18n.resolvedLanguage === lng ? 'bg-gray-100 text-gray-900' : 'text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => changeLanguage(lng)}
              >
                {LANGUAGES[lng as keyof typeof LANGUAGES].nativeName}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}