# -*- coding: utf-8 -*-
import pandas as pd
from calculation_functions import (
    simuleer_klassieke_lening as orig_simuleer_klassieke_lening,
    simuleer_modulaire_lening as orig_simuleer_modulaire_lening,
    bereken_statistieken,
    aggregeer_jaarlijks
)

# Re-export the original aggregeer_jaarlijks function
aggregeer_jaarlijks = aggregeer_jaarlijks

def simuleer_klassieke_lening_multi_client(
    eigen_inbreng,
    jaarlijkse_rentevoet,
    looptijd_jaren,
    aankoopprijs,
    uitstel_maanden=0,
    start_jaar_kalender=2025,
    schuldsaldo_dekking_pct=1.0,
    loan_type='annuity',
    monthly_income=0,
    client_count=1
):
    """Extended version of simuleer_klassieke_lening that supports multi-client calculations"""
    # Call the original function with the same parameters
    result_df = orig_simuleer_klassieke_lening(
        eigen_inbreng=eigen_inbreng,
        jaarlijkse_rentevoet=jaarlijkse_rentevoet,
        looptijd_jaren=looptijd_jaren,
        aankoopprijs=aankoopprijs,
        uitstel_maanden=uitstel_maanden,
        start_jaar_kalender=start_jaar_kalender,
        schuldsaldo_dekking_pct=schuldsaldo_dekking_pct,
        loan_type=loan_type
    )
    
    # If client count > 1, adjust the insurance premium (divided among clients)
    if client_count > 1 and not result_df.empty and "insurancePremium" in result_df.columns:
        # Divide insurance premium by the number of clients
        result_df["insurancePremium"] = result_df["insurancePremium"] * client_count
        
        # Recalculate total monthly payment and cumulative insurance paid
        result_df["totalMonthlyPayment"] = result_df["paymentExcludingInsurance"] + result_df["insurancePremium"]
        
        # Recalculate cumulative insurance paid
        insurance_premiums = result_df["insurancePremium"].values
        cumulative_insurance = [insurance_premiums[0]]
        for i in range(1, len(insurance_premiums)):
            cumulative_insurance.append(cumulative_insurance[i-1] + insurance_premiums[i])
        result_df["cumulativeInsurancePaid"] = cumulative_insurance
    
    # Calculate debt ratio if monthly income is provided
    if monthly_income > 0 and not result_df.empty:
        # Add a debt ratio column
        first_payment = result_df.iloc[0]["totalMonthlyPayment"]
        result_df["debtRatio"] = (first_payment / monthly_income) * 100
    
    return result_df

def simuleer_modulaire_lening_multi_client(
    eigen_inbreng,
    jaarlijkse_rentevoet,
    looptijd_jaren,
    aflossings_schema,
    aankoopprijs,
    start_jaar_kalender=2025,
    schuldsaldo_dekking_pct=1.0,
    loan_type='bullet',
    monthly_income=0,
    client_count=1
):
    """Extended version of simuleer_modulaire_lening that supports multi-client calculations"""
    # Call the original function with the same parameters
    result_df = orig_simuleer_modulaire_lening(
        eigen_inbreng=eigen_inbreng,
        jaarlijkse_rentevoet=jaarlijkse_rentevoet,
        looptijd_jaren=looptijd_jaren,
        aflossings_schema=aflossings_schema,
        aankoopprijs=aankoopprijs,
        start_jaar_kalender=start_jaar_kalender,
        schuldsaldo_dekking_pct=schuldsaldo_dekking_pct,
        loan_type=loan_type
    )
    
    # If client count > 1, adjust the insurance premium (divided among clients)
    if client_count > 1 and not result_df.empty and "insurancePremium" in result_df.columns:
        # Divide insurance premium by the number of clients
        result_df["insurancePremium"] = result_df["insurancePremium"] * client_count
        
        # Recalculate total monthly payment and cumulative insurance paid
        result_df["totalMonthlyPayment"] = result_df["paymentExcludingInsurance"] + result_df["insurancePremium"]
        
        # Recalculate cumulative insurance paid
        insurance_premiums = result_df["insurancePremium"].values
        cumulative_insurance = [insurance_premiums[0]]
        for i in range(1, len(insurance_premiums)):
            cumulative_insurance.append(cumulative_insurance[i-1] + insurance_premiums[i])
        result_df["cumulativeInsurancePaid"] = cumulative_insurance
    
    # Calculate debt ratio if monthly income is provided
    if monthly_income > 0 and not result_df.empty:
        # Add a debt ratio column
        first_payment = result_df.iloc[0]["totalMonthlyPayment"]
        result_df["debtRatio"] = (first_payment / monthly_income) * 100
    
    return result_df

def bereken_statistieken_multi_client(df_lening, hoofdsom=0, monthly_income=0, client_count=1):
    """Extended version of bereken_statistieken that supports multi-client statistics"""
    # Get standard statistics
    stats = bereken_statistieken(df_lening, hoofdsom=hoofdsom)
    
    # Add multi-client specific statistics
    if monthly_income > 0 and not df_lening.empty:
        first_payment = df_lening.iloc[0]["totalMonthlyPayment"]
        debt_ratio = (first_payment / monthly_income) * 100
        stats["debtRatio"] = round(debt_ratio, 2)
        
        # Add debt ratio assessment
        if debt_ratio <= 33:
            stats["debtRatioAssessment"] = "good"
        elif debt_ratio <= 43:
            stats["debtRatioAssessment"] = "moderate"
        else:
            stats["debtRatioAssessment"] = "high"
    
    # Add client count
    stats["clientCount"] = client_count
    
    # Calculate per-client statistics
    if client_count > 1:
        # Calculate insurance paid per client
        stats["perClientInsurancePaid"] = round(stats["totalInsurancePaid"] / client_count, 2)
        
        # Calculate debt ratio per client (if monthly income is available)
        if monthly_income > 0:
            monthly_payment_per_client = stats["medianMonthlyPayment"] / client_count
            per_client_income_share = monthly_income / client_count
            per_client_debt_ratio = (monthly_payment_per_client / per_client_income_share) * 100
            stats["perClientDebtRatio"] = round(per_client_debt_ratio, 2)
            
            # Add per-client debt ratio assessment
            if per_client_debt_ratio <= 33:
                stats["perClientDebtRatioAssessment"] = "good"
            elif per_client_debt_ratio <= 43:
                stats["perClientDebtRatioAssessment"] = "moderate"
            else:
                stats["perClientDebtRatioAssessment"] = "high"
    
    return stats
