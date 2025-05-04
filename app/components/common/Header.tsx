"use client";

import React from 'react';
import { useTranslation } from 'next-i18next';
import { LanguageSwitcher } from './LanguageSwitcher';
import Link from 'next/link';

export function Header() {
  const { t } = useTranslation();

  return (
    <header className="bg-blue-600 p-4 text-white">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Link href="/" className="text-xl font-bold">
            {t('common.appName')}
          </Link>
          
          <nav className="hidden md:flex space-x-4">
            <Link href="/" className="hover:text-blue-200 transition-colors">
              {t('navigation.singleLoan')}
            </Link>
            <Link href="/comparison" className="hover:text-blue-200 transition-colors">
              {t('navigation.loanComparison')}
            </Link>
            <Link href="/investment" className="hover:text-blue-200 transition-colors">
              {t('navigation.investmentSimulation')}
            </Link>
          </nav>
        </div>
        
        <div className="flex items-center space-x-4">
          <Link 
            href="/api-config" 
            className="text-sm px-3 py-1 bg-blue-700 hover:bg-blue-800 rounded flex items-center"
            title="API Settings"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="h-4 w-4 mr-1"
            >
              <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
            API
          </Link>
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
}
