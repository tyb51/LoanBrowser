"use client";

import React from 'react';
import { LoanStatistics } from '@/app/types/loan';

interface LoanStatisticsTableProps {
  statistics: LoanStatistics;
  title?: string;
}

export function LoanStatisticsTable({ 
  statistics, 
  title = 'Loan Statistics'
}: LoanStatisticsTableProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(value);
  };

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
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Value
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                Total Principal Paid
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                {formatCurrency(statistics['Totaal Kapitaal Betaald'])}
              </td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                Total Interest Paid
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                {formatCurrency(statistics['Totale Rente Betaald'])}
              </td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                Total Insurance Premiums
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                {formatCurrency(statistics['Totale SSV Premie Betaald'])}
              </td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                Total Loan Costs (Interest + Insurance)
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                {formatCurrency(statistics['Totale Kosten Lening (Rente + SSV)'])}
              </td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                Highest Monthly Payment
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                {formatCurrency(statistics['Hoogste Maandelijkse Uitgave Lening'])}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
