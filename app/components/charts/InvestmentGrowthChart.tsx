"use client";

import React, { useState } from 'react';
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
import { useTranslation } from '@/app/i18n/client';


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
  referenceData?: InvestmentSimulationData[];
  alternativeData?: InvestmentSimulationData[];
  title?: string;
  showMonthly?: boolean;
  showSeparateInvestments?: boolean;
}

export function InvestmentGrowthChart({ 
  data, 
  referenceData,
  alternativeData,
  title,
  showMonthly = false,
  showSeparateInvestments = false
}: InvestmentGrowthChartProps) {
  const { t } =  useTranslation();
  const [showInvestmentBalance, setShowInvestmentBalance] = useState(true);
  const [showLoanBalance, setShowLoanBalance] = useState(true);
  const [showNetWorth, setShowNetWorth] = useState(true);
  const [showReferenceData, setShowReferenceData] = useState(showSeparateInvestments);
  const [showAlternativeData, setShowAlternativeData] = useState(showSeparateInvestments);
  const [showCombinedData, setShowCombinedData] = useState(!showSeparateInvestments);

  // Filter to yearly data points to avoid overcrowding the chart
  const filterDataByTimeframe = (dataToFilter: InvestmentSimulationData[]) => {
    return showMonthly 
      ? dataToFilter 
      : dataToFilter.filter(d => d.month % 12 === 0 || d.month === 1);
  };

  const filteredData = filterDataByTimeframe(data);
  const filteredReferenceData = referenceData ? filterDataByTimeframe(referenceData) : [];
  const filteredAlternativeData = alternativeData ? filterDataByTimeframe(alternativeData) : [];
  
  // Format labels
  const getLabels = (dataToLabel: InvestmentSimulationData[]) => {
    return dataToLabel.map(d => 
      showMonthly 
        ? `${d.year}-${d.month.toString().padStart(2, '0')}` 
        : `Year ${d.year}`
    );
  };
  
  const labels = getLabels(filteredData);
  
  // Prepare datasets
  const datasets = [];
  
  // Combined Data (Original)
  if (showCombinedData) {
    if (showInvestmentBalance) {
      datasets.push({
        label: t('charts.investmentBalance'),
        data: filteredData.map(d => d.investmentBalance),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
      });
    }
    
    if (showLoanBalance) {
      datasets.push({
        label: t('charts.loanBalance'),
        data: filteredData.map(d => d.remainingPrincipal),
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      });
    }
    
    if (showNetWorth) {
      datasets.push({
        label: t('charts.netWorth'),
        data: filteredData.map(d => d.netWorth),
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
        borderWidth: 2,
      });
    }
  }
  
  // Reference Loan Data
  if (showReferenceData && referenceData) {
    if (showInvestmentBalance) {
      datasets.push({
        label: `${t('comparison.referenceLoan')} - ${t('charts.investmentBalance')}`,
        data: filteredReferenceData.map(d => d.investmentBalance),
        borderColor: 'rgb(65, 171, 171)',
        backgroundColor: 'rgba(65, 171, 171, 0.5)',
        borderDash: [5, 5],
      });
    }
    
    if (showLoanBalance) {
      datasets.push({
        label: `${t('comparison.referenceLoan')} - ${t('charts.loanBalance')}`,
        data: filteredReferenceData.map(d => d.remainingPrincipal),
        borderColor: 'rgb(235, 89, 122)',
        backgroundColor: 'rgba(235, 89, 122, 0.5)',
        borderDash: [5, 5],
      });
    }
    
    if (showNetWorth) {
      datasets.push({
        label: `${t('comparison.referenceLoan')} - ${t('charts.netWorth')}`,
        data: filteredReferenceData.map(d => d.netWorth),
        borderColor: 'rgb(43, 142, 215)',
        backgroundColor: 'rgba(43, 142, 215, 0.5)',
        borderDash: [5, 5],
        borderWidth: 2,
      });
    }
  }
  
  // Alternative Loan Data
  if (showAlternativeData && alternativeData) {
    if (showInvestmentBalance) {
      datasets.push({
        label: `${t('comparison.alternativeLoan')} - ${t('charts.investmentBalance')}`,
        data: filteredAlternativeData.map(d => d.investmentBalance),
        borderColor: 'rgb(95, 201, 134)',
        backgroundColor: 'rgba(95, 201, 134, 0.5)',
        borderDash: [3, 3],
      });
    }
    
    if (showLoanBalance) {
      datasets.push({
        label: `${t('comparison.alternativeLoan')} - ${t('charts.loanBalance')}`,
        data: filteredAlternativeData.map(d => d.remainingPrincipal),
        borderColor: 'rgb(255, 129, 102)',
        backgroundColor: 'rgba(255, 129, 102, 0.5)',
        borderDash: [3, 3],
      });
    }
    
    if (showNetWorth) {
      datasets.push({
        label: `${t('comparison.alternativeLoan')} - ${t('charts.netWorth')}`,
        data: filteredAlternativeData.map(d => d.netWorth),
        borderColor: 'rgb(83, 122, 255)',
        backgroundColor: 'rgba(83, 122, 255, 0.5)',
        borderDash: [3, 3],
        borderWidth: 2,
      });
    }
  }
  
  const chartData = {
    labels,
    datasets,
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

  const toggleButton = (state: boolean, setState: React.Dispatch<React.SetStateAction<boolean>>, label: string) => (
    <button
      className={`px-3 py-1 text-xs rounded-md border ${state ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`}
      onClick={() => setState(!state)}
    >
      {label}
    </button>
  );

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <div className="mb-4 flex flex-wrap gap-2">
        <div className="flex gap-2 mr-6">
          <span className="text-xs font-medium text-gray-700 self-center">Data Series:</span>
          {toggleButton(showInvestmentBalance, setShowInvestmentBalance, t('charts.investmentBalance'))}
          {toggleButton(showLoanBalance, setShowLoanBalance, t('charts.loanBalance'))}
          {toggleButton(showNetWorth, setShowNetWorth, t('charts.netWorth'))}
        </div>
        
        {(referenceData || alternativeData) && (
          <div className="flex gap-2">
            <span className="text-xs font-medium text-gray-700 self-center">Scenarios:</span>
            {toggleButton(showCombinedData, setShowCombinedData, "Combined")}
            {referenceData && toggleButton(showReferenceData, setShowReferenceData, t('comparison.referenceLoan'))}
            {alternativeData && toggleButton(showAlternativeData, setShowAlternativeData, t('comparison.alternativeLoan'))}
          </div>
        )}
      </div>
      
      <Line options={options} data={chartData} />
    </div>
  );
}
