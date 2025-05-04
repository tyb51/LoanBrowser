"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

interface ClientFormData {
  name: string;
  type: 'INDIVIDUAL' | 'COMPANY';
  age?: number | null;
  height?: number | null;
  weight?: number | null;
  smoker?: boolean;
  currentCapital: number;
  currentDebt: number;
  monthlyIncome: number;
}

export default function NewClient() {
  const { user, status, requireAuth } = useAuth();
  const router = useRouter();
  const params = useParams();
  const caseId = params.id as string;
  
  const [formData, setFormData] = useState<ClientFormData>({
    name: '',
    type: 'INDIVIDUAL',
    age: 30,
    height: 175, // cm
    weight: 75, // kg
    smoker: false,
    currentCapital: 50000,
    currentDebt: 10000,
    monthlyIncome: 3500
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Check authentication on component mount
  useEffect(() => {
    requireAuth();
  }, [requireAuth]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked
      }));
    } else if (type === 'number') {
      setFormData(prev => ({
        ...prev,
        [name]: value === '' ? '' : parseFloat(value)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      // Simple validation
      if (!formData.name) {
        throw new Error('Name is required');
      }
      
      if (formData.type === 'INDIVIDUAL' && (formData.age === null || formData.age === undefined)) {
        throw new Error('Age is required for individuals');
      }
      
      // Create client
      const response = await fetch('/api/clients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          caseId
        }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to create client');
      }
      
      // Redirect to case page
      router.push(`/cases/${caseId}`);
    } catch (error) {
      console.error('Error creating client:', error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Show loading state while checking authentication
  if (status === 'loading') {
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
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
          <h1 className="text-3xl font-bold text-gray-900">Add New Client</h1>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-100 p-4 rounded-md mb-6">
          <p className="text-red-700">{error}</p>
        </div>
      )}
      
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                />
              </div>
              
              {/* Type */}
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700">Type</label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="INDIVIDUAL">Individual</option>
                  <option value="COMPANY">Company</option>
                </select>
              </div>
            </div>
          </div>
          
          {/* Biometric Information (only for individuals) */}
          {formData.type === 'INDIVIDUAL' && (
            <div>
              <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Biometric Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Age */}
                <div>
                  <label htmlFor="age" className="block text-sm font-medium text-gray-700">Age</label>
                  <input
                    type="number"
                    name="age"
                    id="age"
                    min="18"
                    max="120"
                    value={formData.age === null ? '' : formData.age}
                    onChange={handleChange}
                    className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
                
                {/* Height */}
                <div>
                  <label htmlFor="height" className="block text-sm font-medium text-gray-700">Height (cm)</label>
                  <input
                    type="number"
                    name="height"
                    id="height"
                    min="100"
                    max="250"
                    value={formData.height === null ? '' : formData.height}
                    onChange={handleChange}
                    className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
                
                {/* Weight */}
                <div>
                  <label htmlFor="weight" className="block text-sm font-medium text-gray-700">Weight (kg)</label>
                  <input
                    type="number"
                    name="weight"
                    id="weight"
                    min="30"
                    max="300"
                    value={formData.weight === null ? '' : formData.weight}
                    onChange={handleChange}
                    className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
                
                {/* Smoker */}
                <div className="flex items-start">
                  <div className="flex items-center h-5 mt-5">
                    <input
                      id="smoker"
                      name="smoker"
                      type="checkbox"
                      checked={formData.smoker}
                      onChange={handleChange}
                      className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3 text-sm mt-5">
                    <label htmlFor="smoker" className="font-medium text-gray-700">Smoker</label>
                    <p className="text-gray-500">Check if the client is a smoker</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Financial Information */}
          <div>
            <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Financial Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Current Capital */}
              <div>
                <label htmlFor="currentCapital" className="block text-sm font-medium text-gray-700">Current Capital (€)</label>
                <input
                  type="number"
                  name="currentCapital"
                  id="currentCapital"
                  min="0"
                  value={formData.currentCapital}
                  onChange={handleChange}
                  className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                />
              </div>
              
              {/* Current Debt */}
              <div>
                <label htmlFor="currentDebt" className="block text-sm font-medium text-gray-700">Current Debt (€)</label>
                <input
                  type="number"
                  name="currentDebt"
                  id="currentDebt"
                  min="0"
                  value={formData.currentDebt}
                  onChange={handleChange}
                  className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                />
              </div>
              
              {/* Monthly Income */}
              <div>
                <label htmlFor="monthlyIncome" className="block text-sm font-medium text-gray-700">Monthly Income (€)</label>
                <input
                  type="number"
                  name="monthlyIncome"
                  id="monthlyIncome"
                  min="0"
                  value={formData.monthlyIncome}
                  onChange={handleChange}
                  className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                />
              </div>
            </div>
          </div>
          
          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => router.push(`/cases/${caseId}`)}
              className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mr-3"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="bg-blue-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isLoading ? 'Saving...' : 'Save Client'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
