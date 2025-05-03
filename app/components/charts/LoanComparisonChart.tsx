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
import { MonthlyLoanData } from '@/app/types/loan';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface LoanComparisonChartProps {
  referenceLoanData: MonthlyLoanData[];
  alternativeLoanData: MonthlyLoanData[];
  title?: string;
  referenceName?: string;
  alternativeName?: string;
  showMonthly?: boolean;
}

export function LoanComparisonChart({ 
  referenceLoanData, 
  alternativeLoanData,
  title = 'Loan Balance Comparison',
  referenceName = 'Reference Loan',
  alternativeName = 'Alternative Loan',
  showMonthly = false
}: LoanComparisonChartProps) {
  // Find the maximum number of months to display
  const maxMonths = Math.max(
    referenceLoanData.length > 0 ? referenceLoanData[referenceLoanData.length - 1].month : 0,
    alternativeLoanData.length > 0 ? alternativeLoanData[alternativeLoanData.length - 1].month : 0
  );
  
  // Filter to yearly data points to avoid overcrowding the chart
  const filterData = (data: MonthlyLoanData[]) => 
    showMonthly 
      ? data 
      : data.filter(d => d.month % 12 === 0 || d.month === 1);
      
  const filteredRefData = filterData(referenceLoanData);
  const filteredAltData = filterData(alternativeLoanData);
  
  // Generate all necessary time points
  const timePoints = showMonthly 
    ? Array.from({ length: maxMonths }, (_, i) => i + 1)
    : Array.from({ length: Math.ceil(maxMonths / 12) }, (_, i) => (i * 12) + 1);
  
  // Format labels
  const labels = timePoints.map(month => {
    const year = Math.ceil(month / 12);
    return showMonthly ? `${year}-${(month % 12 || 12).toString().padStart(2, '0')}` : `Year ${year}`;
  });
  
  // Helper function to find data point for a specific month
  const findDataPoint = (data: MonthlyLoanData[], month: number) => {
    // If showing monthly, get exact match
    if (showMonthly) {
      return data.find(d => d.month === month);
    }
    
    // If showing yearly, find the closest data point
    const yearData = data.filter(d => Math.abs(d.month - month) <= 6);
    if (yearData.length === 0) return undefined;
    
    return yearData.reduce((prev, curr) => 
      Math.abs(curr.month - month) < Math.abs(prev.month - month) ? curr : prev
    );
  };
  
  // Prepare chart data
  const chartData = {
    labels,
    datasets: [
      {
        label: `${referenceName} - Remaining Principal`,
        data: timePoints.map(month => {
          const dataPoint = findDataPoint(filteredRefData, month);
          return dataPoint ? dataPoint.remainingPrincipal : null;
        }),
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
      },
      {
        label: `${alternativeName} - Remaining Principal`,
        data: timePoints.map(month => {
          const dataPoint = findDataPoint(filteredAltData, month);
          return dataPoint ? dataPoint.remainingPrincipal: null;
        }),
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      },
      {
        label: `${referenceName} - Total Cost`,
        data: timePoints.map(month => {
          const dataPoint = findDataPoint(filteredRefData, month);
          return dataPoint 
            ? dataPoint.cumulativeInterestPaid + dataPoint.cumulativeInsurancePaid 
            : null;
        }),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        borderDash: [5, 5],
      },
      {
        label: `${alternativeName} - Total Cost`,
        data: timePoints.map(month => {
          const dataPoint = findDataPoint(filteredAltData, month);
          return dataPoint 
            ? dataPoint.cumulativeInterestPaid + dataPoint.cumulativeInsurancePaid 
            : null;
        }),
        borderColor: 'rgb(255, 159, 64)',
        backgroundColor: 'rgba(255, 159, 64, 0.5)',
        borderDash: [5, 5],
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
        display: !!title,
        text: title,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(context.parsed.y);
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
            return new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value);
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
