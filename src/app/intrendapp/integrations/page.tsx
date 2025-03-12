"use client";
import { useState, useEffect } from 'react';

interface WhatsAppGroup {
  group_id: string;
  group_name: string;
}

interface IntegrationData {
  id: string;
  latest: {
    timestamp: string;
    integrations: {
      whatsapp: {
        groups: WhatsAppGroup[];
      };
    };
    version_note: string;
  };
}

const API_TIMEOUT = 5000;

async function fetchWithTimeout(url: string, options = {}, timeout = API_TIMEOUT) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    return response;
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}

export default function IntegrationsPage() {
  const [whatsappGroups, setWhatsappGroups] = useState<WhatsAppGroup[]>([]);
  const [latestIntegration, setLatestIntegration] = useState<IntegrationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
        try {
          const latestResponse = await fetchWithTimeout('http://0.0.0.0:8001/integrations/latest');
      
          if (!latestResponse.ok) {
            throw new Error(`Failed to fetch latest integration: ${latestResponse.statusText}`);
          }
      
          const data: any = await latestResponse.json();
          
          // 🔍 Debug: Log API response
          console.log("API Response:", data);
      
          // Ensure structure exists before accessing deeply nested properties
          if (!data || !data.latest || !data.latest.integrations || !data.latest.integrations.whatsapp) {
            throw new Error('Invalid API response structure');
          }
      
          setLatestIntegration(data);
          setWhatsappGroups(data.latest.integrations.whatsapp.groups || []); // Ensure fallback empty array
        } catch (err) {
          console.error('API fetch error:', err);
          setError(err instanceof Error ? err.message : 'An unknown error occurred');
        } finally {
          setLoading(false);
        }
      };      

    fetchData();
  }, []);

  if (loading) return <div className="flex justify-center items-center h-screen text-lg text-gray-600">Loading...</div>;
  if (error) return <div className="flex justify-center items-center h-screen text-lg text-red-500">Error: {error}</div>;

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-800 text-center mb-6">WhatsApp Groups</h1>

      {whatsappGroups.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {whatsappGroups.map((group) => (
            <div 
              key={group.group_id} 
              className="bg-white border border-gray-200 rounded-xl shadow-md p-5 transition-transform transform hover:scale-105 hover:shadow-lg"
            >
              <h2 className="text-lg font-semibold text-gray-900">{group.group_name}</h2>
              <p className="text-sm text-gray-500 mt-1">ID: {group.group_id}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500">No WhatsApp groups found.</p>
      )}

      {latestIntegration && (
        <div className="mt-10 bg-gray-100 p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-semibold text-gray-800">Latest Integration</h2>
          <p className="text-gray-600 mt-2"><strong>Timestamp:</strong> {latestIntegration.latest.timestamp}</p>
          <p className="text-gray-600 mt-1"><strong>Version Note:</strong> {latestIntegration.latest.version_note}</p>
        </div>
      )}
    </div>
  );
}
