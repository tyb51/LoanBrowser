import { NextRequest } from 'next/server';

// Mock implementation of loan calculation
// In a real app, this would call the Python backend
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
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
      modular_schedule // Optional for bullet/modular loans
    } = body;

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
        const scheduledPayment = modular_schedule?.schedule.find(item => item.month === month)?.amount || 0;
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
    
    // Return the calculation result
    return new Response(JSON.stringify({
      monthlyData,
      annualData,
      statistics
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error in loan calculation:', error);
    return new Response(JSON.stringify({ error: 'Failed to calculate loan' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}
