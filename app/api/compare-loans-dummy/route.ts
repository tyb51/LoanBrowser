import { NextRequest } from 'next/server';

// Mock implementation of loan comparison
// In a real app, this would call the Python backend
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      reference_loan,
      alternative_loan,
      reference_own_contribution,
      alternative_own_contribution,
      investment_params,
      modular_schedule
    } = body;

    // Calculate loans using the same logic as in calculate-loan
    const referenceLoan = await calculateLoan(reference_loan, null);
    const alternativeLoan = await calculateLoan(alternative_loan, modular_schedule);

    let investmentSimulation = null;
    let minimumRequiredGrowthRate = null;
    let comparisonStats = {
      totalCostDifference: alternativeLoan.statistics["Totale Kosten Lening (Rente + SSV)"] - 
                        referenceLoan.statistics["Totale Kosten Lening (Rente + SSV)"],
      netWorthEndOfTerm: 0
    };

    // If investment parameters are provided, simulate the investment
    if (investment_params) {
      const startCapital = investment_params.startCapital || 0;
      const annualGrowthRate = investment_params.annualGrowthRate 
        ? investment_params.annualGrowthRate / 100 
        : 0.08; // Default to 8%
      
      const monthlyGrowthRate = Math.pow(1 + annualGrowthRate, 1/12) - 1;
      
      // Calculate investment simulation
      investmentSimulation = simulateInvestment(
        referenceLoan.monthlyData,
        alternativeLoan.monthlyData,
        startCapital,
        monthlyGrowthRate
      );
      
      // Calculate minimum required growth rate (simplified for this mock)
      minimumRequiredGrowthRate = calculateMinimumGrowthRate(
        investmentSimulation,
        alternativeLoan.monthlyData[alternativeLoan.monthlyData.length - 1]["Maand"],
        alternativeLoan.statistics["Totaal Kapitaal Betaald"],
        startCapital
      );
      
      // Update comparison stats
      if (investmentSimulation.length > 0) {
        const lastMonth = investmentSimulation[investmentSimulation.length - 1];
        comparisonStats.netWorthEndOfTerm = lastMonth["Netto Vermogen (Invest - Schuld)"];
      }
    }

    // Return the comparison result
    return new Response(JSON.stringify({
      referenceLoan,
      alternativeLoan,
      investmentSimulation,
      minimumRequiredGrowthRate,
      comparisonStats
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error in loan comparison:', error);
    return new Response(JSON.stringify({ error: 'Failed to compare loans' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}

// Helper function to calculate a single loan
async function calculateLoan(loanParams, modularSchedule) {
  const {
    loanType,
    principal,
    interestRate,
    termYears,
    ownContribution,
    purchasePrice = 825000,
    delayMonths = 0,
    startYear = 2025,
    insuranceCoveragePct = 1.0,
  } = loanParams;

  // Calculate monthly interest rate
  const monthlyInterestRate = interestRate / 100 / 12;
  const totalMonths = termYears * 12;
  
  // Generate data
  const monthlyData = [];
  let remainingPrincipal = principal;
  let cumulativeInterest = 0;
  let cumulativeInsurance = 0;
  let cumulativePrincipal = 0;
  
  // For annuity loans, calculate the monthly payment
  let monthlyPayment = 0;
  if (loanType === 'annuity') {
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
    
    if (loanType === 'annuity') {
      principalPayment = monthlyPayment - monthlyInterest;
      totalMonthlyPayment = monthlyPayment;
    } else if (loanType === 'bullet') {
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
    const monthlyInsurance = (principal * 0.0036 * insuranceCoveragePct) / 12; // ~0.36% annual rate
    cumulativeInsurance += monthlyInsurance;
    
    monthlyData.push({
      Maand: month,
      Jaar: year,
      "Betaling Lening (Excl. SSV)": totalMonthlyPayment,
      Rente: monthlyInterest,
      "Kapitaal Aflossing": principalPayment,
      "Schuldsaldo Premie (Maand)": monthlyInsurance,
      "Totale Maandelijkse Uitgave": totalMonthlyPayment + monthlyInsurance,
      "Resterend Kapitaal": remainingPrincipal,
      "Cumulatief Kapitaal Betaald": cumulativePrincipal,
      "Cumulatief Rente Betaald": cumulativeInterest,
      "Cumulatief SSV Betaald": cumulativeInsurance
    });
  }
  
  // Generate yearly aggregated data
  const annualData = [];
  const yearGroups = new Map();
  
  monthlyData.forEach(month => {
    if (!yearGroups.has(month.Jaar)) {
      yearGroups.set(month.Jaar, []);
    }
    yearGroups.get(month.Jaar).push(month);
  });
  
  yearGroups.forEach((months, year) => {
    const yearlyInterest = months.reduce((sum, month) => sum + month.Rente, 0);
    const yearlyPrincipal = months.reduce((sum, month) => sum + month["Kapitaal Aflossing"], 0);
    const yearlyInsurance = months.reduce((sum, month) => sum + month["Schuldsaldo Premie (Maand)"], 0);
    const yearlyTotalPayment = months.reduce((sum, month) => sum + month["Totale Maandelijkse Uitgave"], 0);
    
    // Get end-of-year values
    const lastMonth = months[months.length - 1];
    
    annualData.push({
      Jaar: year,
      Jaarlijkse_Rente: yearlyInterest,
      Jaarlijkse_Kapitaalaflossing: yearlyPrincipal,
      Jaarlijkse_SSV: yearlyInsurance,
      Jaarlijkse_Totale_Uitgave: yearlyTotalPayment,
      Resterend_Kapitaal_Einde_Jaar: lastMonth["Resterend Kapitaal"],
      Cumul_Rente_Einde_Jaar: lastMonth["Cumulatief Rente Betaald"],
      Cumul_SSV_Einde_Jaar: lastMonth["Cumulatief SSV Betaald"],
      Cumul_Kapitaal_Einde_Jaar: lastMonth["Cumulatief Kapitaal Betaald"]
    });
  });
  
  // Sort annual data by year
  annualData.sort((a, b) => a.Jaar - b.Jaar);
  
  // Calculate statistics
  const lastMonth = monthlyData[monthlyData.length - 1];
  const statistics = {
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

// Helper function to simulate investment
function simulateInvestment(
  referenceLoanData,
  alternativeLoanData,
  startCapital,
  monthlyGrowthRate
) {
  const result = [];
  let investmentBalance = startCapital;
  let cumulativeInvestmentContribution = startCapital;
  
  const maxMonths = Math.max(
    referenceLoanData.length,
    alternativeLoanData.length
  );
  
  for (let month = 1; month <= maxMonths; month++) {
    // Apply growth rate to current balance
    investmentBalance *= (1 + monthlyGrowthRate);
    
    // Get monthly payments for both loans (if they exist for this month)
    const refMonthData = referenceLoanData.find(m => m.Maand === month);
    const altMonthData = alternativeLoanData.find(m => m.Maand === month);
    
    const refPayment = refMonthData ? refMonthData["Totale Maandelijkse Uitgave"] : 0;
    const altPayment = altMonthData ? altMonthData["Totale Maandelijkse Uitgave"] : 0;
    
    // Calculate difference (positive if alternative is cheaper)
    const monthlyDifference = refPayment - altPayment;
    
    // Add difference to investment
    investmentBalance += monthlyDifference;
    cumulativeInvestmentContribution += monthlyDifference;
    
    if (altMonthData) {
      result.push({
        ...altMonthData,
        "Saldo Investering": investmentBalance,
        "Maandelijkse Bijdrage/Onttrekking": monthlyDifference,
        "Cumulatieve Bijdrage Investering": cumulativeInvestmentContribution,
        "Netto Vermogen (Invest - Schuld)": investmentBalance - altMonthData["Resterend Kapitaal"]
      });
    }
  }
  
  return result;
}

// Helper function to calculate minimum required growth rate
function calculateMinimumGrowthRate(
  investmentSimulation,
  paymentMonth,
  paymentAmount,
  startCapital
) {
  // This is a simplified implementation
  // In reality, this would be a more complex calculation
  
  // For this mock, we'll return a static value based on the loan terms
  const lastMonth = investmentSimulation[investmentSimulation.length - 1];
  
  // If the investment balance is already sufficient, return 0
  if (lastMonth && lastMonth["Saldo Investering"] >= paymentAmount) {
    return 0;
  }
  
  // Otherwise, calculate a rough estimate
  // This is just a simplified approximation for the mock
  const yearsToGrow = paymentMonth / 12;
  const requiredGrowthRate = Math.pow(paymentAmount / startCapital, 1 / yearsToGrow) - 1;
  
  return Math.max(requiredGrowthRate * 100, 0); // Convert to percentage
}
