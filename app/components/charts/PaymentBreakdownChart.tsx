"use client";

import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { AnnualLoanData } from '@/app/types/loan';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface PaymentBreakdownChartProps {
  data: AnnualLoanData[];
  title?: string;
}

export function PaymentBreakdownChart({ 
  data, 
  title = 'Annual Payment Breakdown'
}: PaymentBreakdownChartProps) {
  const chartData = {
    labels: data.map(d => `Year ${d.Jaar}`),
    datasets: [
      {
        label: 'Principal',
        data: data.map(d => d.Jaarlijkse_Kapitaalaflossing),
        backgroundColor: 'rgba(53, 162, 235, 0.8)',
      },
      {
        label: 'Interest',
        data: data.map(d => d.Jaarlijkse_Rente),
        backgroundColor: 'rgba(255, 99, 132, 0.8)',
      },
      {
        label: 'Insurance',
        data: data.map(d => d.Jaarlijkse_SSV),
        backgroundColor: 'rgba(75, 192, 192, 0.8)',
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
      x: {
        stacked: true,
      },
      y: {
        stacked: true,
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
      <Bar options={options} data={chartData} />
    </div>
  );
}
