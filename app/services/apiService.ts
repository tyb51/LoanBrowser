"use client";

import { 
  LoanParameters, 
  ModularLoanSchedule, 
  LoanCalculationResult,
  InvestmentParameters,
  ComparisonResult,
} from '@/app/types/loan';

// Import both API implementations
import * as mockApi from './loanApi';
import * as backendApi from './backendLoanApi';

// Function to get the API configuration from localStorage
const getApiConfig = () => {
  if (typeof window === 'undefined') {
    return { useBackendApi: true, backendUrl: 'http://localhost:8000' };
  }
  
  try {
    const storedConfig = localStorage.getItem('LoanLogicApiConfig');
    if (storedConfig) {
      return JSON.parse(storedConfig);
    }
  } catch (error) {
    console.error('Error reading API config from localStorage:', error);
  }
  
  // Default configuration
  return { useBackendApi: true, backendUrl: 'http://localhost:8000' };
};

/**
 * Calculate a loan using either the backend API or the mock implementation
 * @param params Loan parameters
 * @param modularSchedule Optional modular schedule for bullet/modular loans
 * @returns Loan calculation result
 */
export async function calculateLoan(
  params: LoanParameters, 
  modularSchedule?: ModularLoanSchedule
): Promise<LoanCalculationResult> {
  try {
    const { useBackendApi } = getApiConfig();
    
    if (useBackendApi) {
      return await backendApi.calculateLoan(params, modularSchedule);
    } else {
      return await mockApi.calculateLoan(params, modularSchedule);
    }
  } catch (error) {
    console.error('Error calculating loan:', error);
    // Fall back to mock API if backend fails
    if (getApiConfig().useBackendApi) {
      console.warn('Falling back to mock API implementation due to backend error');
      return await mockApi.calculateLoan(params, modularSchedule);
    }
    throw error;
  }
}

/**
 * Compare loans with optional investment simulation
 * @param referenceLoan Reference loan parameters
 * @param alternativeLoan Alternative loan parameters
 * @param referenceOwnContribution Reference loan own contribution
 * @param alternativeOwnContribution Alternative loan own contribution
 * @param investmentParams Optional investment parameters
 * @param modularSchedule Optional modular schedule for alternative loan
 * @returns Comparison result
 */
export async function compareLoans(
  referenceLoan: LoanParameters,
  alternativeLoan: LoanParameters,
  referenceOwnContribution: number,
  alternativeOwnContribution: number,
  investmentParams?: InvestmentParameters,
  modularSchedule?: ModularLoanSchedule
): Promise<ComparisonResult> {
  try {
    const { useBackendApi } = getApiConfig();
    
    if (useBackendApi) {
      return await backendApi.compareLoans(
        referenceLoan,
        alternativeLoan,
        referenceOwnContribution,
        alternativeOwnContribution,
        investmentParams,
        modularSchedule
      );
    } else {
      return await mockApi.compareLoans(
        referenceLoan,
        alternativeLoan,
        referenceOwnContribution,
        alternativeOwnContribution,
        investmentParams,
        modularSchedule
      );
    }
  } catch (error) {
    console.error('Error comparing loans:', error);
    // Fall back to mock API if backend fails
    if (getApiConfig().useBackendApi) {
      console.warn('Falling back to mock API implementation due to backend error');
      return await mockApi.compareLoans(
        referenceLoan,
        alternativeLoan,
        referenceOwnContribution,
        alternativeOwnContribution,
        investmentParams,
        modularSchedule
      );
    }
    throw error;
  }
}

/**
 * Update the backendLoanApi base URL from the configuration
 */
export function updateBackendApiUrl() {
  const { backendUrl } = getApiConfig();
  
  // Update the backendLoanApi module if it has an updateBaseUrl function
  if ('updateBaseUrl' in backendApi && typeof backendApi.updateBaseUrl === 'function') {
    backendApi.updateBaseUrl(backendUrl);
  }
}

// Update the backend API URL when this module is imported
updateBackendApiUrl();
