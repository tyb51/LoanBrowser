"use client";

import { 
  LoanParameters, 
  ModularLoanSchedule, 
  LoanCalculationResult,
  InvestmentParameters,
  ComparisonResult,
} from '@/app/types/loan';

// Default API base URL (can be updated dynamically)
let API_BASE_URL = 'http://localhost:8000/api';

/**
 * Update the base URL for the API
 * This allows changing the API URL dynamically from the configuration
 */
export function updateBaseUrl(newBaseUrl: string) {
  // Make sure the URL ends with '/api'
  API_BASE_URL = newBaseUrl.endsWith('/api') ? newBaseUrl : `${newBaseUrl}/api`;
  console.log(`Backend API URL updated to: ${API_BASE_URL}`);
}

/**
 * Calculate a loan using the Python backend API
 * @param params Loan parameters
 * @param modularSchedule Optional modular schedule for bullet/modular loans
 * @param insuranceSimulationIds Optional array of insurance simulation IDs
 * @returns Loan calculation result
 */
export async function calculateLoan(
  params: LoanParameters, 
  modularSchedule?: ModularLoanSchedule,
  insuranceSimulationIds?: string[]
): Promise<LoanCalculationResult> {
  try {
    // Send params directly without wrapping
    const requestData: any = {};
    
    // Add insurance simulation IDs if provided
    if (insuranceSimulationIds && insuranceSimulationIds.length > 0) {
      params = {
        ...params,
        insuranceSimulationIds
      };
    }
    
    requestData.params = params;
    
    // Add modular schedule if provided (directly in the payload)
    if (modularSchedule) {
      requestData.modularSchedule = modularSchedule;
    }
    
    // Make API request
    const response = await fetch(`${API_BASE_URL}/calculate-loan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
      // Add mode: 'cors' explicitly
      mode: 'cors',
      credentials: 'include',
    });
    
    // Handle errors
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to calculate loan');
    }
    
    // Return the data
    return await response.json();
  } catch (error) {
    console.error('Error calculating loan:', error);
    throw error;
  }
}

// Interface for comparison request to ensure correct formatting
interface ComparisonRequest {
  referenceLoan: LoanParameters;
  alternativeLoan: LoanParameters;
  referenceOwnContribution: number;
  alternativeOwnContribution: number;
  investmentParams?: InvestmentParameters;
  modularSchedule?: ModularLoanSchedule;
  refInsuranceSimulationIds?: string[];
  altInsuranceSimulationIds?: string[];
}

/**
 * Compare loans with optional investment simulation
 * @param referenceLoan Reference loan parameters
 * @param alternativeLoan Alternative loan parameters
 * @param referenceOwnContribution Reference loan own contribution
 * @param alternativeOwnContribution Alternative loan own contribution
 * @param investmentParams Optional investment parameters
 * @param modularSchedule Optional modular schedule for alternative loan
 * @param refInsuranceSimulationIds Optional array of insurance simulation IDs for reference loan
 * @param altInsuranceSimulationIds Optional array of insurance simulation IDs for alternative loan
 * @returns Comparison result
 */
export async function compareLoans(
  referenceLoan: LoanParameters,
  alternativeLoan: LoanParameters,
  referenceOwnContribution: number,
  alternativeOwnContribution: number,
  investmentParams?: InvestmentParameters,
  modularSchedule?: ModularLoanSchedule,
  refInsuranceSimulationIds?: string[],
  altInsuranceSimulationIds?: string[]
): Promise<ComparisonResult> {
  try {
    // Prepare request data using the interface
    const requestData: ComparisonRequest = {
      referenceLoan,
      alternativeLoan,
      referenceOwnContribution,
      alternativeOwnContribution,
      investmentParams,
      modularSchedule,
      refInsuranceSimulationIds,
      altInsuranceSimulationIds
    };
    
    // Make API request
    const response = await fetch(`${API_BASE_URL}/compare-loans`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
      // Add mode: 'cors' explicitly
      mode: 'cors',
      credentials: 'include',
    });
    
    // Handle errors
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to compare loans');
    }
    
    // Return the data
    return await response.json();
  } catch (error) {
    console.error('Error comparing loans:', error);
    throw error;
  }
}
