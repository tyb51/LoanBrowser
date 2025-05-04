"use client";

import React, { useState } from 'react';
import { useTranslation } from '@/app/i18n/client';
import { InvestmentParameters } from '@/app/types/loan';
// Removed TabNavigation import as it's not suitable for this use case

interface InvestmentParametersFormProps {
  defaultValues?: Partial<InvestmentParameters>;
  onSubmit: (data: InvestmentParameters) => void;
  isLoading?: boolean;
  // showSeparateCapitals prop is no longer needed as tab handles this
}

type InvestmentType = 'equal' | 'separate';

export function InvestmentParametersForm({
  defaultValues,
  onSubmit,
  isLoading = false,
}: InvestmentParametersFormProps) {
  const { t } = useTranslation();
  
  // State to manage the selected investment type tab
  const [investmentType, setInvestmentType] = useState<InvestmentType>('equal');

  const [formData, setFormData] = useState<InvestmentParameters>({
    startCapital: defaultValues?.startCapital || 120000,
    annualGrowthRate: defaultValues?.annualGrowthRate || 8.0,
    refInvestCapital: defaultValues?.refInvestCapital || 60000,
    altInvestCapital: defaultValues?.altInvestCapital || 60000,
  });

  // Handle changes to input fields
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    
    // If the field is a number, convert it
    const parsedValue = type === 'number' ? 
      (value === '' ? '' : parseFloat(value)) : 
      value;
    
    // Update the specific field
    setFormData(prev => ({
      ...prev,
      [name]: parsedValue
    }));

  
  };

  // Handle tab changes
  const handleTabChange = (tab: InvestmentType) => {
    setInvestmentType(tab);
    // Adjust formData based on the new tab selection to maintain consistency
    if (tab === 'equal') {
      // When switching to 'equal', update separate capitals based on the current total
      const totalCapital = formData.startCapital || 0;
      const halfValue = totalCapital / 2;
      setFormData(prev => ({
        ...prev,
        refInvestCapital: halfValue,
        altInvestCapital: halfValue
      }));
    } else {
      // When switching to 'separate', update total capital based on the current separate capitals
      const newTotal = (formData.refInvestCapital || 0) + (formData.altInvestCapital || 0);
      setFormData(prev => ({
        ...prev,
        startCapital: newTotal
      }));
    }
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };


  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Custom Tab Navigation */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8" aria-label="Investment Type Tabs">
          <button
            type="button"
            onClick={() => handleTabChange('equal')}
            className={`
              whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
              ${investmentType === 'equal' 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
            `}
          >
            {t('forms.equalInvestment')}
          </button>
          <button
            type="button"
            onClick={() => handleTabChange('separate')}
            className={`
              whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
              ${investmentType === 'separate' 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
            `}
          >
            {t('forms.separateInvestment')}
          </button>
        </nav>
      </div>

      {investmentType === 'equal' ? (
        <div className="gap-4">
          {/* Combined Start Capital */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('forms.startCapital')}</label>
            <input
              type="number"
              name="startCapital"
              value={formData.startCapital}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="mt-1 text-xs text-gray-500">
              {t('forms.initialInvestmentCapital')}
            </p>
          </div>

        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4">
            {/* Total Start Capital (derived in separate mode) */}
            <div className="disabled">
              {/* This input is disabled to prevent direct editing */}
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('forms.totalStartCapital')}</label>
              <input
                type="number"
                name="startCapital"
                value={formData.startCapital}
                onChange={handleChange} // Keep onChange for consistency, though changes here will be overwritten by separate inputs
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-gray-100"
                disabled // Disable direct editing in separate mode
              />
              <p className="mt-1 text-xs text-gray-500">
                {t('forms.totalInitialInvestmentCapital')}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Reference Loan Start Capital */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('forms.referenceStartCapital')}</label>
              <input
                type="number"
                name="refInvestCapital"
                value={formData.refInvestCapital}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="mt-1 text-xs text-gray-500">
                {t('forms.referenceInitialCapital')}
              </p>
            </div>

            {/* Alternative Loan Start Capital */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('forms.alternativeStartCapital')}</label>
              <input
                type="number"
                name="altInvestCapital"
                value={formData.altInvestCapital}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="mt-1 text-xs text-gray-500">
                {t('forms.alternativeInitialCapital')}
              </p>
            </div>
          </div>

        </>
      )}

      {/* Annual Growth Rate */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{t('forms.annualGrowthRate')}</label>
        <input
          type="number"
          step="0.1"
          name="annualGrowthRate"
          value={formData.annualGrowthRate}
          onChange={handleChange}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
        <p className="mt-1 text-xs text-gray-500">
          {t('forms.expectedAnnualReturn')}
        </p>
      </div>
      <div className="flex justify-end mt-4">
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {isLoading ? t('forms.calculating') : t('forms.calculateInvestment')}
        </button>
      </div>
    </form>
  );
}
