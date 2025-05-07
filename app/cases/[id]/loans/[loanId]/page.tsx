"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useTranslation } from '@/app/i18n/client';

// Types
import { LoanParameters, LoanType, LoanCalculationResult, ModularLoanScheduleItem } from '@/app/types/loan';
import { Client, ClientSummary, ClientType } from '@/app/types/client';

// Components
import { LoanParametersForm } from '@/app/components/forms/LoanParametersForm';
import { ClientSelectionForm } from '@/app/components/forms/client/ClientSelectionForm';

// Services
import { calculateMultiClientLoan } from '@/app/services/multiClientLoanApi';

interface LoanDetail {
  id: string;
  name: string;
  loanType: LoanType;
  principal: number;
  interestRate: number;
  termYears: number;
  ownContribution: number;
  purchasePrice?: number | null;
  delayMonths?: number | null;
  startYear?: number | null;
  insuranceCoveragePct?: number | null;
  calculationResult?: string;
  caseId: string;
  clients: Client[];
  createdAt: string;
  updatedAt: string;
}

interface Case {
  id: string;
  title: string;
  description: string | null;
  projectName?: string | null;
  purchasePrice?: number | null;
  purchaseDate?: string | null;
}

export default function LoanDetail() {
  const { t } = useTranslation();
  const { user, status, requireAuth } = useAuth();
  const router = useRouter();
  const params = useParams();
  const caseId = params.id as string;
  const loanId = params.loanId as string;
  
  // State for loan, case data, and clients
  const [loanData, setLoanData] = useState<LoanDetail | null>(null);
  const [caseData, setCaseData] = useState<Case | null>(null);
  const [allClients, setAllClients] = useState<Client[]>([]);
  const [calculationResult, setCalculationResult] = useState<LoanCalculationResult | null>(null);
  
  // UI state
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [loanName, setLoanName] = useState('');
  const [selectedClientIds, setSelectedClientIds] = useState<string[]>([]);
  const [clientSummary, setClientSummary] = useState<ClientSummary>({
    totalCurrentCapital: 0,
    totalCurrentDebt: 0,
    totalMonthlyIncome: 0,
    netWorth: 0,
    clientCount: 0,
    individualCount: 0,
    companyCount: 0
  });
  const [loanParams, setLoanParams] = useState<LoanParameters | null>(null);
  
  // Check authentication on component mount
  useEffect(() => {
    requireAuth();
  }, [requireAuth]);
  
  // Fetch loan data, case data, and clients when component mounts
  useEffect(() => {
    const fetchData = async () => {
      if (status !== 'authenticated') return;
      
      try {
        setIsLoading(true);
        
        // Fetch loan data
        const loanResponse = await fetch(`/api/loans/${loanId}`);
        
        if (!loanResponse.ok) {
          throw new Error('Failed to fetch loan data');
        }
        
        const loanData = await loanResponse.json();
        setLoanData(loanData.loan);
        setLoanName(loanData.loan.name);
        
        // Set selected client IDs
        const clientIds = loanData.loan.clients.map((client: Client) => client.id);
        setSelectedClientIds(clientIds);
        
        // Parse calculation result if available
        if (loanData.loan.calculationResult) {
          try {
            const parsed = JSON.parse(loanData.loan.calculationResult);
            setCalculationResult(parsed);
          } catch (e) {
            console.error('Error parsing calculation result:', e);
          }
        }
        
        // Set loan parameters
        setLoanParams({
          loanType: loanData.loan.loanType,
          principal: loanData.loan.principal,
          interestRate: loanData.loan.interestRate,
          termYears: loanData.loan.termYears,
          ownContribution: loanData.loan.ownContribution,
          purchasePrice: loanData.loan.purchasePrice || undefined,
          delayMonths: loanData.loan.delayMonths || 0,
          startYear: loanData.loan.startYear || new Date().getFullYear(),
          insuranceCoveragePct: loanData.loan.insuranceCoveragePct || 1.0,
        });
        
        // Fetch case data
        const caseResponse = await fetch(`/api/cases/${caseId}`);
        
        if (!caseResponse.ok) {
          throw new Error('Failed to fetch case data');
        }
        
        const caseData = await caseResponse.json();
        setCaseData(caseData.case);
        
        // Fetch all clients for the case (for editing)
        const clientsResponse = await fetch(`/api/clients?caseId=${caseId}`);
        
        if (!clientsResponse.ok) {
          throw new Error('Failed to fetch clients');
        }
        
        const clientsData = await clientsResponse.json();
        setAllClients(clientsData.clients);
        
        // Calculate client summary
        const selectedClients = clientsData.clients.filter(
          (client: Client) => clientIds.includes(client.id)
        );
        
        const summary = calculateClientSummary(selectedClients);
        setClientSummary(summary);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error instanceof Error ? error.message : 'An unexpected error occurred');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [caseId, loanId, status]);
  
  // Calculate client summary
  const calculateClientSummary = (selectedClients: Client[]): ClientSummary => {
    return selectedClients.reduce((summary, client) => {
      return {
        totalCurrentCapital: summary.totalCurrentCapital + client.currentCapital,
        totalCurrentDebt: summary.totalCurrentDebt + client.currentDebt,
        totalMonthlyIncome: summary.totalMonthlyIncome + client.monthlyIncome,
        netWorth: summary.netWorth + (client.currentCapital - client.currentDebt),
        clientCount: summary.clientCount + 1,
        individualCount: summary.individualCount + (client.type === ClientType.INDIVIDUAL ? 1 : 0),
        companyCount: summary.companyCount + (client.type === ClientType.COMPANY ? 1 : 0)
      };
    }, {
      totalCurrentCapital: 0,
      totalCurrentDebt: 0,
      totalMonthlyIncome: 0,
      netWorth: 0,
      clientCount: 0,
      individualCount: 0,
      companyCount: 0
    });
  };
  
  // Handle client selection change
  const handleClientSelectionChange = (ids: string[], summary: ClientSummary) => {
    setSelectedClientIds(ids);
    setClientSummary(summary);
  };
  
  // Handle loan parameters change
  const handleLoanParamsChange = (params: LoanParameters) => {
    setLoanParams(params);
  };
  
  // Handle edit
  const handleEdit = () => {
    setIsEditing(true);
  };
  
  // Handle cancel edit
  const handleCancel = () => {
    if (loanData) {
      setLoanName(loanData.name);
      setSelectedClientIds(loanData.clients.map(client => client.id));
      
      // Reset loan parameters
      setLoanParams({
        loanType: loanData.loanType,
        principal: loanData.principal,
        interestRate: loanData.interestRate,
        termYears: loanData.termYears,
        ownContribution: loanData.ownContribution,
        purchasePrice: loanData.purchasePrice || undefined,
        delayMonths: loanData.delayMonths || 0,
        startYear: loanData.startYear || new Date().getFullYear(),
        insuranceCoveragePct: loanData.insuranceCoveragePct || 1.0,
      });
      
      // Recalculate client summary
      const selectedClients = allClients.filter(
        client => loanData.clients.map(c => c.id).includes(client.id)
      );
      
      const summary = calculateClientSummary(selectedClients);
      setClientSummary(summary);
    }
    
    setIsEditing(false);
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
    if (!loanParams) return;
    
    if (!loanName.trim()) {
      setError(t('loan.nameRequired'));
      return;
    }
    
    setIsSaving(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/loans/${loanId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: loanName,
          params: loanParams,
          clientIds: selectedClientIds,
          calculationResult: calculationResult || undefined,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update loan simulation');
      }
      
      const updatedData = await response.json();
      
      // Update loan data with the response
      setLoanData(updatedData.loan);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating loan:', error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setIsSaving(false);
    }
  };
  
  // Handle delete
  const handleDelete = async () => {
    if (!window.confirm(t('loan.confirmDelete'))) {
      return;
    }
    
    try {
      const response = await fetch(`/api/loans/${loanId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete loan simulation');
      }
      
      // Navigate back to case page
      router.push(`/cases/${caseId}`);
    } catch (error) {
      console.error('Error deleting loan:', error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
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
  
  // Show error state
  if (error && !isCalculating && !isSaving) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-red-100 p-4 rounded-md">
          <p className="text-red-700">{error}</p>
          <button
            onClick={() => router.push(`/cases/${caseId}`)}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            {t('case.backToCase')}
          </button>
        </div>
      </div>
    );
  }
  
  // Show loan data
  if (!loanData || !loanParams) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white p-4 rounded-md shadow">
          <p className="text-gray-700">{t('loan.notFound')}</p>
          <button
            onClick={() => router.push(`/cases/${caseId}`)}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            {t('case.backToCase')}
          </button>
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
          {isEditing ? (
            <input
              type="text"
              value={loanName}
              onChange={(e) => setLoanName(e.target.value)}
              className="text-3xl font-bold text-gray-900 border-b border-gray-300 focus:outline-none focus:border-blue-500"
            />
          ) : (
            <h1 className="text-3xl font-bold text-gray-900">{loanData.name}</h1>
          )}
        </div>
        <div className="flex space-x-2">
          {isEditing ? (
            <>
              <button
                onClick={handleCancel}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                {t('buttons.cancel')}
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {isSaving ? t('buttons.saving') : t('buttons.save')}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleEdit}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                {t('buttons.edit')}
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                {t('buttons.delete')}
              </button>
            </>
          )}
        </div>
      </div>
      
      {error && (isCalculating || isSaving) && (
        <div className="bg-red-100 p-4 rounded-md mb-6">
          <p className="text-red-700">{error}</p>
        </div>
      )}
      
      {/* Case and Project Information */}
      {caseData && (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">{t('case.projectInformation')}</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              {t('case.projectInfoDescription')}
            </p>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">{t('case.title')}</dt>
                <dd className="mt-1 text-sm text-gray-900">{caseData.title}</dd>
              </div>
              
              {caseData.projectName && (
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">{t('case.projectName')}</dt>
                  <dd className="mt-1 text-sm text-gray-900">{caseData.projectName}</dd>
                </div>
              )}
              
              {caseData.purchasePrice && (
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">{t('case.purchasePrice')}</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(caseData.purchasePrice)}
                  </dd>
                </div>
              )}
              
              {caseData.purchaseDate && (
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">{t('case.purchaseDate')}</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {new Date(caseData.purchaseDate).toLocaleDateString()}
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Loan Information */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg lg:col-span-2">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">{t('loan.loanInformation')}</h3>
            <p className="mt-1 text-sm text-gray-600">
              {isEditing ? t('loan.editLoanParameters') : t('loan.loanParameters')}
            </p>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
            {isEditing ? (
              <LoanParametersForm
                defaultValues={loanParams}
                onSubmit={handleCalculate}
                isLoading={isCalculating}
                onValuesChange={handleLoanParamsChange}
              />
            ) : (
              <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">{t('loan.loanType')}</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {t(`loanTypes.${loanData.loanType.toLowerCase()}`)}
                  </dd>
                </div>
                
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">{t('loan.principal')}</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(loanData.principal)}
                  </dd>
                </div>
                
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">{t('loan.interestRate')}</dt>
                  <dd className="mt-1 text-sm text-gray-900">{loanData.interestRate}%</dd>
                </div>
                
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">{t('loan.termYears')}</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {loanData.termYears} {t('common.years')} ({loanData.termYears * 12} {t('common.months')})
                  </dd>
                </div>
                
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">{t('loan.ownContribution')}</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(loanData.ownContribution)}
                    {loanData.purchasePrice && (
                      <span className="text-xs text-gray-500 ml-2">
                        ({((loanData.ownContribution / loanData.purchasePrice) * 100).toFixed(1)}%)
                      </span>
                    )}
                  </dd>
                </div>
                
                {loanData.purchasePrice && (
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">{t('loan.purchasePrice')}</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(loanData.purchasePrice)}
                    </dd>
                  </div>
                )}
                
                {loanData.startYear && (
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">{t('loan.startYear')}</dt>
                    <dd className="mt-1 text-sm text-gray-900">{loanData.startYear}</dd>
                  </div>
                )}
                
                {loanData.insuranceCoveragePct && (
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">{t('loan.insuranceCoverage')}</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {(loanData.insuranceCoveragePct * 100).toFixed(1)}%
                    </dd>
                  </div>
                )}
              </dl>
            )}
          </div>
        </div>
        
        {/* Client Information */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">{t('client.clientInformation')}</h3>
            <p className="mt-1 text-sm text-gray-600">
              {isEditing ? t('client.selectClientsForLoan') : t('client.associatedWithLoan')}
            </p>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
            {isEditing ? (
              <ClientSelectionForm 
                clients={allClients}
                preselectedClientIds={selectedClientIds}
                onChange={handleClientSelectionChange}
              />
            ) : (
              <>
                {/* Client Summary (only displayed when there is more than one client) */}
                {loanData.clients.length > 1 && (
                  <div className="mb-4 p-3 bg-blue-50 rounded-md">
                    <h4 className="text-sm font-medium text-blue-700 mb-1">{t('client.clientSummary')}</h4>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-blue-800">
                      <div>{t('client.totalClients')}: {loanData.clients.length}</div>
                      <div>{t('client.totalMonthlyIncome')}: {new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(
                        loanData.clients.reduce((sum, client) => sum + client.monthlyIncome, 0)
                      )}</div>
                    </div>
                  </div>
                )}
                
                {/* Client List */}
                <ul className="divide-y divide-gray-200">
                  {loanData.clients.map((client) => (
                    <li key={client.id} className="py-2">
                      <div className="flex justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{client.name}</p>
                          <p className="text-xs text-gray-500">{client.type}</p>
                        </div>
                        <div>
                          <Link 
                            href={`/cases/${caseId}/clients/${client.id}`}
                            className="text-xs text-blue-600 hover:text-blue-800"
                          >
                            {t('common.view', 'View')}	
                          </Link>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </>
            )}
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
                  `
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
        
        {isEditing && !calculationResult && (
          <button
            onClick={() => loanParams && handleCalculate(loanParams)}
            disabled={isCalculating}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {isCalculating ? t('forms.calculating') : t('forms.calculate')}
          </button>
        )}
      </div>
    </div>
  );
}