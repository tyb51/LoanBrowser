"use client";

import React from 'react';
import { useTranslation } from '@/app/i18n/client';

interface InsuranceSimulation {
  id: string;
  name: string;
  type: 'LIFE' | 'HOME';
  client?: {
    name: string;
    type: string;
  };
  homeInsuranceClients?: {
    clientId: string;
    sharePercentage: number;
    client: {
      name: string;
      type: string;
    }
  }[];
  parameters: any;
  calculationResult?: {
    monthlyPremium?: number;
    yearlyPremium?: number;
    totalPremium?: number;
    coverageAmount?: number;
    deductible?: number;
    amortizationTable?: any[];
  };
}

interface InsuranceSelectionSummaryProps {
  insuranceSimulations: InsuranceSimulation[];
  title?: string;
  className?: string;
}

export function InsuranceSelectionSummary({ 
  insuranceSimulations, 
  title = "Selected Insurance Simulations",
  className = "" 
}: InsuranceSelectionSummaryProps) {
  const { t } = useTranslation();
  
  if (!insuranceSimulations || insuranceSimulations.length === 0) {
    return (
      <div className={`p-3 border border-gray-200 rounded-md bg-gray-50 ${className}`}>
        <p className="text-sm text-gray-500 text-center">No insurance simulations selected</p>
      </div>
    );
  }
  
  // Format currency
  const formatCurrency = (amount?: number) => {
    if (amount === undefined || amount === null) return 'N/A';
    return new Intl.NumberFormat('nl-BE', { style: 'currency', currency: 'EUR' }).format(amount);
  };
  
  // Calculate totals
  const totalMonthlyPremium = insuranceSimulations.reduce((sum, ins) => {
    return sum + (ins.calculationResult?.monthlyPremium || 0);
  }, 0);
  
  // Group by type
  const lifeInsurances = insuranceSimulations.filter(ins => ins.type === 'LIFE');
  const homeInsurances = insuranceSimulations.filter(ins => ins.type === 'HOME');
  
  return (
    <div className={`p-3 border border-gray-200 rounded-md ${className}`}>
      <h4 className="text-sm font-medium text-gray-700 mb-2">{title}</h4>
      
      <div className="space-y-3">
        {/* Summary totals */}
        <div className="bg-blue-50 p-2 rounded-md">
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-600">Total Monthly Premium:</span>
            <span className="text-sm font-medium text-gray-800">
              {formatCurrency(totalMonthlyPremium)}
            </span>
          </div>
          <div className="flex justify-between items-center mt-1">
            <span className="text-xs text-gray-600">Total Simulations:</span>
            <span className="text-sm font-medium text-gray-800">
              {insuranceSimulations.length} ({lifeInsurances.length} life, {homeInsurances.length} home)
            </span>
          </div>
        </div>
        
        {/* Life insurances */}
        {lifeInsurances.length > 0 && (
          <div>
            <h5 className="text-xs font-medium text-gray-700 mb-1">Life Insurance</h5>
            <div className="space-y-2">
              {lifeInsurances.map((ins) => (
                <div key={ins.id} className="text-xs p-2 bg-white border border-gray-200 rounded-md">
                  <div className="flex justify-between">
                    <span className="font-medium">{ins.name}</span>
                    {ins.calculationResult?.monthlyPremium !== undefined && (
                      <span className="text-blue-700">{formatCurrency(ins.calculationResult.monthlyPremium)}/month</span>
                    )}
                  </div>
                  <div className="mt-1 text-gray-600">
                    {ins.client?.name && (
                      <div className="flex justify-between">
                        <span>Client:</span>
                        <span>{ins.client.name}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Coverage:</span>
                      <span>{((ins.parameters.coveragePercentage || 0) * 100).toFixed(0)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Payment Type:</span>
                      <span>{ins.parameters.paymentType === 'DISTRIBUTED' ? 'Monthly' : 'Lump Sum'}</span>
                    </div>
                    {ins.calculationResult?.yearlyPremium !== undefined && (
                      <div className="flex justify-between">
                        <span>Yearly Premium:</span>
                        <span>{formatCurrency(ins.calculationResult.yearlyPremium)}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Home insurances */}
        {homeInsurances.length > 0 && (
          <div>
            <h5 className="text-xs font-medium text-gray-700 mb-1">Home Insurance</h5>
            <div className="space-y-2">
              {homeInsurances.map((ins) => (
                <div key={ins.id} className="text-xs p-2 bg-white border border-gray-200 rounded-md">
                  <div className="flex justify-between">
                    <span className="font-medium">{ins.name}</span>
                    {ins.calculationResult?.monthlyPremium !== undefined && (
                      <span className="text-green-700">{formatCurrency(ins.calculationResult.monthlyPremium)}/month</span>
                    )}
                  </div>
                  <div className="mt-1 text-gray-600">
                    {/* Display clients if available */}
                    {ins.homeInsuranceClients && ins.homeInsuranceClients.length > 0 && (
                      <div className="flex justify-between mb-1">
                        <span>Clients:</span>
                        <span>
                          {ins.homeInsuranceClients.map(client => 
                            `${client.client.name} (${client.sharePercentage.toFixed(0)}%)`
                          ).join(', ')}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Property Type:</span>
                      <span>{ins.parameters.propertyType?.replace('_', ' ') || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Property Value:</span>
                      <span>{formatCurrency(ins.parameters.propertyValue || 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Coverage:</span>
                      <span>{((ins.parameters.coveragePercentage || 0) * 100).toFixed(0)}%</span>
                    </div>
                    {ins.calculationResult?.deductible !== undefined && (
                      <div className="flex justify-between">
                        <span>Deductible:</span>
                        <span>{formatCurrency(ins.calculationResult.deductible)}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}