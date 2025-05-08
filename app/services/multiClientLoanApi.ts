"use client";

import { 
  LoanParameters, 
  ModularLoanSchedule, 
  LoanCalculationResult
} from '@/app/types/loan';
import { Client, ClientSummary } from '@/app/types/client';

/**
 * Calculate a loan for multiple clients using the backend API
 * @param params Loan parameters
 * @param clientIds Array of client IDs
 * @param clientSummary Summary information for the selected clients
 * @param modularSchedule Optional modular schedule for bullet/modular loans
 * @param insuranceSimulationIds Optional array of insurance simulation IDs
 * @returns Loan calculation result
 */
export async function calculateMultiClientLoan(
  params: LoanParameters,
  clientIds: string[],
  clientSummary: ClientSummary,
  modularSchedule?: ModularLoanSchedule,
  insuranceSimulationIds?: string[]
): Promise<LoanCalculationResult> {
  try {
    // Base URL from apiService
    const baseUrl = typeof window !== 'undefined' 
      ? localStorage.getItem('LoanLogicApiConfig') 
        ? JSON.parse(localStorage.getItem('LoanLogicApiConfig') || '{}').backendUrl
        : 'http://localhost:8000' 
      : 'http://localhost:8000';
    
    const API_URL = `${baseUrl}/api/calculate-multi-client-loan`;

    // Prepare the request data
    const requestData = {
      params,
      clientIds,
      clientSummary,
      modularSchedule,
      insuranceSimulationIds
    };
    
    // Make API request
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
      mode: 'cors',
      credentials: 'include',
    });
    
    // Handle errors
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to calculate multi-client loan');
    }
    
    // Return the data
    return await response.json();
  } catch (error) {
    console.error('Error calculating multi-client loan:', error);
    // Use the fallback implementation here if needed
    throw error;
  }
}

/**
 * Save a loan simulation for multiple clients
 * @param params Loan parameters
 * @param clientIds Array of client IDs
 * @param caseId The case ID
 * @param calculationResult The calculated loan result
 * @param name The name of the loan simulation
 * @returns The saved loan simulation
 */
export async function saveMultiClientLoanSimulation(
  params: LoanParameters,
  clientIds: string[],
  caseId: string,
  calculationResult: LoanCalculationResult,
  name: string
): Promise<any> {
  try {
    // Make API request to save the loan
    const response = await fetch('/api/loans', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        params,
        clientIds,
        caseId,
        calculationResult
      }),
    });
    
    // Handle errors
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to save loan simulation');
    }
    
    // Return the data
    return await response.json();
  } catch (error) {
    console.error('Error saving loan simulation:', error);
    throw error;
  }
}
