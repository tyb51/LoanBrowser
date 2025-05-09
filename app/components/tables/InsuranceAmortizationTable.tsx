"use client";

import React, { useState } from 'react';
import { useTranslation } from '@/app/i18n/client';
import { InsuranceAmortizationEntry } from '@/app/services/insuranceSimulationApi';

interface InsuranceAmortizationTableProps {
  data: InsuranceAmortizationEntry[];
  title?: string;
  coverageAmount?: number;
  totalPremium?: number;
  monthlyPremium?: number;
}

export function InsuranceAmortizationTable({ 
  data, 
  title = "Insurance Amortization Schedule",
  coverageAmount,
  totalPremium,
  monthlyPremium
}: InsuranceAmortizationTableProps) {
  const { t } = useTranslation();
  const [showMonthly, setShowMonthly] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(12);
  
  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(value);
  };
  
  // Calculate total number of pages
  const totalPages = Math.ceil(data.length / rowsPerPage);
  
  // Group data by year if showing annual view
  const annualData = React.useMemo(() => {
    if (showMonthly) return null;
    
    const groupedByYear: Record<number, InsuranceAmortizationEntry> = {};
    
    data.forEach(entry => {
      const year = entry.year;
      if (!groupedByYear[year]) {
        groupedByYear[year] = {
          year,
          month: entry.month,
          premium: 0,
          cumulativePremium: 0,
          coverage: 0
        };
      }
      
      // Sum up monthly premiums for the year
      groupedByYear[year].premium += entry.premium;
      
      // Take the cumulative premium from the last month of the year
      if (entry.month % 12 === 0 || entry.month === data.length) {
        groupedByYear[year].cumulativePremium = entry.cumulativePremium;
        groupedByYear[year].coverage = entry.coverage;
      }
    });
    
    return Object.values(groupedByYear);
  }, [data, showMonthly]);
  
  // Get current page data
  const currentData = React.useMemo(() => {
    const displayData = showMonthly ? data : annualData;
    if (!displayData) return [];
    
    const indexOfLastRow = currentPage * rowsPerPage;
    const indexOfFirstRow = indexOfLastRow - rowsPerPage;
    return displayData.slice(indexOfFirstRow, indexOfLastRow);
  }, [data, annualData, currentPage, rowsPerPage, showMonthly]);
  
  // Handle page change
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };
  
  // Toggle between monthly and annual view
  const toggleView = () => {
    setShowMonthly(!showMonthly);
    setCurrentPage(1); // Reset to first page when toggling view
  };
  
  if (!data || data.length === 0) {
    return (
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-medium mb-4">{title}</h3>
        <p className="text-gray-500 text-center py-4">No amortization data available.</p>
      </div>
    );
  }
  
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">{title}</h3>
        <div className="flex items-center">
          <button
            onClick={toggleView}
            className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors duration-200"
          >
            {showMonthly ? t('tables.showAnnual') : t('tables.showMonthly')}
          </button>
        </div>
      </div>
      
      {/* Summary statistics */}
      {(coverageAmount || totalPremium || monthlyPremium) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-4 bg-blue-50 rounded-lg">
          {coverageAmount !== undefined && (
            <div>
              <span className="text-sm text-gray-600">{t('insurance.coverageAmount')}:</span>
              <p className="text-lg font-semibold">{formatCurrency(coverageAmount)}</p>
            </div>
          )}
          {totalPremium !== undefined && (
            <div>
              <span className="text-sm text-gray-600">{t('insurance.totalPremium')}:</span>
              <p className="text-lg font-semibold">{formatCurrency(totalPremium)}</p>
            </div>
          )}
          {monthlyPremium !== undefined && (
            <div>
              <span className="text-sm text-gray-600">{t('insurance.monthlyPremium')}:</span>
              <p className="text-lg font-semibold">{formatCurrency(monthlyPremium)}</p>
            </div>
          )}
        </div>
      )}
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {showMonthly ? t('tables.month') : t('tables.year')}
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('insurance.premium')}
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('insurance.cumulativePremium')}
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('insurance.coverage')}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentData.map((entry, index) => (
              <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {showMonthly ? 
                    `${t('tables.year')} ${entry.year}, ${t('tables.month')} ${entry.month % 12 || 12}` : 
                    `${t('tables.year')} ${entry.year}`
                  }
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                  {formatCurrency(entry.premium)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                  {formatCurrency(entry.cumulativePremium)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                  {formatCurrency(entry.coverage)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              {t('pagination.previous')}
            </button>
            <button
              onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              {t('pagination.next')}
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                {t('pagination.showing')} <span className="font-medium">{(currentPage - 1) * rowsPerPage + 1}</span> {t('pagination.to')}{' '}
                <span className="font-medium">
                  {Math.min(currentPage * rowsPerPage, (showMonthly ? data.length : annualData?.length || 0))}
                </span>{' '}
                {t('pagination.of')}{' '}
                <span className="font-medium">{showMonthly ? data.length : annualData?.length}</span> {t('pagination.results')}
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  <span className="sr-only">{t('pagination.previous')}</span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
                
                {/* Page numbers */}
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  // Show at most 5 page numbers centered around current page
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        currentPage === pageNum
                          ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                
                <button
                  onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  <span className="sr-only">{t('pagination.next')}</span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}