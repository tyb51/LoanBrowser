"use client";

import React, { useState, useEffect } from 'react';
import { InsuranceType, LifeInsuranceParameters, HomeInsuranceParameters } from '@/app/services/insuranceSimulationApi';

interface InsuranceSimulationFormProps {
  type: InsuranceType;
  defaultValues?: {
    name?: string;
    parameters?: LifeInsuranceParameters | HomeInsuranceParameters;
  };
  onSubmit: (data: { 
    name: string; 
    parameters: LifeInsuranceParameters | HomeInsuranceParameters;
    calculateResult?: boolean;
  }) => void;
  isLoading?: boolean;
}

export function InsuranceSimulationForm({
  type,
  defaultValues = {},
  onSubmit,
  isLoading = false
}: InsuranceSimulationFormProps) {
  // Common form state
  const [name, setName] = useState(defaultValues.name || '');
  const [calculateResult, setCalculateResult] = useState(true);
  
  // Life insurance form state
  const [coveragePercentage, setCoveragePercentage] = useState<number>(
    (defaultValues.parameters as LifeInsuranceParameters)?.coveragePercentage * 100 || 100
  );
  const [paymentType, setPaymentType] = useState<'LUMP_SUM' | 'DISTRIBUTED'>(
    (defaultValues.parameters as LifeInsuranceParameters)?.paymentType || 'DISTRIBUTED'
  );
  const [basedOnRemainingCapital, setBasedOnRemainingCapital] = useState<boolean>(
    (defaultValues.parameters as LifeInsuranceParameters)?.basedOnRemainingCapital ?? true
  );
  const [loanAmount, setLoanAmount] = useState<number>(
    (defaultValues.parameters as LifeInsuranceParameters)?.loanAmount || 0
  );
  const [termYears, setTermYears] = useState<number>(
    (defaultValues.parameters as LifeInsuranceParameters)?.termYears || 30
  );
  
  // Home insurance form state
  const [propertyValue, setPropertyValue] = useState<number>(
    (defaultValues.parameters as HomeInsuranceParameters)?.propertyValue || 0
  );
  const [propertyType, setPropertyType] = useState<string>(
    (defaultValues.parameters as HomeInsuranceParameters)?.propertyType || 'APARTMENT'
  );
  const [constructionYear, setConstructionYear] = useState<number | undefined>(
    (defaultValues.parameters as HomeInsuranceParameters)?.constructionYear || 2000
  );
  const [squareMeters, setSquareMeters] = useState<number | undefined>(
    (defaultValues.parameters as HomeInsuranceParameters)?.squareMeters || 100
  );
  const [deductible, setDeductible] = useState<number | undefined>(
    (defaultValues.parameters as HomeInsuranceParameters)?.deductible || 500
  );
  const [homeCoveragePercentage, setHomeCoveragePercentage] = useState<number>(
    (defaultValues.parameters as HomeInsuranceParameters)?.coveragePercentage * 100 || 100
  );
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (name.trim() === '') {
      alert('Please enter a name for the insurance simulation');
      return;
    }
    
    if (type === 'LIFE') {
      onSubmit({
        name,
        parameters: {
          coveragePercentage: coveragePercentage / 100,
          paymentType,
          basedOnRemainingCapital,
          loanAmount,
          termYears
        } as LifeInsuranceParameters,
        calculateResult
      });
    } else if (type === 'HOME') {
      onSubmit({
        name,
        parameters: {
          propertyValue,
          propertyType,
          constructionYear,
          squareMeters,
          deductible,
          coveragePercentage: homeCoveragePercentage / 100
        } as HomeInsuranceParameters,
        calculateResult
      });
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white px-4 py-5 shadow sm:rounded-lg sm:p-6">
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-1">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              {type === 'LIFE' ? 'Life Insurance Simulation' : 'Home Insurance Simulation'}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {type === 'LIFE' 
                ? 'Configure life insurance parameters based on loan details.'
                : 'Configure home insurance parameters based on property details.'}
            </p>
          </div>
          
          <div className="mt-5 space-y-6 md:col-span-2 md:mt-0">
            {/* Common Fields */}
            <div>
              <label htmlFor="insurance-name" className="block text-sm font-medium text-gray-700">
                Simulation Name
              </label>
              <input
                type="text"
                id="insurance-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="Enter a name for this simulation"
                required
              />
            </div>
            
            {/* Type-specific Fields */}
            {type === 'LIFE' && (
              <>
                <div>
                  <label htmlFor="loan-amount" className="block text-sm font-medium text-gray-700">
                    Loan Amount
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">€</span>
                    </div>
                    <input
                      type="number"
                      id="loan-amount"
                      value={loanAmount}
                      onChange={(e) => setLoanAmount(Number(e.target.value))}
                      className="mt-1 block w-full pl-7 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      min="0"
                      step="1000"
                      required
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    The loan amount that will be used for insurance calculations
                  </p>
                </div>
                
                <div>
                  <label htmlFor="term-years" className="block text-sm font-medium text-gray-700">
                    Term (Years)
                  </label>
                  <input
                    type="number"
                    id="term-years"
                    value={termYears}
                    onChange={(e) => setTermYears(Number(e.target.value))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    min="1"
                    max="50"
                    required
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    The loan term in years
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Coverage Percentage
                  </label>
                  <div className="flex items-center">
                    <input
                      type="range"
                      min="10"
                      max="200"
                      step="5"
                      value={coveragePercentage}
                      onChange={(e) => setCoveragePercentage(parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <span className="ml-2 w-16 text-sm text-gray-700">{coveragePercentage}%</span>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Percentage of the loan amount to insure (€{Math.round(loanAmount * coveragePercentage / 100)})
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Payment Type
                  </label>
                  <select
                    value={paymentType}
                    onChange={(e) => setPaymentType(e.target.value as 'LUMP_SUM' | 'DISTRIBUTED')}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  >
                    <option value="DISTRIBUTED">Monthly Payments</option>
                    <option value="LUMP_SUM">Lump Sum Payment</option>
                  </select>
                  <p className="mt-1 text-xs text-gray-500">
                    How the insurance premium will be paid
                  </p>
                </div>
                
                <div className="mt-4">
                  <div className="flex items-center">
                    <input
                      id="remaining-capital"
                      type="checkbox"
                      checked={basedOnRemainingCapital}
                      onChange={(e) => setBasedOnRemainingCapital(e.target.checked)}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="remaining-capital" className="ml-2 text-sm text-gray-700">
                      Base coverage on remaining capital
                    </label>
                  </div>
                  <p className="mt-1 text-xs text-gray-500 pl-6">
                    If checked, insurance coverage will decrease as the loan is paid off. This typically results in lower premiums.
                  </p>
                </div>
              </>
            )}
            
            {type === 'HOME' && (
              <>
                <div>
                  <label htmlFor="property-value" className="block text-sm font-medium text-gray-700">
                    Property Value
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">€</span>
                    </div>
                    <input
                      type="number"
                      id="property-value"
                      value={propertyValue}
                      onChange={(e) => setPropertyValue(Number(e.target.value))}
                      className="mt-1 block w-full pl-7 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      min="0"
                      step="1000"
                      required
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    The value of the property to be insured
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Property Type
                  </label>
                  <select
                    value={propertyType}
                    onChange={(e) => setPropertyType(e.target.value)}
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
                  <p className="mt-1 text-xs text-gray-500">
                    The type of property affects insurance premiums
                  </p>
                </div>
                
                <div>
                  <label htmlFor="construction-year" className="block text-sm font-medium text-gray-700">
                    Construction Year
                  </label>
                  <input
                    type="number"
                    id="construction-year"
                    value={constructionYear}
                    onChange={(e) => setConstructionYear(e.target.value ? Number(e.target.value) : undefined)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    min="1800"
                    max={new Date().getFullYear()}
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    The year the property was built (optional)
                  </p>
                </div>
                
                <div>
                  <label htmlFor="square-meters" className="block text-sm font-medium text-gray-700">
                    Size (m²)
                  </label>
                  <input
                    type="number"
                    id="square-meters"
                    value={squareMeters}
                    onChange={(e) => setSquareMeters(e.target.value ? Number(e.target.value) : undefined)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    min="10"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    The size of the property in square meters (optional)
                  </p>
                </div>
                
                <div>
                  <label htmlFor="deductible" className="block text-sm font-medium text-gray-700">
                    Deductible
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">€</span>
                    </div>
                    <input
                      type="number"
                      id="deductible"
                      value={deductible}
                      onChange={(e) => setDeductible(e.target.value ? Number(e.target.value) : undefined)}
                      className="mt-1 block w-full pl-7 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      min="0"
                      step="100"
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    The amount you will pay before insurance coverage kicks in (optional)
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Coverage Percentage
                  </label>
                  <div className="flex items-center">
                    <input
                      type="range"
                      min="10"
                      max="200"
                      step="5"
                      value={homeCoveragePercentage}
                      onChange={(e) => setHomeCoveragePercentage(parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <span className="ml-2 w-16 text-sm text-gray-700">{homeCoveragePercentage}%</span>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Percentage of the property value to insure (€{Math.round(propertyValue * homeCoveragePercentage / 100)})
                  </p>
                </div>
              </>
            )}
            
            <div className="flex items-center">
              <input
                id="calculate-result"
                type="checkbox"
                checked={calculateResult}
                onChange={(e) => setCalculateResult(e.target.checked)}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="calculate-result" className="ml-2 text-sm text-gray-700">
                Calculate insurance premiums
              </label>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isLoading}
          className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {isLoading ? 'Saving...' : 'Save'}
        </button>
      </div>
    </form>
  );
}
