// API service functions for insurance simulations

import { toast } from 'react-hot-toast';

// Types for insurance simulations
export type InsuranceType = 'LIFE' | 'HOME';

export interface LifeInsuranceParameters {
  coveragePercentage: number;
  paymentType: 'LUMP_SUM' | 'DISTRIBUTED';
  basedOnRemainingCapital: boolean;
  // loanAmount and termYears are no longer required as parameters
  // as they will be derived from the selected loan
}

export interface HomeInsuranceParameters {
  propertyValue: number;
  propertyType: string;
  constructionYear?: number;
  squareMeters?: number;
  deductible?: number;
  coveragePercentage: number;
  clientShares?: Record<string, number>; // New: percentage share for each client
}

export type InsuranceParameters = LifeInsuranceParameters | HomeInsuranceParameters;

// Amortization table entry for insurance
export interface InsuranceAmortizationEntry {
  month: number;
  year: number;
  premium: number;
  cumulativePremium: number;
  coverage: number;
}

// Insurance calculation result
export interface InsuranceCalculationResult {
  monthlyPremium: number;
  totalPremium: number;
  coverageAmount: number;
  amortizationTable: InsuranceAmortizationEntry[];
}

export interface InsuranceSimulation {
  id: string;
  name: string;
  type: InsuranceType;
  parameters: InsuranceParameters;
  calculationResult?: InsuranceCalculationResult;
  clientId?: string;
  homeInsuranceClients?: {
    clientId: string;
    sharePercentage: number;
    client: {
      name: string;
      type: string;
    }
  }[];
  caseId: string;
  simulatedInterestRate?: number;
  createdAt: string;
  updatedAt: string;
  client?: {
    name: string;
    type: string;
  };
  // If this is a life insurance and a loan is selected for viewing
  currentLoan?: {
    id: string;
    name: string;
    principal: number;
    termYears: number;
  };
}

export interface CreateInsuranceSimulationParams {
  name: string;
  type: InsuranceType;
  parameters: InsuranceParameters;
  clientIds: string[];
  caseId: string;
  selectedLoanId?: string; // For life insurance
  simulatedInterestRate?: number; // For home insurance
  calculateResult?: boolean;
}

export interface UpdateInsuranceSimulationParams {
  name?: string;
  parameters?: InsuranceParameters;
  clientIds?: string[];
  selectedLoanId?: string; // For life insurance
  simulatedInterestRate?: number; // For home insurance
  calculateResult?: boolean;
}

// Get all insurance simulations for a case
export async function getInsuranceSimulations(caseId: string): Promise<InsuranceSimulation[]> {
  try {
    const response = await fetch(`/api/insurance-simulations?caseId=${caseId}`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get insurance simulations');
    }
    
    const data = await response.json();
    return data.insuranceSimulations;
  } catch (error) {
    console.error('Error getting insurance simulations:', error);
    toast.error('Failed to get insurance simulations');
    return [];
  }
}

// Get a specific insurance simulation
export async function getInsuranceSimulation(simId: string, loanId?: string): Promise<InsuranceSimulation | null> {
  try {
    let url = `/api/insurance-simulations/${simId}`;
    if (loanId) {
      url += `?loanId=${loanId}`;
    }
    
    const response = await fetch(url);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get insurance simulation');
    }
    
    const data = await response.json();
    return data.insuranceSimulation;
  } catch (error) {
    console.error('Error getting insurance simulation:', error);
    toast.error('Failed to get insurance simulation');
    return null;
  }
}

// Create a new insurance simulation
export async function createInsuranceSimulation(
  params: CreateInsuranceSimulationParams
): Promise<InsuranceSimulation | null> {
  try {
    const response = await fetch('/api/insurance-simulations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create insurance simulation');
    }
    
    const data = await response.json();
    toast.success('Insurance simulation created successfully');
    return data.insuranceSimulation;
  } catch (error) {
    console.error('Error creating insurance simulation:', error);
    toast.error('Failed to create insurance simulation');
    return null;
  }
}

// Update an insurance simulation
export async function updateInsuranceSimulation(
  simId: string,
  params: UpdateInsuranceSimulationParams
): Promise<InsuranceSimulation | null> {
  try {
    const response = await fetch(`/api/insurance-simulations/${simId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update insurance simulation');
    }
    
    const data = await response.json();
    toast.success('Insurance simulation updated successfully');
    return data.insuranceSimulation;
  } catch (error) {
    console.error('Error updating insurance simulation:', error);
    toast.error('Failed to update insurance simulation');
    return null;
  }
}

// Delete an insurance simulation
export async function deleteInsuranceSimulation(simId: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/insurance-simulations/${simId}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete insurance simulation');
    }
    
    toast.success('Insurance simulation deleted successfully');
    return true;
  } catch (error) {
    console.error('Error deleting insurance simulation:', error);
    toast.error('Failed to delete insurance simulation');
    return false;
  }
}

// Calculate insurance for a specific loan
export async function calculateInsuranceForLoan(
  simId: string,
  loanId: string
): Promise<InsuranceCalculationResult | null> {
  try {
    const response = await fetch(`/api/insurance-simulations/${simId}/calculate?loanId=${loanId}`, {
      method: 'POST',
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to calculate insurance for loan');
    }
    
    const data = await response.json();
    return data.calculationResult;
  } catch (error) {
    console.error('Error calculating insurance for loan:', error);
    toast.error('Failed to calculate insurance for loan');
    return null;
  }
}