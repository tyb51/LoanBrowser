"use client";

import React from 'react';
import { InvestmentSimulationData } from '@/app/types/loan';

interface InvestmentSimulationTableProps {
  data: InvestmentSimulationData[];
  minimumRequiredGrowthRate?: number;
  netWorthEndOfTerm?: number;
  title?: string;
}

export function InvestmentSimulationTable({
  data,
  minimumRequiredGrowthRate,
  netWorthEndOfTerm,
  title = 'Investment Simulation Results'
}: InvestmentSimulationTableProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(2)}%`;
  };

  // Get data at specific intervals for a summary view
  const getDataAtIntervals = (intervalMonths: number) => {
    const result: InvestmentSimulationData[] = [];
    const years = Math.ceil(data.length / 12);
    
    for (let year = 1; year <= years; year++) {
      const monthIndex = year * intervalMonths - 1;
      if (monthIndex < data.length) {
        result.push(data[monthIndex]);
      }
    }
    
    // Always include the last data point
    if (result.length > 0 && result[result.length - 1] !== data[data.length - 1]) {
      result.push(data[data.length - 1]);
    }
    
    return result;
  };

  // Get data at yearly intervals
  const yearlyData = getDataAtIntervals(12);

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-medium mb-4">{title}</h3>
      
      {/* Summary stats */}
      {(minimumRequiredGrowthRate !== undefined || netWorthEndOfTerm !== undefined) && (
        <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {minimumRequiredGrowthRate !== undefined && (
            <div className="bg-blue-50 p-4 rounded-md">
              <h4 className="text-sm font-medium text-blue-700">Minimum Required Growth Rate</h4>
              <p className="text-2xl font-bold text-blue-800 mt-1">{formatPercentage(minimumRequiredGrowthRate)}</p>
              <p className="text-xs text-blue-600 mt-1">
                Minimum annual return needed to cover the final loan payment
              </p>
            </div>
          )}
          
          {netWorthEndOfTerm !== undefined && (
            <div className="bg-green-50 p-4 rounded-md">
              <h4 className="text-sm font-medium text-green-700">Net Worth at End of Term</h4>
              <p className="text-2xl font-bold text-green-800 mt-1">{formatCurrency(netWorthEndOfTerm)}</p>
              <p className="text-xs text-green-600 mt-1">
                Final investment value minus remaining loan balance
              </p>
            </div>
          )}
        </div>
      )}
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Year
              </th>
              <th scope="col" className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Investment Balance
              </th>
              <th scope="col" className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Loan Balance
              </th>
              <th scope="col" className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Net Worth
              </th>
              <th scope="col" className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Monthly Difference
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {yearlyData.map((row) => (
              <tr key={row.Maand}>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                  {row.Jaar}
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 text-right">
                  {formatCurrency(row["Saldo Investering"])}
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 text-right">
                  {formatCurrency(row["Resterend Kapitaal"])}
                </td>
                <td className={`px-3 py-2 whitespace-nowrap text-sm font-medium text-right ${
                  row["Netto Vermogen (Invest - Schuld)"] >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatCurrency(row["Netto Vermogen (Invest - Schuld)"])}
                </td>
                <td className={`px-3 py-2 whitespace-nowrap text-sm font-medium text-right ${
                  row["Maandelijkse Bijdrage/Onttrekking"] >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatCurrency(row["Maandelijkse Bijdrage/Onttrekking"])}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
