"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

interface Client {
  id: string;
  name: string;
  type: 'INDIVIDUAL' | 'COMPANY';
  age?: number | null;
  currentCapital: number;
  currentDebt: number;
  monthlyIncome: number;
  caseId: string;
}

export default function CaseClients() {
  const { user, status, requireAuth } = useAuth();
  const router = useRouter();
  const params = useParams();
  const caseId = params.id as string;
  
  const [clients, setClients] = useState<Client[]>([]);
  const [caseName, setCaseName] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Check authentication on component mount
  useEffect(() => {
    requireAuth();
  }, [requireAuth]);
  
  // Fetch case data and clients
  useEffect(() => {
    const fetchData = async () => {
      if (status !== 'authenticated') return;
      
      try {
        // Fetch case data
        const caseResponse = await fetch(`/api/cases/${caseId}`);
        
        if (!caseResponse.ok) {
          throw new Error('Failed to fetch case data');
        }
        
        const caseData = await caseResponse.json();
        setCaseName(caseData.case.name);
        
        // Fetch clients for this case
        const clientsResponse = await fetch(`/api/clients?caseId=${caseId}`);
        
        if (!clientsResponse.ok) {
          throw new Error('Failed to fetch clients');
        }
        
        const clientsData = await clientsResponse.json();
        setClients(clientsData.clients);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error instanceof Error ? error.message : 'An unexpected error occurred');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [caseId, status]);
  
  // Show loading state
  if (status === 'loading' || isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  // If not authenticated, the requireAuth function will redirect to signin
  if (status === 'unauthenticated') {
    return null;
  }
  
  // Show error state
  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-red-100 p-4 rounded-md">
          <p className="text-red-700">{error}</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <button
            onClick={() => router.push(`/cases/${caseId}`)}
            className="mr-4 text-gray-600 hover:text-gray-900"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <h1 className="text-3xl font-bold text-gray-900">
            Clients for Case: {caseName}
          </h1>
        </div>
        <Link
          href={`/cases/${caseId}/clients/new`}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Add New Client
        </Link>
      </div>
      
      {clients.length === 0 ? (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900">No clients yet</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by adding a new client to this case.
            </p>
            <div className="mt-6">
              <Link
                href={`/cases/${caseId}/clients/new`}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Your First Client
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col">
          <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
              <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Name
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Type
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Age
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Financial Status
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Monthly Income
                      </th>
                      <th scope="col" className="relative px-6 py-3">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {clients.map((client) => {
                      // Calculate net worth
                      const netWorth = client.currentCapital - client.currentDebt;
                      
                      return (
                        <tr key={client.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {client.name}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                              {client.type}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {client.type === 'INDIVIDUAL' && client.age !== null
                                ? `${client.age} years`
                                : 'N/A'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              <span className={netWorth >= 0 ? 'text-green-600' : 'text-red-600'}>
                                {new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(netWorth)}
                              </span>
                            </div>
                            <div className="text-xs text-gray-500">
                              Capital: {new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(client.currentCapital)}
                              {' | '}
                              Debt: {new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(client.currentDebt)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(client.monthlyIncome)}
                              <span className="text-xs text-gray-500"> / month</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <Link
                              href={`/cases/${caseId}/clients/${client.id}`}
                              className="text-blue-600 hover:text-blue-900 mr-4"
                            >
                              View
                            </Link>
                            <Link
                              href={`/cases/${caseId}/insurance?clientId=${client.id}`}
                              className="text-green-600 hover:text-green-900 mr-4"
                            >
                              Insurance
                            </Link>
                            <Link
                              href={`/cases/${caseId}/loans/new?clientId=${client.id}`}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              Loan Simulation
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="mt-6">
        <Link
          href={`/cases/${caseId}`}
          className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          Back to Case
        </Link>
      </div>
    </div>
  );
}
