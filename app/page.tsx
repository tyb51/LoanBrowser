"use client";

import React, { useState } from 'react';
import { TabNavigation } from '@/app/components/navigation/TabNavigation';
import { LoanParametersForm } from '@/app/components/forms/LoanParametersForm';
import { LoanBalanceChart } from '@/app/components/charts/LoanBalanceChart';
import { PaymentBreakdownChart } from '@/app/components/charts/PaymentBreakdownChart';
import { LoanStatisticsTable } from '@/app/components/tables/LoanStatisticsTable';
import { AmortizationTable } from '@/app/components/tables/AmortizationTable';
import { calculateLoan } from '@/app/services/loanApi';
import { LoanParameters, LoanCalculationResult, ModularLoanScheduleItem } from '@/app/types/loan';

const mainTabs = [
  { label: 'Single Loan', href: '/' },
  { label: 'Loan Comparison', href: '/comparison' },
  { label: 'Investment Simulation', href: '/investment' },
];

export default function SingleLoanPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [loanResult, setLoanResult] = useState<LoanCalculationResult | null>(null);

  const handleSubmit = async (params: LoanParameters, modularSchedule?: ModularLoanScheduleItem[]) => {
    setIsLoading(true);
    try {
      // Convert modularSchedule to the format expected by the API
      const schedule = modularSchedule ? {
        schedule: modularSchedule
      } : undefined;
      
      const result = await calculateLoan(params, schedule);
      setLoanResult(result);
    } catch (error) {
      console.error('Error calculating loan:', error);
      alert('Failed to calculate loan. Please check your inputs and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <TabNavigation tabs={mainTabs} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sidebar with forms */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Loan Parameters</h2>
            <LoanParametersForm onSubmit={handleSubmit} isLoading={isLoading} />
          </div>
        </div>
        
        {/* Main content area with charts and tables */}
        <div className="lg:col-span-2">
          {loanResult ? (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <LoanStatisticsTable statistics={loanResult.statistics} />
                
                <div className="bg-white rounded-lg shadow p-4">
                  <h3 className="text-lg font-medium mb-2">Loan Summary</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Loan Type</p>
                      <p className="font-medium">Annuity</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Loan Amount</p>
                      <p className="font-medium">
                        {new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(
                          loanResult.statistics["Totaal Kapitaal Betaald"]
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Interest Rate</p>
                      <p className="font-medium">3.5%</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Term</p>
                      <p className="font-medium">30 years</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Monthly Payment</p>
                      <p className="font-medium">
                        {new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(
                          loanResult.monthlyData[0]?.["Totale Maandelijkse Uitgave"] || 0
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Total Cost</p>
                      <p className="font-medium">
                        {new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(
                          loanResult.statistics["Totale Kosten Lening (Rente + SSV)"]
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <LoanBalanceChart data={loanResult.monthlyData} title="Loan Balance & Costs Over Time" />
              
              <PaymentBreakdownChart data={loanResult.annualData} title="Annual Payment Breakdown" />
              
              <AmortizationTable 
                monthlyData={loanResult.monthlyData} 
                annualData={loanResult.annualData} 
                title="Amortization Schedule" 
              />
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <h2 className="text-xl font-medium text-gray-600 mb-4">Loan Calculation</h2>
              <p className="text-gray-500 mb-6">
                Enter your loan parameters in the form and click "Calculate Loan" to see the results.
              </p>
              <div className="w-24 h-24 mx-auto bg-blue-50 rounded-full flex items-center justify-center">
                <svg className="w-12 h-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
