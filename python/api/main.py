from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, List, Tuple, Optional, Union, Any
from pydantic import BaseModel, Field
import sys
import os
import pandas as pd
import numpy as np
from enum import Enum
from fastapi.routing import APIRouter

# Add parent directory to path to import calculation functions
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from calculation_functions import (
    simuleer_klassieke_lening,
    simuleer_modulaire_lening,
    bereken_statistieken,
    aggregeer_jaarlijks,
    simuleer_met_investering,
    bereken_min_groei_voor_betaling
)

app = FastAPI(title="LoanLogic API", 
              description="API for loan calculations and simulations")

# Configure CORS - IMPORTANT: Make sure this is before any routes
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



# Enum classes to match the TypeScript enums
class LoanType(str, Enum):
    ANNUITY = "annuity"
    BULLET = "bullet"
    MODULAR = "modular"

# Data models
class ModularLoanScheduleItem(BaseModel):
    month: int
    amount: float

class ModularLoanSchedule(BaseModel):
    schedule: List[ModularLoanScheduleItem]

class LoanParameters(BaseModel):
    loanType: LoanType
    principal: float
    interestRate: float
    termYears: int
    ownContribution: float
    purchasePrice: Optional[float] = 825000
    delayMonths: Optional[int] = 0
    startYear: Optional[int] = 2025
    insuranceCoveragePct: Optional[float] = 1.0
    insuranceSimulationIds: Optional[List[str]] = None

class InvestmentParameters(BaseModel):
    startCapital: Optional[float] = None
    annualGrowthRate: Optional[float] = None
    refInvestCapital: Optional[float] = None
    altInvestCapital: Optional[float] = None

class ComparisonRequest(BaseModel):
    referenceLoan: LoanParameters
    alternativeLoan: LoanParameters
    referenceOwnContribution: float
    alternativeOwnContribution: float
    investmentParams: Optional[InvestmentParameters] = None
    modularSchedule: Optional[ModularLoanSchedule] = None
    refInsuranceSimulationIds: Optional[List[str]] = None
    altInsuranceSimulationIds: Optional[List[str]] = None

# Helper functions to transform data
def transform_monthly_data(df: pd.DataFrame) -> List[Dict[str, Any]]:
    """Transform monthly DataFrame to the expected API response format"""
    if df.empty:
        return []
    
    # Create a list of dictionaries with both enum-based and legacy string-based fields
    result = []
    for _, row in df.iterrows():
        # Map DataFrame columns to API response fields
        data = {
            # Enum-based fields
            "month": int(row["month"]),
            "year": int(row["year"]),
            "paymentExcludingInsurance": float(row["paymentExcludingInsurance"]),
            "interest": float(row["interest"]),
            "principalPayment": float(row["principalPayment"]),
            "insurancePremium": float(row["insurancePremium"]),
            "totalMonthlyPayment": float(row["totalMonthlyPayment"]),
            "remainingPrincipal": float(row["remainingPrincipal"]),
            "cumulativePrincipalPaid": float(row["cumulativePrincipalPaid"]),
            "cumulativeInterestPaid": float(row["cumulativeInterestPaid"]),
            "cumulativeInsurancePaid": float(row["cumulativeInsurancePaid"]),
            
        }
        
        # Add investment fields if they exist in the DataFrame
        if "investmentBalance" in row:
            data["investmentBalance"] = float(row["investmentBalance"])
        
        if "monthlyContribution" in row:
            data["monthlyContribution"] = float(row["monthlyContribution"])
        
        if "cumulativeInvestmentContribution" in row:
            data["cumulativeInvestmentContribution"] = float(row["cumulativeInvestmentContribution"])
        
        if "netWorth" in row:
            data["netWorth"] = float(row["netWorth"])
        
        result.append(data)
    
    return result

def transform_annual_data(df: pd.DataFrame) -> List[Dict[str, Any]]:
    """Transform annual DataFrame to the expected API response format"""
    if df.empty:
        return []
    
    # Create a list of dictionaries with both enum-based and legacy string-based fields
    result = []
    for _, row in df.iterrows():
        # Map DataFrame columns to API response fields
        data = {
            # Enum-based fields
            "year": int(row["year"]),
            "annualInterest": float(row["annualInterest"]),
            "annualPrincipal": float(row["annualPrincipal"]),
            "annualInsurance": float(row["annualInsurance"]),
            "annualTotalPayment": float(row["annualTotalPayment"]),
            "remainingPrincipalYearEnd": float(row["remainingPrincipalYearEnd"]),
            "cumulativeInterestYearEnd": float(row["cumulativeInterestYearEnd"]),
            "cumulativeInsuranceYearEnd": float(row["cumulativeInsuranceYearEnd"]),
            "cumulativePrincipalYearEnd": float(row["cumulativePrincipalYearEnd"]),
        }
        
        result.append(data)
    
    return result

def transform_statistics(stats: Dict[str, Any]) -> Dict[str, Any]:
    """Transform statistics dictionary to the expected API response format"""
    # Create a dictionary with both enum-based and legacy string-based fields
    result = {
        # Enum-based fields
        "totalPrincipalPaid": stats["totalPrincipalPaid"],
        "totalInterestPaid": stats["totalInterestPaid"],
        "totalInsurancePaid": stats["totalInsurancePaid"],
        "totalLoanCosts": stats["totalLoanCosts"],
        "medianMonthlyPayment": stats["medianMonthlyPayment"],
    }
    
    # Add investment statistics if they exist
    if "startInvestment" in stats:
        result["startInvestment"] = stats["startInvestment"]
    
    if "endInvestmentBalance" in stats:
        result["endInvestmentBalance"] = stats["endInvestmentBalance"]
    
    if "netInvestmentGrowth" in stats:
        result["netInvestmentGrowth"] = stats["netInvestmentGrowth"]
    
    if "netFinalResult" in stats:
        result["netFinalResult"] = stats["netFinalResult"]
    
    if "netWorthEndOfTerm" in stats:
        result["netWorthEndOfTerm"] = stats["netWorthEndOfTerm"]
    
    # Add multi-client specific statistics if they exist
    if "debtRatio" in stats:
        result["debtRatio"] = stats["debtRatio"]
    
    if "debtRatioAssessment" in stats:
        result["debtRatioAssessment"] = stats["debtRatioAssessment"]
    
    if "perClientInsurancePaid" in stats:
        result["perClientInsurancePaid"] = stats["perClientInsurancePaid"]
    
    if "perClientDebtRatio" in stats:
        result["perClientDebtRatio"] = stats["perClientDebtRatio"]
    
    if "perClientDebtRatioAssessment" in stats:
        result["perClientDebtRatioAssessment"] = stats["perClientDebtRatioAssessment"]
    
    if "clientCount" in stats:
        result["clientCount"] = stats["clientCount"]
    
    return result

# API endpoints
@app.get("/")
async def root():
    return {"message": "LoanLogic API is running. Visit /docs for API documentation."}

@app.post("/api/calculate-loan")
async def calculate_loan(params: LoanParameters, modular_schedule: Optional[ModularLoanSchedule] = None):
    try:
        loan_type = params.loanType.value  # Convert enum to string
       
        # Convert modular schedule to the format expected by the calculation function
        schedule_tuples = []
        if modular_schedule and loan_type in ["bullet", "modular"]:
            schedule_tuples = [(item.month, item.amount) for item in modular_schedule.schedule]
        
        # Call the appropriate calculation function based on loan type
        if loan_type == "annuity":
            result_df = simuleer_klassieke_lening(
                eigen_inbreng=params.ownContribution,
                jaarlijkse_rentevoet=params.interestRate / 100,  # Convert from percentage to decimal
                looptijd_jaren=params.termYears,
                aankoopprijs=params.purchasePrice,
                uitstel_maanden=params.delayMonths,
                start_jaar_kalender=params.startYear,
                schuldsaldo_dekking_pct=params.insuranceCoveragePct,
                loan_type=loan_type
            )
        else:  # bullet or modular
            if not schedule_tuples:
                # For bullet loans, create a schedule with a single payment at the end
                if loan_type == "bullet":
                    last_month = params.termYears * 12
                    schedule_tuples = [(last_month, params.principal)]
                else:
                    raise HTTPException(
                        status_code=400,
                        detail="Modular loan schedule required for modular loans"
                    )
            
            result_df = simuleer_modulaire_lening(
                eigen_inbreng=params.ownContribution,
                jaarlijkse_rentevoet=params.interestRate / 100,  # Convert from percentage to decimal
                looptijd_jaren=params.termYears,
                aflossings_schema=schedule_tuples,
                aankoopprijs=params.purchasePrice,
                start_jaar_kalender=params.startYear,
                schuldsaldo_dekking_pct=params.insuranceCoveragePct,
                loan_type=loan_type
            )
        
        # Handle empty result
        if result_df.empty:
            return {
                "monthlyData": [],
                "annualData": [],
                "statistics": transform_statistics(bereken_statistieken(pd.DataFrame(), hoofdsom=(params.purchasePrice - params.ownContribution)))
            }
            
        # Process insurance simulation IDs if provided
        insurance_simulation_info = []
        if params.insuranceSimulationIds and len(params.insuranceSimulationIds) > 0:
            # For now, we'll just add a note about insurance simulations being used
            # In a complete implementation, we would:
            # 1. Fetch insurance simulations from database
            # 2. Calculate insurance premiums based on simulation parameters
            # 3. Apply those premiums to the result_df data
            
            # Add insurance simulation IDs to the result
            insurance_simulation_info = params.insuranceSimulationIds
        
        # Generate annual data
        annual_data = aggregeer_jaarlijks(result_df)

        # Calculate statistics
        statistics = bereken_statistieken(result_df, hoofdsom=(params.purchasePrice - params.ownContribution))
        
        # Transform data to the expected API response format
        response = {
            "monthlyData": transform_monthly_data(result_df),
            "annualData": transform_annual_data(annual_data),
            "statistics": transform_statistics(statistics)
        }
        
        # Add insurance simulation info if provided
        if insurance_simulation_info:
            response["insuranceSimulationIds"] = insurance_simulation_info
            
        return response
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/compare-loans")
async def compare_loans(request: ComparisonRequest):
    try:
        # Create ModularLoanSchedule with a single payment for bullet loans
        if request.alternativeLoan.loanType == LoanType.BULLET and not request.modularSchedule:
            print("Creating modular schedule for bullet loan")
            last_month = request.alternativeLoan.termYears * 12
            request.modularSchedule = ModularLoanSchedule(
                schedule=[ModularLoanScheduleItem(month=last_month, amount=request.alternativeLoan.principal)]
            )
        
        # Set insurance simulation IDs for the reference and alternative loans if provided
        if request.refInsuranceSimulationIds:
            request.referenceLoan.insuranceSimulationIds = request.refInsuranceSimulationIds
            
        if request.altInsuranceSimulationIds:
            request.alternativeLoan.insuranceSimulationIds = request.altInsuranceSimulationIds
        
        # Calculate reference loan
        ref_loan_result = await calculate_loan(request.referenceLoan)

        # Calculate alternative loan
        alt_loan_result = await calculate_loan(request.alternativeLoan, request.modularSchedule)

        # If investment parameters are provided, calculate investment simulation
        if request.investmentParams:
            # Convert monthly data to DataFrames
            ref_df = pd.DataFrame(ref_loan_result["monthlyData"])
            alt_df = pd.DataFrame(alt_loan_result["monthlyData"])
            
            # Prepare investment parameters
            start_capital = request.investmentParams.startCapital or 0
            annual_growth_rate = request.investmentParams.annualGrowthRate or 0
            monthly_growth_rate = (1 + annual_growth_rate / 100) ** (1/12) - 1
            
            # Run investment simulation
            investment_df, start_inv_alt, ref_invest_df, start_inv_ref = simuleer_met_investering(
                df_referentie=ref_df,
                df_alternatief=alt_df,
                eigen_inbreng_referentie=request.referenceOwnContribution,
                eigen_inbreng_alternatief=request.alternativeOwnContribution,
                start_kapitaal_totaal=start_capital,
                maandelijkse_groei_investering=monthly_growth_rate,
                invest_kapitaal_referentie=request.investmentParams.refInvestCapital or None,
                invest_kapitaal_alternatief=request.investmentParams.altInvestCapital or None
            )
            
            # Calculate minimum required growth rate
            alt_principal = request.alternativeLoan.principal
            alt_term_months = request.alternativeLoan.termYears * 12
            
           
            min_growth_rate= bereken_min_groei_voor_betaling(
                df_combined=investment_df,
                payment_maand=alt_term_months,
                payment_bedrag=alt_principal,
                start_investering=start_inv_alt
            )
            
            # Calculate comparison statistics
            ref_total_costs = ref_loan_result["statistics"]["totalLoanCosts"]
            alt_total_costs = alt_loan_result["statistics"]["totalLoanCosts"]
            total_cost_difference = ref_total_costs - alt_total_costs
            
            net_worth_end_of_term = 0
            if not investment_df.empty and "netWorth" in investment_df.columns:
                net_worth_end_of_term = investment_df["netWorth"].iloc[-1]
            
            # Return complete comparison result
            return {
                "referenceLoan": ref_loan_result,
                "alternativeLoan": alt_loan_result,
                "investmentSimulation": transform_monthly_data(investment_df),
                "minimumRequiredGrowthRate": min_growth_rate * 100 if min_growth_rate is not None else None,  # Convert to percentage
                "comparisonStats": {
                    "totalCostDifference": total_cost_difference,
                    "netWorthEndOfTerm": net_worth_end_of_term
                }
            }
        else:
            # Return basic comparison without investment simulation
            return {
                "referenceLoan": ref_loan_result,
                "alternativeLoan": alt_loan_result
            }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Add this function to help debug CORS issues
@app.options("/{path:path}")
async def options_route(path: str):
    return {"success": True}

# Run the application with uvicorn when executed directly
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

# Import routers - Must be after FastAPI initialization
from .multi_client_loan import router as multi_client_router

# Include routers
app.include_router(multi_client_router, prefix="/api")