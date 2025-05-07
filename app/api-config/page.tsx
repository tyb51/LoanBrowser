"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ApiConfigPage() {
  const router = useRouter();
  const [useBackendApi, setUseBackendApi] = useState(true);
  const [backendStatus, setBackendStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [backendUrl, setBackendUrl] = useState('http://localhost:8000');

  useEffect(() => {
    // Get the stored API configuration
    const storedConfig = localStorage.getItem('LoanLogicApiConfig');
    if (storedConfig) {
      const config = JSON.parse(storedConfig);
      setUseBackendApi(config.useBackendApi);
      setBackendUrl(config.backendUrl || backendUrl);
    }

    // Check if the backend API is available
    checkBackendStatus();
  }, []);

  const checkBackendStatus = async () => {
    try {
      const response = await fetch(`${backendUrl}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'cors',
      });
      
      if (response.ok) {
        setBackendStatus('online');
      } else {
        setBackendStatus('offline');
      }
    } catch (error) {
      console.error('Error checking backend status:', error);
      setBackendStatus('offline');
    }
  };

  const handleSaveConfig = () => {
    // Save the API configuration to localStorage
    localStorage.setItem('LoanLogicApiConfig', JSON.stringify({
      useBackendApi,
      backendUrl,
    }));

    // Show success message
    alert('API configuration saved successfully! Changes will take effect on the next page load.');
    
    // Refresh backend status
    checkBackendStatus();
  };

  const handleBackendUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBackendUrl(e.target.value);
    setBackendStatus('checking');
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">API Configuration</h1>
      
      <div className="bg-white rounded-lg shadow p-6 max-w-2xl">
        <h2 className="text-xl font-semibold mb-4">API Settings</h2>
        
        <div className="space-y-6">
          <div>
            <div className="flex items-center mb-2">
              <input
                type="checkbox"
                id="useBackendApi"
                checked={useBackendApi}
                onChange={e => setUseBackendApi(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="useBackendApi" className="ml-2 block text-sm font-medium text-gray-700">
                Use Python Backend API
              </label>
            </div>
            <p className="text-sm text-gray-500">
              {useBackendApi 
                ? "Using the real Python backend for calculations. This provides more accurate results but requires the backend server to be running."
                : "Using the mock API for calculations. This works without a backend server but provides simplified results."}
            </p>
          </div>
          
          <div>
            <label htmlFor="backendUrl" className="block text-sm font-medium text-gray-700 mb-1">
              Backend API URL
            </label>
            <div className="flex">
              <input
                type="text"
                id="backendUrl"
                value={backendUrl}
                onChange={handleBackendUrlChange}
                disabled={!useBackendApi}
                className="flex-1 block w-full px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100 disabled:text-gray-500"
                placeholder="http://localhost:8000"
              />
              <button 
                onClick={checkBackendStatus}
                className="px-4 py-2 border border-gray-300 border-l-0 rounded-r-md bg-gray-50 text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Test
              </button>
            </div>
            
            <div className="mt-2 flex items-center">
              <div
                className={`h-3 w-3 rounded-full mr-2 ${
                  backendStatus === 'online'
                    ? 'bg-green-500'
                    : backendStatus === 'offline'
                    ? 'bg-red-500'
                    : 'bg-yellow-500'
                }`}
              ></div>
              <p className="text-sm text-gray-600">
                {backendStatus === 'online'
                  ? 'Backend is online'
                  : backendStatus === 'offline'
                  ? 'Backend is offline'
                  : 'Checking backend status...'}
              </p>
            </div>
          </div>
          
          <div className="flex justify-end pt-4">
            <button
              onClick={() => router.push('/')}
              className="mr-4 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveConfig}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Save Configuration
            </button>
          </div>
        </div>
      </div>
      
      <div className="mt-8 bg-blue-50 rounded-lg p-6 max-w-2xl">
        <h2 className="text-lg font-semibold text-blue-800 mb-2">Setup Instructions</h2>
        
        <div className="space-y-4 text-blue-700">
          <h3 className="font-medium">To use the Python Backend API:</h3>
          <ol className="list-decimal list-inside pl-4 space-y-2">
            <li>Ensure Python 3.9+ is installed on your system</li>
            <li>Navigate to the <code className="px-1 py-0.5 bg-blue-100 rounded">python</code> directory in the project</li>
            <li>Create a virtual environment: <code className="px-1 py-0.5 bg-blue-100 rounded">python -m venv venv</code></li>
            <li>Activate the virtual environment:
              <ul className="list-disc list-inside pl-4 mt-1">
                <li>Windows: <code className="px-1 py-0.5 bg-blue-100 rounded">venv\Scripts\activate</code></li>
                <li>Unix/macOS: <code className="px-1 py-0.5 bg-blue-100 rounded">source venv/bin/activate</code></li>
              </ul>
            </li>
            <li>Install dependencies: <code className="px-1 py-0.5 bg-blue-100 rounded">pip install -r requirements.txt</code></li>
            <li>Start the API server: <code className="px-1 py-0.5 bg-blue-100 rounded">python run_api.py</code></li>
            <li>Check that the API is running at <a href="http://localhost:8000" target="_blank" className="text-blue-600 hover:underline">http://localhost:8000</a></li>
          </ol>
          
          <p>
            If you can't run the Python backend, you can disable it here and use the mock API instead.
          </p>
        </div>
      </div>
    </div>
  );
}
