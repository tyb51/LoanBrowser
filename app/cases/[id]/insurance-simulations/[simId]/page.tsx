"use client";

import React, { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { 
  InsuranceType, 
  InsuranceSimulation, 
  getInsuranceSimulation, 
  updateInsuranceSimulation,
  deleteInsuranceSimulation,
  calculateInsuranceForLoan
} from '@/app/services/insuranceSimulationApi';
import { InsuranceSimulationForm } from '@/app/components/forms/InsuranceSimulationForm';
import { InsuranceAmortizationTable } from '@/app/components/tables/InsuranceAmortizationTable';
import { getCaseLoans } from '@/app/actions/caseActions';

interface Loan {
  id: string;
  name: string;
  principal: number;
  interestRate: number;
  termYears: number;
}


export default function InsuranceSimulationDetailPage({ params }: { params: Promise<{ id: string; simId: string }> }) {
  const router = useRouter();
  const {id: caseId, simId} = use(params);
 
  
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  const [insuranceSimulation, setInsuranceSimulation] = useState<InsuranceSimulation | null>(null);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [selectedLoanId, setSelectedLoanId] = useState<string>('');
  
  // Fetch insurance simulation data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch loans in parallel with insurance simulation data
        const [simulation, loansList] = await Promise.all([
          getInsuranceSimulation(simId),
          getCaseLoans(caseId)
        ]);
        
        setInsuranceSimulation(simulation);
        setLoans(loansList);
        
        // If this is a life insurance and there's a current loan, select it
        if (simulation?.type === 'LIFE' && simulation.currentLoan) {
          setSelectedLoanId(simulation.currentLoan.id);
        } else if (loansList.length > 0) {
          // Otherwise, select the first loan by default
          setSelectedLoanId(loansList[0].id);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load insurance simulation data');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [simId, caseId]);
  
  const handleUpdate = async (formData: { 
    name: string; 
    parameters: any; 
    calculateResult?: boolean;
    clientIds: string[];
    selectedLoanId?: string;
    simulatedInterestRate?: number;
  }) => {
    if (!insuranceSimulation) return;
    
    setIsSaving(true);
    
    try {
      const result = await updateInsuranceSimulation(simId, {
        name: formData.name,
        parameters: formData.parameters,
        clientIds: formData.clientIds,
        selectedLoanId: formData.selectedLoanId,
        simulatedInterestRate: formData.simulatedInterestRate,
        calculateResult: formData.calculateResult
      });
      
      if (result) {
        setInsuranceSimulation(result);
        setIsEditing(false);
        toast.success('Insurance simulation updated successfully');
      }
    } catch (error) {
      console.error('Error updating insurance simulation:', error);
      toast.error('Failed to update insurance simulation');
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this insurance simulation?')) {
      return;
    }
    
    setIsDeleting(true);
    
    try {
      const success = await deleteInsuranceSimulation(simId);
      
      if (success) {
        toast.success('Insurance simulation deleted successfully');
        router.push(`/cases/${caseId}`);
      }
    } catch (error) {
      console.error('Error deleting insurance simulation:', error);
      toast.error('Failed to delete insurance simulation');
    } finally {
      setIsDeleting(false);
    }
  };
  
  const handleLoanChange = async (loanId: string) => {
    if (!insuranceSimulation || insuranceSimulation.type !== 'LIFE' || loanId === selectedLoanId) {
      return;
    }
    
    setSelectedLoanId(loanId);
    setIsCalculating(true);
    
    try {
      // For life insurance, recalculate with the selected loan
      const result = await getInsuranceSimulation(simId, loanId);
      
      if (result) {
        setInsuranceSimulation(result);
      }
    } catch (error) {
      console.error('Error calculating insurance for loan:', error);
      toast.error('Failed to calculate insurance for selected loan');
    } finally {
      setIsCalculating(false);
    }
  };
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('nl-BE', { style: 'currency', currency: 'EUR' }).format(amount);
  };
  
  // Render life insurance details
  const renderLifeInsuranceDetails = () => {
    if (!insuranceSimulation || insuranceSimulation.type !== 'LIFE') return null;
    
    const params = insuranceSimulation.parameters as any;
    const currentLoan = insuranceSimulation.currentLoan || loans.find(loan => loan.id === selectedLoanId);
    
    return (
      <div className="space-y-6">
        {/* Loan selector for life insurance */}
        <div className="bg-blue-50 p-4 rounded-md">
          <h4 className="text-sm font-medium text-blue-900 mb-2">Selected Loan</h4>
          <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-4">
            <div className="flex-grow">
              <select
                value={selectedLoanId}
                onChange={(e) => handleLoanChange(e.target.value)}
                disabled={isCalculating}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                <option value="" disabled>Select a loan</option>
                {loans.map((loan) => (
                  <option key={loan.id} value={loan.id}>
                    {loan.name} (€{loan.principal.toLocaleString()}, {loan.termYears} years)
                  </option>
                ))}
              </select>
            </div>
            {isCalculating && (
              <div className="flex items-center justify-center sm:justify-start">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="text-sm text-blue-700">Calculating...</span>
              </div>
            )}
          </div>
          
          {currentLoan && (
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-blue-700 font-medium">Loan Amount:</span> {formatCurrency(currentLoan.principal)}
              </div>
              <div>
                <span className="text-blue-700 font-medium">Term:</span> {currentLoan.termYears} years
              </div>
              <div>
                <span className="text-blue-700 font-medium">Interest Rate:</span> {currentLoan?.interestRate ? `${currentLoan.interestRate}%` : 'N/A'}
              </div>
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium text-gray-500">Coverage Percentage</h4>
            <p className="mt-1 text-sm text-gray-900">{params.coveragePercentage * 100}%</p>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-gray-500">Payment Type</h4>
            <p className="mt-1 text-sm text-gray-900">{params.paymentType === 'DISTRIBUTED' ? 'Monthly Payments' : 'Lump Sum Payment'}</p>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-gray-500">Based on Remaining Capital</h4>
            <p className="mt-1 text-sm text-gray-900">{params.basedOnRemainingCapital ? 'Yes' : 'No'}</p>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-gray-500">Client</h4>
            <p className="mt-1 text-sm text-gray-900">{insuranceSimulation.client?.name || 'Not specified'}</p>
          </div>
        </div>
        
        {insuranceSimulation.calculationResult && (
          <>
            <div className="mt-6 p-4 bg-gray-50 rounded-md">
              <h4 className="text-sm font-medium text-gray-900">Calculation Results</h4>
              <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h5 className="text-xs font-medium text-gray-500">Monthly Premium</h5>
                  <p className="text-sm text-gray-900">{formatCurrency(insuranceSimulation.calculationResult.monthlyPremium)}</p>
                </div>
                
                <div>
                  <h5 className="text-xs font-medium text-gray-500">Total Premium</h5>
                  <p className="text-sm text-gray-900">{formatCurrency(insuranceSimulation.calculationResult.totalPremium)}</p>
                </div>
                
                <div>
                  <h5 className="text-xs font-medium text-gray-500">Coverage Amount</h5>
                  <p className="text-sm text-gray-900">{formatCurrency(insuranceSimulation.calculationResult.coverageAmount)}</p>
                </div>
              </div>
            </div>
            
            <div className="mt-4">
              <InsuranceAmortizationTable 
                data={insuranceSimulation.calculationResult.amortizationTable}
                title="Life Insurance Amortization Schedule"
                coverageAmount={insuranceSimulation.calculationResult.coverageAmount}
                totalPremium={insuranceSimulation.calculationResult.totalPremium}
                monthlyPremium={insuranceSimulation.calculationResult.monthlyPremium}
              />
            </div>
          </>
        )}
      </div>
    );
  };
  
  // Render home insurance details
  const renderHomeInsuranceDetails = () => {
    if (!insuranceSimulation || insuranceSimulation.type !== 'HOME') return null;
    
    const params = insuranceSimulation.parameters as any;
    
    return (
      <div className="space-y-6">
        {/* Client information for home insurance */}
        {insuranceSimulation.homeInsuranceClients && insuranceSimulation.homeInsuranceClients.length > 0 && (
          <div className="bg-green-50 p-4 rounded-md">
            <h4 className="text-sm font-medium text-green-900 mb-2">Associated Clients</h4>
            <div className="mt-2 space-y-2">
              {insuranceSimulation.homeInsuranceClients.map((clientAssoc) => (
                <div key={clientAssoc.clientId} className="flex justify-between items-center">
                  <span className="text-sm text-gray-900">{clientAssoc.client.name} ({clientAssoc.client.type})</span>
                  {insuranceSimulation.homeInsuranceClients &&insuranceSimulation.homeInsuranceClients.length > 1 && (
                    <span className="text-sm font-medium text-gray-700 bg-gray-100 px-2 py-1 rounded">
                      {clientAssoc.sharePercentage.toFixed(1)}%
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium text-gray-500">Property Value</h4>
            <p className="mt-1 text-sm text-gray-900">{formatCurrency(params.propertyValue)}</p>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-gray-500">Property Type</h4>
            <p className="mt-1 text-sm text-gray-900">{params.propertyType.replace('_', ' ')}</p>
          </div>
          
          {params.constructionYear && (
            <div>
              <h4 className="text-sm font-medium text-gray-500">Construction Year</h4>
              <p className="mt-1 text-sm text-gray-900">{params.constructionYear}</p>
            </div>
          )}
          
          {params.squareMeters && (
            <div>
              <h4 className="text-sm font-medium text-gray-500">Size</h4>
              <p className="mt-1 text-sm text-gray-900">{params.squareMeters} m²</p>
            </div>
          )}
          
          {params.deductible && (
            <div>
              <h4 className="text-sm font-medium text-gray-500">Deductible</h4>
              <p className="mt-1 text-sm text-gray-900">{formatCurrency(params.deductible)}</p>
            </div>
          )}
          
          <div>
            <h4 className="text-sm font-medium text-gray-500">Coverage Percentage</h4>
            <p className="mt-1 text-sm text-gray-900">{params.coveragePercentage * 100}%</p>
          </div>
          
          {insuranceSimulation.simulatedInterestRate !== undefined && insuranceSimulation.simulatedInterestRate > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-500">Simulated Interest Rate</h4>
              <p className="mt-1 text-sm text-gray-900">{insuranceSimulation.simulatedInterestRate}%</p>
            </div>
          )}
        </div>
        
        {insuranceSimulation.calculationResult && (
          <>
            <div className="mt-6 p-4 bg-gray-50 rounded-md">
              <h4 className="text-sm font-medium text-gray-900">Calculation Results</h4>
              <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h5 className="text-xs font-medium text-gray-500">Monthly Premium</h5>
                  <p className="text-sm text-gray-900">{formatCurrency(insuranceSimulation.calculationResult.monthlyPremium)}</p>
                </div>
                
                <div>
                  <h5 className="text-xs font-medium text-gray-500">Annual Premium</h5>
                  <p className="text-sm text-gray-900">{formatCurrency(insuranceSimulation.calculationResult.monthlyPremium * 12)}</p>
                </div>
                
                <div>
                  <h5 className="text-xs font-medium text-gray-500">Coverage Amount</h5>
                  <p className="text-sm text-gray-900">{formatCurrency(insuranceSimulation.calculationResult.coverageAmount)}</p>
                </div>
                
                <div>
                  <h5 className="text-xs font-medium text-gray-500">Deductible</h5>
                  <p className="text-sm text-gray-900">{formatCurrency(params.deductible || 0)}</p>
                </div>
              </div>
            </div>
            
            {/* Generate an amortization table for home insurance */}
            {insuranceSimulation.simulatedInterestRate !== undefined && insuranceSimulation.simulatedInterestRate > 0 && (
              <div className="mt-4">
                <InsuranceAmortizationTable 
                  data={[
                    {
                      month: 1,
                      year: 1,
                      premium: insuranceSimulation.calculationResult.monthlyPremium,
                      cumulativePremium: insuranceSimulation.calculationResult.monthlyPremium,
                      coverage: insuranceSimulation.calculationResult.coverageAmount
                    },
                    {
                      month: 12,
                      year: 1,
                      premium: insuranceSimulation.calculationResult.monthlyPremium,
                      cumulativePremium: insuranceSimulation.calculationResult.monthlyPremium * 12,
                      coverage: insuranceSimulation.calculationResult.coverageAmount
                    }
                  ]}
                  title="Home Insurance Premium Schedule"
                  coverageAmount={insuranceSimulation.calculationResult.coverageAmount}
                  totalPremium={insuranceSimulation.calculationResult.monthlyPremium * 12}
                  monthlyPremium={insuranceSimulation.calculationResult.monthlyPremium}
                />
              </div>
            )}
          </>
        )}
      </div>
    );
  };
  
  return (
    <div className="py-10">
      <header>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <nav className="mb-5 flex" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-4">
              <li>
                <div className="flex items-center">
                  <Link href={`/cases/${caseId}`} className="text-sm font-medium text-gray-500 hover:text-gray-700">
                    Case Details
                  </Link>
                </div>
              </li>
              <li>
                <div className="flex items-center">
                  <span className="mx-2 text-gray-400">/</span>
                  <span className="text-sm font-medium text-gray-500">Insurance Simulation</span>
                </div>
              </li>
            </ol>
          </nav>
          
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold leading-tight text-gray-900">
              {isLoading ? 'Loading...' : insuranceSimulation?.name}
            </h1>
            
            {!isLoading && insuranceSimulation && !isEditing && (
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Edit
                </button>
                
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
      
      <main>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="py-6 text-center">
              <p className="text-gray-500">Loading insurance simulation...</p>
            </div>
          ) : !insuranceSimulation ? (
            <div className="py-6 text-center">
              <p className="text-gray-500">Insurance simulation not found.</p>
              <Link 
                href={`/cases/${caseId}`}
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Return to Case
              </Link>
            </div>
          ) : isEditing ? (
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="p-6">
                <InsuranceSimulationForm 
                  type={insuranceSimulation.type}
                  clients={[]} // This should be fetched from the case
                  loans={loans}
                  defaultValues={{
                    name: insuranceSimulation.name,
                    parameters: insuranceSimulation.parameters,
                    selectedClientIds: insuranceSimulation.type === 'LIFE' && insuranceSimulation.clientId ? 
                      [insuranceSimulation.clientId] : 
                      insuranceSimulation.homeInsuranceClients?.map(c => c.clientId) || [],
                    selectedLoanId: insuranceSimulation.currentLoan?.id,
                    simulatedInterestRate: insuranceSimulation.simulatedInterestRate
                  }}
                  onSubmit={handleUpdate}
                  isLoading={isSaving}
                />
                
                <div className="mt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <div className="flex items-center">
                  <div className={`h-10 w-10 flex items-center justify-center rounded-md ${
                    insuranceSimulation.type === 'LIFE' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'
                  }`}>
                    {insuranceSimulation.type === 'LIFE' ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                    )}
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium leading-6 text-gray-900">
                      {insuranceSimulation.type === 'LIFE' ? 'Life Insurance' : 'Home Insurance'}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {insuranceSimulation.type === 'LIFE' ? 
                        `Client: ${insuranceSimulation.client?.name || 'Not specified'}` : 
                        `Clients: ${insuranceSimulation.homeInsuranceClients?.length || 0}`}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                {insuranceSimulation.type === 'LIFE' ? renderLifeInsuranceDetails() : renderHomeInsuranceDetails()}
              </div>
              
              <div className="border-t border-gray-200 px-4 py-4 sm:px-6 bg-gray-50">
                <div className="text-sm">
                  <span className="text-gray-500">Created: </span>
                  <time className="text-gray-900">{new Date(insuranceSimulation.createdAt).toLocaleString()}</time>
                </div>
                <div className="text-sm mt-1">
                  <span className="text-gray-500">Last Updated: </span>
                  <time className="text-gray-900">{new Date(insuranceSimulation.updatedAt).toLocaleString()}</time>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}