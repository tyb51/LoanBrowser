"use client";

import React, { useEffect, useState } from 'react';
import { useTranslation } from '@/app/i18n/client';
import { Client, ClientSummary, ClientType } from '@/app/types/client';

interface ClientSelectionFormProps {
  clients: Client[];
  preselectedClientIds?: string[];
  onChange: (selectedClientIds: string[], summary: ClientSummary) => void;
}

export function ClientSelectionForm({ 
  clients, 
  preselectedClientIds, 
  onChange 
}: ClientSelectionFormProps) {
  const { t } = useTranslation();
  const [selectedClientIds, setSelectedClientIds] = useState<string[]>(preselectedClientIds || []);

  // Initialize with all clients selected if no preselected clients
  useEffect(() => {
    if (!preselectedClientIds && clients.length > 0 && selectedClientIds.length === 0) {
      const allClientIds = clients.map(client => client.id);
      setSelectedClientIds(allClientIds);
    }
  }, [clients, preselectedClientIds, selectedClientIds.length]);

  // Calculate the client summary whenever selection changes
  useEffect(() => {
    if (selectedClientIds.length > 0) {
      const selectedClients = clients.filter(client => selectedClientIds.includes(client.id));
      const summary = calculateClientSummary(selectedClients);
      onChange(selectedClientIds, summary);
    }
  }, [selectedClientIds, clients]);

  const calculateClientSummary = (selectedClients: Client[]): ClientSummary => {
    return selectedClients.reduce((summary, client) => {
      return {
        totalCurrentCapital: summary.totalCurrentCapital + client.currentCapital,
        totalCurrentDebt: summary.totalCurrentDebt + client.currentDebt,
        totalMonthlyIncome: summary.totalMonthlyIncome + client.monthlyIncome,
        netWorth: summary.netWorth + (client.currentCapital - client.currentDebt),
        clientCount: summary.clientCount + 1,
        individualCount: summary.individualCount + (client.type === ClientType.INDIVIDUAL ? 1 : 0),
        companyCount: summary.companyCount + (client.type === ClientType.COMPANY ? 1 : 0)
      };
    }, {
      totalCurrentCapital: 0,
      totalCurrentDebt: 0,
      totalMonthlyIncome: 0,
      netWorth: 0,
      clientCount: 0,
      individualCount: 0,
      companyCount: 0
    });
  };

  const handleSelectAll = () => {
    const allClientIds = clients.map(client => client.id);
    setSelectedClientIds(allClientIds);
  };

  const handleSelectNone = () => {
    setSelectedClientIds([]);
  };

  const handleToggleClient = (clientId: string) => {
    setSelectedClientIds(prev => {
      if (prev.includes(clientId)) {
        return prev.filter(id => id !== clientId);
      } else {
        return [...prev, clientId];
      }
    });
  };

  if (clients.length === 0) {
    return (
      <div className="bg-yellow-50 p-4 rounded-md">
        <p className="text-yellow-800">{t('client.noClientsYet')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-medium text-gray-700">{t('client.selectClients')}</h3>
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={handleSelectAll}
            className="px-2 py-1 text-xs bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
          >
            {t('client.selectAll')}
          </button>
          <button
            type="button"
            onClick={handleSelectNone}
            className="px-2 py-1 text-xs bg-gray-50 text-gray-600 rounded hover:bg-gray-100"
          >
            {t('client.selectNone')}
          </button>
        </div>
      </div>

      <div className="border border-gray-200 rounded-md overflow-hidden">
        <ul className="divide-y divide-gray-200">
          {clients.map(client => (
            <li key={client.id} className="px-4 py-3 hover:bg-gray-50">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id={`client-${client.id}`}
                  checked={selectedClientIds.includes(client.id)}
                  onChange={() => handleToggleClient(client.id)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor={`client-${client.id}`} className="ml-3 flex-1 cursor-pointer">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-700">{client.name}</span>
                    <span className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-800">
                      {client.type === ClientType.INDIVIDUAL ? t('client.individual') : t('client.company')}
                    </span>
                  </div>
                  <div className="mt-1 text-xs text-gray-500 flex justify-between">
                    <span>
                      {t('client.monthlyIncome')}: {new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(client.monthlyIncome)}
                    </span>
                    <span>
                      {t('client.netWorth')}: {new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(client.currentCapital - client.currentDebt)}
                    </span>
                  </div>
                </label>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {selectedClientIds.length > 0 && (
        <div className="mt-4 p-4 bg-blue-50 rounded-md">
          <h4 className="text-sm font-medium text-blue-700 mb-2">{t('client.selectedClientsSummary') }</h4>
          <div className="grid grid-cols-2 gap-2 text-xs text-blue-800">
            <div>{t('client.totalClients')}: {selectedClientIds.length}</div>
            {selectedClientIds.length > 1 && (
              <>
                <div>{t('client.totalMonthlyIncome')}: {new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(
                  clients
                    .filter(client => selectedClientIds.includes(client.id))
                    .reduce((sum, client) => sum + client.monthlyIncome, 0)
                )}</div>
                <div>{t('client.totalCapital')}: {new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(
                  clients
                    .filter(client => selectedClientIds.includes(client.id))
                    .reduce((sum, client) => sum + client.currentCapital, 0)
                )}</div>
                <div>{t('client.totalDebt')}: {new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(
                  clients
                    .filter(client => selectedClientIds.includes(client.id))
                    .reduce((sum, client) => sum + client.currentDebt, 0)
                )}</div>
                <div>{t('client.combinedNetWorth')}: {new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(
                  clients
                    .filter(client => selectedClientIds.includes(client.id))
                    .reduce((sum, client) => sum + (client.currentCapital - client.currentDebt), 0)
                )}</div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
