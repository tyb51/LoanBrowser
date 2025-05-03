"use client";

import { 
  LoanParameters, 
  ModularLoanSchedule, 
  LoanCalculationResult,
  InvestmentParameters,
  ComparisonResult,
  ComparisonRequest,
} from '@/app/types/loan';

const API_BASE_URL = 'http://localhost:8000/api';

/**
 * Calculate a loan using the Python backend API
 * @param params Loan parameters
 * @param modularSchedule Optional modular schedule for bullet/modular loans
 * @returns Loan calculation result
 */
export async function calculateLoan(
  params: LoanParameters, 
  modularSchedule?: ModularLoanSchedule
): Promise<LoanCalculationResult> {
  try {
    // Send params directly without wrapping
    const requestData: any = { };
    requestData.params = params;
    // Add modular schedule if provided (directly in the payload)
    if (modularSchedule) {
      requestData.modularSchedule = modularSchedule;
    }
    console.log('Request data:', requestData);

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
    // Prepare request data using the interface
    const request: ComparisonRequest = {
      referenceLoan,
      alternativeLoan,
      referenceOwnContribution,
      alternativeOwnContribution,
      investmentParams,
      modularSchedule,
    };
    // The backend expects the request body to match the ComparisonRequest model directly,
    // so do NOT wrap it in an extra {request: ...} object.
    console.log('Request data:', request);

    // Make API request
    const response = await fetch(`${API_BASE_URL}/compare-loans`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
      // Use 'cors' to allow reading the response and proper CORS handling
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
