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

export default function Dashboard() {
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
        setCases(data.cases || []);
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
  if (status === 'loading') {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // If not authenticated, the requireAuth function will redirect to signin
  // This is just an extra check
  if (status === 'unauthenticated') {
    return null;
  }

  const activeCasesCount = cases.length;
  const recentCases = cases.slice(0, 3); // Show the most recent 3 cases

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <header className="py-4">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-600">
          Welcome back, {user?.name || 'User'}!
        </p>
      </header>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Overview Card */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Active Cases
                  </dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">
                      {isLoading ? 'Loading...' : activeCasesCount}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-4 sm:px-6">
            <div className="text-sm">
              <Link href="/cases" className="font-medium text-blue-600 hover:text-blue-500">
                View all cases<span aria-hidden="true"> &rarr;</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Cases Card */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Recent Cases
            </h3>
            <div className="mt-4">
              {isLoading ? (
                <p className="text-gray-500 text-sm">Loading recent cases...</p>
              ) : recentCases.length === 0 ? (
                <p className="text-gray-500 text-sm">No recent cases found.</p>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {recentCases.map(caseItem => (
                    <li key={caseItem.id} className="py-2">
                      <Link 
                        href={`/cases/${caseItem.id}`}
                        className="block hover:text-blue-600 text-sm"
                      >
                        {caseItem.title}
                        <span className="text-xs text-gray-500 ml-2">
                          {new Date(caseItem.updatedAt).toLocaleDateString()}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-4 sm:px-6">
            <div className="text-sm">
              <Link href="/cases/new" className="font-medium text-blue-600 hover:text-blue-500">
                Create a new case<span aria-hidden="true"> &rarr;</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Links Card */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Quick Links
            </h3>
            <div className="mt-4 space-y-2">
              <Link href="/" className="block text-blue-600 hover:text-blue-500">
                Loan Calculator
              </Link>
              <Link href="/comparison" className="block text-blue-600 hover:text-blue-500">
                Loan Comparison
              </Link>
              <Link href="/investment" className="block text-blue-600 hover:text-blue-500">
                Investment Simulation
              </Link>
              <Link href="/profile" className="block text-blue-600 hover:text-blue-500">
                Profile Settings
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

