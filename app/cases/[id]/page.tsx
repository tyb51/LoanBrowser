"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useTranslation } from '@/app/i18n/client';

interface Client {
  id: string;
  name: string;
  type: 'INDIVIDUAL' | 'COMPANY';
  age?: number | null;
  height?: number | null;
  weight?: number | null;
  smoker?: boolean | null;
  currentCapital: number;
  currentDebt: number;
  monthlyIncome: number;
}

interface LoanSimulation {
  id: string;
  name: string;
  loanType: string;
  principal: number;
  interestRate: number;
  termYears: number;
  ownContribution: number;
  purchasePrice?: number | null;
  clients?: Client[];
}

interface InsuranceSimulation {
  id: string;
  name: string;
  type: 'LIFE' | 'HOME';
  clientId: string;
  client?: {
    name: string;
    type: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface Case {
  id: string;
  title: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  projectName?: string | null;
  purchasePrice?: number | null;
  purchaseDate?: string | null;
  clients: Client[];
  loanSimulations: LoanSimulation[];
  insuranceSimulations?: InsuranceSimulation[];
}

export default function CaseDetail() {
  const { t } = useTranslation();
  const { user, status, requireAuth } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const [caseData, setCaseData] = useState<Case | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  // Form data for editing
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [projectName, setProjectName] = useState('');
  const [purchasePrice, setPurchasePrice] = useState<number | ''>(0);
  const [purchaseDate, setPurchaseDate] = useState('');

  // Check authentication on component mount
  useEffect(() => {
    requireAuth();
  }, [requireAuth]);

  // Fetch case data when component mounts
  useEffect(() => {
    const fetchCase = async () => {
      if (status !== 'authenticated') return;
      
      try {
        const response = await fetch(`/api/cases/${id}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error(t('case.notFound'));
          } else {
            throw new Error(t('case.failedToFetch'));
          }
        }
        
        const data = await response.json();
        console.log('Fetched case data:', data);
        setCaseData(data.case);
        setTitle(data.case.title);
        setDescription(data.case.description || '');
        setProjectName(data.case.projectName || '');
        setPurchasePrice(data.case.purchasePrice || '');
        setPurchaseDate(data.case.purchaseDate ? 
          new Date(data.case.purchaseDate).toISOString().split('T')[0] : '');
      } catch (error) {
        console.error('Error fetching case:', error);
        setError(error instanceof Error ? error.message : t('common.unexpectedError'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchCase();
  }, [id, status, t]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setTitle(caseData?.title || '');
    setDescription(caseData?.description || '');
    setProjectName(caseData?.projectName || '');
    setPurchasePrice(caseData?.purchasePrice || '');
    setPurchaseDate(caseData?.purchaseDate ? 
      new Date(caseData.purchaseDate).toISOString().split('T')[0] : '');
    setIsEditing(false);
  };

  const handleSave = async () => {
    try {
      const response = await fetch(`/api/cases/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          description,
          projectName,
          purchasePrice: purchasePrice === '' ? null : purchasePrice,
          purchaseDate: purchaseDate || null,
        }),
      });
      
      if (!response.ok) {
        throw new Error(t('case.failedToUpdate'));
      }
      
      const data = await response.json();
      setCaseData({
        ...caseData!,
        title: data.case.title,
        description: data.case.description,
        projectName: data.case.projectName,
        purchasePrice: data.case.purchasePrice,
        purchaseDate: data.case.purchaseDate,
        updatedAt: data.case.updatedAt,
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating case:', error);
      setError(error instanceof Error ? error.message : t('common.unexpectedError'));
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(t('case.confirmDelete'))) {
      return;
    }
    
    try {
      const response = await fetch(`/api/cases/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(t('case.failedToDelete'));
      }
      
      router.push('/cases');
    } catch (error) {
      console.error('Error deleting case:', error);
      setError(error instanceof Error ? error.message : t('common.unexpectedError'));
    }
  };

  // Show loading state while checking authentication or fetching data
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
  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-red-100 p-4 rounded-md">
          <p className="text-red-700">{error}</p>
          <button
            onClick={() => router.push('/cases')}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            {t('case.backToCases')}
          </button>
        </div>
      </div>
    );
  }

  // Show case data
  if (!caseData) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white p-4 rounded-md shadow">
          <p className="text-gray-700">{t('case.notFound')}</p>
          <button
            onClick={() => router.push('/cases')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            {t('case.backToCases')}
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
            onClick={() => router.push('/cases')}
            className="mr-4 text-gray-600 hover:text-gray-900"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          {isEditing ? (
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-3xl font-bold text-gray-900 border-b border-gray-300 focus:outline-none focus:border-blue-500"
            />
          ) : (
            <h1 className="text-3xl font-bold text-gray-900">{caseData.title}</h1>
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
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                {t('buttons.save')}
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

      {/* Basic Case Details */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">{t('case.details')}</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            {t('case.basicInformation')}
          </p>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
          <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-gray-500">{t('case.description')}</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {isEditing ? (
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    className="w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                ) : (
                  description || t('case.noDescriptionProvided')
                )}
              </dd>
            </div>
            
            {/* Project Information */}
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">{t('case.projectName')}</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {isEditing ? (
                  <input
                    type="text"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    className="w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                ) : (
                  projectName || t('common.notSpecified')
                )}
              </dd>
            </div>
            
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">{t('case.purchaseDate')}</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {isEditing ? (
                  <input
                    type="date"
                    value={purchaseDate}
                    onChange={(e) => setPurchaseDate(e.target.value)}
                    className="w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                ) : (
                  caseData.purchaseDate ? 
                    new Date(caseData.purchaseDate).toLocaleDateString() : 
                    t('common.notSpecified')
                )}
              </dd>
            </div>
            
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">{t('case.purchasePrice')}</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {isEditing ? (
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">€</span>
                    </div>
                    <input
                      type="number"
                      value={purchasePrice}
                      onChange={(e) => setPurchasePrice(e.target.value === '' ? '' : parseFloat(e.target.value))}
                      className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
                      placeholder="0.00"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">EUR</span>
                    </div>
                  </div>
                ) : (
                  caseData.purchasePrice ? 
                    new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(caseData.purchasePrice) : 
                    t('common.notSpecified')
                )}
              </dd>
            </div>
            
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">{t('case.created')}</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {new Date(caseData.createdAt).toLocaleDateString()} {t('common.at')} {new Date(caseData.createdAt).toLocaleTimeString()}
              </dd>
            </div>
            
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">{t('case.lastUpdated')}</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {new Date(caseData.updatedAt).toLocaleDateString()} {t('common.at')} {new Date(caseData.updatedAt).toLocaleTimeString()}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Clients Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">{t('client.clients')}</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                {t('client.associatedWithCase')}
              </p>
            </div>
            <Link href={`/cases/${id}/clients/new`} className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700">
              {t('client.addClient')}
            </Link>
          </div>
          <div className="border-t border-gray-200">
            {caseData.clients.length === 0 ? (
              <div className="px-4 py-5 sm:px-6 text-center">
                <p className="text-sm text-gray-500">{t('client.noClientsYet')}</p>
                <p className="mt-2 text-sm text-gray-500">{t('client.addClientToStart')}</p>
              </div>
            ) : (
              <>
                {/* Client Summary (only displayed when there is more than one client) */}
                {caseData.clients.length > 1 && (
                  <div className="px-4 py-3 bg-blue-50">
                    <h4 className="text-sm font-medium text-blue-700 mb-1">{t('client.clientSummary')}</h4>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-blue-800">
                      <div>{t('client.totalClients')}: {caseData.clients.length}</div>
                      <div>{t('client.totalMonthlyIncome')}: {new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(
                        caseData.clients.reduce((sum, client) => sum + client.monthlyIncome, 0)
                      )}</div>
                      <div>{t('client.totalCapital')}: {new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(
                        caseData.clients.reduce((sum, client) => sum + client.currentCapital, 0)
                      )}</div>
                      <div>{t('client.totalDebt')}: {new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(
                        caseData.clients.reduce((sum, client) => sum + client.currentDebt, 0)
                      )}</div>
                      <div className="col-span-2">{t('client.combinedNetWorth')}: {new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(
                        caseData.clients.reduce((sum, client) => sum + (client.currentCapital - client.currentDebt), 0)
                      )}</div>
                    </div>
                  </div>
                )}
                <ul className="divide-y divide-gray-200">
                  {caseData.clients.map((client) => (
                    <li key={client.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                      <Link href={`/cases/${id}/clients/${client.id}`} className="flex justify-between">
                        <div>
                          <p className="text-sm font-medium text-blue-600">{client.name}</p>
                          <p className="text-xs text-gray-500">{client.type}</p>
                        </div>
                        <div className="text-sm text-gray-500">
                          <div>{t('client.income')}: {new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(client.monthlyIncome)} / {t('common.month')}</div>
                          <div className="text-xs text-right">{t('client.netWorth')}: {new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(client.currentCapital - client.currentDebt)}</div>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </div>

        {/* Loan Simulations Section */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">{t('loan.loanSimulations')}</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                {t('loan.scenariosForCase')}
              </p>
            </div>
            <Link href={`/cases/${id}/loans/new`} className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700">
              {t('loan.addSimulation')}
            </Link>
          </div>
          <div className="border-t border-gray-200">
            {caseData.loanSimulations.length === 0 ? (
              <div className="px-4 py-5 sm:px-6 text-center">
                <p className="text-sm text-gray-500">{t('loan.noSimulationsYet')}</p>
                <p className="mt-2 text-sm text-gray-500">{t('loan.addSimulationToStart')}</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {caseData.loanSimulations.map((loan) => (
                  <li key={loan.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                    <Link href={`/cases/${id}/loans/${loan.id}`} className="flex justify-between">
                      <div>
                        <p className="text-sm font-medium text-blue-600">{loan.name}</p>
                        <div className="flex items-center mt-1">
                          <p className="text-xs text-gray-500 mr-2">{t(`loanTypes.${loan.loanType.toLowerCase()}`)}</p>
                          
                          {/* Show number of associated clients if available */}
                          {loan.clients && (
                            <span className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-800">
                              {loan.clients.length} {t('client.clients')}
                            </span>
                          )}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">
                          {new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(loan.principal)} {t('common.at')} {loan.interestRate}%
                        </p>
                        <p className="text-xs text-gray-500 text-right">
                          {loan.termYears} {t('common.years')}
                        </p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Insurance Simulations Section */}
      <div className="grid grid-cols-1 mb-6">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">{t('insurance.insuranceSimulations')}</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                {t('insurance.simulationsForCase')}
              </p>
            </div>
            <Link href={`/cases/${id}/insurance-simulations/new`} className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700">
              {t('insurance.addSimulation')}
            </Link>
          </div>
          <div className="border-t border-gray-200">
            {!caseData.insuranceSimulations || caseData.insuranceSimulations.length === 0 ? (
              <div className="px-4 py-5 sm:px-6 text-center">
                <p className="text-sm text-gray-500">{t('insurance.noSimulationsYet')}</p>
                <p className="mt-2 text-sm text-gray-500">{t('insurance.addSimulationToStart')}</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {caseData.insuranceSimulations.map((insurance) => (
                  <li key={insurance.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                    <Link href={`/cases/${id}/insurance-simulations/${insurance.id}`} className="flex justify-between">
                      <div>
                        <p className="text-sm font-medium text-blue-600">{insurance.name}</p>
                        <div className="flex items-center mt-1">
                          <span className={`px-2 py-0.5 text-xs rounded-full ${
                            insurance.type === 'LIFE' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'
                          }`}>
                            {insurance.type}
                          </span>
                          {insurance.client && (
                            <span className="ml-2 text-xs text-gray-500">
                              {insurance.client.name}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">
                        <p className="text-xs text-right text-gray-500">
                          {new Date(insurance.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
      <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">{t('common.quickActions')}</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            {t('common.commonOperations')}
          </p>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <Link 
              href={`/cases/${id}/clients/new`}
              className="p-4 border border-gray-300 rounded-md hover:bg-blue-50 flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              <span className="text-sm font-medium text-gray-900">{t('client.addNewClient')}</span>
            </Link>
            
            <Link 
              href={`/cases/${id}/loans/new`}
              className="p-4 border border-gray-300 rounded-md hover:bg-blue-50 flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-medium text-gray-900">{t('loan.createLoanSimulation')}</span>
            </Link>
            
            <Link 
              href={`/cases/${id}/insurance-simulations/new`}
              className="p-4 border border-gray-300 rounded-md hover:bg-blue-50 flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span className="text-sm font-medium text-gray-900">{t('insurance.configureInsurance')}</span>
            </Link>
            
            <Link 
              href={`/cases/${id}/investment`}
              className="p-4 border border-gray-300 rounded-md hover:bg-blue-50 flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span className="text-sm font-medium text-gray-900">{t('investment.runSimulation')}</span>
            </Link>
            
            <Link 
              href={`/cases/${id}/export`}
              className="p-4 border border-gray-300 rounded-md hover:bg-blue-50 flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span className="text-sm font-medium text-gray-900">{t('case.exportData')}</span>
            </Link>
            
            <Link 
              href={caseData.clients.length > 0 ? `/cases/${id}/compare` : '#'}
              className={`p-4 border border-gray-300 rounded-md flex items-center ${
                caseData.clients.length > 0 ? 'hover:bg-blue-50' : 'opacity-50 cursor-not-allowed'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
              </svg>
              <span className="text-sm font-medium text-gray-900">{t('common.compareSimulations')}</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
