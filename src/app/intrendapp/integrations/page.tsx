"use client";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";

interface WhatsAppGroup {
  id: string;
  name?: string;
}

interface APIResponse {
  success: boolean;
  response: {
    groups: WhatsAppGroup[];
  };
  message: string;
}

interface IntegrationResponse {
  latest?: {
    integrations?: {
      whatsapp?: {
        groups?: Array<{
          id?: string;
          name?: string;
          group_id?: string;
          group_name?: string;
        }>;
      };
    };
  };
}

const FETCH_GROUPS_API = "http://localhost:5001/api/integrations/fetch-whatsapp-groups";
const FETCH_LATEST_API = "http://localhost:5001/api/integrations/latest";
const CREATE_INTEGRATIONS_API = "http://localhost:5001/api/integrations/create";
const UPDATE_INTEGRATIONS_API = "http://localhost:5001/api/integrations/update?userId=1&userAgent=user-test";

export default function IntegrationsPage() {
  const [whatsappGroups, setWhatsappGroups] = useState<WhatsAppGroup[]>([]);
  const [selectedGroups, setSelectedGroups] = useState<WhatsAppGroup[]>([]);
  const [existingIntegration, setExistingIntegration] = useState<WhatsAppGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch existing integrations
        const latestResponse = await fetch(FETCH_LATEST_API);
        if (latestResponse.ok) {
          const latestData: IntegrationResponse = await latestResponse.json();
          console.log(latestData.latest?.integrations?.whatsapp?.groups)
          // Following initialization pattern with optional chaining and fallback
          const groups = latestData?.latest?.integrations?.whatsapp?.groups || [];
          const formattedGroups = groups.map(group => ({
            id: group.id || group.group_id || '',
            name: group.name || group.group_name || 'Unnamed Group'
          }));
          setExistingIntegration(formattedGroups);
          setSelectedGroups(formattedGroups); // Show already selected integrations
        }

        // Fetch available WhatsApp groups
        const groupsResponse = await fetch(FETCH_GROUPS_API);
        if (!groupsResponse.ok) throw new Error("Failed to fetch WhatsApp groups");

        const groupsData: APIResponse = await groupsResponse.json();
        // Following initialization pattern with fallback for empty response
        const groups = groupsData?.response?.groups || [];
        console.log(groups)
        const formattedGroups = groups.map((group) => ({
          id: group.id || '',
          name: group.name || 'Unnamed Group'
        }));
        setWhatsappGroups(formattedGroups);

        // Log formatted groups for debugging
        console.log('Available WhatsApp Groups:', formattedGroups.length);
      } catch (err) {
        console.warn("Error loading WhatsApp groups:", err);
        // Following initialization pattern, set empty arrays as fallback
        setExistingIntegration([]);
        setSelectedGroups([]);
        setWhatsappGroups([]);

        // Set error state with user-friendly message
        const errorMessage = err instanceof Error ? err.message : 'Failed to load WhatsApp groups';
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const toggleSelection = (group: WhatsAppGroup) => {
    setSelectedGroups((prevSelected) => {
      const isSelected = prevSelected.some((g) => g.id === group.id);
      return isSelected ? prevSelected.filter((g) => g.id !== group.id) : [...prevSelected, group];
    });
  };

  const saveIntegration = async () => {
    if (!selectedGroups?.length) {
      toast.error('Please select at least one group');
      return;
    }

    setSaving(true);

    // Use only the currently selected groups
    const payload = {
      whatsapp: {
        groups: selectedGroups.map(group => ({
          group_id: group.id,
          group_name: group.name || 'Unnamed Group'
        }))
      }
    };

    try {
      const response = await fetch(existingIntegration.length ? UPDATE_INTEGRATIONS_API : CREATE_INTEGRATIONS_API, {
        method: existingIntegration.length ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData?.message || "Failed to save integration");
      }

      const result = await response.json();

      // Following initialization pattern with optional chaining and fallbacks
      setExistingIntegration(selectedGroups.map(group => ({
        id: group.id || '',
        name: group.name || 'Unnamed Group'
      })));

      toast.success(result?.message || "Integration updated successfully");
    } catch (err) {
      console.error("Integration error:", err);
      toast.error(err instanceof Error ? err.message : "Failed to update integration");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-6">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-600 mb-4"></div>
        <p className="text-gray-600">Loading WhatsApp groups...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-6">
        <div className="text-red-500 text-4xl mb-4">⚠️</div>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Groups</h2>
        <p className="text-gray-600 text-center">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-6">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-600 mb-4"></div>
        <p className="text-gray-600">Loading WhatsApp groups...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-6">
        <div className="text-red-500 text-4xl mb-4">⚠️</div>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Groups</h2>
        <p className="text-gray-600 text-center">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }
  
  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-800 text-center mb-6">WhatsApp Groups Integration</h1>

      {/* Existing Integrations */}
      {existingIntegration.length > 0 && (
        <div className="mt-6 bg-gray-100 p-6 rounded-xl shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Currently Integrated Groups</h2>
            <span className="text-sm text-gray-600">{existingIntegration.length} group{existingIntegration.length !== 1 ? 's' : ''}</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {existingIntegration.map((group) => (
              <div key={group.id} className="bg-white border border-gray-200 rounded-xl shadow-md p-4">
                <h3 className="text-md text-gray-700 font-semibold truncate">{group.name || 'Unnamed Group'}</h3>
                <p className="text-sm text-gray-500 mt-1 truncate">ID: {group.id}</p>
              </div>
            ))}
          </div>
        </div>
      )}


      {/* Select Groups for Integration */}
      <h2 className="text-xl font-semibold text-gray-800 mt-8">Select Groups to Integrate</h2>
      {whatsappGroups.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
          {whatsappGroups.map((group: WhatsAppGroup) => (
            <div
              key={group.id}
              className={`cursor-pointer bg-white border border-gray-200 rounded-xl shadow-md p-5 transition-transform transform hover:scale-105 hover:shadow-lg ${selectedGroups.some((g) => g.id === group.id) ? "border-green-500 bg-green-50" : ""
                }`}
              onClick={() => toggleSelection(group)}
            >
              <h2 className="text-lg font-semibold text-gray-900">{group.name || "Unnamed Group"}</h2>
              <p className="text-sm text-gray-500 mt-1">ID: {group.id}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center min-h-[200px] p-6 bg-gray-50 rounded-xl border border-gray-200">
          <div className="text-gray-400 text-4xl mb-4">📱</div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No WhatsApp Groups Available</h3>
          <p className="text-gray-500 text-center max-w-md">
            No WhatsApp groups were found. Make sure you have created groups in your WhatsApp account.
          </p>
        </div>
      )}


      {/* Button for Saving Integrations */}
      <div className="flex justify-center mt-8 mb-4">
        <button
          className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors min-w-[180px] shadow-sm"
          onClick={saveIntegration}
          disabled={selectedGroups.length === 0 || saving}
        >
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-3" />
              <span>{existingIntegration.length ? "Updating..." : "Creating..."}</span>
            </>
          ) : (
            <span>{existingIntegration.length ? "Update Integration" : "Create Integration"}</span>
          )}
        </button>
      </div>
    </div>
  );
}
