"use client";

import React from 'react';
import { useTranslation } from '@/app/i18n/client';
import { LanguageSwitcher } from './LanguageSwitcher';
import Link from 'next/link';
import { useAuth } from '@/app/contexts/AuthContext';

export function Header() {
  const { t } = useTranslation();
  const { user, status, signOut } = useAuth();

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
            {status === 'authenticated' && (
              <Link href="/dashboard" className="hover:text-blue-200 transition-colors">
                Dashboard
              </Link>
            )}
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
          
          {status === 'authenticated' ? (
            <div className="relative group">
              <button className="flex items-center space-x-1 text-white hover:text-blue-200">
                <span>{user?.name || 'User'}</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 hidden group-hover:block">
                <Link href="/dashboard" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  Dashboard
                </Link>
                <Link href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  Profile
                </Link>
                <Link href="/cases" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  {t('ui.myCases')}
                </Link>
                <button
                  onClick={() => signOut()}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Sign out
                </button>
              </div>
            </div>
          ) : (
            <div className="flex space-x-2">
              <Link href="/auth/signin" className="text-sm px-3 py-1 bg-white text-blue-600 hover:bg-blue-50 rounded">
                Sign in
              </Link>
              <Link href="/auth/register" className="text-sm px-3 py-1 bg-blue-700 hover:bg-blue-800 rounded">
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
