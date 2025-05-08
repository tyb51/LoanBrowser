"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { compareLoans } from '@/app/services/backendLoanApi';
import { LoanComparisonTable } from '@/app/components/tables/LoanComparisonTable';
import { LoanComparisonChart } from '@/app/components/charts/LoanComparisonChart';

export default function ComparisonPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const caseId = params.id;
  
  // State for loan/insurance selection
  const [loanSimulations, setLoanSimulations] = useState<any[]>([]);
  const [insuranceSimulations, setInsuranceSimulations] = useState<any[]>([]);
  const [referenceLoanId, setReferenceLoanId] = useState<string>('');
  const [alternativeLoanId, setAlternativeLoanId] = useState<string>('');
  const [refInsuranceSimulationIds, setRefInsuranceSimulationIds] = useState<string[]>([]);
  const [altInsuranceSimulationIds, setAltInsuranceSimulationIds] = useState<string[]>([]);
  
  // State for comparison results
  const [comparisonResult, setComparisonResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);
  
  // Fetch loan and insurance simulations when the component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch loan simulations
        const loansResponse = await fetch(`/api/cases/${caseId}/loans`);
        if (!loansResponse.ok) {
          throw new Error('Failed to fetch loan simulations');
        }
        const loansData = await loansResponse.json();
        setLoanSimulations(loansData.loans || []);
        
        // Set default selection if loans are available
        if (loansData.loans && loansData.loans.length > 0) {
          setReferenceLoanId(loansData.loans[0].id);
          if (loansData.loans.length > 1) {
            setAlternativeLoanId(loansData.loans[1].id);
          }
        }
        
        // Fetch insurance simulations
        const insuranceResponse = await fetch(`/api/insurance-simulations?caseId=${caseId}`);
        if (!insuranceResponse.ok) {
          throw new Error('Failed to fetch insurance simulations');
        }
        const insuranceData = await insuranceResponse.json();
        setInsuranceSimulations(insuranceData.insuranceSimulations || []);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load data');
      } finally {
        setIsLoadingData(false);
      }
    };
    
    fetchData();
  }, [caseId]);
  
  // Handle reference loan insurance selection
  const handleRefInsuranceChange = (insuranceId: string) => {
    setRefInsuranceSimulationIds(prev => {
      if (prev.includes(insuranceId)) {
        return prev.filter(id => id !== insuranceId);
      } else {
        return [...prev, insuranceId];
      }
    });
  };
  
  // Handle alternative loan insurance selection
  const handleAltInsuranceChange = (insuranceId: string) => {
    setAltInsuranceSimulationIds(prev => {
      if (prev.includes(insuranceId)) {
        return prev.filter(id => id !== insuranceId);
      } else {
        return [...prev, insuranceId];
      }
    });
  };
  
  // Handle comparison submission
  const handleCompare = async () => {
    if (!referenceLoanId || !alternativeLoanId) {
      toast.error('Please select both reference and alternative loans');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Find the selected loan simulations
      const referenceLoan = loanSimulations.find(loan => loan.id === referenceLoanId);
      const alternativeLoan = loanSimulations.find(loan => loan.id === alternativeLoanId);
      
      if (!referenceLoan || !alternativeLoan) {
        throw new Error('Selected loans not found');
      }
      
      // Extract loan parameters from the simulations
      const refLoanParams = {
        loanType: referenceLoan.loanType,
        principal: referenceLoan.principal,
        interestRate: referenceLoan.interestRate,
        termYears: referenceLoan.termYears,
        ownContribution: referenceLoan.ownContribution,
        purchasePrice: referenceLoan.purchasePrice || referenceLoan.principal + referenceLoan.ownContribution,
        startYear: referenceLoan.startYear || new Date().getFullYear(),
        insuranceCoveragePct: referenceLoan.insuranceCoveragePct || 1.0
      };
      
      const altLoanParams = {
        loanType: alternativeLoan.loanType,
        principal: alternativeLoan.principal,
        interestRate: alternativeLoan.interestRate,
        termYears: alternativeLoan.termYears,
        ownContribution: alternativeLoan.ownContribution,
        purchasePrice: alternativeLoan.purchasePrice || alternativeLoan.principal + alternativeLoan.ownContribution,
        startYear: alternativeLoan.startYear || new Date().getFullYear(),
        insuranceCoveragePct: alternativeLoan.insuranceCoveragePct || 1.0
      };
      
      // Create modular schedule for bullet/modular loans
      let modularSchedule = null;
      if (alternativeLoan.loanType === 'BULLET' || alternativeLoan.loanType === 'MODULAR') {
        if (alternativeLoan.modularSchedule) {
          modularSchedule = alternativeLoan.modularSchedule;
        } else if (alternativeLoan.loanType === 'BULLET') {
          // Create a simple schedule with payment at end of term
          modularSchedule = {
            schedule: [
              { month: alternativeLoan.termYears * 12, amount: alternativeLoan.principal }
            ]
          };
        }
      }
      
      // Call the compareLoans API
      const result = await compareLoans(
        refLoanParams,
        altLoanParams,
        referenceLoan.ownContribution,
        alternativeLoan.ownContribution,
        undefined, // No investment parameters for comparison
        modularSchedule,
        refInsuranceSimulationIds.length > 0 ? refInsuranceSimulationIds : undefined,
        altInsuranceSimulationIds.length > 0 ? altInsuranceSimulationIds : undefined
      );
      
      setComparisonResult(result);
    } catch (error) {
      console.error('Error comparing loans:', error);
      toast.error('Failed to compare loans');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('nl-BE', { style: 'currency', currency: 'EUR' }).format(amount);
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
                  <span className="text-sm font-medium text-gray-500">Compare Loans</span>
                </div>
              </li>
            </ol>
          </nav>
          
          <h1 className="text-3xl font-bold leading-tight text-gray-900">Loan Comparison</h1>
          <p className="mt-2 text-sm text-gray-600">
            Compare loan simulations with optional insurance to see the difference in costs and payments.
          </p>
        </div>
      </header>
      
      <main>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {isLoadingData ? (
            <div className="py-6 text-center">
              <p className="text-gray-500">Loading data...</p>
            </div>
          ) : loanSimulations.length < 2 ? (
            <div className="bg-white shadow sm:rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium leading-6 text-gray-900">Not enough loan simulations</h3>
                <div className="mt-2 max-w-xl text-sm text-gray-500">
                  <p>You need at least two loan simulations to compare. Please create more simulations.</p>
                </div>
                <div className="mt-5">
                  <Link
                    href={`/cases/${caseId}/loans/new`}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Create Loan Simulation
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="bg-white shadow-sm sm:rounded-lg mb-6">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg font-medium leading-6 text-gray-900">Select Loans to Compare</h3>
                  
                  <div className="mt-5 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                    {/* Reference Loan Selection */}
                    <div>
                      <label htmlFor="reference-loan" className="block text-sm font-medium text-gray-700">
                        Reference Loan
                      </label>
                      <select
                        id="reference-loan"
                        value={referenceLoanId}
                        onChange={(e) => setReferenceLoanId(e.target.value)}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                      >
                        <option value="">Select a reference loan</option>
                        {loanSimulations.map((loan) => (
                          <option key={`ref-${loan.id}`} value={loan.id}>
                            {loan.name} ({formatCurrency(loan.principal)} @ {loan.interestRate}%)
                          </option>
                        ))}
                      </select>
                      
                      {/* Reference Loan Insurance Selection */}
                      {referenceLoanId && insuranceSimulations.length > 0 && (
                        <div className="mt-4">
                          <label className="block text-sm font-medium text-gray-700">
                            Insurance Simulations (Reference)
                          </label>
                          <div className="mt-2 space-y-2 max-h-60 overflow-y-auto p-2 border border-gray-200 rounded-md">
                            {insuranceSimulations.map((insurance) => (
                              <div key={`ref-ins-${insurance.id}`} className="flex items-center">
                                <input
                                  id={`ref-ins-${insurance.id}`}
                                  type="checkbox"
                                  checked={refInsuranceSimulationIds.includes(insurance.id)}
                                  onChange={() => handleRefInsuranceChange(insurance.id)}
                                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <label htmlFor={`ref-ins-${insurance.id}`} className="ml-2 text-sm text-gray-700">
                                  {insurance.name}
                                  <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                                    insurance.type === 'LIFE' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'
                                  }`}>
                                    {insurance.type}
                                  </span>
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Alternative Loan Selection */}
                    <div>
                      <label htmlFor="alternative-loan" className="block text-sm font-medium text-gray-700">
                        Alternative Loan
                      </label>
                      <select
                        id="alternative-loan"
                        value={alternativeLoanId}
                        onChange={(e) => setAlternativeLoanId(e.target.value)}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                      >
                        <option value="">Select an alternative loan</option>
                        {loanSimulations.map((loan) => (
                          <option key={`alt-${loan.id}`} value={loan.id}>
                            {loan.name} ({formatCurrency(loan.principal)} @ {loan.interestRate}%)
                          </option>
                        ))}
                      </select>
                      
                      {/* Alternative Loan Insurance Selection */}
                      {alternativeLoanId && insuranceSimulations.length > 0 && (
                        <div className="mt-4">
                          <label className="block text-sm font-medium text-gray-700">
                            Insurance Simulations (Alternative)
                          </label>
                          <div className="mt-2 space-y-2 max-h-60 overflow-y-auto p-2 border border-gray-200 rounded-md">
                            {insuranceSimulations.map((insurance) => (
                              <div key={`alt-ins-${insurance.id}`} className="flex items-center">
                                <input
                                  id={`alt-ins-${insurance.id}`}
                                  type="checkbox"
                                  checked={altInsuranceSimulationIds.includes(insurance.id)}
                                  onChange={() => handleAltInsuranceChange(insurance.id)}
                                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <label htmlFor={`alt-ins-${insurance.id}`} className="ml-2 text-sm text-gray-700">
                                  {insurance.name}
                                  <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                                    insurance.type === 'LIFE' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'
                                  }`}>
                                    {insurance.type}
                                  </span>
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-5">
                    <button
                      type="button"
                      onClick={handleCompare}
                      disabled={isLoading || !referenceLoanId || !alternativeLoanId}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                      {isLoading ? 'Comparing...' : 'Compare Loans'}
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Comparison Results */}
              {comparisonResult && (
                <div className="space-y-6">
                  <div className="bg-white shadow sm:rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                      <h3 className="text-lg font-medium leading-6 text-gray-900">Comparison Results</h3>
                      
                      <div className="mt-5 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                        <div>
                          <h4 className="text-sm font-medium text-gray-700">Reference Loan</h4>
                          <p className="mt-1 text-sm text-gray-900">
                            {loanSimulations.find(loan => loan.id === referenceLoanId)?.name}
                          </p>
                          {refInsuranceSimulationIds.length > 0 && (
                            <div className="mt-2">
                              <p className="text-xs font-medium text-gray-500">With Insurance:</p>
                              <ul className="mt-1 text-xs text-gray-500">
                                {refInsuranceSimulationIds.map((id) => {
                                  const insurance = insuranceSimulations.find(ins => ins.id === id);
                                  return (
                                    <li key={`ref-ins-display-${id}`}>
                                      {insurance?.name} ({insurance?.type})
                                    </li>
                                  );
                                })}
                              </ul>
                            </div>
                          )}
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-medium text-gray-700">Alternative Loan</h4>
                          <p className="mt-1 text-sm text-gray-900">
                            {loanSimulations.find(loan => loan.id === alternativeLoanId)?.name}
                          </p>
                          {altInsuranceSimulationIds.length > 0 && (
                            <div className="mt-2">
                              <p className="text-xs font-medium text-gray-500">With Insurance:</p>
                              <ul className="mt-1 text-xs text-gray-500">
                                {altInsuranceSimulationIds.map((id) => {
                                  const insurance = insuranceSimulations.find(ins => ins.id === id);
                                  return (
                                    <li key={`alt-ins-display-${id}`}>
                                      {insurance?.name} ({insurance?.type})
                                    </li>
                                  );
                                })}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="mt-6">
                        <div className="border-t border-gray-200 py-5">
                          <h4 className="text-sm font-medium text-gray-700">Cost Comparison</h4>
                          
                          <div className="mt-4">
                            <LoanComparisonTable
                              referenceLoan={comparisonResult.referenceLoan}
                              alternativeLoan={comparisonResult.alternativeLoan}
                            />
                          </div>
                        </div>
                        
                        <div className="border-t border-gray-200 py-5">
                          <h4 className="text-sm font-medium text-gray-700">Payment Comparison</h4>
                          
                          <div className="mt-4 h-96">
                            <LoanComparisonChart
                              referenceLoanData={comparisonResult.referenceLoan}
                              alternativeLoanData={comparisonResult.alternativeLoan}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
