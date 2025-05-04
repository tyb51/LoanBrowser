"use client";

import { useTranslation } from '@/app/i18n/client';
import React, { useState } from 'react';

interface BiometricData {
  id: string;
  name: string;
  type: 'INDIVIDUAL' | 'COMPANY';
  age?: number | null;
  height?: number | null;
  weight?: number | null;
  smoker?: boolean | null;
}

interface LifeInsuranceFormProps {
  clients: BiometricData[];
  loanAmount: number;
  termYears: number;
  onCalculate: (data: any) => void;
  isLoading?: boolean;
}

export function LifeInsuranceForm({
  clients,
  loanAmount,
  termYears,
  onCalculate,
  isLoading = false
}: LifeInsuranceFormProps) {
  const { t } = useTranslation();
  
  const [selectedClientIds, setSelectedClientIds] = useState<string[]>([]);
  const [coveragePercentage, setCoveragePercentage] = useState<number>(100);
  const [paymentType, setPaymentType] = useState<'LUMP_SUM' | 'DISTRIBUTED'>('DISTRIBUTED');
  const [basedOnRemainingCapital, setBasedOnRemainingCapital] = useState<boolean>(true);
  
  // Filter only individual clients with age information
  const eligibleClients = clients.filter(
    client => client.type === 'INDIVIDUAL' && client.age !== null
  );
  
  const handleClientChange = (clientId: string) => {
    setSelectedClientIds(prev => {
      if (prev.includes(clientId)) {
        return prev.filter(id => id !== clientId);
      } else {
        return [...prev, clientId];
      }
    });
  };
  
  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedClientIds.length === 0) {
      alert('Please select at least one client');
      return;
    }
    
    onCalculate({
      clientIds: selectedClientIds,
      lifeInsurance: {
        coveragePercentage: coveragePercentage / 100,
        paymentType,
        basedOnRemainingCapital
      }
    });
  };
  
  return (
    <form onSubmit={handleCalculate} className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Life Insurance Settings</h3>
        
        {eligibleClients.length === 0 ? (
          <div className="p-4 bg-yellow-50 rounded-md">
            <p className="text-sm text-yellow-700">
              {t('insurance.noEligibleClients')}
            </p>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Clients
              </label>
              <div className="space-y-2 max-h-40 overflow-y-auto p-2 border border-gray-300 rounded-md">
                {eligibleClients.map(client => (
                  <div key={client.id} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`client-${client.id}`}
                      checked={selectedClientIds.includes(client.id)}
                      onChange={() => handleClientChange(client.id)}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor={`client-${client.id}`} className="ml-2 text-sm text-gray-700">
                      {client.name} ({client.age} years, {client.smoker ? 'Smoker' : 'Non-smoker'})
                      {client.height && client.weight ? ` - ${client.height}cm, ${client.weight}kg` : ''}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Coverage Percentage
                </label>
                <div className="flex items-center">
                  <input
                    type="range"
                    min="10"
                    max="200"
                    step="5"
                    value={coveragePercentage}
                    onChange={(e) => setCoveragePercentage(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="ml-2 w-16 text-sm text-gray-700">{coveragePercentage}%</span>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Percentage of the loan amount to insure (€{Math.round(loanAmount * coveragePercentage / 100)})
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Type
                </label>
                <select
                  value={paymentType}
                  onChange={(e) => setPaymentType(e.target.value as 'LUMP_SUM' | 'DISTRIBUTED')}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  <option value="DISTRIBUTED">Monthly Payments</option>
                  <option value="LUMP_SUM">Lump Sum Payment</option>
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  How the insurance premium will be paid
                </p>
              </div>
            </div>
            
            <div className="mt-4">
              <div className="flex items-center">
                <input
                  id="remaining-capital"
                  type="checkbox"
                  checked={basedOnRemainingCapital}
                  onChange={(e) => setBasedOnRemainingCapital(e.target.checked)}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="remaining-capital" className="ml-2 text-sm text-gray-700">
                  Base coverage on remaining capital
                </label>
              </div>
              <p className="mt-1 text-xs text-gray-500 pl-6">
                If checked, insurance coverage will decrease as the loan is paid off. This typically results in lower premiums.
              </p>
            </div>
            
            <div className="mt-6 p-4 bg-blue-50 rounded-md">
              <h4 className="text-sm font-medium text-blue-800 mb-2">Insurance Information</h4>
              <ul className="text-xs text-blue-700 space-y-1 list-disc pl-5">
                <li>Life insurance provides coverage in case of death of the insured person</li>
                <li>Monthly payments spread the premium over the life of the loan</li>
                <li>Lump sum payment is higher upfront but may offer overall savings</li>
                <li>Over-insurance allows for multiple 100% coverages (useful for couples or business partners)</li>
              </ul>
            </div>
          </>
        )}
      </div>
      
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isLoading || selectedClientIds.length === 0}
          className="px-4 py-2 bg-blue-600 text-white rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {isLoading ? 'Calculating...' : 'Calculate Life Insurance'}
        </button>
      </div>
    </form>
  );
}
