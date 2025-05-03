"use client";

import React, { useState } from 'react';
import { LoanParameters, LoanType, ModularLoanScheduleItem } from '@/app/types/loan';

interface LoanParametersFormProps {
  defaultValues?: Partial<LoanParameters>;
  onSubmit: (data: LoanParameters, modularSchedule?: ModularLoanScheduleItem[]) => void;
  isLoading?: boolean;
}

export function LoanParametersForm({ 
  defaultValues, 
  onSubmit, 
  isLoading = false 
}: LoanParametersFormProps) {
  const [formData, setFormData] = useState<LoanParameters>({
    loanType: defaultValues?.loanType || 'annuity',
    principal: defaultValues?.principal || 500000,
    interestRate: defaultValues?.interestRate || 3.5,
    termYears: defaultValues?.termYears || 30,
    ownContribution: defaultValues?.ownContribution || 100000,
    purchasePrice: defaultValues?.purchasePrice || 825000,
    delayMonths: defaultValues?.delayMonths || 0,
    startYear: defaultValues?.startYear || 2025,
    insuranceCoveragePct: defaultValues?.insuranceCoveragePct || 1.0,
  });

  const [modularSchedule, setModularSchedule] = useState<ModularLoanScheduleItem[]>([
    { month: formData.termYears * 12, amount: formData.principal }
  ]);

  const [scheduleItems, setScheduleItems] = useState<{ month: string, amount: string }[]>([
    { month: (formData.termYears * 12).toString(), amount: formData.principal.toString() }
  ]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    // If the field is a number, convert it
    const parsedValue = type === 'number' ? 
      (value === '' ? '' : parseFloat(value)) : 
      value;
    
    setFormData(prev => ({
      ...prev,
      [name]: parsedValue
    }));

    // If the principal changes, update the bullet loan schedule
    if (name === 'principal' && formData.loanType !== 'annuity') {
      setScheduleItems([
        { month: (formData.termYears * 12).toString(), amount: value }
      ]);
    }

    // If loan term changes, update the schedule for bullet loans
    if (name === 'termYears' && formData.loanType !== 'annuity') {
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
    if (newLoanType === 'bullet') {
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
    if (formData.loanType === 'annuity') {
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
          <label className="block text-sm font-medium text-gray-700 mb-1">Loan Type</label>
          <div className="mt-1 flex space-x-4">
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="loanType"
                value="annuity"
                checked={formData.loanType === 'annuity'}
                onChange={handleLoanTypeChange}
                className="h-4 w-4 text-blue-600"
              />
              <span className="ml-2">Annuity</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="loanType"
                value="bullet"
                checked={formData.loanType === 'bullet'}
                onChange={handleLoanTypeChange}
                className="h-4 w-4 text-blue-600"
              />
              <span className="ml-2">Bullet</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="loanType"
                value="modular"
                checked={formData.loanType === 'modular'}
                onChange={handleLoanTypeChange}
                className="h-4 w-4 text-blue-600"
              />
              <span className="ml-2">Modular</span>
            </label>
          </div>
        </div>

        {/* Basic Loan Parameters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Purchase Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Price (€)</label>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Down Payment / Own Contribution (€)</label>
            <input
              type="number"
              name="ownContribution"
              value={formData.ownContribution}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Principal Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Loan Principal (€)</label>
            <input
              type="number"
              name="principal"
              value={formData.principal}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Interest Rate */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Interest Rate (%)</label>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Loan Term (Years)</label>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Year</label>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Insurance Coverage (%)</label>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Delay (Months)</label>
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
        {(formData.loanType === 'bullet' || formData.loanType === 'modular') && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Payment Schedule</label>
            {formData.loanType === 'bullet' ? (
              <div className="text-sm text-gray-600 mb-2">
                For bullet loans, principal will be paid in the final month.
              </div>
            ) : (
              <div className="text-sm text-gray-600 mb-2">
                For modular loans, specify when principal payments will be made.
              </div>
            )}
            
            {scheduleItems.map((item, index) => (
              <div key={index} className="flex items-center space-x-2 mb-2">
                <input
                  type="number"
                  value={item.month}
                  onChange={(e) => handleScheduleChange(index, 'month', e.target.value)}
                  placeholder="Month"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                />
                <input
                  type="number"
                  value={item.amount}
                  onChange={(e) => handleScheduleChange(index, 'amount', e.target.value)}
                  placeholder="Amount"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                />
                {formData.loanType === 'modular' && (
                  <>
                    <button 
                      type="button"
                      onClick={() => handleRemoveScheduleItem(index)}
                      className="p-2 bg-red-50 text-red-500 rounded-md hover:bg-red-100"
                    >
                      Remove
                    </button>
                    {index === scheduleItems.length - 1 && (
                      <button 
                        type="button"
                        onClick={handleAddScheduleItem}
                        className="p-2 bg-blue-50 text-blue-500 rounded-md hover:bg-blue-100"
                      >
                        Add
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
          {isLoading ? 'Calculating...' : 'Calculate Loan'}
        </button>
      </div>
    </form>
  );
}
