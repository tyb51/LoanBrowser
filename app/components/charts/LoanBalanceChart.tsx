"use client";

import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useTranslation } from 'react-i18next';
import { MonthlyLoanData, LoanDataField } from '@/app/types/loan';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface LoanBalanceChartProps {
  data: MonthlyLoanData[];
  title?: string;
  showMonthly?: boolean;
}

export function LoanBalanceChart({ 
  data, 
  title,
  showMonthly = false
}: LoanBalanceChartProps) {
  const { t, i18n } = useTranslation();
  
  // Use the provided title or default to translated title
  const chartTitle = title || t('charts.loanBalance');
  
  // Filter to yearly data points to avoid overcrowding the chart
  const filteredData = showMonthly 
    ? data 
    : data.filter(d => d[LoanDataField.MONTH] % 12 === 0 || d[LoanDataField.MONTH] === 1);
  
  // Format labels based on frequency (month or year)
  const labels = filteredData.map(d => 
    showMonthly 
      ? `${d[LoanDataField.YEAR]}-${d[LoanDataField.MONTH].toString().padStart(2, '0')}` 
      : `${t('tables.year')} ${d[LoanDataField.YEAR]}`
  );
  
  const chartData = {
    labels,
    datasets: [
      {
        label: t('charts.remainingPrincipal'),
        data: filteredData.map(d => d[LoanDataField.REMAINING_PRINCIPAL]),
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
      },
      {
        label: t('charts.cumulativeInterest'),
        data: filteredData.map(d => d[LoanDataField.CUMULATIVE_INTEREST_PAID]),
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      },
      {
        label: t('charts.cumulativeInsurance'),
        data: filteredData.map(d => d[LoanDataField.CUMULATIVE_INSURANCE_PAID]),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: !!chartTitle,
        text: chartTitle,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat(i18n.language, { style: 'currency', currency: 'EUR' }).format(context.parsed.y);
            }
            return label;
          }
        }
      }
    },
    scales: {
      y: {
        ticks: {
          callback: function(value: any) {
            return new Intl.NumberFormat(i18n.language, { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value);
          }
        }
      }
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <Line options={options} data={chartData} />
    </div>
  );
}
