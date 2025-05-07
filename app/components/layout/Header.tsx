"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from '@/app/i18n/client';
import { LanguageSwitcher } from '../common/LanguageSwitcher';
import { useAuth } from '@/app/contexts/AuthContext';
import { ChevronDownIcon, Menu, MenuIcon, X, XIcon } from 'lucide-react';

export const Header = () => {
  const { t } = useTranslation();

  const { user, status, signOut } = useAuth();
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMenuVisible, setIsMenuVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const isActive = (path: string) => {
    return pathname === path;
  };


  const handleLogout = () => {
    setIsMobileMenuOpen(false);
    signOut();
  };
  const navLinks = [
    { name: t('navigation.home', 'Home'), path: '/' },
    { name: t('navigation.features', 'Features'), path: '/features' },
    { name: t('navigation.pricing', 'Pricing'), path: '/pricing' },
    { name: t('navigation.about', 'About'), path: '/about' },
    { name: t('navigation.contact', 'Contact'), path: '/contact' },
  ];
  const authNavLinks = [
    { name: t('navigation.home', 'Home'), path: '/' },
    { name: t('navigation.dashboard', 'Dashboard'), path: '/dashboard' },
    { name: t('navigation.profile', 'Profile'), path: '/profile' },
    { name: t('navigation.about', 'About'), path: '/about' },
    { name: t('navigation.contact', 'Contact'), path: '/contact' },
  ];

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white shadow-md py-2' : 'bg-blue-600 py-4'}`}>
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center"
          >
            <span className={`text-2xl font-bold ${isScrolled ? 'text-blue-600' : 'text-white'}`}>
              {t('common.appName')}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {status === 'authenticated' ? (
              authNavLinks.map((link) => (
                <Link
                  key={link.path}
                  href={link.path}
                  className={`font-medium transition-colors duration-300 ${isActive(link.path)
                    ? isScrolled
                      ? 'text-blue-600'
                      : 'text-white font-semibold'
                    : isScrolled
                      ? 'text-gray-700 hover:text-blue-600'
                      : 'text-blue-100 hover:text-white'
                    }`}
                >
                  {link.name}
                </Link>
              ))
            ) : (
              navLinks.map((link) => (
                <Link
                  key={link.path}
                  href={link.path}
                  className={`font-medium transition-colors duration-300 ${isActive(link.path)
                    ? isScrolled
                      ? 'text-blue-600'
                      : 'text-white font-semibold'
                    : isScrolled
                      ? 'text-gray-700 hover:text-blue-600'
                      : 'text-blue-100 hover:text-white'
                    }`}
                >
                  {link.name}
                </Link>
              ))
            )}
          </nav>

          {/* CTA Buttons */}
          {status === 'authenticated' ? (
            <div className="relative group">
              <button 
                className={`max-md:hidden flex items-center space-x-1 font-medium transition-colors duration-300 ${isScrolled
                  ? 'text-gray-700 hover:text-blue-600'
                  : 'text-blue-100 hover:text-white'
                  }`}
                onMouseEnter={() => setIsMenuVisible(true)}
                onClick={() => setIsMenuVisible(!isMenuVisible)}
              >
                <span>{user?.name || 'User'}</span>
                <ChevronDownIcon className={`w-4 h-4 transition-transform duration-300 ${isMenuVisible ? 'rotate-180' : ''}`} />
              </button>
              <div 
                className={`absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 ${isMenuVisible ? 'block' : 'hidden group-hover:block'}`}
                onMouseEnter={() => setIsMenuVisible(true)}
                onMouseLeave={() => setIsMenuVisible(false)}
              >
                <Link href="/dashboard" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  {t('navigation.dashboard')}
                </Link>
                <Link href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  {t('navigation.profile')}
                </Link>
                <Link href="/cases" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  {t('ui.myCases')}
                </Link>
                <button
                  onClick={() => signOut()}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  {t('navigation.logout')}
                </button>
              </div>
            </div>
          ) : (
            <div className="max-md:hidden flex space-x-2">
              <Link href="/auth/signin" className={`transition-colors duration-300 pt-4  border-gray-200 flex flex-col space-y-4 ${isScrolled
                ? 'text-gray-700 hover:text-blue-600'
                : 'text-blue-100 hover:text-white'
                }`}>
                {t('navigation.login')}
              </Link>
              <Link href="/auth/register" className={`px-4 py-2 rounded-lg font-medium transition-colors duration-300 ${isScrolled
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-white text-blue-600 hover:bg-blue-50'
                }`}>
                {t('navigation.signup')}
              </Link>
            </div>
          )}



          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
                <XIcon className={`w-6 h-6 ${isScrolled ? 'text-gray-800' : 'text-white'}`} />
              ) : (
                <MenuIcon className={`w-6 h-6 ${isScrolled ? 'text-gray-800' : 'text-white'}`} />
              )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 py-4 bg-white rounded-lg shadow-lg">

            {status === 'authenticated' ? (
              <div>
                <nav className="flex flex-col space-y-4 px-4">
                  {authNavLinks.map((link) => (
                    <Link
                      key={link.path}
                      href={link.path}
                      className={`font-medium ${isActive(link.path) ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'
                        }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {link.name}
                    </Link>
                  ))}
                  <div className="pt-4 border-t border-gray-200 flex flex-col space-y-4">
                    <Link
                      href="/profile"
                      className="text-gray-700 hover:text-blue-600"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <span>{user?.name || 'User'}</span>
                    </Link>
                    <button
                      onClick={() => handleLogout()}
                      className="bg-blue-600 text-white py-2 px-4 rounded-lg text-center font-medium hover:bg-blue-700 transition-colors"
                    >
                      {t('navigation.logout')}
                    </button>
                  </div>
                </nav>
              </div>
            ) : (
              <div>
                <nav className="flex flex-col space-y-4 px-4">
                  {navLinks.map((link) => (
                    <Link
                      key={link.path}
                      href={link.path}
                      className={`font-medium ${isActive(link.path) ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'
                        }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {link.name}
                    </Link>
                  ))}
                  <div className="pt-4 border-t border-gray-200 flex flex-col space-y-4">
                    <Link
                      href="/auth/signin"
                      className="text-gray-700 hover:text-blue-600"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {t('navigation.login', 'Login')}
                    </Link>
                    <Link
                      href="/auth/register"
                      className="bg-blue-600 text-white py-2 px-4 rounded-lg text-center font-medium hover:bg-blue-700 transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {t('navigation.getStarted', 'Get Started')}
                    </Link>
                  </div>
                </nav>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;