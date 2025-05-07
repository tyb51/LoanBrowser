"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { useTranslation } from '@/app/i18n/client';
import Link from 'next/link';

// Components
import { LoanParametersForm } from '@/app/components/forms/LoanParametersForm';
import { ClientSelectionForm } from '@/app/components/forms/client/ClientSelectionForm';

// Types
import { LoanParameters, LoanType, ModularLoanScheduleItem, LoanCalculationResult } from '@/app/types/loan';
import { Client, ClientSummary, ClientType } from '@/app/types/client';

// Services
import { calculateMultiClientLoan, saveMultiClientLoanSimulation } from '@/app/services/multiClientLoanApi';

// Utilities
import { calculateLoanValues } from '@/app/utils/loan/calculateLoanValues';

// Define a case type for props
interface Case {
  id: string;
  title: string;
  description: string | null;
  purchaseDate?: string;
  projectName?: string;
  purchasePrice?: number;
}

export default function NewLoan() {
  const { t } = useTranslation();
  const { user, status, requireAuth } = useAuth();
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const caseId = params.id as string;
  const preselectedClientId = searchParams.get('clientId');
  
  // State for clients, case data, and form data
  const [clients, setClients] = useState<Client[]>([]);
  const [caseData, setCaseData] = useState<Case | null>(null);
  const [selectedClientIds, setSelectedClientIds] = useState<string[]>(preselectedClientId ? [preselectedClientId] : []);
  const [clientSummary, setClientSummary] = useState<ClientSummary>({
    totalCurrentCapital: 0,
    totalCurrentDebt: 0,
    totalMonthlyIncome: 0,
    netWorth: 0,
    clientCount: 0,
    individualCount: 0,
    companyCount: 0
  });
  
  // State for form inputs
  const [loanName, setLoanName] = useState('');
  const [loanParams, setLoanParams] = useState<LoanParameters | null>(null);
  
  // State for UI
  const [isLoading, setIsLoading] = useState(true);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [calculationResult, setCalculationResult] = useState<LoanCalculationResult | null>(null);
  
  // Check authentication on component mount
  useEffect(() => {
    requireAuth();
  }, [requireAuth]);
  
  // Fetch case and client data
  useEffect(() => {
    const fetchData = async () => {
      if (status !== 'authenticated') return;
      
      try {
        // Fetch case data
        const caseResponse = await fetch(`/api/cases/${caseId}`);
        
        if (!caseResponse.ok) {
          throw new Error('Failed to fetch case data');
        }
        
        const caseData = await caseResponse.json();
        setCaseData(caseData.case);
        
        // Initialize loan name with case title
        setLoanName(`${caseData.case.title} - ${t('loan.newLoan')}`);
        
        // Initialize loan parameters with case purchase price if available
        if (caseData.case.purchasePrice) {
          const purchasePrice = caseData.case.purchasePrice;
          // Use utility function to calculate loan values (90/10 split is the default)
          const { principal, ownContribution } = calculateLoanValues(purchasePrice);
          
          // Calculate start year from purchase date if available
          let startYear = new Date().getFullYear();
          if (caseData.case.purchaseDate) {
            const purchaseDate = new Date(caseData.case.purchaseDate);
            startYear = purchaseDate.getFullYear();
          }
          
          setLoanParams({
            loanType: LoanType.ANNUITY,
            principal,
            interestRate: 3.5,
            termYears: 30,
            ownContribution,
            purchasePrice,
            delayMonths: 0,
            startYear: startYear,
            insuranceCoveragePct: 1.0,
          });
        }
        
        // Fetch clients for this case
        const clientsResponse = await fetch(`/api/clients?caseId=${caseId}`);
        
        if (!clientsResponse.ok) {
          throw new Error('Failed to fetch clients');
        }
        
        const clientsData = await clientsResponse.json();
        setClients(clientsData.clients);
        
        // If specific client is preselected, just select that one
        // Otherwise select all clients by default
        if (!preselectedClientId && clientsData.clients.length > 0) {
          setSelectedClientIds(clientsData.clients.map(client => client.id));
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error instanceof Error ? error.message : 'An unexpected error occurred');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [caseId, status, t, preselectedClientId]);
  
  // Handle client selection change
  const handleClientSelectionChange = (ids: string[], summary: ClientSummary) => {
    setSelectedClientIds(ids);
    setClientSummary(summary);
  };
  
  // Handle loan parameters change
  const handleLoanParamsChange = (params: LoanParameters) => {
    setLoanParams(params);
  };
  
  // Handle calculate
  const handleCalculate = async (params: LoanParameters, modularSchedule?: ModularLoanScheduleItem[]) => {
    if (selectedClientIds.length === 0) {
      setError(t('loan.selectAtLeastOneClient'));
      return;
    }
    
    setIsCalculating(true);
    setError(null);
    
    try {
      // Convert modular schedule items to the expected format if needed
      const modularScheduleForApi = modularSchedule ? { schedule: modularSchedule } : undefined;
      
      // Call the API to calculate loan for multiple clients
      const result = await calculateMultiClientLoan(
        params, 
        selectedClientIds, 
        clientSummary, 
        modularScheduleForApi
      );
      
      setCalculationResult(result);
      setLoanParams(params); // Update the loan parameters with the calculated values
    } catch (error) {
      console.error('Error calculating loan:', error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setIsCalculating(false);
    }
  };
  
  // Handle save
  const handleSave = async () => {
    if (!calculationResult || !loanParams) return;
    
    if (!loanName.trim()) {
      setError(t('loan.nameRequired'));
      return;
    }
    
    setIsSaving(true);
    setError(null);
    
    try {
      // Save the loan simulation
      await saveMultiClientLoanSimulation(
        loanParams,
        selectedClientIds,
        caseId,
        calculationResult,
        loanName
      );
      
      // Navigate back to case page
      router.push(`/cases/${caseId}`);
    } catch (error) {
      console.error('Error saving loan:', error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
      setIsSaving(false);
    }
  };
  
  // Show loading state
  if (status === 'loading' || isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  // If not authenticated, the requireAuth function will redirect to signin
  if (status === 'unauthenticated') {
    return null;
  }
  
  // No clients available
  if (clients.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white p-4 rounded-md shadow">
          <p className="text-gray-700">{t('loan.noClientsFound')}</p>
          <div className="mt-6 flex space-x-3">
            <button
              onClick={() => router.push(`/cases/${caseId}`)}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              {t('case.backToCase')}
            </button>
            <Link
              href={`/cases/${caseId}/clients/new`}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              {t('client.addClient')}
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <button
            onClick={() => router.push(`/cases/${caseId}`)}
            className="mr-4 text-gray-600 hover:text-gray-900"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <h1 className="text-3xl font-bold text-gray-900">{t('loan.createLoanSimulation')}</h1>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-100 p-4 rounded-md mb-6">
          <p className="text-red-700">{error}</p>
        </div>
      )}
      
      {/* Loan name input */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">{t('loan.loanName')}</h3>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
          <input
            type="text"
            value={loanName}
            onChange={(e) => setLoanName(e.target.value)}
            placeholder={t('loan.enterLoanName')}
            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Loan Information */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg lg:col-span-2">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">{t('loan.loanInformation')}</h3>
            <p className="mt-1 text-sm text-gray-600">
              {t('loan.configureLoanParameters')}
            </p>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
            <LoanParametersForm
              defaultValues={loanParams || undefined}
              onSubmit={handleCalculate}
              isLoading={isCalculating}
              onValuesChange={handleLoanParamsChange}
            />
          </div>
        </div>
        
        {/* Client Selection */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">{t('client.clientInformation')}</h3>
            <p className="mt-1 text-sm text-gray-600">
              {t('client.selectClientsForLoan')}
            </p>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
            <ClientSelectionForm 
              clients={clients}
              preselectedClientIds={selectedClientIds}
              onChange={handleClientSelectionChange}
            />
          </div>
        </div>
      </div>
      
      {/* Results Section */}
      {calculationResult && (
        <div className="space-y-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900">{t('loan.calculationResults')}</h2>
          
          {/* Summary Card */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">{t('loan.loanSummary')}</h3>
              <p className="mt-1 text-sm text-gray-600">
                {t('loan.keyFinancialFigures')}
              </p>
            </div>
            <div className="border-t border-gray-200">
              <dl>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">{t('loan.monthlyPayment')}</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {calculationResult.statistics.medianMonthlyPayment ? 
                      new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(calculationResult.statistics.medianMonthlyPayment) :
                      t('common.notAvailable')}
                  </dd>
                </div>
                
                {loanParams && (
                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">{t('loan.principalAmount')}</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(loanParams.principal)}
                    </dd>
                  </div>
                )}
                
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">{t('loan.totalInterest')}</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {calculationResult.statistics.totalInterestPaid ? 
                      new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(calculationResult.statistics.totalInterestPaid) :
                      t('common.notAvailable')}
                  </dd>
                </div>
                
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">{t('loan.totalPayment')}</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {calculationResult.statistics.totalPrincipalPaid && calculationResult.statistics.totalInterestPaid ? 
                      new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(
                        calculationResult.statistics.totalPrincipalPaid + calculationResult.statistics.totalInterestPaid
                      ) :
                      t('common.notAvailable')}
                  </dd>
                </div>
                
                {loanParams && (
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">{t('loan.loanTerm')}</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {loanParams.termYears} {t('common.years')} ({loanParams.termYears * 12} {t('common.months')})
                    </dd>
                  </div>
                )}
                
                {loanParams && (
                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">{t('loan.interestRate')}</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {loanParams.interestRate}%
                    </dd>
                  </div>
                )}
                
                {/* Client Information */}
                {selectedClientIds.length > 0 && (
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">{t('client.selectedClients')}</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {selectedClientIds.length} {t('client.clients')}
                      {selectedClientIds.length > 1 && (
                        <span className="ml-2 text-xs text-gray-500">
                          ({clientSummary.individualCount} {t('client.individuals')}, {clientSummary.companyCount} {t('client.companies')})
                        </span>
                      )}
                    </dd>
                  </div>
                )}
                
                {/* Debt Ratio */}
                {calculationResult.statistics.debtRatio && (
                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">{t('loan.debtRatio')}</dt>
                    <dd className="mt-1 text-sm sm:mt-0 sm:col-span-2">
                      <div className="flex items-center">
                        <span className={`font-medium ${
                          calculationResult.statistics.debtRatio <= 33 ? 'text-green-600' :
                          calculationResult.statistics.debtRatio <= 43 ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                          {calculationResult.statistics.debtRatio.toFixed(1)}%
                        </span>
                        <span className="ml-2 text-xs text-gray-500">
                          ({calculationResult.statistics.debtRatio <= 33 ? 
                            t('loan.debtRatioGood') :
                            calculationResult.statistics.debtRatio <= 43 ?
                            t('loan.debtRatioModerate') :
                            t('loan.debtRatioHigh')})
                        </span>
                      </div>
                    </dd>
                  </div>
                )}
                
                {/* Per-Client Statistics (if multiple clients) */}
                {selectedClientIds.length > 1 && calculationResult.statistics.perClientInsurancePaid && (
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">{t('loan.perClientInsurance')}</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(
                        calculationResult.statistics.perClientInsurancePaid
                      )}
                    </dd>
                  </div>
                )}
                
                {/* Per-Client Debt Ratio (if multiple clients) */}
                {selectedClientIds.length > 1 && calculationResult.statistics.perClientDebtRatio && (
                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">{t('loan.perClientDebtRatio')}</dt>
                    <dd className="mt-1 text-sm sm:mt-0 sm:col-span-2">
                      <div className="flex items-center">
                        <span className={`font-medium ${
                          calculationResult.statistics.perClientDebtRatio <= 33 ? 'text-green-600' :
                          calculationResult.statistics.perClientDebtRatio <= 43 ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                          {calculationResult.statistics.perClientDebtRatio.toFixed(1)}%
                        </span>
                        {calculationResult.statistics.perClientDebtRatioAssessment && (
                          <span className="ml-2 text-xs text-gray-500">
                            ({calculationResult.statistics.perClientDebtRatioAssessment === 'good' ? 
                              t('loan.debtRatioGood') :
                              calculationResult.statistics.perClientDebtRatioAssessment === 'moderate' ?
                              t('loan.debtRatioModerate') :
                              t('loan.debtRatioHigh')})
                          </span>
                        )}
                      </div>
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          </div>
          
          {/* Amortization Schedule */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">{t('loan.amortizationSchedule')}</h3>
              <p className="mt-1 text-sm text-gray-600">
                {t('loan.paymentScheduleOverTime')}
              </p>
            </div>
            <div className="border-t border-gray-200">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('loan.year')}
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('loan.annualPayment')}
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('loan.annualInterest')}
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('loan.annualPrincipal')}
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('loan.remainingBalance')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {calculationResult.annualData.map((entry, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {entry.year}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(entry.annualTotalPayment)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(entry.annualInterest)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(entry.annualPrincipal)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(entry.remainingPrincipalYearEnd)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          
          {/* Save Button */}
          <div className="flex justify-center">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-6 py-3 bg-green-600 text-white rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 text-lg"
            >
              {isSaving ? t('buttons.saving') : t('loan.saveLoanSimulation')}
            </button>
          </div>
        </div>
      )}
      
      {/* Bottom Navigation */}
      <div className="mt-6 flex justify-between">
        <button
          onClick={() => router.push(`/cases/${caseId}`)}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          {t('case.backToCase')}
        </button>
      </div>
    </div>
  );
}
