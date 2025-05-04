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
  height?: number | null;
  weight?: number | null;
  smoker?: boolean | null;
  currentCapital: number;
  currentDebt: number;
  monthlyIncome: number;
}

interface LoanSimulation {
  id: string;
  name: string;
  loanType: string;
  principal: number;
  interestRate: number;
  termYears: number;
  ownContribution: number;
  purchasePrice?: number | null;
}

interface Case {
  id: string;
  title: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  clients: Client[];
  loanSimulations: LoanSimulation[];
}

export default function CaseDetail() {
  const { user, status, requireAuth } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const [caseData, setCaseData] = useState<Case | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  // Check authentication on component mount
  useEffect(() => {
    requireAuth();
  }, [requireAuth]);

  // Fetch case data when component mounts
  useEffect(() => {
    const fetchCase = async () => {
      if (status !== 'authenticated') return;
      
      try {
        const response = await fetch(`/api/cases/${id}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Case not found');
          } else {
            throw new Error('Failed to fetch case');
          }
        }
        
        const data = await response.json();
        setCaseData(data.case);
        setTitle(data.case.title);
        setDescription(data.case.description || '');
      } catch (error) {
        console.error('Error fetching case:', error);
        setError(error instanceof Error ? error.message : 'An unexpected error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCase();
  }, [id, status]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setTitle(caseData?.title || '');
    setDescription(caseData?.description || '');
    setIsEditing(false);
  };

  const handleSave = async () => {
    try {
      const response = await fetch(`/api/cases/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          description,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update case');
      }
      
      const data = await response.json();
      setCaseData({
        ...caseData!,
        title: data.case.title,
        description: data.case.description,
        updatedAt: data.case.updatedAt,
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating case:', error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this case? This action cannot be undone.')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/cases/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete case');
      }
      
      router.push('/cases');
    } catch (error) {
      console.error('Error deleting case:', error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
    }
  };

  // Show loading state while checking authentication or fetching data
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
            onClick={() => router.push('/cases')}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Back to Cases
          </button>
        </div>
      </div>
    );
  }

  // Show case data
  if (!caseData) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white p-4 rounded-md shadow">
          <p className="text-gray-700">Case not found</p>
          <button
            onClick={() => router.push('/cases')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Back to Cases
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
            onClick={() => router.push('/cases')}
            className="mr-4 text-gray-600 hover:text-gray-900"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          {isEditing ? (
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-3xl font-bold text-gray-900 border-b border-gray-300 focus:outline-none focus:border-blue-500"
            />
          ) : (
            <h1 className="text-3xl font-bold text-gray-900">{caseData.title}</h1>
          )}
        </div>
        <div className="flex space-x-2">
          {isEditing ? (
            <>
              <button
                onClick={handleCancel}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Save
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleEdit}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Edit
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </>
          )}
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Case Details</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Basic information about this case.
          </p>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
          <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-gray-500">Description</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {isEditing ? (
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    className="w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                ) : (
                  description || 'No description provided'
                )}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Created</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {new Date(caseData.createdAt).toLocaleDateString()} at {new Date(caseData.createdAt).toLocaleTimeString()}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {new Date(caseData.updatedAt).toLocaleDateString()} at {new Date(caseData.updatedAt).toLocaleTimeString()}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Clients Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">Clients</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                People or companies associated with this case.
              </p>
            </div>
            <Link href={`/cases/${id}/clients/new`} className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700">
              Add Client
            </Link>
          </div>
          <div className="border-t border-gray-200">
            {caseData.clients.length === 0 ? (
              <div className="px-4 py-5 sm:px-6 text-center">
                <p className="text-sm text-gray-500">No clients added yet.</p>
                <p className="mt-2 text-sm text-gray-500">Add a client to get started.</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {caseData.clients.map((client) => (
                  <li key={client.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                    <Link href={`/cases/${id}/clients/${client.id}`} className="flex justify-between">
                      <div>
                        <p className="text-sm font-medium text-blue-600">{client.name}</p>
                        <p className="text-xs text-gray-500">{client.type}</p>
                      </div>
                      <div className="text-sm text-gray-500">
                        Income: {new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(client.monthlyIncome)} / month
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Loan Simulations Section */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">Loan Simulations</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Loan scenarios created for this case.
              </p>
            </div>
            <Link href={`/cases/${id}/loans/new`} className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700">
              Add Simulation
            </Link>
          </div>
          <div className="border-t border-gray-200">
            {caseData.loanSimulations.length === 0 ? (
              <div className="px-4 py-5 sm:px-6 text-center">
                <p className="text-sm text-gray-500">No loan simulations added yet.</p>
                <p className="mt-2 text-sm text-gray-500">Add a loan simulation to get started.</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {caseData.loanSimulations.map((loan) => (
                  <li key={loan.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                    <Link href={`/cases/${id}/loans/${loan.id}`} className="flex justify-between">
                      <div>
                        <p className="text-sm font-medium text-blue-600">{loan.name}</p>
                        <p className="text-xs text-gray-500">{loan.loanType}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">
                          {new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(loan.principal)} at {loan.interestRate}%
                        </p>
                        <p className="text-xs text-gray-500">
                          {loan.termYears} years
                        </p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Quick Actions</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Common operations for this case.
          </p>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <Link 
              href={`/cases/${id}/clients/new`}
              className="p-4 border border-gray-300 rounded-md hover:bg-blue-50 flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              <span className="text-sm font-medium text-gray-900">Add New Client</span>
            </Link>
            
            <Link 
              href={`/cases/${id}/loans/new`}
              className="p-4 border border-gray-300 rounded-md hover:bg-blue-50 flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-medium text-gray-900">Create Loan Simulation</span>
            </Link>
            
            <Link 
              href={`/cases/${id}/insurance`}
              className="p-4 border border-gray-300 rounded-md hover:bg-blue-50 flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span className="text-sm font-medium text-gray-900">Configure Insurance</span>
            </Link>
            
            <Link 
              href={`/cases/${id}/investment`}
              className="p-4 border border-gray-300 rounded-md hover:bg-blue-50 flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span className="text-sm font-medium text-gray-900">Run Investment Simulation</span>
            </Link>
            
            <Link 
              href={`/cases/${id}/export`}
              className="p-4 border border-gray-300 rounded-md hover:bg-blue-50 flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span className="text-sm font-medium text-gray-900">Export Case Data</span>
            </Link>
            
            <Link 
              href={caseData.clients.length > 0 ? `/cases/${id}/compare` : '#'}
              className={`p-4 border border-gray-300 rounded-md flex items-center ${
                caseData.clients.length > 0 ? 'hover:bg-blue-50' : 'opacity-50 cursor-not-allowed'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
              </svg>
              <span className="text-sm font-medium text-gray-900">Compare Simulations</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
