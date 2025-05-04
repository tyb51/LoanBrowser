"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

interface Client {
  id: string;
  name: string;
  type: 'INDIVIDUAL' | 'COMPANY';
  age?: number | null;
  height?: number | null;
  weight?: number | null;
  smoker?: boolean | null;
}

interface Loan {
  id: string;
  name: string;
  loanType: 'ANNUITY' | 'BULLET' | 'MODULAR';
  principal: number;
  interestRate: number;
  termYears: number;
  purchasePrice?: number | null;
}

interface Insurance {
  id: string;
  type: 'LIFE' | 'HOME';
  coveragePercentage: number;
  initialPremium: number;
  clientName: string;
  clientType: 'INDIVIDUAL' | 'COMPANY';
  lifeInsurance?: {
    id: string;
    paymentType: 'LUMP_SUM' | 'DISTRIBUTED';
    basedOnRemainingCapital: boolean;
  };
  homeInsurance?: {
    id: string;
    propertyValue: number;
    propertyType: string;
  };
}

// Life insurance form data
interface LifeInsuranceFormData {
  coveragePercentage: number;
  paymentType: 'LUMP_SUM' | 'DISTRIBUTED';
  basedOnRemainingCapital: boolean;
}

// Home insurance form data
interface HomeInsuranceFormData {
  propertyType: string;
  constructionYear?: number;
  squareMeters?: number;
  deductible: number;
  coveragePercentage: number;
}

// Life insurance result
interface LifeInsuranceResult {
  clientId: string;
  clientName: string;
  monthlyPremium: number;
  totalPremium: number;
  coverageAmount: number;
  amortizationTable: {
    month: number;
    year: number;
    premium: number;
    cumulativePremium: number;
    coverage: number;
  }[];
}

// Home insurance result
interface HomeInsuranceResult {
  clientId: string;
  clientName: string;
  monthlyPremium: number;
  yearlyPremium: number;
  coverageAmount: number;
  deductible: number;
}

interface InsuranceResults {
  lifeInsuranceResults: LifeInsuranceResult[];
  homeInsuranceResults: HomeInsuranceResult[];
  totalMonthlyPremium: number;
}

export default function InsurancePage() {
  const { user, status, requireAuth } = useAuth();
  const router = useRouter();
  const params = useParams();
  const caseId = params.id as string;
  
  // State
  const [clients, setClients] = useState<Client[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [existingInsurances, setExistingInsurances] = useState<Insurance[]>([]);
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  const [selectedLoan, setSelectedLoan] = useState<string>("");
  const [calculateLife, setCalculateLife] = useState(true);
  const [calculateHome, setCalculateHome] = useState(true);
  const [lifeFormData, setLifeFormData] = useState<LifeInsuranceFormData>({
    coveragePercentage: 1.0,
    paymentType: 'DISTRIBUTED',
    basedOnRemainingCapital: true
  });
  const [homeFormData, setHomeFormData] = useState<HomeInsuranceFormData>({
    propertyType: 'DETACHED_HOUSE',
    constructionYear: new Date().getFullYear() - 10,
    squareMeters: 120,
    deductible: 500,
    coveragePercentage: 1.0
  });
  const [results, setResults] = useState<InsuranceResults | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch data on mount
  useEffect(() => {
    requireAuth();
    
    const fetchData = async () => {
      if (status !== 'authenticated') return;
      
      try {
        // Fetch case data
        const response = await fetch(`/api/cases/${caseId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch case data');
        }
        
        const data = await response.json();
        
        // Set clients and loans
        setClients(data.case.clients);
        setLoans(data.case.loanSimulations);
        
        // Pre-select the first client and loan if available
        if (data.case.clients.length > 0) {
          setSelectedClients([data.case.clients[0].id]);
        }
        
        if (data.case.loanSimulations.length > 0) {
          setSelectedLoan(data.case.loanSimulations[0].id);
        }
        
        // Fetch existing insurances
        const insuranceResponse = await fetch(`/api/insurance?caseId=${caseId}`);
        
        if (insuranceResponse.ok) {
          const insuranceData = await insuranceResponse.json();
          setExistingInsurances(insuranceData.insurances);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error instanceof Error ? error.message : 'An unexpected error occurred');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [caseId, status, requireAuth]);
  
  // Handle client selection
  const handleClientSelection = (clientId: string) => {
    setSelectedClients(prev => {
      if (prev.includes(clientId)) {
        return prev.filter(id => id !== clientId);
      } else {
        return [...prev, clientId];
      }
    });
  };
  
  // Handle loan selection
  const handleLoanSelection = (loanId: string) => {
    setSelectedLoan(loanId);
  };
  
  // Handle life insurance form changes
  const handleLifeFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    setLifeFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' 
        ? (e.target as HTMLInputElement).checked 
        : (type === 'number' ? parseFloat(value) : value)
    }));
  };
  
  // Handle home insurance form changes
  const handleHomeFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    setHomeFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) : value
    }));
  };
  
  // Handle calculation
  const handleCalculate = async () => {
    if (!selectedLoan || selectedClients.length === 0) {
      setError('Please select at least one client and a loan');
      return;
    }
    
    setIsCalculating(true);
    setError(null);
    
    try {
      const response = await fetch('/api/insurance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          caseId,
          clientIds: selectedClients,
          loanId: selectedLoan,
          lifeInsurance: calculateLife ? lifeFormData : null,
          homeInsurance: calculateHome ? homeFormData : null,
          storeResult: false // Don't store yet, just calculate
        }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to calculate insurance');
      }
      
      const data = await response.json();
      setResults(data.results);
    } catch (error) {
      console.error('Error calculating insurance:', error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setIsCalculating(false);
    }
  };
  
  // Handle save
  const handleSave = async () => {
    if (!results) return;
    
    setIsCalculating(true);
    setError(null);
    
    try {
      const response = await fetch('/api/insurance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          caseId,
          clientIds: selectedClients,
          loanId: selectedLoan,
          lifeInsurance: calculateLife ? lifeFormData : null,
          homeInsurance: calculateHome ? homeFormData : null,
          storeResult: true // Store the results
        }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to save insurance');
      }
      
      // Reload page to show updated insurances
      router.refresh();
      
      // Show success message
      alert('Insurance saved successfully');
    } catch (error) {
      console.error('Error saving insurance:', error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setIsCalculating(false);
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
  
  // Show error state
  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-red-100 p-4 rounded-md">
          <p className="text-red-700">{error}</p>
          <button
            onClick={() => router.push(`/cases/${caseId}`)}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Back to Case
          </button>
        </div>
      </div>
    );
  }
  
  // Check if we have clients and loans
  if (clients.length === 0 || loans.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white p-4 rounded-md shadow">
          <p className="text-gray-700">
            {clients.length === 0 ? 'No clients found' : 'No loans found'} for this case.
          </p>
          <p className="mt-2 text-gray-700">
            You need to add {clients.length === 0 ? 'clients' : 'loans'} before you can calculate insurance.
          </p>
          <button
            onClick={() => router.push(`/cases/${caseId}`)}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Back to Case
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
          <h1 className="text-3xl font-bold text-gray-900">Insurance Calculator</h1>
        </div>
      </div>
      
      {/* Configuration Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Client Selection */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Clients</h3>
            <p className="mt-1 text-sm text-gray-600">
              Select clients to insure
            </p>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
            <dl className="sm:divide-y sm:divide-gray-200">
              {clients.map(client => (
                <div key={client.id} className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id={`client-${client.id}`}
                        checked={selectedClients.includes(client.id)}
                        onChange={() => handleClientSelection(client.id)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor={`client-${client.id}`} className="ml-2">
                        {client.name}
                      </label>
                    </div>
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                      {client.type}
                    </span>
                    {client.type === 'INDIVIDUAL' && (
                      <span className="ml-2 text-xs text-gray-500">
                        {client.age !== null ? `${client.age} years old` : ''}
                        {client.smoker ? ', Smoker' : ''}
                      </span>
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
        
        {/* Loan Selection */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Loan</h3>
            <p className="mt-1 text-sm text-gray-600">
              Select the loan to insure
            </p>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
            <div className="sm:divide-y sm:divide-gray-200">
              {loans.map(loan => (
                <div key={loan.id} className="py-4 sm:py-5 sm:px-6">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id={`loan-${loan.id}`}
                      name="loan"
                      value={loan.id}
                      checked={selectedLoan === loan.id}
                      onChange={() => handleLoanSelection(loan.id)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <label htmlFor={`loan-${loan.id}`} className="ml-2 block">
                      <span className="text-sm font-medium text-gray-900">{loan.name}</span>
                      <span className="block text-sm text-gray-500">
                        €{loan.principal.toLocaleString()} at {loan.interestRate}% for {loan.termYears} years
                      </span>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Insurance Types */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Insurance Types</h3>
            <p className="mt-1 text-sm text-gray-600">
              Select the types of insurance to calculate
            </p>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="calculate-life"
                    name="calculate-life"
                    type="checkbox"
                    checked={calculateLife}
                    onChange={() => setCalculateLife(!calculateLife)}
                    className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="calculate-life" className="font-medium text-gray-700">Life Insurance</label>
                  <p className="text-gray-500">Covers the loan in case of death or permanent disability</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="calculate-home"
                    name="calculate-home"
                    type="checkbox"
                    checked={calculateHome}
                    onChange={() => setCalculateHome(!calculateHome)}
                    className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="calculate-home" className="font-medium text-gray-700">Home Insurance</label>
                  <p className="text-gray-500">Covers property damage and liability</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Insurance Parameters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Life Insurance Parameters */}
        {calculateLife && (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Life Insurance Parameters</h3>
              <p className="mt-1 text-sm text-gray-600">
                Configure life insurance options
              </p>
            </div>
            <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
              <div className="space-y-6">
                {/* Coverage Percentage */}
                <div>
                  <label htmlFor="coveragePercentage" className="block text-sm font-medium text-gray-700">
                    Coverage Percentage
                  </label>
                  <select
                    id="coveragePercentage"
                    name="coveragePercentage"
                    value={lifeFormData.coveragePercentage}
                    onChange={handleLifeFormChange}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  >
                    <option value={0.5}>50%</option>
                    <option value={0.75}>75%</option>
                    <option value={1.0}>100%</option>
                    <option value={1.25}>125%</option>
                    <option value={1.5}>150%</option>
                  </select>
                  <p className="mt-1 text-xs text-gray-500">
                    Percentage of the loan that will be covered
                  </p>
                </div>
                
                {/* Payment Type */}
                <div>
                  <label htmlFor="paymentType" className="block text-sm font-medium text-gray-700">
                    Payment Type
                  </label>
                  <select
                    id="paymentType"
                    name="paymentType"
                    value={lifeFormData.paymentType}
                    onChange={handleLifeFormChange}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  >
                    <option value="DISTRIBUTED">Distributed (Monthly Payments)</option>
                    <option value="LUMP_SUM">Lump Sum (Single Payment)</option>
                  </select>
                  <p className="mt-1 text-xs text-gray-500">
                    How the insurance premium will be paid
                  </p>
                </div>
                
                {/* Based on Remaining Capital */}
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="basedOnRemainingCapital"
                      name="basedOnRemainingCapital"
                      type="checkbox"
                      checked={lifeFormData.basedOnRemainingCapital}
                      onChange={handleLifeFormChange}
                      className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="basedOnRemainingCapital" className="font-medium text-gray-700">
                      Based on Remaining Capital
                    </label>
                    <p className="text-gray-500">
                      Coverage amount decreases as the loan is paid off
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Home Insurance Parameters */}
        {calculateHome && (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Home Insurance Parameters</h3>
              <p className="mt-1 text-sm text-gray-600">
                Configure home insurance options
              </p>
            </div>
            <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
              <div className="space-y-6">
                {/* Property Type */}
                <div>
                  <label htmlFor="propertyType" className="block text-sm font-medium text-gray-700">
                    Property Type
                  </label>
                  <select
                    id="propertyType"
                    name="propertyType"
                    value={homeFormData.propertyType}
                    onChange={handleHomeFormChange}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  >
                    <option value="APARTMENT">Apartment</option>
                    <option value="DETACHED_HOUSE">Detached House</option>
                    <option value="SEMI_DETACHED_HOUSE">Semi-Detached House</option>
                    <option value="TERRACED_HOUSE">Terraced House</option>
                    <option value="BUNGALOW">Bungalow</option>
                    <option value="MANSION">Mansion</option>
                    <option value="COTTAGE">Cottage</option>
                    <option value="FARMHOUSE">Farmhouse</option>
                    <option value="CONDO">Condominium</option>
                    <option value="LOFT">Loft</option>
                    <option value="STUDIO">Studio</option>
                  </select>
                </div>
                
                {/* Construction Year */}
                <div>
                  <label htmlFor="constructionYear" className="block text-sm font-medium text-gray-700">
                    Construction Year
                  </label>
                  <input
                    type="number"
                    name="constructionYear"
                    id="constructionYear"
                    value={homeFormData.constructionYear}
                    onChange={handleHomeFormChange}
                    className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
                
                {/* Square Meters */}
                <div>
                  <label htmlFor="squareMeters" className="block text-sm font-medium text-gray-700">
                    Square Meters
                  </label>
                  <input
                    type="number"
                    name="squareMeters"
                    id="squareMeters"
                    value={homeFormData.squareMeters}
                    onChange={handleHomeFormChange}
                    className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
                
                {/* Deductible */}
                <div>
                  <label htmlFor="deductible" className="block text-sm font-medium text-gray-700">
                    Deductible (€)
                  </label>
                  <select
                    id="deductible"
                    name="deductible"
                    value={homeFormData.deductible}
                    onChange={handleHomeFormChange}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  >
                    <option value={250}>€250</option>
                    <option value={500}>€500</option>
                    <option value={1000}>€1,000</option>
                    <option value={2500}>€2,500</option>
                  </select>
                  <p className="mt-1 text-xs text-gray-500">
                    Amount you pay before insurance coverage begins
                  </p>
                </div>
                
                {/* Coverage Percentage */}
                <div>
                  <label htmlFor="homeCoveragePercentage" className="block text-sm font-medium text-gray-700">
                    Coverage Percentage
                  </label>
                  <select
                    id="homeCoveragePercentage"
                    name="coveragePercentage"
                    value={homeFormData.coveragePercentage}
                    onChange={handleHomeFormChange}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  >
                    <option value={0.8}>80%</option>
                    <option value={1.0}>100%</option>
                    <option value={1.2}>120%</option>
                  </select>
                  <p className="mt-1 text-xs text-gray-500">
                    Percentage of the property value that will be covered
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Calculate Button */}
      <div className="flex justify-center mb-6">
        <button
          onClick={handleCalculate}
          disabled={isCalculating || selectedClients.length === 0 || !selectedLoan}
          className="px-6 py-3 bg-blue-600 text-white rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 text-lg"
        >
          {isCalculating ? 'Calculating...' : 'Calculate Insurance'}
        </button>
      </div>
      
      {/* Results Section */}
      {results && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Results</h2>
          
          {/* Summary Card */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Insurance Summary</h3>
              <p className="mt-1 text-sm text-gray-600">
                Total monthly cost: {new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(results.totalMonthlyPremium)}
              </p>
            </div>
            <div className="border-t border-gray-200">
              <dl>
                {results.lifeInsuranceResults.length > 0 && (
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Life Insurance</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {results.lifeInsuranceResults.map((result, index) => (
                        <div key={index} className="mb-2">
                          <p>
                            <span className="font-medium">{result.clientName}:</span> {' '}
                            {new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(result.monthlyPremium)} / month
                          </p>
                          <p className="text-xs text-gray-500">
                            Coverage amount: {new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(result.coverageAmount)}
                          </p>
                        </div>
                      ))}
                    </dd>
                  </div>
                )}
                
                {results.homeInsuranceResults.length > 0 && (
                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Home Insurance</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {results.homeInsuranceResults.map((result, index) => (
                        <div key={index} className="mb-2">
                          <p>
                            <span className="font-medium">{result.clientName}:</span> {' '}
                            {new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(result.monthlyPremium)} / month
                          </p>
                          <p className="text-xs text-gray-500">
                            Coverage amount: {new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(result.coverageAmount)}
                          </p>
                          <p className="text-xs text-gray-500">
                            Deductible: {new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(result.deductible)}
                          </p>
                        </div>
                      ))}
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          </div>
          
          {/* Life Insurance Details */}
          {results.lifeInsuranceResults.length > 0 && (
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Life Insurance Details</h3>
                <p className="mt-1 text-sm text-gray-600">
                  Detailed premium and coverage information
                </p>
              </div>
              <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                {results.lifeInsuranceResults.map((result, index) => (
                  <div key={index} className={index > 0 ? 'mt-8 pt-8 border-t border-gray-200' : ''}>
                    <h4 className="text-md font-medium text-gray-900">{result.clientName}</h4>
                    <dl className="mt-2 grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">Monthly Premium</dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          {new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(result.monthlyPremium)}
                        </dd>
                      </div>
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">Total Premium</dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          {new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(result.totalPremium)}
                        </dd>
                      </div>
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">Coverage Amount</dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          {new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(result.coverageAmount)}
                        </dd>
                      </div>
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">Payment Type</dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          {lifeFormData.paymentType === 'DISTRIBUTED' ? 'Monthly Payments' : 'Lump Sum'}
                        </dd>
                      </div>
                      
                      {/* Display first few and last few entries from amortization table */}
                      <div className="sm:col-span-2">
                        <dt className="text-sm font-medium text-gray-500">Coverage Schedule</dt>
                        <dd className="mt-1 overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Year
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Month
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Premium
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Coverage
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {/* Display first 3 entries */}
                              {result.amortizationTable.slice(0, 3).map((entry, i) => (
                                <tr key={`start-${i}`}>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{entry.year}</td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{entry.month}</td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(entry.premium)}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(entry.coverage)}
                                  </td>
                                </tr>
                              ))}
                              
                              {/* Show ellipsis if there are more than 6 entries */}
                              {result.amortizationTable.length > 6 && (
                                <tr>
                                  <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">...</td>
                                </tr>
                              )}
                              
                              {/* Display last 3 entries if there are more than 3 entries */}
                              {result.amortizationTable.length > 3 && 
                                result.amortizationTable.slice(-3).map((entry, i) => (
                                  <tr key={`end-${i}`}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{entry.year}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{entry.month}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                      {new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(entry.premium)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                      {new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(entry.coverage)}
                                    </td>
                                  </tr>
                                ))
                              }
                            </tbody>
                          </table>
                        </dd>
                      </div>
                    </dl>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Home Insurance Details */}
          {results.homeInsuranceResults.length > 0 && (
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Home Insurance Details</h3>
                <p className="mt-1 text-sm text-gray-600">
                  Detailed premium and coverage information
                </p>
              </div>
              <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                {results.homeInsuranceResults.map((result, index) => (
                  <div key={index} className={index > 0 ? 'mt-8 pt-8 border-t border-gray-200' : ''}>
                    <h4 className="text-md font-medium text-gray-900">{result.clientName}</h4>
                    <dl className="mt-2 grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">Monthly Premium</dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          {new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(result.monthlyPremium)}
                        </dd>
                      </div>
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">Yearly Premium</dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          {new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(result.yearlyPremium)}
                        </dd>
                      </div>
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">Coverage Amount</dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          {new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(result.coverageAmount)}
                        </dd>
                      </div>
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">Deductible</dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          {new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(result.deductible)}
                        </dd>
                      </div>
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">Property Type</dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          {homeFormData.propertyType.replace(/_/g, ' ')}
                        </dd>
                      </div>
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">Construction Year</dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          {homeFormData.constructionYear}
                        </dd>
                      </div>
                    </dl>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Save Button */}
          <div className="flex justify-center">
            <button
              onClick={handleSave}
              disabled={isCalculating}
              className="px-6 py-3 bg-green-600 text-white rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 text-lg"
            >
              {isCalculating ? 'Saving...' : 'Save Insurance'}
            </button>
          </div>
        </div>
      )}
      
      {/* Existing Insurances */}
      {existingInsurances.length > 0 && !results && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Current Insurances</h2>
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Existing Insurances</h3>
              <p className="mt-1 text-sm text-gray-600">
                Insurance policies for clients in this case
              </p>
            </div>
            <div className="border-t border-gray-200">
              <ul className="divide-y divide-gray-200">
                {existingInsurances.map((insurance) => (
                  <li key={insurance.id} className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-blue-600">
                          {insurance.type === 'LIFE' ? 'Life Insurance' : 'Home Insurance'} - {insurance.clientName}
                        </p>
                        <p className="text-xs text-gray-500">
                          Coverage: {(insurance.coveragePercentage * 100).toFixed(0)}%
                        </p>
                      </div>
                      <div className="text-sm text-gray-900">
                        {new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(insurance.initialPremium)} / month
                      </div>
                    </div>
                    
                    {insurance.type === 'LIFE' && insurance.lifeInsurance && (
                      <div className="mt-2 text-xs text-gray-500">
                        <p>
                          Payment Type: {insurance.lifeInsurance.paymentType === 'DISTRIBUTED' ? 'Monthly Payments' : 'Lump Sum'}
                        </p>
                        <p>
                          Based on Remaining Capital: {insurance.lifeInsurance.basedOnRemainingCapital ? 'Yes' : 'No'}
                        </p>
                      </div>
                    )}
                    
                    {insurance.type === 'HOME' && insurance.homeInsurance && (
                      <div className="mt-2 text-xs text-gray-500">
                        <p>
                          Property Type: {insurance.homeInsurance.propertyType.replace(/_/g, ' ')}
                        </p>
                        <p>
                          Property Value: {new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(insurance.homeInsurance.propertyValue)}
                        </p>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
