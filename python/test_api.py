import requests
import json

# Base URL for the API
API_URL = "http://localhost:8000"

def test_calculate_loan_annuity():
    """Test the /api/calculate-loan endpoint with an annuity loan"""
    url = f"{API_URL}/api/calculate-loan"
    
    # Loan parameters for an annuity loan
    payload = {
        "loanType": "annuity",
        "principal": 500000,
        "interestRate": 3.5,
        "termYears": 30,
        "ownContribution": 100000,
        "purchasePrice": 825000,
        "delayMonths": 0,
        "startYear": 2025,
        "insuranceCoveragePct": 1.0
    }
    
    try:
        response = requests.post(url, json={"params": payload})
        response.raise_for_status()  # Raise exception for HTTP errors
        
        result = response.json()
        
        # Verify the response structure
        assert "monthlyData" in result, "Response missing monthlyData"
        assert "annualData" in result, "Response missing annualData"
        assert "statistics" in result, "Response missing statistics"
        
        # Verify we have data for all months
        assert len(result["monthlyData"]) == 30 * 12, "Monthly data does not match expected term length"
        
        # Verify we have data for all years
        assert len(result["annualData"]) == 30, "Annual data does not match expected term length"
        
        # Print some summary info
        print("\nAnnuity Loan Calculation:")
        print(f"Monthly Payment: €{result['monthlyData'][0]['totalMonthlyPayment']:.2f}")
        print(f"Total Interest Paid: €{result['statistics']['totalInterestPaid']:.2f}")
        print(f"Total Insurance Paid: €{result['statistics']['totalInsurancePaid']:.2f}")
        print(f"Total Loan Costs: €{result['statistics']['totalLoanCosts']:.2f}")
        
        print("Annuity loan calculation test passed!")
        return result
    
    except Exception as e:
        print(f"Error testing annuity loan calculation: {e}")
        return None

def test_calculate_loan_bullet():
    """Test the /api/calculate-loan endpoint with a bullet loan"""
    url = f"{API_URL}/api/calculate-loan"
    
    # Loan parameters for a bullet loan
    payload = {
        "loanType": "bullet",
        "principal": 500000,
        "interestRate": 3.5,
        "termYears": 30,
        "ownContribution": 100000,
        "purchasePrice": 825000,
        "startYear": 2025,
        "insuranceCoveragePct": 1.0
    }
    
    # For a bullet loan, we need to provide a payment schedule
    # with a single payment at the end of the term
    modular_schedule = {
        "schedule": [
            {"month": 30 * 12, "amount": 500000}
        ]
    }
    
    try:
        response = requests.post(
            url, 
            json={"params": payload, "modularSchedule": modular_schedule}
        )
        response.raise_for_status()  # Raise exception for HTTP errors
        
        result = response.json()
        
        # Verify the response structure
        assert "monthlyData" in result, "Response missing monthlyData"
        assert "annualData" in result, "Response missing annualData"
        assert "statistics" in result, "Response missing statistics"
        
        # Verify we have data for all months
        assert len(result["monthlyData"]) == 30 * 12, "Monthly data does not match expected term length"
        
        # Print some summary info
        print("\nBullet Loan Calculation:")
        print(f"Monthly Interest Payment: €{result['monthlyData'][0]['interest']:.2f}")
        print(f"Final Balloon Payment: €{result['monthlyData'][-1]['principalPayment']:.2f}")
        print(f"Total Interest Paid: €{result['statistics']['totalInterestPaid']:.2f}")
        print(f"Total Insurance Paid: €{result['statistics']['totalInsurancePaid']:.2f}")
        print(f"Total Loan Costs: €{result['statistics']['totalLoanCosts']:.2f}")
        
        print("Bullet loan calculation test passed!")
        return result
    
    except Exception as e:
        print(f"Error testing bullet loan calculation: {e}")
        return None

def test_modular_loan():
    """Test the /api/calculate-loan endpoint with a modular loan"""
    url = f"{API_URL}/api/calculate-loan"
    
    # Loan parameters for a modular loan
    payload = {
        "loanType": "modular",
        "principal": 500000,
        "interestRate": 3.5,
        "termYears": 30,
        "ownContribution": 100000,
        "purchasePrice": 825000,
        "startYear": 2025,
        "insuranceCoveragePct": 1.0
    }
    
    # Create a modular payment schedule with payments every 5 years
    schedule = []
    for year in range(5, 31, 5):
        schedule.append({"month": year * 12, "amount": 100000})
    
    modular_schedule = {
        "schedule": schedule
    }
    print(modular_schedule)
    try:
        response = requests.post(
            url, 
            json={"params": payload, "modular_schedule": modular_schedule}
        )
        print(response.text)
        response.raise_for_status()  # Raise exception for HTTP errors
        
        result = response.json()
        
        # Verify the response structure
        assert "monthlyData" in result, "Response missing monthlyData"
        assert "annualData" in result, "Response missing annualData"
        assert "statistics" in result, "Response missing statistics"
        
        # Verify payment schedule is applied correctly
        for item in schedule:
            month = item["month"] - 1  # Zero-based index
            payment = result["monthlyData"][month]["principalPayment"]
            assert abs(payment - item["amount"]) < 0.01, f"Payment at month {item['month']} doesn't match schedule"
        
        # Print some summary info
        print("\nModular Loan Calculation:")
        print(f"First Payment Month: {schedule[0]['month']}, Amount: €{schedule[0]['amount']:.2f}")
        print(f"Total Interest Paid: €{result['statistics']['totalInterestPaid']:.2f}")
        print(f"Total Insurance Paid: €{result['statistics']['totalInsurancePaid']:.2f}")
        print(f"Total Loan Costs: €{result['statistics']['totalLoanCosts']:.2f}")
        
        print("Modular loan calculation test passed!")
        return result
    
    except Exception as e:
        print(f"Error testing modular loan calculation: {e}")
        return None

def test_compare_loans():
    """Test the /api/compare-loans endpoint"""
    url = f"{API_URL}/api/compare-loans"
    
    # Create a comparison request with an annuity reference loan and a bullet alternative loan
    payload = {
        "referenceLoan": {
            "loanType": "annuity",
            "principal": 500000,
            "interestRate": 3.5,
            "termYears": 30,
            "ownContribution": 100000,
            "purchasePrice": 825000,
            "delayMonths": 0,
            "startYear": 2025,
            "insuranceCoveragePct": 1.0
        },
        "alternativeLoan": {
            "loanType": "bullet",
            "principal": 500000,
            "interestRate": 3.0,  # Lower interest rate
            "termYears": 30,
            "ownContribution": 100000,
            "purchasePrice": 825000,
            "startYear": 2025,
            "insuranceCoveragePct": 1.0
        },
        "referenceOwnContribution": 100000,
        "alternativeOwnContribution": 100000,
        "investmentParams": {
            "startCapital": 120000,
            "annualGrowthRate": 8.0
        },
        "modularSchedule": {
            "schedule": [
                {"month": 20 * 12, "amount": 250000},
                {"month": 30 * 12, "amount": 250000},
            ]
        }
    }
    
    try:
        response = requests.post(url, json=payload)
        response.raise_for_status()  # Raise exception for HTTP errors
        
        result = response.json()
        
        # Verify the response structure
        assert "referenceLoan" in result, "Response missing referenceLoan"
        assert "alternativeLoan" in result, "Response missing alternativeLoan"
        assert "investmentSimulation" in result, "Response missing investmentSimulation"
        assert "minimumRequiredGrowthRate" in result, "Response missing minimumRequiredGrowthRate"
        assert "comparisonStats" in result, "Response missing comparisonStats"
        
        # Print some summary info
        print("\nLoan Comparison:")
        print(f"Reference Loan Monthly Payment: €{result['referenceLoan']['monthlyData'][0]['totalMonthlyPayment']:.2f}")
        print(f"Alternative Loan Monthly Interest: €{result['alternativeLoan']['monthlyData'][0]['interest']:.2f}")
        print(f"Total Cost Difference: €{result['comparisonStats']['totalCostDifference']:.2f}")
        print(f"Net Worth at End of Term: €{result['comparisonStats']['netWorthEndOfTerm']:.2f}")
        print(f"Minimum Required Growth Rate: {result['minimumRequiredGrowthRate']:.2f}%")
        
        print("Loan comparison test passed!")
        return result
    
    except Exception as e:
        print(f"Error testing loan comparison: {e}")
        return None

if __name__ == "__main__":
    print("Testing LoanLogic API...")
    
    # Run the tests
    #test_calculate_loan_annuity()
    #test_calculate_loan_bullet()
    #test_modular_loan()
    test_compare_loans()
    
    print("\nAll tests completed!")
