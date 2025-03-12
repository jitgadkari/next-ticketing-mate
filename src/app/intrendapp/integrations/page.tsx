"use client";
import { useState, useEffect } from "react";

interface WhatsAppGroup {
  group_id: string;
  group_name: string;
}

interface APIResponse {
  whatsapp?: {
    groups?: WhatsAppGroup[];
  };
}

const FETCH_GROUPS_API = "http://127.0.0.1:8001/integrations/fetch-whatsapp-groups";
const FETCH_LATEST_API = "http://localhost:8001/integrations/latest";
const CREATE_INTEGRATIONS_API = "http://127.0.0.1:8001/integrations/create";
const UPDATE_INTEGRATIONS_API = "http://127.0.0.1:8001/integrations/update";

export default function IntegrationsPage() {
  const [whatsappGroups, setWhatsappGroups] = useState<WhatsAppGroup[]>([]);
  const [selectedGroups, setSelectedGroups] = useState<WhatsAppGroup[]>([]);
  const [existingIntegration, setExistingIntegration] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch available WhatsApp groups
        const groupsResponse = await fetch(FETCH_GROUPS_API);
        if (!groupsResponse.ok) throw new Error("Failed to fetch WhatsApp groups");
        const groupsData: APIResponse = await groupsResponse.json();
        setWhatsappGroups(groupsData.whatsapp?.groups || []);

        // Fetch existing integrations
        const latestResponse = await fetch(FETCH_LATEST_API);
        if (!latestResponse.ok) throw new Error("No existing integrations found");

        const latestData = await latestResponse.json();
        if (latestData.latest?.integrations?.whatsapp?.groups) {
          setExistingIntegration(true);
        }
      } catch (err) {
        console.error("❌ API error:", err);
        setError(err instanceof Error ? err.message : "An unknown error occurred");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const toggleSelection = (group: WhatsAppGroup) => {
    setSelectedGroups((prevSelected) => {
      const isSelected = prevSelected.some((g) => g.group_id === group.group_id);
      if (isSelected) {
        return prevSelected.filter((g) => g.group_id !== group.group_id);
      } else {
        return [...prevSelected, group];
      }
    });
  };

  const saveIntegration = async () => {
    const payload = {
      integrations: {
        whatsapp: {
          groups: selectedGroups,
        },
      },
    };

    try {
      const response = await fetch(
        existingIntegration ? UPDATE_INTEGRATIONS_API : CREATE_INTEGRATIONS_API,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) throw new Error("Failed to save integration");

      const result = await response.json();
      alert("✅ Integration saved successfully!");
      console.log("✅ API Response:", result);
    } catch (err) {
      console.error("❌ API error:", err);
      alert("❌ Failed to save integration");
    }
  };

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
              className={`cursor-pointer bg-white border border-gray-200 rounded-xl shadow-md p-5 transition-transform transform hover:scale-105 hover:shadow-lg ${
                selectedGroups.some((g) => g.group_id === group.group_id)
                  ? "border-green-500 bg-green-50"
                  : ""
              }`}
              onClick={() => toggleSelection(group)}
            >
              <h2 className="text-lg font-semibold text-gray-900">{group.group_name}</h2>
              <p className="text-sm text-gray-500 mt-1">ID: {group.group_id}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500">No WhatsApp groups found.</p>
      )}

      <button
        className="mt-6 px-6 py-3 bg-blue-600 text-white font-bold rounded-md hover:bg-blue-700 disabled:bg-gray-400"
        onClick={saveIntegration}
        disabled={selectedGroups.length === 0}
      >
        {existingIntegration ? "Update Integration" : "Create Integration"}
      </button>
    </div>
  );
}
