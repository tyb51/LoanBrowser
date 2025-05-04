"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Link from 'next/link';

interface Case {
  id: string;
  title: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function Cases() {
  const { user, status, requireAuth } = useAuth();
  const [cases, setCases] = useState<Case[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check authentication on component mount
  useEffect(() => {
    requireAuth();
  }, [requireAuth]);

  // Fetch cases when component mounts
  useEffect(() => {
    const fetchCases = async () => {
      if (status !== 'authenticated') return;
      
      try {
        const response = await fetch('/api/cases');
        if (!response.ok) {
          throw new Error('Failed to fetch cases');
        }
        
        const data = await response.json();
        setCases(data.cases);
      } catch (error) {
        console.error('Error fetching cases:', error);
        setError('Failed to load cases. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCases();
  }, [status]);

  // Show loading state while checking authentication
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Cases</h1>
        <Link href="/cases/new" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
          New Case
        </Link>
      </div>

      {error && (
        <div className="bg-red-100 p-4 rounded-md mb-6">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {cases.length === 0 ? (
        <div className="bg-white shadow overflow-hidden sm:rounded-md p-6 text-center">
          <p className="text-gray-500">You don't have any cases yet.</p>
          <p className="mt-2 text-sm text-gray-500">Create a new case to get started.</p>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {cases.map((caseItem) => (
              <li key={caseItem.id}>
                <Link href={`/cases/${caseItem.id}`} className="block hover:bg-gray-50">
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <p className="text-lg font-medium text-blue-600 truncate">
                        {caseItem.title}
                      </p>
                      <div className="ml-2 flex-shrink-0 flex">
                        <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          {new Date(caseItem.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <p className="flex items-center text-sm text-gray-500">
                          {caseItem.description || 'No description'}
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
