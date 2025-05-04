// Home Insurance Calculation Module
// This module calculates home insurance premiums based on property value and type

import { LoanParameters } from '@/app/types/loan';

// Property types with associated risk factors
const propertyTypeRiskFactors = {
  'APARTMENT': 0.85,
  'DETACHED_HOUSE': 1.1,
  'SEMI_DETACHED_HOUSE': 1.0,
  'TERRACED_HOUSE': 0.95,
  'BUNGALOW': 1.15,
  'MANSION': 1.4,
  'COTTAGE': 1.2,
  'FARMHOUSE': 1.25,
  'CONDO': 0.9,
  'LOFT': 1.0,
  'STUDIO': 0.8
};

interface HomeInsuranceParams {
  propertyValue: number;
  propertyType: string;
  constructionYear?: number;
  squareMeters?: number;
  deductible?: number;
  coveragePercentage: number; // 0-1.0
}

interface HomeInsuranceResult {
  monthlyPremium: number;
  yearlyPremium: number;
  coverageAmount: number;
  deductible: number;
}

// Calculate home insurance premium
export function calculateHomeInsurance(params: HomeInsuranceParams): HomeInsuranceResult {
  const {
    propertyValue,
    propertyType,
    constructionYear = 2000,
    squareMeters = 100,
    deductible = 500,
    coveragePercentage
  } = params;
  
  // Base annual premium rate per 1000 euros of property value
  const basePremiumPer1000 = 0.3;
  
  // Get risk factor based on property type (default to 1.0 if unknown)
  const propertyTypeRiskFactor = propertyTypeRiskFactors[propertyType] || 1.0;
  
  // Construction year factor (newer constructions are less risky)
  const currentYear = new Date().getFullYear();
  const buildingAge = currentYear - constructionYear;
  const constructionYearFactor = buildingAge <= 5 ? 0.85 :
                                 buildingAge <= 15 ? 0.9 :
                                 buildingAge <= 30 ? 1.0 :
                                 buildingAge <= 50 ? 1.15 :
                                 buildingAge <= 75 ? 1.3 : 1.5;
  
  // Size factor (larger properties have higher premiums)
  const sizeFactor = Math.sqrt(squareMeters / 100);
  
  // Deductible factor (higher deductibles mean lower premiums)
  const deductibleFactor = Math.pow(500 / deductible, 0.15);
  
  // Calculate coverage amount
  const coverageAmount = propertyValue * coveragePercentage;
  
  // Combined risk factor
  const combinedRiskFactor = propertyTypeRiskFactor * constructionYearFactor * sizeFactor * deductibleFactor;
  
  // Calculate yearly premium
  const yearlyPremium = (coverageAmount / 1000) * basePremiumPer1000 * combinedRiskFactor;
  
  // Calculate monthly premium
  const monthlyPremium = yearlyPremium / 12;
  
  return {
    monthlyPremium,
    yearlyPremium,
    coverageAmount,
    deductible
  };
}

// Calculate home insurance premium with loan data
export function calculateHomeInsuranceForLoan(
  loan: LoanParameters,
  propertyType: string,
  constructionYear?: number,
  squareMeters?: number,
  deductible: number = 500,
  coveragePercentage: number = 1.0
): HomeInsuranceResult {
  // Use purchase price as property value if available, otherwise use loan amount
  const propertyValue = loan.purchasePrice || loan.principal;
  
  return calculateHomeInsurance({
    propertyValue,
    propertyType,
    constructionYear,
    squareMeters,
    deductible,
    coveragePercentage
  });
}
