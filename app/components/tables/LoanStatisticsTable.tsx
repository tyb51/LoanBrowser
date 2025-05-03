"use client";

import React from 'react';
import { useTranslation } from 'react-i18next';
import { LoanStatistics, LoanStatisticsField } from '@/app/types/loan';

interface LoanStatisticsTableProps {
  statistics: LoanStatistics;
  title?: string;
}

export function LoanStatisticsTable({ 
  statistics, 
  title
}: LoanStatisticsTableProps) {
  const { t, i18n } = useTranslation();
  
  // Use the provided title or default to translated title
  const tableTitle = title || t('tables.loanStatistics');
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat(i18n.language, { style: 'currency', currency: 'EUR' }).format(value);
  };

  // Define the rows to display with translation keys
  const rows = [
    { field: LoanStatisticsField.TOTAL_PRINCIPAL_PAID, label: 'tables.totalPrincipalPaid' },
    { field: LoanStatisticsField.TOTAL_INTEREST_PAID, label: 'tables.totalInterestPaid' },
    { field: LoanStatisticsField.TOTAL_INSURANCE_PAID, label: 'tables.totalInsurancePremiums' },
    { field: LoanStatisticsField.TOTAL_LOAN_COSTS, label: 'tables.totalLoanCosts' },
    { field: LoanStatisticsField.HIGHEST_MONTHLY_PAYMENT, label: 'tables.highestMonthlyPayment' },
  ];

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-medium mb-4">{tableTitle}</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('tables.metric')}
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('tables.value')}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {rows.map(row => (
              <tr key={row.field}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {t(row.label)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                  {formatCurrency(statistics[row.field])}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
