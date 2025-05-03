"use client";

import React, { useState } from 'react';
import { MonthlyLoanData, AnnualLoanData } from '@/app/types/loan';

interface AmortizationTableProps {
  monthlyData: MonthlyLoanData[];
  annualData: AnnualLoanData[];
  title?: string;
  defaultView?: 'monthly' | 'yearly';
}

export function AmortizationTable({ 
  monthlyData, 
  annualData,
  title = 'Amortization Schedule',
  defaultView = 'yearly'
}: AmortizationTableProps) {
  const [view, setView] = useState<'monthly' | 'yearly'>(defaultView);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 12;
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(value);
  };

  // Calculate pagination for monthly view
  const totalMonthlyPages = Math.ceil(monthlyData.length / rowsPerPage);
  const monthlyDataToShow = monthlyData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  // Annual data doesn't need pagination usually
  const yearlyDataToShow = annualData;

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">{title}</h3>
        <div className="flex items-center space-x-4">
          <div className="flex rounded-md shadow-sm">
            <button
              type="button"
              onClick={() => setView('yearly')}
              className={`px-4 py-2 text-sm font-medium rounded-l-md ${
                view === 'yearly' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              } border border-gray-300`}
            >
              Yearly
            </button>
            <button
              type="button"
              onClick={() => {
                setView('monthly');
                setCurrentPage(1);
              }}
              className={`px-4 py-2 text-sm font-medium rounded-r-md ${
                view === 'monthly' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              } border border-gray-300 border-l-0`}
            >
              Monthly
            </button>
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        {view === 'yearly' ? (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Year
                </th>
                <th scope="col" className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Annual Principal
                </th>
                <th scope="col" className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Annual Interest
                </th>
                <th scope="col" className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Annual Insurance
                </th>
                <th scope="col" className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Annual Total
                </th>
                <th scope="col" className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Remaining Principal
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {yearlyDataToShow.map((row) => (
                <tr key={row.Jaar}>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                    {row.Jaar}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 text-right">
                    {formatCurrency(row.Jaarlijkse_Kapitaalaflossing)}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 text-right">
                    {formatCurrency(row.Jaarlijkse_Rente)}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 text-right">
                    {formatCurrency(row.Jaarlijkse_SSV)}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 text-right">
                    {formatCurrency(row.Jaarlijkse_Totale_Uitgave)}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 text-right">
                    {formatCurrency(row.Resterend_Kapitaal_Einde_Jaar)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Month
                  </th>
                  <th scope="col" className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Year
                  </th>
                  <th scope="col" className="px-2 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment
                  </th>
                  <th scope="col" className="px-2 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Principal
                  </th>
                  <th scope="col" className="px-2 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Interest
                  </th>
                  <th scope="col" className="px-2 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Insurance
                  </th>
                  <th scope="col" className="px-2 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Remaining Principal
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {monthlyDataToShow.map((row) => (
                  <tr key={row.Maand}>
                    <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-900">
                      {row.Maand}
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-900">
                      {row.Jaar}
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-500 text-right">
                      {formatCurrency(row["Totale Maandelijkse Uitgave"])}
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-500 text-right">
                      {formatCurrency(row["Kapitaal Aflossing"])}
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-500 text-right">
                      {formatCurrency(row.Rente)}
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-500 text-right">
                      {formatCurrency(row["Schuldsaldo Premie (Maand)"])}
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-500 text-right">
                      {formatCurrency(row["Resterend Kapitaal"])}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {/* Pagination */}
            {totalMonthlyPages > 1 && (
              <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 mt-4">
                <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing <span className="font-medium">{(currentPage - 1) * rowsPerPage + 1}</span> to{' '}
                      <span className="font-medium">
                        {Math.min(currentPage * rowsPerPage, monthlyData.length)}
                      </span>{' '}
                      of <span className="font-medium">{monthlyData.length}</span> results
                    </p>
                  </div>
                  <div>
                    <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                      <button
                        onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className={`relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ${
                          currentPage === 1 ? 'cursor-not-allowed' : 'hover:bg-gray-50'
                        }`}
                      >
                        Previous
                      </button>
                      
                      {/* Page numbers */}
                      {Array.from({ length: Math.min(5, totalMonthlyPages) }, (_, i) => {
                        // Show pages around current page
                        let pageNum: number;
                        if (totalMonthlyPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalMonthlyPages - 2) {
                          pageNum = totalMonthlyPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        
                        return (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                              currentPage === pageNum
                                ? 'z-10 bg-blue-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600'
                                : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-offset-0'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                      
                      <button
                        onClick={() => handlePageChange(Math.min(totalMonthlyPages, currentPage + 1))}
                        disabled={currentPage === totalMonthlyPages}
                        className={`relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ${
                          currentPage === totalMonthlyPages ? 'cursor-not-allowed' : 'hover:bg-gray-50'
                        }`}
                      >
                        Next
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
