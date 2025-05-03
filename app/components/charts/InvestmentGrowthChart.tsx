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
import { InvestmentSimulationData } from '@/app/types/loan';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface InvestmentGrowthChartProps {
  data: InvestmentSimulationData[];
  title?: string;
  showMonthly?: boolean;
}

export function InvestmentGrowthChart({ 
  data, 
  title = 'Investment Growth & Net Worth',
  showMonthly = false
}: InvestmentGrowthChartProps) {
  // Filter to yearly data points to avoid overcrowding the chart
  const filteredData = showMonthly 
    ? data 
    : data.filter(d => d.month % 12 === 0 || d.month === 1);
  
  // Format labels
  const labels = filteredData.map(d => 
    showMonthly 
      ? `${d.year}-${d.month.toString().padStart(2, '0')}` 
      : `Year ${d.year}`
  );
  
  const chartData = {
    labels,
    datasets: [
      {
        label: 'Investment Balance',
        data: filteredData.map(d => d.investmentBalance),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
      },
      {
        label: 'Loan Balance',
        data: filteredData.map(d => d.remainingPrincipal),
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      },
      {
        label: 'Net Worth (Investment - Loan)',
        data: filteredData.map(d => d.netWorth),
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
        borderWidth: 2,
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
