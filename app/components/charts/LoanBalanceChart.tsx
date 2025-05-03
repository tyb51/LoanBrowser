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

interface LoanBalanceChartProps {
  data: MonthlyLoanData[];
  title?: string;
  showMonthly?: boolean;
}

export function LoanBalanceChart({ 
  data, 
  title = 'Loan Balance Over Time',
  showMonthly = false
}: LoanBalanceChartProps) {
  // Filter to yearly data points to avoid overcrowding the chart
  const filteredData = showMonthly 
    ? data 
    : data.filter(d => d.Maand % 12 === 0 || d.Maand === 1);
  
  // Format labels based on frequency (month or year)
  const labels = filteredData.map(d => 
    showMonthly 
      ? `${d.Jaar}-${d.Maand.toString().padStart(2, '0')}` 
      : `Year ${d.Jaar}`
  );
  
  const chartData = {
    labels,
    datasets: [
      {
        label: 'Remaining Principal',
        data: filteredData.map(d => d['Resterend Kapitaal']),
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
      },
      {
        label: 'Cumulative Interest',
        data: filteredData.map(d => d['Cumulatief Rente Betaald']),
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      },
      {
        label: 'Cumulative Insurance',
        data: filteredData.map(d => d['Cumulatief SSV Betaald']),
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
