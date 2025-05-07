import { LoanType, LoanDataField, LoanStatisticsField } from './enums';

export * from './enums';

export interface LoanParameters {
  loanType: LoanType;
  principal: number;
  interestRate: number;
  termYears: number;
  ownContribution: number;
  purchasePrice?: number;
  delayMonths?: number;
  startYear?: number;
  insuranceCoveragePct?: number;
}

export interface ModularLoanScheduleItem {
  month: number;
  amount: number;
}

export interface ModularLoanSchedule {
  schedule: ModularLoanScheduleItem[];
}

export interface MonthlyLoanData {
  [LoanDataField.MONTH]: number;
  [LoanDataField.YEAR]: number;
  [LoanDataField.PAYMENT_EXCLUDING_INSURANCE]: number;
  [LoanDataField.INTEREST]: number;
  [LoanDataField.PRINCIPAL_PAYMENT]: number;
  [LoanDataField.INSURANCE_PREMIUM]: number;
  [LoanDataField.TOTAL_MONTHLY_PAYMENT]: number;
  [LoanDataField.REMAINING_PRINCIPAL]: number;
  [LoanDataField.CUMULATIVE_PRINCIPAL_PAID]: number;
  [LoanDataField.CUMULATIVE_INTEREST_PAID]: number;
  [LoanDataField.CUMULATIVE_INSURANCE_PAID]: number;

}

export interface AnnualLoanData {
  [LoanDataField.YEAR]: number;
  [LoanDataField.ANNUAL_INTEREST]: number;
  [LoanDataField.ANNUAL_PRINCIPAL]: number;
  [LoanDataField.ANNUAL_INSURANCE]: number;
  [LoanDataField.ANNUAL_TOTAL_PAYMENT]: number;
  [LoanDataField.REMAINING_PRINCIPAL_YEAR_END]: number;
  [LoanDataField.CUMULATIVE_INTEREST_YEAR_END]: number;
  [LoanDataField.CUMULATIVE_INSURANCE_YEAR_END]: number;
  [LoanDataField.CUMULATIVE_PRINCIPAL_YEAR_END]: number;

}

export interface LoanStatistics {
  [LoanStatisticsField.TOTAL_PRINCIPAL_PAID]: number;
  [LoanStatisticsField.TOTAL_INTEREST_PAID]: number;
  [LoanStatisticsField.TOTAL_INSURANCE_PAID]: number;
  [LoanStatisticsField.TOTAL_LOAN_COSTS]: number;
  [LoanStatisticsField.MEDIAN_MONTHLY_PAYMENT]: number;
  // Multi-client specific fields (optional as they might not be present for single-client calculations)
  [LoanStatisticsField.DEBT_RATIO]?: number;
  [LoanStatisticsField.DEBT_RATIO_ASSESSMENT]?: 'good' | 'moderate' | 'high';
  [LoanStatisticsField.PER_CLIENT_INSURANCE_PAID]?: number;
  [LoanStatisticsField.PER_CLIENT_DEBT_RATIO]?: number;
  [LoanStatisticsField.PER_CLIENT_DEBT_RATIO_ASSESSMENT]?: 'good' | 'moderate' | 'high';
  // Additional fields for client information
  clientCount?: number;
}

export interface LoanCalculationResult {
  monthlyData: MonthlyLoanData[];
  annualData: AnnualLoanData[];
  statistics: LoanStatistics;
}

export interface InvestmentParameters {
  startCapital?: number;
  annualGrowthRate?: number;
  refInvestCapital?: number;
  altInvestCapital?: number;
}

export interface InvestmentSimulationData extends MonthlyLoanData {
  [LoanDataField.INVESTMENT_BALANCE]: number;
  [LoanDataField.MONTHLY_CONTRIBUTION]: number;
  [LoanDataField.CUMULATIVE_INVESTMENT_CONTRIBUTION]: number;
  [LoanDataField.NET_WORTH]: number;
  

}

export interface ComparisonRequest {
  referenceLoan: LoanParameters;
  alternativeLoan: LoanParameters;
  referenceOwnContribution: number;
  alternativeOwnContribution: number;
  investmentParams?: InvestmentParameters;
  modularSchedule?: ModularLoanSchedule;
}


export interface ComparisonResult {
  referenceLoan: LoanCalculationResult;
  alternativeLoan: LoanCalculationResult;
  investmentSimulation?: InvestmentSimulationData[];
  minimumRequiredGrowthRate?: number;
  comparisonStats?: {
    totalCostDifference: number;
    netWorthEndOfTerm: number;
  };
}
