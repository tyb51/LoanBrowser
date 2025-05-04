"use client";

import React, { useState } from 'react';
import { useTranslation } from 'next-i18next';
import { InvestmentParameters } from '@/app/types/loan';

interface InvestmentParametersFormProps {
  defaultValues?: Partial<InvestmentParameters>;
  onSubmit: (data: InvestmentParameters) => void;
  isLoading?: boolean;
}

export function InvestmentParametersForm({
  defaultValues,
  onSubmit,
  isLoading = false
}: InvestmentParametersFormProps) {
  const { t } = useTranslation();
  
  const [formData, setFormData] = useState<InvestmentParameters>({
    startCapital: defaultValues?.startCapital || 120000,
    annualGrowthRate: defaultValues?.annualGrowthRate || 8.0,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    
    // If the field is a number, convert it
    const parsedValue = type === 'number' ? 
      (value === '' ? '' : parseFloat(value)) : 
      value;
    
    setFormData(prev => ({
      ...prev,
      [name]: parsedValue
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Start Capital */}
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
