"use client";

import React from 'react';
import { LoanCalculationResult } from '@/app/types/loan';

interface LoanComparisonTableProps {
  referenceLoan: LoanCalculationResult;
  alternativeLoan: LoanCalculationResult;
  referenceName?: string;
  alternativeName?: string;
  title?: string;
}

export function LoanComparisonTable({
  referenceLoan,
  alternativeLoan,
  referenceName = 'Reference Loan',
  alternativeName = 'Alternative Loan',
  title = 'Loan Comparison'
}: LoanComparisonTableProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(value);
  };

  // Calculate differences
  const totalCostDifference = 
    alternativeLoan.statistics.totalLoanCosts - 
    referenceLoan.statistics.totalLoanCosts;
  
  const totalInterestDifference = 
    alternativeLoan.statistics.totalInterestPaid - 
    referenceLoan.statistics.totalInterestPaid;
  
  const totalInsuranceDifference = 
    alternativeLoan.statistics.totalInsurancePaid - 
    referenceLoan.statistics.totalInsurancePaid;
  
  const monthlyPaymentDifference = 
    alternativeLoan.statistics.medianMonthlyPayment - 
    referenceLoan.statistics.medianMonthlyPayment;

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-medium mb-4">{title}</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Metric
              </th>
              <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                {referenceName}
              </th>
              <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                {alternativeName}
              </th>
              <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Difference
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                Total Loan Costs (Interest + Insurance)
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                {formatCurrency(referenceLoan.statistics.totalLoanCosts)}
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                {formatCurrency(alternativeLoan.statistics.totalLoanCosts)}
              </td>
              <td className={`px-4 py-4 whitespace-nowrap text-sm font-medium text-right ${
                totalCostDifference < 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {formatCurrency(totalCostDifference)} {totalCostDifference < 0 ? '(less)' : '(more)'}
              </td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                Total Interest Paid
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                {formatCurrency(referenceLoan.statistics.totalInterestPaid)}
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                {formatCurrency(alternativeLoan.statistics.totalInterestPaid)}
              </td>
              <td className={`px-4 py-4 whitespace-nowrap text-sm font-medium text-right ${
                totalInterestDifference < 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {formatCurrency(totalInterestDifference)} {totalInterestDifference < 0 ? '(less)' : '(more)'}
              </td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                Total Insurance Premiums
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                {formatCurrency(referenceLoan.statistics.totalInsurancePaid)}
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                {formatCurrency(alternativeLoan.statistics.totalInsurancePaid)}
              </td>
              <td className={`px-4 py-4 whitespace-nowrap text-sm font-medium text-right ${
                totalInsuranceDifference < 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {formatCurrency(totalInsuranceDifference)} {totalInsuranceDifference < 0 ? '(less)' : '(more)'}
              </td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                Highest Monthly Payment
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                {formatCurrency(referenceLoan.statistics.medianMonthlyPayment)}
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                {formatCurrency(alternativeLoan.statistics.medianMonthlyPayment)}
              </td>
              <td className={`px-4 py-4 whitespace-nowrap text-sm font-medium text-right ${
                monthlyPaymentDifference < 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {formatCurrency(monthlyPaymentDifference)} {monthlyPaymentDifference < 0 ? '(less)' : '(more)'}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
