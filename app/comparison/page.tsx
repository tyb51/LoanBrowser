"use client";

import React, { useState } from 'react';
import { TabNavigation } from '@/app/components/navigation/TabNavigation';
import { LoanParametersForm } from '@/app/components/forms/LoanParametersForm';
import { LoanComparisonChart } from '@/app/components/charts/LoanComparisonChart';
import { LoanComparisonTable } from '@/app/components/tables/LoanComparisonTable';
import { compareLoans } from '@/app/services/apiService';
import { LoanParameters, ComparisonResult, ModularLoanScheduleItem, LoanType } from '@/app/types/loan';

const mainTabs = [
  { label: 'Single Loan', href: '/' },
  { label: 'Loan Comparison', href: '/comparison' },
  { label: 'Investment Simulation', href: '/investment' },
];

export default function ComparisonPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [comparisonResult, setComparisonResult] = useState<ComparisonResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [referenceLoanParams, setReferenceLoanParams] = useState<LoanParameters>({
    loanType: LoanType.ANNUITY,
    principal: 500000,
    interestRate: 3.5,
    termYears: 30,
    ownContribution: 100000,
    purchasePrice: 825000,
    startYear: 2025,
    insuranceCoveragePct: 1.0,
  });
  
  const [alternativeLoanParams, setAlternativeLoanParams] = useState<LoanParameters>({
    loanType: LoanType.BULLET,
    principal: 500000,
    interestRate: 3.2,
    termYears: 30,
    ownContribution: 100000,
    purchasePrice: 825000,
    startYear: 2025,
    insuranceCoveragePct: 1.0,
  });
  
  const [modularSchedule, setModularSchedule] = useState<ModularLoanScheduleItem[]>([]);

  const handleReferenceSubmit = (params: LoanParameters, schedule?: ModularLoanScheduleItem[]) => {
    setReferenceLoanParams(params);
  };

  const handleAlternativeSubmit = (params: LoanParameters, schedule?: ModularLoanScheduleItem[]) => {
    setAlternativeLoanParams(params);
    if (schedule) {
      setModularSchedule(schedule);
    }
  };

  const handleCompare = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Convert modularSchedule to the format expected by the API
      const schedule = modularSchedule.length > 0 ? {
        schedule: modularSchedule
      } : undefined;
      
      const result = await compareLoans(
        referenceLoanParams,
        alternativeLoanParams,
        referenceLoanParams.ownContribution || 0,
        alternativeLoanParams.ownContribution || 0,
        undefined,
        schedule
      );
      
      setComparisonResult(result);
    } catch (error) {
      console.error('Error comparing loans:', error);
      setError('Failed to compare loans. Please check your inputs and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <TabNavigation tabs={mainTabs} />
      
      {/* Insurance notice banner */}
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-blue-700">
              For comparisons including insurance, please use a <a href="/cases" className="font-medium text-blue-800 underline">Case</a> where you can create insurance simulations and include them in loan comparisons.
            </p>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Reference Loan Form */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Reference Loan Parameters</h2>
            <LoanParametersForm 
              defaultValues={referenceLoanParams}
              onSubmit={handleReferenceSubmit} 
              isLoading={isLoading} 
            />
          </div>
          
          {/* Alternative Loan Form */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Alternative Loan Parameters</h2>
            <LoanParametersForm 
              defaultValues={alternativeLoanParams}
              onSubmit={handleAlternativeSubmit} 
              isLoading={isLoading} 
            />
          </div>
        </div>
        
        {/* Compare Button */}
        <div className="flex justify-center">
          <button
            onClick={handleCompare}
            disabled={isLoading}
            className="px-6 py-3 bg-blue-600 text-white rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 text-lg"
          >
            {isLoading ? 'Comparing...' : 'Compare Loans'}
          </button>
        </div>
        
        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-100 text-red-700 rounded-md">
            <p>{error}</p>
          </div>
        )}
        
        {/* Comparison Results */}
        {comparisonResult && (
          <div className="space-y-8 mt-4">
            <LoanComparisonTable 
              referenceLoan={comparisonResult.referenceLoan}
              alternativeLoan={comparisonResult.alternativeLoan}
              referenceName="Annuity Loan"
              alternativeName="Bullet Loan"
            />
            
            <LoanComparisonChart 
              referenceLoanData={comparisonResult.referenceLoan.monthlyData}
              alternativeLoanData={comparisonResult.alternativeLoan.monthlyData}
              referenceName="Annuity Loan"
              alternativeName="Bullet Loan"
              title="Loan Balance Comparison"
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white rounded-lg shadow p-4">
                <h3 className="text-lg font-medium mb-4">Key Differences</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700">Total Cost Difference</h4>
                    <p className={`text-xl font-bold ${
                      (comparisonResult.comparisonStats?.totalCostDifference || 0) < 0 
                        ? 'text-green-600' 
                        : 'text-red-600'
                    }`}>
                      {new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(
                        comparisonResult.comparisonStats?.totalCostDifference || 0
                      )}
                      {(comparisonResult.comparisonStats?.totalCostDifference || 0) < 0 ? ' saved' : ' additional cost'}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-700">Monthly Payment Difference</h4>
                    <p className={`text-xl font-bold ${
                      (comparisonResult.alternativeLoan.statistics.medianMonthlyPayment - 
                       comparisonResult.referenceLoan.statistics.medianMonthlyPayment) < 0 
                        ? 'text-green-600' 
                        : 'text-red-600'
                    }`}>
                      {new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(
                        comparisonResult.alternativeLoan.statistics.medianMonthlyPayment - 
                        comparisonResult.referenceLoan.statistics.medianMonthlyPayment
                      )}
                      {(comparisonResult.alternativeLoan.statistics.medianMonthlyPayment - 
                        comparisonResult.referenceLoan.statistics.medianMonthlyPayment) < 0 
                          ? ' lower per month' 
                          : ' higher per month'
                      }
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-700">Interest Rate Difference</h4>
                    <p className={`text-xl font-bold ${
                      (alternativeLoanParams.interestRate - referenceLoanParams.interestRate) < 0 
                        ? 'text-green-600' 
                        : 'text-red-600'
                    }`}>
                      {(alternativeLoanParams.interestRate - referenceLoanParams.interestRate).toFixed(2)}%
                      {(alternativeLoanParams.interestRate - referenceLoanParams.interestRate) < 0 
                        ? ' lower' 
                        : ' higher'
                      }
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-4">
                <h3 className="text-lg font-medium mb-4">Recommendation</h3>
                <div className="p-4 bg-blue-50 rounded-md">
                  {(comparisonResult.comparisonStats?.totalCostDifference || 0) < 0 ? (
                    <div>
                      <h4 className="text-lg font-semibold text-blue-800">The Alternative Loan Saves Money</h4>
                      <p className="mt-2 text-blue-700">
                        Based on the comparison, the {alternativeLoanParams.loanType} loan offers better value
                        with total savings of {new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(
                          Math.abs(comparisonResult.comparisonStats?.totalCostDifference || 0)
                        )}.
                      </p>
                      <p className="mt-2 text-blue-700">
                        Consider if the different payment structure fits your financial situation.
                      </p>
                    </div>
                  ) : (
                    <div>
                      <h4 className="text-lg font-semibold text-blue-800">The Reference Loan Saves Money</h4>
                      <p className="mt-2 text-blue-700">
                        Based on the comparison, the {referenceLoanParams.loanType} loan offers better value
                        with total savings of {new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(
                          Math.abs(comparisonResult.comparisonStats?.totalCostDifference || 0)
                        )}.
                      </p>
                      <p className="mt-2 text-blue-700">
                        The traditional structure provides better long-term value in this case.
                      </p>
                    </div>
                  )}
                </div>
                
                <div className="mt-4">
                  <p className="text-sm text-gray-600">
                    Want to see how investing the difference could change this comparison?
                  </p>
                  <a 
                    href="/investment" 
                    className="mt-2 inline-block text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    Go to Investment Simulation →
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Placeholder when no comparison results */}
        {!comparisonResult && !error && (
          <div className="bg-white rounded-lg shadow p-8 text-center mt-6">
            <h2 className="text-xl font-medium text-gray-600 mb-4">Loan Comparison</h2>
            <p className="text-gray-500 mb-6">
              Update the loan parameters for both loans and click "Compare Loans" to see a detailed comparison.
            </p>
            <div className="w-24 h-24 mx-auto bg-blue-50 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
