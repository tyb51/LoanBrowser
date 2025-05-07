"use client";

import React, { useState, useEffect } from 'react';
import { useTranslation } from '@/app/i18n/client';
import { LoanParameters, LoanType, ModularLoanScheduleItem } from '@/app/types/loan';
import { calculateLoanValues, updateLoanWithPurchasePrice } from '@/app/utils/loan/calculateLoanValues';

interface LoanParametersFormProps {
  defaultValues?: Partial<LoanParameters>;
  onSubmit: (data: LoanParameters, modularSchedule?: ModularLoanScheduleItem[]) => void;
  isLoading?: boolean;
  onValuesChange?: (data: LoanParameters) => void;
}

export function LoanParametersForm({ 
  defaultValues, 
  onSubmit, 
  isLoading = false,
  onValuesChange
}: LoanParametersFormProps) {
  const { t } = useTranslation();
  
  // Set default values with calculated loan amount and own contribution
  const initialPurchasePrice = defaultValues?.purchasePrice || 500000;
  const { principal, ownContribution } = calculateLoanValues(initialPurchasePrice);
  
  const [formData, setFormData] = useState<LoanParameters>({
    loanType: defaultValues?.loanType || LoanType.ANNUITY,
    principal: defaultValues?.principal || principal,
    interestRate: defaultValues?.interestRate || 3.5,
    termYears: defaultValues?.termYears || 30,
    ownContribution: defaultValues?.ownContribution || ownContribution,
    purchasePrice: defaultValues?.purchasePrice || initialPurchasePrice,
    delayMonths: defaultValues?.delayMonths || 0,
    startYear: defaultValues?.startYear || new Date().getFullYear(),
    insuranceCoveragePct: defaultValues?.insuranceCoveragePct || 1.0,
  });

  const [scheduleItems, setScheduleItems] = useState<{ month: string, amount: string }[]>([
    { month: (formData.termYears * 12).toString(), amount: formData.principal.toString() }
  ]);

  // Notify parent component when values change
  // Using a ref to avoid infinite update loops
  const prevFormDataRef = React.useRef(formData);
  
  useEffect(() => {
    // Only call onValuesChange if the formData has actually changed meaningfully
    //if (onValuesChange && JSON.stringify(prevFormDataRef.current) !== JSON.stringify(formData)) {
      //prevFormDataRef.current = formData;
      if (onValuesChange) {
        onValuesChange(formData);
      }
   // }
  }, [formData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    // If the field is a number, convert it
    const parsedValue = type === 'number' ? 
      (value === '' ? '' : parseFloat(value)) : 
      value;
    
    setFormData(prev => {
      const newData = {
        ...prev,
        [name]: parsedValue
      };

      // Auto-calculate loan amount and own contribution when purchase price changes
      if (name === 'purchasePrice' && parsedValue) {
        const updatedData = updateLoanWithPurchasePrice(newData, parsedValue as number);
        return updatedData;
      }

      // Update loan amount when own contribution changes
      if (name === 'ownContribution' && parsedValue && newData.purchasePrice) {
        return {
          ...newData,
          principal: newData.purchasePrice - (parsedValue as number)
        };
      }

      // Update own contribution when principal changes
      if (name === 'principal' && parsedValue && newData.purchasePrice) {
        return {
          ...newData,
          ownContribution: newData.purchasePrice - (parsedValue as number)
        };
      }

      return newData;
    });

    // If the principal changes, update the bullet loan schedule
    if (name === 'principal' && formData.loanType !== LoanType.ANNUITY) {
      setScheduleItems([
        { month: (formData.termYears * 12).toString(), amount: value }
      ]);
    }

    // If loan term changes, update the schedule for bullet loans
    if (name === 'termYears' && formData.loanType !== LoanType.ANNUITY) {
      setScheduleItems([
        { month: (parseInt(value, 10) * 12).toString(), amount: formData.principal.toString() }
      ]);
    }
  };

  const handleLoanTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newLoanType = e.target.value as LoanType;
    
    setFormData(prev => ({
      ...prev,
      loanType: newLoanType
    }));

    // Reset the schedule for bullet loans
    if (newLoanType === LoanType.BULLET) {
      setScheduleItems([
        { month: (formData.termYears * 12).toString(), amount: formData.principal.toString() }
      ]);
    }
  };

  const handleAddScheduleItem = () => {
    setScheduleItems([...scheduleItems, { month: '', amount: '' }]);
  };

  const handleRemoveScheduleItem = (index: number) => {
    const updatedSchedule = [...scheduleItems];
    updatedSchedule.splice(index, 1);
    setScheduleItems(updatedSchedule);
  };

  const handleScheduleChange = (index: number, field: 'month' | 'amount', value: string) => {
    const updatedSchedule = [...scheduleItems];
    updatedSchedule[index][field] = value;
    setScheduleItems(updatedSchedule);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Convert schedule items to ModularLoanScheduleItem[]
    const parsedSchedule = scheduleItems
      .filter(item => item.month !== '' && item.amount !== '')
      .map(item => ({
        month: parseInt(item.month, 10),
        amount: parseFloat(item.amount)
      }))
      .sort((a, b) => a.month - b.month);
    
    // For annuity loans, no schedule is needed
    if (formData.loanType === LoanType.ANNUITY) {
      onSubmit(formData);
    } else {
      onSubmit(formData, parsedSchedule);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-4">
        {/* Loan Type Selection */}
        <div className="col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('forms.loanType')}</label>
          <div className="mt-1 flex space-x-4">
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="loanType"
                value={LoanType.ANNUITY}
                checked={formData.loanType === LoanType.ANNUITY}
                onChange={handleLoanTypeChange}
                className="h-4 w-4 text-blue-600"
              />
              <span className="ml-2">{t('loanTypes.annuity')}</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="loanType"
                value={LoanType.BULLET}
                checked={formData.loanType === LoanType.BULLET}
                onChange={handleLoanTypeChange}
                className="h-4 w-4 text-blue-600"
              />
              <span className="ml-2">{t('loanTypes.bullet')}</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="loanType"
                value={LoanType.MODULAR}
                checked={formData.loanType === LoanType.MODULAR}
                onChange={handleLoanTypeChange}
                className="h-4 w-4 text-blue-600"
              />
              <span className="ml-2">{t('loanTypes.modular')}</span>
            </label>
          </div>
        </div>

        {/* Basic Loan Parameters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Purchase Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('forms.purchasePrice')}</label>
            <input
              type="number"
              name="purchasePrice"
              value={formData.purchasePrice}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Own Contribution */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('forms.ownContribution')}</label>
            <input
              type="number"
              name="ownContribution"
              value={formData.ownContribution}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="mt-1 text-xs text-gray-500">
              {formData.purchasePrice && formData.ownContribution ? 
                `${((formData.ownContribution / formData.purchasePrice) * 100).toFixed(1)}% ${t('forms.ofPurchasePrice')}` : 
                ''}
            </p>
          </div>

          {/* Principal Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('forms.principal')}</label>
            <input
              type="number"
              name="principal"
              value={formData.principal}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="mt-1 text-xs text-gray-500">
              {formData.purchasePrice && formData.principal ? 
                `${((formData.principal / formData.purchasePrice) * 100).toFixed(1)}% ${t('forms.ofPurchasePrice')}` : 
                ''}
            </p>
          </div>

          {/* Interest Rate */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('forms.interestRate')}</label>
            <input
              type="number"
              step="0.01"
              name="interestRate"
              value={formData.interestRate}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Term */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('forms.termYears')}</label>
            <input
              type="number"
              name="termYears"
              value={formData.termYears}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Start Year */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('forms.startYear')}</label>
            <input
              type="number"
              name="startYear"
              value={formData.startYear}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Insurance Coverage */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('forms.insuranceCoverage')}</label>
            <input
              type="number"
              step="0.01"
              min="0"
              max="100"
              name="insuranceCoveragePct"
              value={formData.insuranceCoveragePct * 100}
              onChange={(e) => {
                const value = e.target.value;
                setFormData(prev => ({
                  ...prev,
                  insuranceCoveragePct: parseFloat(value) / 100
                }));
              }}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Delay Months */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('forms.delayMonths')}</label>
            <input
              type="number"
              name="delayMonths"
              value={formData.delayMonths}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Modular/Bullet Loan Schedule */}
        {(formData.loanType === LoanType.BULLET || formData.loanType === LoanType.MODULAR) && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('forms.paymentSchedule')}</label>
            {formData.loanType === LoanType.BULLET ? (
              <div className="text-sm text-gray-600 mb-2">
                {t('forms.bulletLoanInfo')}
              </div>
            ) : (
              <div className="text-sm text-gray-600 mb-2">
                {t('forms.modularLoanInfo')}
              </div>
            )}
            
            {scheduleItems.map((item, index) => (
              <div key={index} className="flex items-center space-x-2 mb-2">
                <input
                  type="number"
                  value={item.month}
                  onChange={(e) => handleScheduleChange(index, 'month', e.target.value)}
                  placeholder={t('forms.month')}
                  className="flex-1 px-3 py-2 border w-full border-gray-300 rounded-md"
                />
                <input
                  type="number"
                  value={item.amount}
                  onChange={(e) => handleScheduleChange(index, 'amount', e.target.value)}
                  placeholder={t('forms.amount')}
                  className="flex-1 px-3 py-2 border w-full border-gray-300 rounded-md"
                />
                {formData.loanType === LoanType.MODULAR && (
                  <>
                    <button 
                      type="button"
                      onClick={() => handleRemoveScheduleItem(index)}
                      className="p-2 bg-red-50 text-red-500 rounded-md hover:bg-red-100"
                    >
                      -
                      {/* t('forms.remove') */}
                    </button>
                    {index === scheduleItems.length - 1 && (
                      <button 
                        type="button"
                        onClick={handleAddScheduleItem}
                        className="p-2 bg-blue-50 text-blue-500 rounded-md hover:bg-blue-100"
                      >
                        +
                        {/* t('forms.add') */}
                      </button>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-end mt-6">
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {isLoading ? t('forms.calculating') : t('forms.calculate')}
        </button>
      </div>
    </form>
  );
}
