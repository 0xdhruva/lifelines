"use client";

import { useState, useEffect } from "react";

export default function DebugPage() {
  const [healthData, setHealthData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchHealthData() {
      try {
        setLoading(true);
        const response = await fetch("/api/health");
        if (!response.ok) {
          throw new Error(`Health check failed: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        setHealthData(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
        setHealthData(null);
      } finally {
        setLoading(false);
      }
    }

    fetchHealthData();
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-6 md:p-12">
      <div className="w-full max-w-3xl">
        <h1 className="text-2xl font-bold mb-6">Lifelines Debug Page</h1>
        
        {loading && <p className="text-gray-500">Loading health data...</p>}
        
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <h2 className="text-red-700 font-semibold mb-2">Error</h2>
            <p className="text-red-600">{error}</p>
          </div>
        )}
        
        {healthData && (
          <div className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <h2 className="text-green-700 font-semibold mb-2">Health Status</h2>
              <p className="text-green-600">
                Status: {healthData.status}
                <br />
                Timestamp: {healthData.timestamp}
              </p>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <h2 className="text-blue-700 font-semibold mb-2">Environment</h2>
              <p className="text-blue-600">
                Node Version: {healthData.environment?.nodeVersion || 'Unknown'}
                <br />
                Environment: {healthData.environment?.environment || 'Unknown'}
                <br />
                Debug Mode: {healthData.environment?.debug || 'Unknown'}
              </p>
            </div>
            
            <div className="bg-purple-50 border border-purple-200 rounded-md p-4">
              <h2 className="text-purple-700 font-semibold mb-2">OpenAI Configuration</h2>
              <p className="text-purple-600">
                API Key Present: {healthData.openai?.hasKey ? 'Yes' : 'No'}
                <br />
                API Key Length: {healthData.openai?.keyLength || 0}
                <br />
                Client Status: {healthData.openai?.clientStatus || 'Unknown'}
              </p>
            </div>
            
            <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
              <h2 className="text-gray-700 font-semibold mb-2">Raw Response</h2>
              <pre className="text-xs text-gray-600 overflow-auto max-h-64 p-2 bg-gray-100 rounded">
                {JSON.stringify(healthData, null, 2)}
              </pre>
            </div>
          </div>
        )}
        
        <div className="mt-8">
          <a 
            href="/"
            className="text-blue-600 hover:text-blue-800 underline"
          >
            Return to Home Page
          </a>
        </div>
      </div>
    </main>
  );
}
