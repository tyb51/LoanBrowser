"use client";

import { useState } from 'react';
import { 
  LoanParameters, 
  LoanType, 
  LoanCalculationResult, 
  ComparisonResult,
  ModularLoanSchedule
} from '../types/loan';
import * as backendApi from '../services/backendLoanApi';

export default function ApiTestPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Example loan parameters for testing
  const testAnnuityLoan: LoanParameters = {
    loanType: LoanType.ANNUITY,
    principal: 500000,
    interestRate: 3.5,
    termYears: 30,
    ownContribution: 100000,
    purchasePrice: 825000,
    delayMonths: 0,
    startYear: 2025,
    insuranceCoveragePct: 1.0
  };

  const testBulletLoan: LoanParameters = {
    loanType: LoanType.BULLET,
    principal: 500000,
    interestRate: 3.0,
    termYears: 30,
    ownContribution: 50000,
    purchasePrice: 825000,
    startYear: 2025,
    insuranceCoveragePct: 1.0
  };

  const testModularSchedule: ModularLoanSchedule = {
    schedule: [
      { month: 360, amount: 500000 } // single payment at the end
    ]
  };

  // Test the calculateLoan API with an annuity loan
  const testCalculateAnnuityLoan = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await backendApi.calculateLoan(testAnnuityLoan);
      setResult({
        type: 'Annuity Loan Calculation',
        data
      });
    } catch (err: any) {
      setError(`Failed to calculate annuity loan: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Test the calculateLoan API with a bullet loan
  const testCalculateBulletLoan = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await backendApi.calculateLoan(testBulletLoan, testModularSchedule);
      setResult({
        type: 'Bullet Loan Calculation',
        data
      });
    } catch (err: any) {
      setError(`Failed to calculate bullet loan: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Test the compareLoans API
  const testCompareLoan = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await backendApi.compareLoans(
        testAnnuityLoan,
        testBulletLoan,
        100000,
        100000,
        { startCapital: 120000, annualGrowthRate: 8.0 },
        testModularSchedule
      );
      setResult({
        type: 'Loan Comparison',
        data
      });
    } catch (err: any) {
      setError(`Failed to compare loans: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">API Testing Page</h1>
      <p className="mb-4">
        This page tests the connection to the Python backend API.
        Make sure the API server is running on http://localhost:8000.
      </p>
      
      <div className="flex flex-wrap gap-4 mb-6">
        <button
          onClick={testCalculateAnnuityLoan}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:opacity-50"
        >
          Test Annuity Loan
        </button>
        
        <button
          onClick={testCalculateBulletLoan}
          disabled={loading}
          className="px-4 py-2 bg-green-600 text-white rounded-md disabled:opacity-50"
        >
          Test Bullet Loan
        </button>
        
        <button
          onClick={testCompareLoan}
          disabled={loading}
          className="px-4 py-2 bg-purple-600 text-white rounded-md disabled:opacity-50"
        >
          Test Loan Comparison
        </button>
      </div>
      
      {loading && (
        <div className="my-4 p-4 bg-gray-100 rounded-md">
          <p>Loading...</p>
        </div>
      )}
      
      {error && (
        <div className="my-4 p-4 bg-red-100 text-red-800 rounded-md">
          <h3 className="font-bold">Error</h3>
          <p>{error}</p>
        </div>
      )}
      
      {result && (
        <div className="my-4">
          <h2 className="text-xl font-bold mb-2">{result.type} Results</h2>
          
          {result.data && result.type === 'Annuity Loan Calculation' && (
            <div className="p-4 bg-blue-50 rounded-md">
              <h3 className="font-bold mb-2">Loan Statistics</h3>
              <div className="grid grid-cols-2 gap-2">
                <p>Monthly Payment:</p>
                <p className="font-mono">
                  €{result.data.monthlyData[0].totalMonthlyPayment.toFixed(2)}
                </p>
                
                <p>Total Principal:</p>
                <p className="font-mono">
                  €{result.data.statistics.totalPrincipalPaid.toFixed(2)}
                </p>
                
                <p>Total Interest:</p>
                <p className="font-mono">
                  €{result.data.statistics.totalInterestPaid.toFixed(2)}
                </p>
                
                <p>Total Insurance:</p>
                <p className="font-mono">
                  €{result.data.statistics.totalInsurancePaid.toFixed(2)}
                </p>
                
                <p>Total Loan Costs:</p>
                <p className="font-mono">
                  €{result.data.statistics.totalLoanCosts.toFixed(2)}
                </p>
              </div>
            </div>
          )}
          
          {result.data && result.type === 'Bullet Loan Calculation' && (
            <div className="p-4 bg-green-50 rounded-md">
              <h3 className="font-bold mb-2">Loan Statistics</h3>
              <div className="grid grid-cols-2 gap-2">
                <p>Monthly Interest:</p>
                <p className="font-mono">
                  €{result.data.monthlyData[0].interest.toFixed(2)}
                </p>
                
                <p>Final Balloon Payment:</p>
                <p className="font-mono">
                  €{result.data.monthlyData[result.data.monthlyData.length - 1].principalPayment.toFixed(2)}
                </p>
                
                <p>Total Interest:</p>
                <p className="font-mono">
                  €{result.data.statistics.totalInterestPaid.toFixed(2)}
                </p>
                
                <p>Total Insurance:</p>
                <p className="font-mono">
                  €{result.data.statistics.totalInsurancePaid.toFixed(2)}
                </p>
                
                <p>Total Loan Costs:</p>
                <p className="font-mono">
                  €{result.data.statistics.totalLoanCosts.toFixed(2)}
                </p>
              </div>
            </div>
          )}
          
          {result.data && result.type === 'Loan Comparison' && (
            <div className="p-4 bg-purple-50 rounded-md">
              <h3 className="font-bold mb-2">Comparison Results</h3>
              <div className="grid grid-cols-2 gap-2">
                <p>Reference Monthly Payment:</p>
                <p className="font-mono">
                  €{result.data.referenceLoan.monthlyData[0].totalMonthlyPayment.toFixed(2)}
                </p>
                
                <p>Alternative Monthly Interest:</p>
                <p className="font-mono">
                  €{result.data.alternativeLoan.monthlyData[0].interest.toFixed(2)}
                </p>
                
                <p>Total Cost Difference:</p>
                <p className="font-mono">
                  €{result.data.comparisonStats.totalCostDifference.toFixed(2)}
                </p>
                
                <p>Net Worth at End of Term:</p>
                <p className="font-mono">
                  €{result.data.comparisonStats.netWorthEndOfTerm.toFixed(2)}
                </p>
                
                <p>Minimum Required Growth Rate:</p>
                <p className="font-mono">
                  {result.data.minimumRequiredGrowthRate.toFixed(2)}%
                </p>
              </div>
            </div>
          )}
          
          <div className="mt-6">
            <h3 className="font-bold mb-2">Raw Response Data</h3>
            <details>
              <summary className="cursor-pointer text-blue-600">Show/Hide</summary>
              <pre className="p-4 bg-gray-100 rounded-md mt-2 overflow-auto max-h-96">
                {JSON.stringify(result.data, null, 2)}
              </pre>
            </details>
          </div>
        </div>
      )}
    </div>
  );
}
