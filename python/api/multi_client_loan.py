from fastapi import APIRouter, HTTPException
from typing import Dict, List, Optional, Any
from pydantic import BaseModel
import pandas as pd

from .main import (
    LoanParameters, 
    ModularLoanSchedule,
    transform_monthly_data,
    transform_annual_data,
    transform_statistics
)

from multi_client_calculation import (
    simuleer_klassieke_lening_multi_client,
    simuleer_modulaire_lening_multi_client,
    bereken_statistieken_multi_client,
    aggregeer_jaarlijks
)

router = APIRouter()

class ClientSummary(BaseModel):
    totalCurrentCapital: float
    totalCurrentDebt: float
    totalMonthlyIncome: float
    netWorth: float
    clientCount: int
    individualCount: int
    companyCount: int

class MultiClientLoanRequest(BaseModel):
    params: LoanParameters
    clientIds: List[str]
    clientSummary: ClientSummary
    modularSchedule: Optional[ModularLoanSchedule] = None
    insuranceSimulationIds: Optional[List[str]] = None

@router.post("/calculate-multi-client-loan")
async def calculate_multi_client_loan(request: MultiClientLoanRequest):
    try:
        params = request.params
        client_summary = request.clientSummary
        loan_type = params.loanType.value  # Convert enum to string
        
        # Set insurance simulation IDs if provided
        if request.insuranceSimulationIds:
            params.insuranceSimulationIds = request.insuranceSimulationIds
        
        # Use client summary for calculations
        monthly_income = client_summary.totalMonthlyIncome
        
        # Convert modular schedule to the format expected by the calculation function
        schedule_tuples = []
        if request.modularSchedule and loan_type in ["bullet", "modular"]:
            schedule_tuples = [(item.month, item.amount) for item in request.modularSchedule.schedule]
        
        # Call the appropriate calculation function based on loan type, incorporating client info
        if loan_type == "annuity":
            result_df = simuleer_klassieke_lening_multi_client(
                eigen_inbreng=params.ownContribution,
                jaarlijkse_rentevoet=params.interestRate / 100,  # Convert from percentage to decimal
                looptijd_jaren=params.termYears,
                aankoopprijs=params.purchasePrice,
                uitstel_maanden=params.delayMonths,
                start_jaar_kalender=params.startYear,
                schuldsaldo_dekking_pct=params.insuranceCoveragePct,
                loan_type=loan_type,
                # Add client-specific parameters
                monthly_income=monthly_income,
                client_count=client_summary.clientCount
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
            
            result_df = simuleer_modulaire_lening_multi_client(
                eigen_inbreng=params.ownContribution,
                jaarlijkse_rentevoet=params.interestRate / 100,  # Convert from percentage to decimal
                looptijd_jaren=params.termYears,
                aflossings_schema=schedule_tuples,
                aankoopprijs=params.purchasePrice,
                start_jaar_kalender=params.startYear,
                schuldsaldo_dekking_pct=params.insuranceCoveragePct,
                loan_type=loan_type,
                # Add client-specific parameters
                monthly_income=monthly_income,
                client_count=client_summary.clientCount
            )
        
        # Handle empty result
        if result_df.empty:
            return {
                "monthlyData": [],
                "annualData": [],
                "statistics": transform_statistics(bereken_statistieken_multi_client(pd.DataFrame(), hoofdsom=(params.purchasePrice - params.ownContribution)))
            }
        
        # Generate annual data
        annual_data = aggregeer_jaarlijks(result_df)

        # Calculate statistics with multi-client support
        statistics = bereken_statistieken_multi_client(
            result_df, 
            hoofdsom=(params.purchasePrice - params.ownContribution),
            monthly_income=monthly_income,
            client_count=client_summary.clientCount
        )
        
        # Calculate debt ratio based on total monthly income
        if monthly_income > 0:
            first_payment = result_df.iloc[0]["totalMonthlyPayment"] if not result_df.empty else 0
            debt_ratio = (first_payment / monthly_income) * 100
            statistics["debtRatio"] = debt_ratio
            
            # Debt ratio assessment
            if debt_ratio <= 33:
                statistics["debtRatioAssessment"] = "good"
            elif debt_ratio <= 43:
                statistics["debtRatioAssessment"] = "moderate"
            else:
                statistics["debtRatioAssessment"] = "high"
        
        # Transform data to the expected API response format
        return {
            "monthlyData": transform_monthly_data(result_df),
            "annualData": transform_annual_data(annual_data),
            "statistics": transform_statistics(statistics),
            "clientSummary": {
                "clientCount": client_summary.clientCount,
                "individualCount": client_summary.individualCount,
                "companyCount": client_summary.companyCount,
                "totalMonthlyIncome": client_summary.totalMonthlyIncome,
                "netWorth": client_summary.netWorth
            }
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
