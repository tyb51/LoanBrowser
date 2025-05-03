export enum LoanType {
  ANNUITY = 'annuity',
  BULLET = 'bullet',
  MODULAR = 'modular'
}

export enum LoanDataField {
  // Monthly data fields
  MONTH = 'month',
  YEAR = 'year',
  PAYMENT_EXCLUDING_INSURANCE = 'paymentExcludingInsurance',
  INTEREST = 'interest',
  PRINCIPAL_PAYMENT = 'principalPayment',
  INSURANCE_PREMIUM = 'insurancePremium',
  TOTAL_MONTHLY_PAYMENT = 'totalMonthlyPayment',
  REMAINING_PRINCIPAL = 'remainingPrincipal',
  CUMULATIVE_PRINCIPAL_PAID = 'cumulativePrincipalPaid',
  CUMULATIVE_INTEREST_PAID = 'cumulativeInterestPaid',
  CUMULATIVE_INSURANCE_PAID = 'cumulativeInsurancePaid',
  
  // Annual data fields
  ANNUAL_INTEREST = 'annualInterest',
  ANNUAL_PRINCIPAL = 'annualPrincipal',
  ANNUAL_INSURANCE = 'annualInsurance',
  ANNUAL_TOTAL_PAYMENT = 'annualTotalPayment',
  REMAINING_PRINCIPAL_YEAR_END = 'remainingPrincipalYearEnd',
  CUMULATIVE_INTEREST_YEAR_END = 'cumulativeInterestYearEnd',
  CUMULATIVE_INSURANCE_YEAR_END = 'cumulativeInsuranceYearEnd',
  CUMULATIVE_PRINCIPAL_YEAR_END = 'cumulativePrincipalYearEnd',
  
  // Investment fields
  INVESTMENT_BALANCE = 'investmentBalance',
  MONTHLY_CONTRIBUTION = 'monthlyContribution',
  CUMULATIVE_INVESTMENT_CONTRIBUTION = 'cumulativeInvestmentContribution',
  NET_WORTH = 'netWorth'
}

export enum LoanStatisticsField {
  TOTAL_PRINCIPAL_PAID = 'totalPrincipalPaid',
  TOTAL_INTEREST_PAID = 'totalInterestPaid',
  TOTAL_INSURANCE_PAID = 'totalInsurancePaid',
  TOTAL_LOAN_COSTS = 'totalLoanCosts',
  HIGHEST_MONTHLY_PAYMENT = 'highestMonthlyPayment'
}
