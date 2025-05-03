"use client";

import { 
  LoanParameters, 
  ModularLoanSchedule, 
  LoanCalculationResult,
  InvestmentParameters,
  ComparisonResult,
  MonthlyLoanData,
  AnnualLoanData,
  LoanStatistics,
  InvestmentSimulationData,
  LoanDataField,
  LoanStatisticsField,
  LoanType
} from '@/app/types/loan';

// For now, we'll mock the API calls with local calculations
// In a real implementation, these would call out to a Python backend

// Simulate an annuity loan calculation
export async function calculateLoan(
  params: LoanParameters, 
  modularSchedule?: ModularLoanSchedule
): Promise<LoanCalculationResult> {
  // Mock response
  const { principal, interestRate, termYears, loanType } = params;
  
  // Calculate monthly interest rate
  const monthlyInterestRate = interestRate / 100 / 12;
  const totalMonths = termYears * 12;
  
  // Generate data
  const monthlyData: MonthlyLoanData[] = [];
  let remainingPrincipal = principal;
  let cumulativeInterest = 0;
  let cumulativeInsurance = 0;
  let cumulativePrincipal = 0;
  
  // For annuity loans, calculate the monthly payment
  let monthlyPayment = 0;
  if (loanType === LoanType.ANNUITY) {
    // Formula: PMT = P * [r(1+r)^n] / [(1+r)^n - 1]
    if (monthlyInterestRate > 0) {
      monthlyPayment = principal * (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, totalMonths)) / 
                     (Math.pow(1 + monthlyInterestRate, totalMonths) - 1);
    } else {
      monthlyPayment = principal / totalMonths;
    }
  }
  
  for (let month = 1; month <= totalMonths; month++) {
    const year = Math.ceil(month / 12);
    
    // Calculate monthly values
    const monthlyInterest = remainingPrincipal * monthlyInterestRate;
    cumulativeInterest += monthlyInterest;
    
    let principalPayment = 0;
    let totalMonthlyPayment = 0;
    
    if (loanType === LoanType.ANNUITY) {
      principalPayment = monthlyPayment - monthlyInterest;
      totalMonthlyPayment = monthlyPayment;
    } else if (loanType === LoanType.BULLET) {
      // For bullet loans, we pay only interest until the final month
      principalPayment = month === totalMonths ? remainingPrincipal : 0;
      totalMonthlyPayment = monthlyInterest + principalPayment;
    } else { // modular
      // For modular loans, use the schedule if provided
      const scheduledPayment = modularSchedule?.schedule.find(item => item.month === month)?.amount || 0;
      principalPayment = Math.min(scheduledPayment, remainingPrincipal);
      totalMonthlyPayment = monthlyInterest + principalPayment;
    }
    
    // Adjust principal payment for last month to avoid rounding issues
    if (Math.abs(remainingPrincipal - principalPayment) < 0.01) {
      principalPayment = remainingPrincipal;
      totalMonthlyPayment = principalPayment + monthlyInterest;
    }
    
    remainingPrincipal -= principalPayment;
    if (remainingPrincipal < 0.01) {
      remainingPrincipal = 0;
    }
    
    cumulativePrincipal += principalPayment;
    
    // Calculate insurance (simplified)
    const monthlyInsurance = (principal * 0.0036) / 12; // ~0.36% annual rate
    cumulativeInsurance += monthlyInsurance;
    
    // Create data object with both new enum-based and legacy string-based fields
    const monthData: MonthlyLoanData = {
      // New enum-based fields
      [LoanDataField.MONTH]: month,
      [LoanDataField.YEAR]: year,
      [LoanDataField.PAYMENT_EXCLUDING_INSURANCE]: totalMonthlyPayment,
      [LoanDataField.INTEREST]: monthlyInterest,
      [LoanDataField.PRINCIPAL_PAYMENT]: principalPayment,
      [LoanDataField.INSURANCE_PREMIUM]: monthlyInsurance,
      [LoanDataField.TOTAL_MONTHLY_PAYMENT]: totalMonthlyPayment + monthlyInsurance,
      [LoanDataField.REMAINING_PRINCIPAL]: remainingPrincipal,
      [LoanDataField.CUMULATIVE_PRINCIPAL_PAID]: cumulativePrincipal,
      [LoanDataField.CUMULATIVE_INTEREST_PAID]: cumulativeInterest,
      [LoanDataField.CUMULATIVE_INSURANCE_PAID]: cumulativeInsurance,
      
      // Legacy fields for backward compatibility
      "Maand": month,
      "Jaar": year,
      "Betaling Lening (Excl. SSV)": totalMonthlyPayment,
      "Rente": monthlyInterest,
      "Kapitaal Aflossing": principalPayment,
      "Schuldsaldo Premie (Maand)": monthlyInsurance,
      "Totale Maandelijkse Uitgave": totalMonthlyPayment + monthlyInsurance,
      "Resterend Kapitaal": remainingPrincipal,
      "Cumulatief Kapitaal Betaald": cumulativePrincipal,
      "Cumulatief Rente Betaald": cumulativeInterest,
      "Cumulatief SSV Betaald": cumulativeInsurance
    };
    
    monthlyData.push(monthData);
  }
  
  // Generate yearly aggregated data
  const annualData: AnnualLoanData[] = [];
  const yearGroups = new Map<number, MonthlyLoanData[]>();
  
  monthlyData.forEach(month => {
    const year = month[LoanDataField.YEAR];
    if (!yearGroups.has(year)) {
      yearGroups.set(year, []);
    }
    yearGroups.get(year)?.push(month);
  });
  
  yearGroups.forEach((months, year) => {
    const yearlyInterest = months.reduce((sum, month) => sum + month[LoanDataField.INTEREST], 0);
    const yearlyPrincipal = months.reduce((sum, month) => sum + month[LoanDataField.PRINCIPAL_PAYMENT], 0);
    const yearlyInsurance = months.reduce((sum, month) => sum + month[LoanDataField.INSURANCE_PREMIUM], 0);
    const yearlyTotalPayment = months.reduce((sum, month) => sum + month[LoanDataField.TOTAL_MONTHLY_PAYMENT], 0);
    
    // Get end-of-year values
    const lastMonth = months[months.length - 1];
    
    // Create data object with both new enum-based and legacy string-based fields
    const annualDataItem: AnnualLoanData = {
      // New enum-based fields
      [LoanDataField.YEAR]: year,
      [LoanDataField.ANNUAL_INTEREST]: yearlyInterest,
      [LoanDataField.ANNUAL_PRINCIPAL]: yearlyPrincipal,
      [LoanDataField.ANNUAL_INSURANCE]: yearlyInsurance,
      [LoanDataField.ANNUAL_TOTAL_PAYMENT]: yearlyTotalPayment,
      [LoanDataField.REMAINING_PRINCIPAL_YEAR_END]: lastMonth[LoanDataField.REMAINING_PRINCIPAL],
      [LoanDataField.CUMULATIVE_INTEREST_YEAR_END]: lastMonth[LoanDataField.CUMULATIVE_INTEREST_PAID],
      [LoanDataField.CUMULATIVE_INSURANCE_YEAR_END]: lastMonth[LoanDataField.CUMULATIVE_INSURANCE_PAID],
      [LoanDataField.CUMULATIVE_PRINCIPAL_YEAR_END]: lastMonth[LoanDataField.CUMULATIVE_PRINCIPAL_PAID],
      
      // Legacy fields for backward compatibility
      "Jaar": year,
      "Jaarlijkse_Rente": yearlyInterest,
      "Jaarlijkse_Kapitaalaflossing": yearlyPrincipal,
      "Jaarlijkse_SSV": yearlyInsurance,
      "Jaarlijkse_Totale_Uitgave": yearlyTotalPayment,
      "Resterend_Kapitaal_Einde_Jaar": lastMonth["Resterend Kapitaal"],
      "Cumul_Rente_Einde_Jaar": lastMonth["Cumulatief Rente Betaald"],
      "Cumul_SSV_Einde_Jaar": lastMonth["Cumulatief SSV Betaald"],
      "Cumul_Kapitaal_Einde_Jaar": lastMonth["Cumulatief Kapitaal Betaald"]
    };
    
    annualData.push(annualDataItem);
  });
  
  // Sort annual data by year
  annualData.sort((a, b) => a[LoanDataField.YEAR] - b[LoanDataField.YEAR]);
  
  // Calculate statistics
  const lastMonth = monthlyData[monthlyData.length - 1];
  const statistics: LoanStatistics = {
    // New enum-based fields
    [LoanStatisticsField.TOTAL_PRINCIPAL_PAID]: lastMonth[LoanDataField.CUMULATIVE_PRINCIPAL_PAID],
    [LoanStatisticsField.TOTAL_INTEREST_PAID]: lastMonth[LoanDataField.CUMULATIVE_INTEREST_PAID],
    [LoanStatisticsField.TOTAL_INSURANCE_PAID]: lastMonth[LoanDataField.CUMULATIVE_INSURANCE_PAID],
    [LoanStatisticsField.TOTAL_LOAN_COSTS]: lastMonth[LoanDataField.CUMULATIVE_INTEREST_PAID] + lastMonth[LoanDataField.CUMULATIVE_INSURANCE_PAID],
    [LoanStatisticsField.HIGHEST_MONTHLY_PAYMENT]: Math.max(...monthlyData.map(m => m[LoanDataField.TOTAL_MONTHLY_PAYMENT])),
    
    // Legacy fields for backward compatibility
    "Totaal Kapitaal Betaald": lastMonth["Cumulatief Kapitaal Betaald"],
    "Totale Rente Betaald": lastMonth["Cumulatief Rente Betaald"],
    "Totale SSV Premie Betaald": lastMonth["Cumulatief SSV Betaald"],
    "Totale Kosten Lening (Rente + SSV)": lastMonth["Cumulatief Rente Betaald"] + lastMonth["Cumulatief SSV Betaald"],
    "Hoogste Maandelijkse Uitgave Lening": Math.max(...monthlyData.map(m => m["Totale Maandelijkse Uitgave"]))
  };
  
  return {
    monthlyData,
    annualData,
    statistics
  };
}

export async function compareLoans(
  referenceLoan: LoanParameters,
  alternativeLoan: LoanParameters,
  referenceOwnContribution: number,
  alternativeOwnContribution: number,
  investmentParams?: InvestmentParameters,
  modularSchedule?: ModularLoanSchedule
): Promise<ComparisonResult> {
  // Calculate both loans
  const refResult = await calculateLoan(referenceLoan);
  const altResult = await calculateLoan(alternativeLoan, modularSchedule);
  
  let investmentSimulation: InvestmentSimulationData[] | undefined;
  let minimumRequiredGrowthRate: number | undefined;
  let comparisonStats: { totalCostDifference: number; netWorthEndOfTerm: number } | undefined;
  
  // If investment parameters are provided, simulate the investment
  if (investmentParams) {
    const { startCapital, annualGrowthRate } = investmentParams;
    const monthlyGrowthRate = annualGrowthRate ? Math.pow(1 + annualGrowthRate / 100, 1/12) - 1 : 0;
    
    // Calculate investment simulation
    investmentSimulation = [];
    let investmentBalance = startCapital || 0;
    let cumulativeInvestmentContribution = startCapital || 0;
    
    const maxMonths = Math.max(
      refResult.monthlyData.length,
      altResult.monthlyData.length
    );
    
    for (let month = 1; month <= maxMonths; month++) {
      // Apply growth rate to current balance
      investmentBalance *= (1 + monthlyGrowthRate);
      
      // Get monthly payments for both loans (if they exist for this month)
      const refMonthData = refResult.monthlyData.find(m => m[LoanDataField.MONTH] === month);
      const altMonthData = altResult.monthlyData.find(m => m[LoanDataField.MONTH] === month);
      
      const refPayment = refMonthData ? refMonthData[LoanDataField.TOTAL_MONTHLY_PAYMENT] : 0;
      const altPayment = altMonthData ? altMonthData[LoanDataField.TOTAL_MONTHLY_PAYMENT] : 0;
      
      // Calculate difference (positive if alternative is cheaper)
      const monthlyDifference = refPayment - altPayment;
      
      // Add difference to investment
      investmentBalance += monthlyDifference;
      cumulativeInvestmentContribution += monthlyDifference;
      
      if (altMonthData) {
        // Create data object with both new enum-based and legacy string-based fields
        const simulationData: InvestmentSimulationData = {
          ...altMonthData,
          // New enum-based fields
          [LoanDataField.INVESTMENT_BALANCE]: investmentBalance,
          [LoanDataField.MONTHLY_CONTRIBUTION]: monthlyDifference,
          [LoanDataField.CUMULATIVE_INVESTMENT_CONTRIBUTION]: cumulativeInvestmentContribution,
          [LoanDataField.NET_WORTH]: investmentBalance - altMonthData[LoanDataField.REMAINING_PRINCIPAL],
          
          // Legacy fields for backward compatibility
          "Saldo Investering": investmentBalance,
          "Maandelijkse Bijdrage/Onttrekking": monthlyDifference,
          "Cumulatieve Bijdrage Investering": cumulativeInvestmentContribution,
          "Netto Vermogen (Invest - Schuld)": investmentBalance - altMonthData["Resterend Kapitaal"]
        };
        
        investmentSimulation.push(simulationData);
      }
    }
    
    // Calculate minimum required growth rate
    // This is a simplified calculation for the mock
    // In real implementation, we would calculate this more precisely
    const totalCosts = refResult.statistics[LoanStatisticsField.TOTAL_LOAN_COSTS];
    const totalAltCosts = altResult.statistics[LoanStatisticsField.TOTAL_LOAN_COSTS];
    const totalDifference = totalCosts - totalAltCosts;
    
    if (investmentSimulation.length > 0) {
      const lastMonth = investmentSimulation[investmentSimulation.length - 1];
      minimumRequiredGrowthRate = 3.5; // Placeholder - would be calculated
      
      comparisonStats = {
        totalCostDifference: totalDifference,
        netWorthEndOfTerm: lastMonth[LoanDataField.NET_WORTH]
      };
    }
  }
  
  return {
    referenceLoan: refResult,
    alternativeLoan: altResult,
    investmentSimulation,
    minimumRequiredGrowthRate,
    comparisonStats
  };
}
