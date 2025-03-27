'use client'
import React, { useState, useMemo, useEffect } from 'react';
import Button from '../../../components/Button';
import toast from 'react-hot-toast';

interface Step8Props {
  ticketNumber: string;
  customerTemplate: string;
  customerResponse: string;
  isCurrentStep: boolean;
  setActiveStep: (step: string) => void;
  fetchTicket: (ticketId: string) => Promise<void>;
  ticket: {
    id: string;
    ticket_number: string;
    customer_name: string;
    current_step: string;
    steps: Record<string, any>;
    created_data: string;
    updated_date: string;
  };
}

interface StepVersion {
  time: string;
  customer_message_template: string;
  customer_response: string;
  customer_response_received: boolean;
  customer_response_received_time: string;
}

const Step8: React.FC<Step8Props> = ({ 
  ticketNumber, 
  customerTemplate, 
  customerResponse,
  isCurrentStep,
  fetchTicket,
  setActiveStep,
  ticket,
}) => {
  const [response, setResponse] = useState(customerResponse);
  const [loading, setLoading] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<string>('latest');

  const allVersions = useMemo(() => {
    const stepData = ticket.steps["Step 8 : Customer Response"] || {};
    const defaultData = { 
      customer_message_template: "",
      customer_response: "",
      customer_response_received: false,
      customer_response_received_time: ""
    };

    const versions = (stepData.versions || []).map((version: StepVersion) => ({
      version: version.time,
      time: version.time,
      data: version
    }));

    const versionList = [
      {
        version: 'latest',
        time: stepData.latest?.time || new Date().toISOString(),
        data: stepData.latest || defaultData
      },
      ...versions
    ];

    return versionList.sort((a, b) => {
      if (a.version === 'latest') return -1;
      if (b.version === 'latest') return 1;
      return new Date(b.time).getTime() - new Date(a.time).getTime();
    });
  }, [ticket.steps]);

  useEffect(() => {
    console.log("Dropdown options:", allVersions);
  }, [allVersions]);

  useEffect(() => {
    const versionData = allVersions.find(v => v.version === selectedVersion);
    if (versionData?.data) {
      setResponse(versionData.data.customer_message_received || '');
    }
  }, [selectedVersion, allVersions]);

  const formatTime = (timestamp: string) => {
    if (timestamp === 'No timestamp') return timestamp;
    try {
      const date = new Date(timestamp);
      return date.toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  const handleUpdate = async (updatedResponse: string) => {
    const responseReceived = updatedResponse.trim() !== "";
    try {
      const payload = {
        ticket_id: ticket.id,
        step_info: {
          customer_message_template: customerTemplate,
          customer_response_received: responseReceived,
          customer_message_received: updatedResponse
        },
        step_number: ticket.current_step
      };

      console.log("Updating step with payload:", payload);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/api/tickets/update_step/specific?userId=a8ccba22-4c4e-41d8-bc2c-bfb7e28720ea&userAgent=user-test`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );
toast.success("Step updated successfully");
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update step");
      }

      await fetchTicket(ticket.id);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      console.error("Error updating step:", errorMessage);
      toast.error(`Failed to update step: ${errorMessage}`);
    }
  };

  const handleSave = async () => {
    await handleUpdate(response);
  };

  const handleNextStep = async () => {
    setLoading(true);
    try {
      await handleUpdate(response);
      const currentTime = new Date().toISOString();
      const payload = {
        ticket_id: ticket.id,
        step_info: {
          status: "open",
          final_decision: "pending",
          time: currentTime,
          customer_message_template: customerTemplate,
          customer_response: response,
          customer_response_received: response.trim() !== "",
          customer_response_received_time: currentTime
        },
        step_number: ticket.current_step
      };

      console.log("Moving to next step with payload:", payload);
      const apiResponse = await fetch(
        `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/api/tickets/update_next_step?userId=a8ccba22-4c4e-41d8-bc2c-bfb7e28720ea&userAgent=user-test`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!apiResponse.ok) {
        const errorData = await apiResponse.json();
        throw new Error(errorData.message || "Failed to update step");
      }

      await fetchTicket(ticket.id);
      setActiveStep("Step 9 : Final Status");
      toast.success("Step 8 completed");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      console.error("Error moving to next step:", errorMessage);
      toast.error(`Failed to complete step: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="py-1 mb-4">
        <h1 className="text-xl font-bold">Customer Message</h1>
        <div>{ticket.steps["Step 1 : Customer Message Received"]?.latest?.text}</div>
      </div>
      <div className="flex justify-between items-center my-4">
        <h3 className="text-xl font-bold">Step 8: Customer Response</h3>
        <div className="flex items-center gap-4">
          {isCurrentStep && (
            <select
              value={selectedVersion}
              onChange={(e) => setSelectedVersion(e.target.value)}
              className="px-3 py-2 border rounded-md text-sm"
            >
              {allVersions.map((version: { version: string; time: string }) => (
                <option key={`${version.version}-${version.time}`} value={version.version}>
                  {version.version === 'latest' ? 'Latest Version' : `Version from ${formatTime(version.time)}`}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>
      {!loading && (
        <>
          <div className="bg-gray-100 p-4 rounded mb-4">
            <pre className="whitespace-pre-wrap">{customerTemplate}</pre>
          </div>
          <h3 className="text-xl font-bold mb-4">Customer Response</h3>
          <textarea
            value={response}
            onChange={(e) => setResponse(e.target.value)}
            className="w-full h-32 p-2 border rounded mb-4"
            placeholder="Enter customer's response here..."
          />
        </>
      )}
      {loading && <h1>Loading...</h1>}
      <div className="flex justify-end space-x-4 mt-4">
        <Button
        disabled={!isCurrentStep}
          onClick={handleSave}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Save
        </Button>
        <Button
          onClick={handleNextStep}
          className={`font-bold py-2 px-4 rounded ${
            isCurrentStep
              ? 'bg-green-500 hover:bg-green-700 text-white'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
          disabled={!isCurrentStep}
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default Step8;