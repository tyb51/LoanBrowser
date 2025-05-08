"use client";

import React, { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { InsuranceType, createInsuranceSimulation } from '@/app/services/insuranceSimulationApi';
import { InsuranceSimulationForm } from '@/app/components/forms/InsuranceSimulationForm';

export default function NewInsuranceSimulationPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id: caseId } = use(params);

  const [insuranceType, setInsuranceType] = useState<InsuranceType>('LIFE');
  const [clients, setClients] = useState<any[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoadingClients, setIsLoadingClients] = useState<boolean>(true);

  // Fetch clients for the case
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await fetch(`/api/cases/${caseId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch clients');
        }

        const data = await response.json();


        if (data.case && data.case.clients.length > 0) {
          setClients(data.case.clients || []);

          // Set default selected client if available
          setSelectedClientId(data.case.clients[0].id);

        }
      } catch (error) {
        console.error('Error fetching clients:', error);
        toast.error('Failed to load clients');
      } finally {
        setIsLoadingClients(false);
      }
    };

    fetchClients();
  }, [caseId]);

  const handleSubmit = async (formData: { name: string; parameters: any; calculateResult?: boolean }) => {
    if (!selectedClientId) {
      toast.error('Please select a client');
      return;
    }

    setIsLoading(true);

    try {
      const result = await createInsuranceSimulation({
        name: formData.name,
        type: insuranceType,
        parameters: formData.parameters,
        clientId: selectedClientId,
        caseId,
        calculateResult: formData.calculateResult
      });

      if (result) {
        toast.success('Insurance simulation created successfully');
        router.push(`/cases/${caseId}`);
      }
    } catch (error) {
      console.error('Error creating insurance simulation:', error);
      toast.error('Failed to create insurance simulation');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="py-10">
      <header>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <nav className="mb-5 flex" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-4">
              <li>
                <div className="flex items-center">
                  <Link href={`/cases/${caseId}`} className="text-sm font-medium text-gray-500 hover:text-gray-700">
                    Case Details
                  </Link>
                </div>
              </li>
              <li>
                <div className="flex items-center">
                  <span className="mx-2 text-gray-400">/</span>
                  <span className="text-sm font-medium text-gray-500">New Insurance Simulation</span>
                </div>
              </li>
            </ol>
          </nav>

          <h1 className="text-3xl font-bold leading-tight text-gray-900">Create New Insurance Simulation</h1>
        </div>
      </header>

      <main>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="p-6">
              {isLoadingClients ? (
                <div className="py-6 text-center">
                  <p className="text-gray-500">Loading clients...</p>
                </div>
              ) : clients.length === 0 ? (
                <div className="py-6 text-center">
                  <p className="text-gray-500">No clients found for this case.</p>
                  <Link
                    href={`/cases/${caseId}/clients/new`}
                    className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Create Client
                  </Link>
                </div>
              ) : (
                <>
                  <div className="mb-8 space-y-6">
                    <div>
                      <label htmlFor="client-select" className="block text-sm font-medium text-gray-700">
                        Select Client
                      </label>
                      <select
                        id="client-select"
                        value={selectedClientId}
                        onChange={(e) => setSelectedClientId(e.target.value)}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                        required
                      >
                        <option value="" disabled>Select a client</option>
                        {clients.map((client) => (
                          <option key={client.id} value={client.id}>
                            {client.name} ({client.type === 'INDIVIDUAL' ? 'Individual' : 'Company'})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Insurance Type
                      </label>
                      <div className="mt-1 space-y-4 sm:flex sm:items-center sm:space-y-0 sm:space-x-10">
                        <div className="flex items-center">
                          <input
                            id="life-insurance"
                            name="insurance-type"
                            type="radio"
                            checked={insuranceType === 'LIFE'}
                            onChange={() => setInsuranceType('LIFE')}
                            className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                          />
                          <label htmlFor="life-insurance" className="ml-3 block text-sm font-medium text-gray-700">
                            Life Insurance
                          </label>
                        </div>

                        <div className="flex items-center">
                          <input
                            id="home-insurance"
                            name="insurance-type"
                            type="radio"
                            checked={insuranceType === 'HOME'}
                            onChange={() => setInsuranceType('HOME')}
                            className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                          />
                          <label htmlFor="home-insurance" className="ml-3 block text-sm font-medium text-gray-700">
                            Home Insurance
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  <InsuranceSimulationForm
                    type={insuranceType}
                    onSubmit={handleSubmit}
                    isLoading={isLoading}
                  />
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
