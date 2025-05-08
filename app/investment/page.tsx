"use client";

import React, { useState } from 'react';
import { useTranslation } from '@/app/i18n/client';
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
  InvestmentParameters,
  InvestmentSimulationData,
  LoanType
} from '@/app/types/loan';

const mainTabs = [
  { label: 'Single Loan', href: '/' },
  { label: 'Loan Comparison', href: '/comparison' },
  { label: 'Investment Simulation', href: '/investment' },
];

export default function InvestmentPage() {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [simulationResult, setSimulationResult] = useState<ComparisonResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showSeparateInvestments, setShowSeparateInvestments] = useState(false);
  const [referenceSimulation, setReferenceSimulation] = useState<InvestmentSimulationData[] | null>(null);
  const [alternativeSimulation, setAlternativeSimulation] = useState<InvestmentSimulationData[] | null>(null);
  
  // Form state
  const [referenceLoanParams, setReferenceLoanParams] = useState<LoanParameters>({
    loanType: LoanType.ANNUITY,
    principal: 500000,
    interestRate: 3.5,
    termYears: 25,
    ownContribution: 100000,
    purchasePrice: 825000,
    startYear: 2025,
    insuranceCoveragePct: 1.0,
  });
  
  const [alternativeLoanParams, setAlternativeLoanParams] = useState<LoanParameters>({
    loanType: LoanType.BULLET,
    principal: 500000,
    interestRate: 3.2,
    termYears: 25,
    ownContribution: 100000,
    purchasePrice: 825000,
    startYear: 2025,
    insuranceCoveragePct: 1.0,
  });
  
  const [investmentParams, setInvestmentParams] = useState<InvestmentParameters>({
    startCapital: 120000,
    annualGrowthRate: 8.0,
    refInvestCapital: 60000,
    altInvestCapital: 60000
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
      
      // Run the combined simulation
      const result = await compareLoans(
        referenceLoanParams,
        alternativeLoanParams,
        referenceLoanParams.ownContribution || 0,
        alternativeLoanParams.ownContribution || 0,
        investmentParams,
        schedule
      );
      
      setSimulationResult(result);
      
      // If we're showing separate investments, run separate simulations for each loan
      if (showSeparateInvestments) {
        // Generate reference loan simulation with its own starting capital
        const referenceInvestParams: InvestmentParameters = {
          startCapital: investmentParams.refInvestCapital,
          annualGrowthRate: investmentParams.annualGrowthRate
        };
        
        const refResult = await compareLoans(
          referenceLoanParams,
          referenceLoanParams, // Compare with itself to get a baseline
          referenceLoanParams.ownContribution || 0,
          referenceLoanParams.ownContribution || 0,
          referenceInvestParams,
          undefined
        );
        
        if (refResult.investmentSimulation) {
          setReferenceSimulation(refResult.investmentSimulation);
        }
        
        // Generate alternative loan simulation with its own starting capital
        const alternativeInvestParams: InvestmentParameters = {
          startCapital: investmentParams.altInvestCapital,
          annualGrowthRate: investmentParams.annualGrowthRate
        };
        
        const altResult = await compareLoans(
          alternativeLoanParams,
          alternativeLoanParams, // Compare with itself to get a baseline
          alternativeLoanParams.ownContribution || 0,
          alternativeLoanParams.ownContribution || 0,
          alternativeInvestParams,
          schedule
        );
        
        if (altResult.investmentSimulation) {
          setAlternativeSimulation(altResult.investmentSimulation);
        }
      }
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
    
  // Toggle for separate investments display
  const handleToggleSeparateInvestments = () => {
    setShowSeparateInvestments(!showSeparateInvestments);
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
              For investment simulations including insurance, please use a <a href="/cases" className="font-medium text-blue-800 underline">Case</a> where you can create insurance simulations and include them in investment analyses.
            </p>
          </div>
        </div>
      </div>
      
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
                        {t('investment.growthRateBelow', {
                          growthRate: investmentParams.annualGrowthRate,
                          requiredRate: simulationResult.minimumRequiredGrowthRate?.toFixed(2)
                        })}
                      </p>
                    </div>
                  )}
                </div>
                
                <div className="mt-4 p-4 bg-gray-50 rounded-md">
                  <h4 className="text-sm font-medium text-gray-700">{t('investment.riskFactors')}</h4>
                  <ul className="mt-2 text-sm text-gray-600 space-y-1 list-disc pl-5">
                    <li>{t('investment.marketVolatility')}</li>
                    <li>{t('investment.interestRateChange')}</li>
                    <li>{t('investment.taxConsiderations')}</li>
                    <li>{t('investment.additionalContributions')}</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <InvestmentGrowthChart 
              data={simulationResult.investmentSimulation}
              referenceData={referenceSimulation || undefined}
              alternativeData={alternativeSimulation || undefined}
              title={t('charts.investmentGrowth')}
              showSeparateInvestments={showSeparateInvestments}
            />
            
            <InvestmentSimulationTable 
              data={simulationResult.investmentSimulation}
              minimumRequiredGrowthRate={simulationResult.minimumRequiredGrowthRate}
              netWorthEndOfTerm={simulationResult.comparisonStats?.netWorthEndOfTerm}
              title={t('tables.investmentSimulation')}
            />
          </div>
        )}
        
        {/* Placeholder when no simulation results */}
        {!simulationResult?.investmentSimulation && !error && (
          <div className="bg-white rounded-lg shadow p-8 text-center mt-6">
            <h2 className="text-xl font-medium text-gray-600 mb-4">{t('navigation.investmentSimulation')}</h2>
            <p className="text-gray-500 mb-6">
              {t('placeholders.investmentPlaceholder')}
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
