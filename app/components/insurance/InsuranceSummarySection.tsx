"use client";

import React from 'react';
import Link from 'next/link';
import { useTranslation } from '@/app/i18n/client';

interface InsuranceClient {
  id: string;
  name: string;
  type: string;
}

interface HomeInsuranceClient {
  clientId: string;
  sharePercentage: number;
  client: {
    name: string;
    type: string;
  };
}

interface InsuranceSimulation {
  id: string;
  name: string;
  type: 'LIFE' | 'HOME';
  parameters: any;
  calculationResult?: any;
  clientId?: string;
  client?: InsuranceClient;
  homeInsuranceClients?: HomeInsuranceClient[];
  simulatedInterestRate?: number;
}

interface InsuranceSummarySectionProps {
  caseId: string;
  insuranceSimulations: InsuranceSimulation[];
}

export function InsuranceSummarySection({ caseId, insuranceSimulations }: InsuranceSummarySectionProps) {
  const { t } = useTranslation();
  
  // Group simulations by type
  const lifeInsurances = insuranceSimulations.filter(sim => sim.type === 'LIFE');
  const homeInsurances = insuranceSimulations.filter(sim => sim.type === 'HOME');
  
  // Format currency
  const formatCurrency = (amount?: number) => {
    if (amount === undefined || amount === null) return 'N/A';
    return new Intl.NumberFormat('nl-BE', { style: 'currency', currency: 'EUR' }).format(amount);
  };
  
  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
        <div>
          <h3 className="text-lg leading-6 font-medium text-gray-900">Insurance Simulations</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Insurance policies simulated for this case
          </p>
        </div>
        
        <Link
          href={`/cases/${caseId}/insurance-simulations/new`}
          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Add Simulation
        </Link>
      </div>
      
      <div className="border-t border-gray-200">
        {insuranceSimulations.length === 0 ? (
          <div className="px-4 py-5 sm:px-6 text-center">
            <p className="text-sm text-gray-500">No insurance simulations yet.</p>
            <p className="mt-2 text-sm text-gray-500">
              Click "Add Simulation" to create your first insurance simulation.
            </p>
          </div>
        ) : (
          <>
            {/* Life Insurance Summary */}
            {lifeInsurances.length > 0 && (
              <div className="bg-blue-50 p-4">
                <h4 className="text-sm font-medium text-blue-800 mb-2">Life Insurance Simulations ({lifeInsurances.length})</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {lifeInsurances.map(insurance => (
                    <div key={insurance.id} className="bg-white p-3 rounded-md shadow-sm">
                      <Link 
                        href={`/cases/${caseId}/insurance-simulations/${insurance.id}`}
                        className="text-sm font-medium text-blue-600 hover:text-blue-800"
                      >
                        {insurance.name}
                      </Link>
                      <div className="mt-2 text-xs text-gray-600 space-y-1">
                        <div className="flex justify-between">
                          <span>Client:</span>
                          <span className="font-medium">{insurance.client?.name || 'None'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Coverage:</span>
                          <span className="font-medium">{(insurance.parameters.coveragePercentage * 100).toFixed(0)}%</span>
                        </div>
                        {insurance.calculationResult && (
                          <>
                            <div className="flex justify-between">
                              <span>Monthly Premium:</span>
                              <span className="font-medium">{formatCurrency(insurance.calculationResult.monthlyPremium)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Coverage Amount:</span>
                              <span className="font-medium">{formatCurrency(insurance.calculationResult.coverageAmount)}</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Home Insurance Summary */}
            {homeInsurances.length > 0 && (
              <div className={`${lifeInsurances.length > 0 ? 'border-t border-gray-200' : ''} bg-green-50 p-4`}>
                <h4 className="text-sm font-medium text-green-800 mb-2">Home Insurance Simulations ({homeInsurances.length})</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {homeInsurances.map(insurance => (
                    <div key={insurance.id} className="bg-white p-3 rounded-md shadow-sm">
                      <Link 
                        href={`/cases/${caseId}/insurance-simulations/${insurance.id}`}
                        className="text-sm font-medium text-green-600 hover:text-green-800"
                      >
                        {insurance.name}
                      </Link>
                      <div className="mt-2 text-xs text-gray-600 space-y-1">
                        {insurance.homeInsuranceClients && insurance.homeInsuranceClients.length > 0 && (
                          <div className="flex justify-between">
                            <span>Clients:</span>
                            <span className="font-medium">
                              {insurance.homeInsuranceClients.length === 1
                                ? insurance.homeInsuranceClients[0].client.name
                                : `${insurance.homeInsuranceClients.length} clients`}
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span>Property Type:</span>
                          <span className="font-medium">{insurance.parameters.propertyType.replace('_', ' ')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Property Value:</span>
                          <span className="font-medium">{formatCurrency(insurance.parameters.propertyValue)}</span>
                        </div>
                        {insurance.calculationResult && (
                          <>
                            <div className="flex justify-between">
                              <span>Monthly Premium:</span>
                              <span className="font-medium">{formatCurrency(insurance.calculationResult.monthlyPremium)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Yearly Premium:</span>
                              <span className="font-medium">{formatCurrency(insurance.calculationResult.yearlyPremium)}</span>
                            </div>
                          </>
                        )}
                        {insurance.simulatedInterestRate !== undefined && insurance.simulatedInterestRate > 0 && (
                          <div className="flex justify-between">
                            <span>Simulated Interest:</span>
                            <span className="font-medium">{insurance.simulatedInterestRate}%</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}