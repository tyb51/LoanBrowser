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
  
  // Legacy fields for backwards compatibility - will be removed after migrating all components
  "Maand": number;
  "Jaar": number;
  "Betaling Lening (Excl. SSV)": number;
  "Rente": number;
  "Kapitaal Aflossing": number;
  "Schuldsaldo Premie (Maand)": number;
  "Totale Maandelijkse Uitgave": number;
  "Resterend Kapitaal": number;
  "Cumulatief Kapitaal Betaald": number;
  "Cumulatief Rente Betaald": number;
  "Cumulatief SSV Betaald": number;
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
  
  // Legacy fields for backwards compatibility - will be removed after migrating all components
  "Jaar": number;
  "Jaarlijkse_Rente": number;
  "Jaarlijkse_Kapitaalaflossing": number;
  "Jaarlijkse_SSV": number;
  "Jaarlijkse_Totale_Uitgave": number;
  "Resterend_Kapitaal_Einde_Jaar": number;
  "Cumul_Rente_Einde_Jaar": number;
  "Cumul_SSV_Einde_Jaar": number;
  "Cumul_Kapitaal_Einde_Jaar": number;
}

export interface LoanStatistics {
  [LoanStatisticsField.TOTAL_PRINCIPAL_PAID]: number;
  [LoanStatisticsField.TOTAL_INTEREST_PAID]: number;
  [LoanStatisticsField.TOTAL_INSURANCE_PAID]: number;
  [LoanStatisticsField.TOTAL_LOAN_COSTS]: number;
  [LoanStatisticsField.HIGHEST_MONTHLY_PAYMENT]: number;
  
  // Legacy fields for backwards compatibility - will be removed after migrating all components
  "Totaal Kapitaal Betaald": number;
  "Totale Rente Betaald": number;
  "Totale SSV Premie Betaald": number;
  "Totale Kosten Lening (Rente + SSV)": number;
  "Hoogste Maandelijkse Uitgave Lening": number;
}

export interface LoanCalculationResult {
  monthlyData: MonthlyLoanData[];
  annualData: AnnualLoanData[];
  statistics: LoanStatistics;
}

export interface InvestmentParameters {
  startCapital?: number;
  annualGrowthRate?: number;
}

export interface InvestmentSimulationData extends MonthlyLoanData {
  [LoanDataField.INVESTMENT_BALANCE]: number;
  [LoanDataField.MONTHLY_CONTRIBUTION]: number;
  [LoanDataField.CUMULATIVE_INVESTMENT_CONTRIBUTION]: number;
  [LoanDataField.NET_WORTH]: number;
  
  // Legacy fields for backwards compatibility
  "Saldo Investering": number;
  "Maandelijkse Bijdrage/Onttrekking": number;
  "Cumulatieve Bijdrage Investering": number;
  "Netto Vermogen (Invest - Schuld)": number;
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
