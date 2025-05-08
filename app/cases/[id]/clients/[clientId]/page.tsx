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
  caseId: string;
}

interface Insurance {
  id: string;
  type: 'LIFE' | 'HOME';
  coveragePercentage: number;
  initialPremium: number;
  lifeInsurance?: {
    id: string;
    paymentType: 'LUMP_SUM' | 'DISTRIBUTED';
    basedOnRemainingCapital: boolean;
  };
  homeInsurance?: {
    id: string;
    propertyValue: number;
    propertyType: string;
  };
}

export default function ClientDetail() {
  const { user, status, requireAuth } = useAuth();
  const router = useRouter();
  const params = useParams();
  const caseId = params.id as string;
  const clientId = params.clientId as string;
  
  const [client, setClient] = useState<Client | null>(null);
  const [insurances, setInsurances] = useState<Insurance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState<Partial<Client>>({});
  
  // Check authentication on component mount
  useEffect(() => {
    requireAuth();
  }, [requireAuth]);
  
  // Fetch client data
  useEffect(() => {
    const fetchClient = async () => {
      if (status !== 'authenticated') return;
      
      try {
        const response = await fetch(`/api/clients/${clientId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch client data');
        }
        
        const data = await response.json();
        setClient(data.client);
        setFormData(data.client);
        
        // Fetch client insurances
        const insuranceResponse = await fetch(`/api/clients/${clientId}/insurances`);
        
        if (insuranceResponse.ok) {
          const insuranceData = await insuranceResponse.json();
          setInsurances(insuranceData.insurances || []);
        }
      } catch (error) {
        console.error('Error fetching client:', error);
        setError(error instanceof Error ? error.message : 'An unexpected error occurred');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchClient();
  }, [clientId, status]);
  
  const handleEdit = () => {
    setIsEditing(true);
  };
  
  const handleCancel = () => {
    setFormData(client || {});
    setIsEditing(false);
  };
  
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
  
  const handleSave = async () => {
    try {
      // Simple validation
      if (!formData.name) {
        throw new Error('Name is required');
      }
      
      if (formData.type === 'INDIVIDUAL' && (formData.age === null || formData.age === undefined)) {
        throw new Error('Age is required for individuals');
      }
      
      const response = await fetch(`/api/clients/${clientId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update client');
      }
      
      const data = await response.json();
      setClient(data.client);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating client:', error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
    }
  };
  
  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this client? This action cannot be undone.')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/clients/${clientId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete client');
      }
      
      router.push(`/cases/${caseId}`);
    } catch (error) {
      console.error('Error deleting client:', error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
    }
  };
  
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
            onClick={() => router.push(`/cases/${caseId}`)}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Back to Case
          </button>
        </div>
      </div>
    );
  }
  
  // Show client data
  if (!client) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white p-4 rounded-md shadow">
          <p className="text-gray-700">Client not found</p>
          <button
            onClick={() => router.push(`/cases/${caseId}`)}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Back to Case
          </button>
        </div>
      </div>
    );
  }
  
  // Calculate some derived values
  const calculateBMI = () => {
    if (!client.height || !client.weight) return null;
    const heightInMeters = client.height / 100;
    return (client.weight / (heightInMeters * heightInMeters)).toFixed(1);
  };
  
  const calculateNetWorth = () => {
    return client.currentCapital - client.currentDebt;
  };
  
  const bmi = calculateBMI();
  const netWorth = calculateNetWorth();
  
  return (
    <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
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
          {isEditing ? (
            <input
              type="text"
              value={formData.name || ''}
              onChange={handleChange}
              name="name"
              className="text-3xl font-bold text-gray-900 border-b border-gray-300 focus:outline-none focus:border-blue-500"
            />
          ) : (
            <h1 className="text-3xl font-bold text-gray-900">{client.name}</h1>
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
      
      {/* Basic Information */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Client Information</h3>
          <p className="mt-1 text-sm text-gray-500">
            Basic details and personal information.
          </p>
        </div>
        <div className="border-t border-gray-200">
          <dl>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Name</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {isEditing ? (
                  <input
                    type="text"
                    name="name"
                    value={formData.name || ''}
                    onChange={handleChange}
                    className="block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  />
                ) : (
                  client.name
                )}
              </dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Type</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {isEditing ? (
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  >
                    <option value="INDIVIDUAL">Individual</option>
                    <option value="COMPANY">Company</option>
                  </select>
                ) : (
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                    {client.type}
                  </span>
                )}
              </dd>
            </div>
            
            {/* Biometric Information (only for individuals) */}
            {(client.type === 'INDIVIDUAL' || (isEditing && formData.type === 'INDIVIDUAL')) && (
              <>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Age</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {isEditing ? (
                      <input
                        type="number"
                        name="age"
                        min="18"
                        max="120"
                        value={formData.age === null || formData.age === undefined ? '' : formData.age}
                        onChange={handleChange}
                        className="block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      />
                    ) : (
                      client.age !== null && client.age !== undefined ? `${client.age} years` : 'Not specified'
                    )}
                  </dd>
                </div>
                
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Height</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {isEditing ? (
                      <input
                        type="number"
                        name="height"
                        min="100"
                        max="250"
                        value={formData.height === null || formData.height === undefined ? '' : formData.height}
                        onChange={handleChange}
                        className="block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      />
                    ) : (
                      client.height !== null && client.height !== undefined ? `${client.height} cm` : 'Not specified'
                    )}
                  </dd>
                </div>
                
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Weight</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {isEditing ? (
                      <input
                        type="number"
                        name="weight"
                        min="30"
                        max="300"
                        value={formData.weight === null || formData.weight === undefined ? '' : formData.weight}
                        onChange={handleChange}
                        className="block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      />
                    ) : (
                      client.weight !== null && client.weight !== undefined ? `${client.weight} kg` : 'Not specified'
                    )}
                  </dd>
                </div>
                
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">BMI</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {bmi ? bmi : 'Not available'}
                  </dd>
                </div>
                
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Smoker</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {isEditing ? (
                      <div className="flex items-center h-5">
                        <input
                          id="smoker"
                          name="smoker"
                          type="checkbox"
                          checked={formData.smoker || false}
                          onChange={handleChange}
                          className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                        />
                      </div>
                    ) : (
                      client.smoker ? 'Yes' : 'No'
                    )}
                  </dd>
                </div>
              </>
            )}
            
            {/* Financial Information */}
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Current Capital</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {isEditing ? (
                  <input
                    type="number"
                    name="currentCapital"
                    min="0"
                    value={formData.currentCapital}
                    onChange={handleChange}
                    className="block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  />
                ) : (
                  new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(client.currentCapital)
                )}
              </dd>
            </div>
            
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Current Debt</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {isEditing ? (
                  <input
                    type="number"
                    name="currentDebt"
                    min="0"
                    value={formData.currentDebt}
                    onChange={handleChange}
                    className="block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  />
                ) : (
                  new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(client.currentDebt)
                )}
              </dd>
            </div>
            
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Monthly Income</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {isEditing ? (
                  <input
                    type="number"
                    name="monthlyIncome"
                    min="0"
                    value={formData.monthlyIncome}
                    onChange={handleChange}
                    className="block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  />
                ) : (
                  new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(client.monthlyIncome)
                )}
              </dd>
            </div>
            
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Net Worth</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                <span className={netWorth >= 0 ? 'text-green-600' : 'text-red-600'}>
                  {new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(netWorth)}
                </span>
              </dd>
            </div>
          </dl>
        </div>
      </div>
      
      {/* Insurances Section */}
      {!isEditing && (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
          <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">Insurances</h3>
              <p className="mt-1 text-sm text-gray-500">
                Insurance policies associated with this client.
              </p>
            </div>
            <Link 
              href={`/cases/${caseId}/insurance`}
              className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
            >
              Add Insurance
            </Link>
          </div>
          <div className="border-t border-gray-200">
            {insurances.length === 0 ? (
              <div className="px-4 py-5 sm:px-6 text-center">
                <p className="text-sm text-gray-500">No insurance policies found.</p>
                <p className="mt-2 text-sm text-gray-500">
                  Add insurance to protect this client's assets and investments.
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {insurances.map((insurance) => (
                  <li key={insurance.id} className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-blue-600">
                          {insurance.type === 'LIFE' ? 'Life Insurance' : 'Home Insurance'}
                        </p>
                        <p className="text-xs text-gray-500">
                          Coverage: {(insurance.coveragePercentage * 100).toFixed(0)}%
                        </p>
                      </div>
                      <div className="text-sm text-gray-900">
                        {new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(insurance.initialPremium)} / month
                      </div>
                    </div>
                    
                    {insurance.type === 'LIFE' && insurance.lifeInsurance && (
                      <div className="mt-2 text-xs text-gray-500">
                        <p>
                          Payment Type: {insurance.lifeInsurance.paymentType === 'DISTRIBUTED' ? 'Monthly Payments' : 'Lump Sum'}
                        </p>
                        <p>
                          Based on Remaining Capital: {insurance.lifeInsurance.basedOnRemainingCapital ? 'Yes' : 'No'}
                        </p>
                      </div>
                    )}
                    
                    {insurance.type === 'HOME' && insurance.homeInsurance && (
                      <div className="mt-2 text-xs text-gray-500">
                        <p>
                          Property Type: {insurance.homeInsurance.propertyType.replace(/_/g, ' ')}
                        </p>
                        <p>
                          Property Value: {new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(insurance.homeInsurance.propertyValue)}
                        </p>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
      
      {/* Actions */}
      {!isEditing && (
        <div className="flex justify-between mt-6">
          <Link
            href={`/cases/${caseId}`}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Back to Case
          </Link>
          
          <div className="flex space-x-3">
            <Link
              href={`/cases/${caseId}/insurance`}
              className="px-4 py-2 bg-blue-600 text-white rounded-md shadow-sm hover:bg-blue-700 text-sm font-medium"
            >
              Add Insurance
            </Link>
            <Link
              href={`/cases/${caseId}/loans/new?clientId=${clientId}`}
              className="px-4 py-2 bg-green-600 text-white rounded-md shadow-sm hover:bg-green-700 text-sm font-medium"
            >
              Create Loan Simulation
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
