"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/app/i18n/client';

export default function NewCase() {
  const { t } = useTranslation();
  const { user, status, requireAuth } = useAuth();
  const router = useRouter();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [projectName, setProjectName] = useState('');
  const [purchasePrice, setPurchasePrice] = useState<number | ''>(0);
  const [purchaseDate, setPurchaseDate] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Set current date as default purchase date
  useEffect(() => {
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0]; // Format as YYYY-MM-DD
    setPurchaseDate(formattedDate);
  }, []);

  // Check authentication on component mount
  useEffect(() => {
    requireAuth();
  }, [requireAuth]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/cases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          description,
          projectName,
          purchasePrice: purchasePrice === '' ? null : purchasePrice,
          purchaseDate: purchaseDate || null,
        }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || t('case.failedToCreate'));
      }
      
      // Redirect to the cases list
      router.push('/cases');
    } catch (error) {
      console.error('Error creating case:', error);
      setError(error instanceof Error ? error.message : t('common.unexpectedError'));
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state while checking authentication
  if (status === 'loading') {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // If not authenticated, the requireAuth function will redirect to signin
  if (status === 'unauthenticated') {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center sm:justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">{t('case.createNewCase')}</h1>
        <button
          type="button"
          onClick={() => router.push('/cases')}
          className="mt-3 sm:mt-0 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {t('common.cancel')}
        </button>
      </div>

      {error && (
        <div className="bg-red-100 p-4 rounded-md mb-6">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            {/* Basic Case Information */}
            <div>
              <h3 className="text-lg font-medium leading-6 text-gray-900">{t('case.basicInformation')}</h3>
              <div className="mt-5 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-6">
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                    {t('case.title')}
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="title"
                      id="title"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      placeholder={t('case.titlePlaceholder')}
                    />
                  </div>
                </div>

                <div className="sm:col-span-6">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    {t('case.description')}
                  </label>
                  <div className="mt-1">
                    <textarea
                      id="description"
                      name="description"
                      rows={4}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      placeholder={t('case.descriptionPlaceholder')}
                    />
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    {t('case.descriptionHint')}
                  </p>
                </div>
              </div>
            </div>

            {/* Project Information */}
            <div className="pt-5">
              <h3 className="text-lg font-medium leading-6 text-gray-900">{t('case.projectInformation')}</h3>
              <p className="mt-1 text-sm text-gray-500">
                {t('case.projectInfoDescription')}
              </p>
              
              <div className="mt-5 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-3">
                  <label htmlFor="projectName" className="block text-sm font-medium text-gray-700">
                    {t('case.projectName')}
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="projectName"
                      id="projectName"
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      placeholder={t('case.projectNamePlaceholder')}
                    />
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="purchaseDate" className="block text-sm font-medium text-gray-700">
                    {t('case.purchaseDate')}
                  </label>
                  <div className="mt-1">
                    <input
                      type="date"
                      name="purchaseDate"
                      id="purchaseDate"
                      value={purchaseDate}
                      onChange={(e) => setPurchaseDate(e.target.value)}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="purchasePrice" className="block text-sm font-medium text-gray-700">
                    {t('case.purchasePrice')}
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">€</span>
                    </div>
                    <input
                      type="number"
                      name="purchasePrice"
                      id="purchasePrice"
                      value={purchasePrice}
                      onChange={(e) => setPurchasePrice(e.target.value === '' ? '' : parseFloat(e.target.value))}
                      className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
                      placeholder="0.00"
                      aria-describedby="price-currency"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm" id="price-currency">
                        EUR
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-5 flex justify-end">
              <button
                type="submit"
                disabled={isLoading || !title}
                className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isLoading ? t('common.creating') : t('common.create')}
              </button>
            </div>
          </div>
        </form>
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-md">
        <h3 className="text-md font-semibold text-blue-800 mb-2">{t('case.whatIsCase')}</h3>
        <p className="text-sm text-blue-700">
          {t('case.caseExplanation')}
        </p>
      </div>
    </div>
  );
}
