"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTranslation } from '@/app/i18n/client';
import { getLinkedCases, linkCases, unlinkCases } from '@/app/actions/caseActions';

interface LinkedCase {
  id: string;
  title: string;
  description: string | null;
  projectName: string | null;
}

interface LinkedCasesSectionProps {
  caseId: string;
  availableCases?: {
    id: string;
    title: string;
  }[];
}

export function LinkedCasesSection({ caseId, availableCases = [] }: LinkedCasesSectionProps) {
  const { t } = useTranslation();
  const [linkedCases, setLinkedCases] = useState<LinkedCase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLinking, setIsLinking] = useState(false);
  const [selectedCaseId, setSelectedCaseId] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  
  // Fetch linked cases
  useEffect(() => {
    const fetchLinkedCases = async () => {
      try {
        const cases = await getLinkedCases(caseId);
        setLinkedCases(cases);
      } catch (error) {
        console.error('Error fetching linked cases:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchLinkedCases();
  }, [caseId]);
  
  // Filter available cases to exclude those already linked
  const availableToLink = availableCases.filter(
    availableCase => 
      availableCase.id !== caseId && 
      !linkedCases.some(linkedCase => linkedCase.id === availableCase.id)
  );
  
  const handleLinkCase = async () => {
    if (!selectedCaseId) return;
    
    setIsLinking(true);
    try {
      const success = await linkCases(caseId, selectedCaseId);
      
      if (success) {
        // Find the case in available cases
        const caseToAdd = availableCases.find(c => c.id === selectedCaseId);
        if (caseToAdd) {
          setLinkedCases([...linkedCases, {
            id: caseToAdd.id,
            title: caseToAdd.title,
            description: null,
            projectName: null
          }]);
        }
        
        setSelectedCaseId('');
        setIsAdding(false);
      }
    } catch (error) {
      console.error('Error linking case:', error);
    } finally {
      setIsLinking(false);
    }
  };
  
  const handleUnlinkCase = async (linkedCaseId: string) => {
    if (!confirm('Are you sure you want to unlink this case?')) return;
    
    try {
      const success = await unlinkCases(caseId, linkedCaseId);
      
      if (success) {
        setLinkedCases(linkedCases.filter(c => c.id !== linkedCaseId));
      }
    } catch (error) {
      console.error('Error unlinking case:', error);
    }
  };
  
  if (isLoading) {
    return (
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Linked Cases</h3>
        </div>
        <div className="border-t border-gray-200">
          <div className="px-4 py-5 sm:px-6 text-center">
            <p className="text-sm text-gray-500">Loading linked cases...</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Linked Cases</h3>
        
        {!isAdding && availableToLink.length > 0 && (
          <button
            type="button"
            onClick={() => setIsAdding(true)}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Link Case
          </button>
        )}
      </div>
      
      <div className="border-t border-gray-200">
        {isAdding ? (
          <div className="px-4 py-5 sm:px-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-grow">
                <select
                  value={selectedCaseId}
                  onChange={(e) => setSelectedCaseId(e.target.value)}
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  <option value="">Select a case to link</option>
                  {availableToLink.map((c) => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleLinkCase}
                  disabled={!selectedCaseId || isLinking}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {isLinking ? 'Linking...' : 'Link'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsAdding(false);
                    setSelectedCaseId('');
                  }}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        ) : linkedCases.length === 0 ? (
          <div className="px-4 py-5 sm:px-6 text-center">
            <p className="text-sm text-gray-500">No linked cases yet.</p>
            {availableToLink.length > 0 && (
              <p className="text-sm text-gray-500 mt-2">
                Click "Link Case" to link this case to another case.
              </p>
            )}
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {linkedCases.map((linkedCase) => (
              <li key={linkedCase.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50 flex justify-between items-center">
                <Link href={`/cases/${linkedCase.id}`} className="flex-grow">
                  <div>
                    <p className="text-sm font-medium text-blue-600">{linkedCase.title}</p>
                    {linkedCase.projectName && (
                      <p className="text-xs text-gray-500">Project: {linkedCase.projectName}</p>
                    )}
                    {linkedCase.description && (
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">{linkedCase.description}</p>
                    )}
                  </div>
                </Link>
                <button
                  type="button"
                  onClick={() => handleUnlinkCase(linkedCase.id)}
                  className="ml-3 inline-flex items-center px-2 py-1 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Unlink
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}