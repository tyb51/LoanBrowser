// Life Insurance Calculation Module
// This module calculates life insurance premiums based on client biometrics and loan details

import { LoanParameters } from '@/app/types/loan';

interface BiometricData {
  age: number;
  smoker: boolean;
  height?: number; // in cm
  weight?: number; // in kg
  gender?: 'male' | 'female';
}

interface LifeInsuranceParams {
  client: BiometricData;
  loanAmount: number;
  termYears: number;
  coveragePercentage: number; // 0-1.0
  paymentType: 'LUMP_SUM' | 'DISTRIBUTED';
  basedOnRemainingCapital: boolean;
}

interface LifeInsuranceResult {
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

// Risk factors based on age groups
const ageRiskFactors = {
  // Age: risk factor
  18: 0.5,
  25: 0.6,
  30: 0.7,
  35: 0.85,
  40: 1.0,
  45: 1.2,
  50: 1.5,
  55: 1.9,
  60: 2.5,
  65: 3.2,
  70: 4.0,
  75: 5.0,
  80: 6.5
};

// Calculate BMI and associated risk factor
function calculateBmiRiskFactor(height: number, weight: number): number {
  if (!height || !weight) return 1.0;
  
  // BMI calculation: weight (kg) / (height (m))^2
  const heightInMeters = height / 100;
  const bmi = weight / (heightInMeters * heightInMeters);
  
  // Risk factors based on BMI
  if (bmi < 18.5) return 1.2; // Underweight - slightly higher risk
  if (bmi >= 18.5 && bmi < 25) return 1.0; // Normal weight - baseline
  if (bmi >= 25 && bmi < 30) return 1.1; // Overweight - slightly elevated
  if (bmi >= 30 && bmi < 35) return 1.3; // Obese class I - elevated
  if (bmi >= 35 && bmi < 40) return 1.6; // Obese class II - high
  return 2.0; // Obese class III - very high risk
}

// Get risk factor based on age
function getAgeRiskFactor(age: number): number {
  // Find the closest age bracket
  const ageKeys = Object.keys(ageRiskFactors).map(Number).sort((a, b) => a - b);
  
  // If age is below minimum age, use the lowest age bracket
  if (age < ageKeys[0]) return ageRiskFactors[ageKeys[0]];
  
  // If age is above maximum age, use the highest age bracket
  if (age > ageKeys[ageKeys.length - 1]) return ageRiskFactors[ageKeys[ageKeys.length - 1]];
  
  // Find the closest lower bracket
  let closestLower = ageKeys[0];
  for (const ageKey of ageKeys) {
    if (ageKey <= age) closestLower = ageKey;
  }
  
  // Find the closest higher bracket
  let closestHigher = ageKeys[ageKeys.length - 1];
  for (let i = ageKeys.length - 1; i >= 0; i--) {
    if (ageKeys[i] >= age) closestHigher = ageKeys[i];
  }
  
  // If age matches exactly, return that risk factor
  if (closestLower === age) return ageRiskFactors[age];
  
  // Interpolate between the two nearest brackets
  const lowerRisk = ageRiskFactors[closestLower];
  const higherRisk = ageRiskFactors[closestHigher];
  
  const rangePct = (age - closestLower) / (closestHigher - closestLower);
  return lowerRisk + rangePct * (higherRisk - lowerRisk);
}

// Calculate base premium rate per thousand euros of coverage
function calculateBasePremium(client: BiometricData, termYears: number): number {
  // Base monthly premium rate per 1000 euros of coverage
  const basePremiumPer1000 = 0.15;
  
  // Get risk factor based on age
  const ageRiskFactor = getAgeRiskFactor(client.age);
  
  // Calculate risk factor based on BMI if height and weight are provided
  const bmiRiskFactor = client.height && client.weight 
    ? calculateBmiRiskFactor(client.height, client.weight) 
    : 1.0;
    
  // Smoker risk factor
  const smokerRiskFactor = client.smoker ? 1.7 : 1.0;
  
  // Term length risk factor (longer terms have higher risk)
  const termRiskFactor = 1 + (termYears / 100);
  
  // Gender risk factor (if provided)
  const genderRiskFactor = client.gender === 'male' ? 1.1 : 1.0;
  
  // Combined risk factor
  const combinedRiskFactor = ageRiskFactor * bmiRiskFactor * smokerRiskFactor * termRiskFactor * genderRiskFactor;
  
  // Calculate final premium rate
  return basePremiumPer1000 * combinedRiskFactor;
}

// Calculate life insurance premium
export function calculateLifeInsurance(params: LifeInsuranceParams): LifeInsuranceResult {
  const { 
    client, 
    loanAmount, 
    termYears, 
    coveragePercentage, 
    paymentType, 
    basedOnRemainingCapital 
  } = params;
  
  // Calculate base premium rate per 1000 euros
  const basePremiumRate = calculateBasePremium(client, termYears);
  
  // Total number of months in the term
  const totalMonths = termYears * 12;
  
  // Calculate maximum coverage amount
  const maxCoverageAmount = loanAmount * coveragePercentage;
  
  // Initialize amortization table
  const amortizationTable = [];
  let cumulativePremium = 0;
  let totalPremium = 0;
  
  // Create amortization table based on payment type and coverage options
  for (let month = 1; month <= totalMonths; month++) {
    const year = Math.ceil(month / 12);
    
    // Calculate coverage amount for this month
    let coverage = maxCoverageAmount;
    if (basedOnRemainingCapital) {
      // Linear approximation of remaining capital
      coverage = maxCoverageAmount * (1 - (month - 1) / totalMonths);
    }
    
    // Calculate monthly premium
    let premium = 0;
    if (paymentType === 'DISTRIBUTED') {
      // Distributed payment: pay premium each month
      premium = (coverage / 1000) * basePremiumRate;
    } else {
      // Lump sum: pay fixed premium based on initial coverage
      if (month === 1) {
        // For lump sum, calculate premium for the entire term at once
        // This is a simplification - real calculations would use actuarial tables
        premium = (maxCoverageAmount / 1000) * basePremiumRate * totalMonths;
      }
    }
    
    cumulativePremium += premium;
    totalPremium += premium;
    
    amortizationTable.push({
      month,
      year,
      premium,
      cumulativePremium,
      coverage
    });
  }
  
  // Calculate average monthly premium for reporting
  const monthlyPremium = paymentType === 'DISTRIBUTED' 
    ? totalPremium / totalMonths
    : totalPremium / totalMonths; // Distributing lump sum across months for comparison
    
  return {
    monthlyPremium,
    totalPremium,
    coverageAmount: maxCoverageAmount,
    amortizationTable
  };
}

// Calculate life insurance premium with loan data
export function calculateLifeInsuranceForLoan(
  client: BiometricData,
  loan: LoanParameters,
  coveragePercentage: number,
  paymentType: 'LUMP_SUM' | 'DISTRIBUTED',
  basedOnRemainingCapital: boolean
): LifeInsuranceResult {
  return calculateLifeInsurance({
    client,
    loanAmount: loan.principal,
    termYears: loan.termYears,
    coveragePercentage,
    paymentType,
    basedOnRemainingCapital
  });
}
