"use client";

import React, { useState } from 'react';
import { TabNavigation } from '@/app/components/navigation/TabNavigation';
import { LoanParametersForm } from '@/app/components/forms/LoanParametersForm';
import { InvestmentParametersForm } from '@/app/components/forms/InvestmentParametersForm';
import { InvestmentGrowthChart } from '@/app/components/charts/InvestmentGrowthChart';
import { InvestmentSimulationTable } from '@/app/components/tables/InvestmentSimulationTable';
import { compareLoans } from '@/app/services/apiService';
import { 
  LoanParameters, 
  ComparisonResult, 
  ModularLoanScheduleItem,
  InvestmentParameters 
} from '@/app/types/loan';

const mainTabs = [
  { label: 'Single Loan', href: '/' },
  { label: 'Loan Comparison', href: '/comparison' },
  { label: 'Investment Simulation', href: '/investment' },
];

export default function InvestmentPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [simulationResult, setSimulationResult] = useState<ComparisonResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [referenceLoanParams, setReferenceLoanParams] = useState<LoanParameters>({
    loanType: 'annuity',
    principal: 500000,
    interestRate: 3.5,
    termYears: 30,
    ownContribution: 100000,
    purchasePrice: 825000,
    startYear: 2025,
    insuranceCoveragePct: 1.0,
  });
  
  const [alternativeLoanParams, setAlternativeLoanParams] = useState<LoanParameters>({
    loanType: 'bullet',
    principal: 500000,
    interestRate: 3.2,
    termYears: 30,
    ownContribution: 100000,
    purchasePrice: 825000,
    startYear: 2025,
    insuranceCoveragePct: 1.0,
  });
  
  const [investmentParams, setInvestmentParams] = useState<InvestmentParameters>({
    startCapital: 120000,
    annualGrowthRate: 8.0,
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

  const handleInvestmentSubmit = (params: InvestmentParameters) => {
    setInvestmentParams(params);
  };

  const handleSimulate = async () => {
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
        investmentParams,
        schedule
      );
      
      setSimulationResult(result);
    } catch (error) {
      console.error('Error simulating investment:', error);
      setError('Failed to simulate investment. Please check your inputs and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate whether the investment strategy is profitable at the end
  const isInvestmentProfitable = 
    simulationResult?.comparisonStats?.netWorthEndOfTerm && 
    simulationResult.comparisonStats.netWorthEndOfTerm > 0;

  return (
    <div>
      <TabNavigation tabs={mainTabs} />
      
      <div className="grid grid-cols-1 gap-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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
          
          {/* Investment Parameters Form */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Investment Parameters</h2>
            <InvestmentParametersForm 
              defaultValues={investmentParams}
              onSubmit={handleInvestmentSubmit} 
              isLoading={isLoading} 
            />
            
            <div className="mt-8 p-4 bg-blue-50 rounded-md">
              <h3 className="text-md font-semibold text-blue-800 mb-2">How This Works</h3>
              <p className="text-sm text-blue-700">
                This simulation compares a reference loan (typically an annuity) with an alternative loan 
                (typically a bullet loan), while investing the monthly payment differences.
              </p>
              <p className="text-sm text-blue-700 mt-2">
                The goal is to see if investing the payment differences generates enough returns to cover 
                the bullet payment at the end of the term.
              </p>
            </div>
          </div>
        </div>
        
        {/* Simulate Button */}
        <div className="flex justify-center">
          <button
            onClick={handleSimulate}
            disabled={isLoading}
            className="px-6 py-3 bg-blue-600 text-white rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 text-lg"
          >
            {isLoading ? 'Simulating...' : 'Run Investment Simulation'}
          </button>
        </div>
        
        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-100 text-red-700 rounded-md">
            <p>{error}</p>
          </div>
        )}
        
        {/* Simulation Results */}
        {simulationResult?.investmentSimulation && (
          <div className="space-y-8 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white rounded-lg shadow p-4">
                <h3 className="text-lg font-medium mb-4">Investment Simulation Summary</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700">Total Cost Difference</h4>
                    <p className={`text-xl font-bold ${
                      (simulationResult.comparisonStats?.totalCostDifference || 0) < 0 
                        ? 'text-green-600' 
                        : 'text-red-600'
                    }`}>
                      {new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(
                        simulationResult.comparisonStats?.totalCostDifference || 0
                      )}
                      {(simulationResult.comparisonStats?.totalCostDifference || 0) < 0 ? ' saved' : ' additional cost'}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-700">Net Worth at End of Term</h4>
                    <p className={`text-xl font-bold ${
                      (simulationResult.comparisonStats?.netWorthEndOfTerm || 0) > 0 
                        ? 'text-green-600' 
                        : 'text-red-600'
                    }`}>
                      {new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(
                        simulationResult.comparisonStats?.netWorthEndOfTerm || 0
                      )}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-700">Minimum Required Growth Rate</h4>
                    <p className="text-xl font-bold text-blue-600">
                      {simulationResult.minimumRequiredGrowthRate?.toFixed(2)}%
                    </p>
                    <p className="text-xs text-gray-500">
                      Minimum annual return needed to cover the final loan payment
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-4">
                <h3 className="text-lg font-medium mb-4">Strategy Recommendation</h3>
                <div className={`p-4 ${isInvestmentProfitable ? 'bg-green-50' : 'bg-yellow-50'} rounded-md`}>
                  {isInvestmentProfitable ? (
                    <div>
                      <h4 className={`text-lg font-semibold ${isInvestmentProfitable ? 'text-green-800' : 'text-yellow-800'}`}>
                        Investment Strategy is Profitable
                      </h4>
                      <p className={`mt-2 ${isInvestmentProfitable ? 'text-green-700' : 'text-yellow-700'}`}>
                        Based on the simulation, the investment strategy with the {alternativeLoanParams.loanType} loan 
                        results in a positive net worth of {new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(
                          simulationResult.comparisonStats?.netWorthEndOfTerm || 0
                        )} at the end of the term.
                      </p>
                      <p className={`mt-2 ${isInvestmentProfitable ? 'text-green-700' : 'text-yellow-700'}`}>
                        The annual growth rate of {investmentParams.annualGrowthRate}% exceeds the minimum required rate 
                        of {simulationResult.minimumRequiredGrowthRate?.toFixed(2)}%.
                      </p>
                    </div>
                  ) : (
                    <div>
                      <h4 className="text-lg font-semibold text-yellow-800">
                        Investment Strategy is Risky
                      </h4>
                      <p className="mt-2 text-yellow-700">
                        Based on the simulation, the investment strategy with the {alternativeLoanParams.loanType} loan 
                        results in a negative net worth of {new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(
                          simulationResult.comparisonStats?.netWorthEndOfTerm || 0
                        )} at the end of the term.
                      </p>
                      <p className="mt-2 text-yellow-700">
                        The annual growth rate of {investmentParams.annualGrowthRate}% is below the minimum required rate 
                        of {simulationResult.minimumRequiredGrowthRate?.toFixed(2)}%.
                      </p>
                    </div>
                  )}
                </div>
                
                <div className="mt-4 p-4 bg-gray-50 rounded-md">
                  <h4 className="text-sm font-medium text-gray-700">Risk Factors to Consider</h4>
                  <ul className="mt-2 text-sm text-gray-600 space-y-1 list-disc pl-5">
                    <li>Market volatility could result in lower actual returns</li>
                    <li>Interest rates may change over the loan term</li>
                    <li>This simulation doesn't account for taxes on investment gains</li>
                    <li>Additional contributions or withdrawals aren't modeled</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <InvestmentGrowthChart 
              data={simulationResult.investmentSimulation}
              title="Investment Growth & Net Worth Over Time"
            />
            
            <InvestmentSimulationTable 
              data={simulationResult.investmentSimulation}
              minimumRequiredGrowthRate={simulationResult.minimumRequiredGrowthRate}
              netWorthEndOfTerm={simulationResult.comparisonStats?.netWorthEndOfTerm}
              title="Investment Simulation Results"
            />
          </div>
        )}
        
        {/* Placeholder when no simulation results */}
        {!simulationResult?.investmentSimulation && !error && (
          <div className="bg-white rounded-lg shadow p-8 text-center mt-6">
            <h2 className="text-xl font-medium text-gray-600 mb-4">Investment Simulation</h2>
            <p className="text-gray-500 mb-6">
              Configure the loan parameters and investment settings, then click "Run Investment Simulation" to see the results.
            </p>
            <div className="w-24 h-24 mx-auto bg-blue-50 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
