# Mapping table between Dutch legacy field names and canonical (enum-based) English field names
# This can be imported and used for reference or for migration/compatibility utilities.

FIELD_NAME_MAP = {
    # Monthly data fields
    "Maand": "month",
    "Jaar": "year",
    "Betaling Lening (Excl. SSV)": "paymentExcludingInsurance",
    "Rente": "interest",
    "Kapitaal Aflossing": "principalPayment",
    "Schuldsaldo Premie (Maand)": "insurancePremium",
    "Totale Maandelijkse Uitgave": "totalMonthlyPayment",
    "Resterend Kapitaal": "remainingPrincipal",
    "Cumulatief Kapitaal Betaald": "cumulativePrincipalPaid",
    "Cumulatief Rente Betaald": "cumulativeInterestPaid",
    "Cumulatief SSV Betaald": "cumulativeInsurancePaid",

    # Annual data fields
    "Jaarlijkse_Rente": "annualInterest",
    "Jaarlijkse_Kapitaalaflossing": "annualPrincipal",
    "Jaarlijkse_SSV": "annualInsurance",
    "Jaarlijkse_Totale_Uitgave": "annualTotalPayment",
    "Resterend_Kapitaal_Einde_Jaar": "remainingPrincipalYearEnd",
    "Cumul_Rente_Einde_Jaar": "cumulativeInterestYearEnd",
    "Cumul_SSV_Einde_Jaar": "cumulativeInsuranceYearEnd",
    "Cumul_Kapitaal_Einde_Jaar": "cumulativePrincipalYearEnd",

    # Investment fields
    "Saldo Investering": "investmentBalance",
    "Maandelijkse Bijdrage/Onttrekking": "monthlyContribution",
    "Cumulatieve Bijdrage Investering": "cumulativeInvestmentContribution",
    "Netto Vermogen (Invest - Schuld)": "netWorth",

    # Statistics fields
    "Totaal Kapitaal Betaald": "totalPrincipalPaid",
    "Totale Rente Betaald": "totalInterestPaid",
    "Totale SSV Premie Betaald": "totalInsurancePaid",
    "Totale Kosten Lening (Rente + SSV)": "totalLoanCosts",
    "Hoogste Maandelijkse Uitgave Lening": "highestMonthlyPayment",
    "Start Investering": "startInvestment",
    "Eindsaldo Investering": "endInvestmentBalance",
    "Netto Groei Investering": "netInvestmentGrowth",
    "Netto Eindresultaat (Groei Invest - Kosten Lening)": "netFinalResult",
    "Netto Vermogen Einde Looptijd (Invest - Schuld)": "netWorthEndOfTerm",
}
