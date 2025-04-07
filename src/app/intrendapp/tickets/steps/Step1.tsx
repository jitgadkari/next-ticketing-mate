"use client";
import React, { useEffect, useState } from "react";
import Button from "../../../components/Button";
import toast from "react-hot-toast";

interface Step1Props {
  ticketNumber: string;
  message: string;
  customerName: string;
  isCurrentStep: boolean;
  personName: string;
  ticket: {
    id: string;
    ticket_number: string;
    customer_name: string;
    current_step: string;
    steps: Record<string, any>;
    created_date: string;
    updated_date: string;
  };
  step: string;
  setActiveStep: (step: string) => void;
  fetchTicket: (ticketId: string) => Promise<void>;
}

interface StepVersion {
  time: string;
  text: string;
}

const Step1: React.FC<Step1Props> = ({
  ticketNumber,
  message,
  customerName,
  personName,
  isCurrentStep,
  ticket,
  step,
  fetchTicket,
  setActiveStep,
}) => {
  const [loading, setLoading] = useState(false);
  const [editedMessage, setEditedMessage] = useState(message);
  const [selectedVersion, setSelectedVersion] = useState<string>('latest');

  const stepData = ticket.steps[step] || {};
  const versions = stepData.versions || [];

  const allVersions = [
    {
      version: 'latest',
      id: 'latest',
      time: stepData.latest?.time || 'No timestamp',
      text: stepData.latest?.text || ''
    },
    ...versions.map((v: StepVersion, index: number) => ({
      version: v.time,
      id: `version-${index}-${v.time}`,
      time: v.time,
      text: v.text
    }))
  ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

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

  const handleVersionChange = (version: string) => {
    if (isCurrentStep) {
      setSelectedVersion(version);
      const selected = allVersions.find(v => v.version === version);
      if (selected) {
        setEditedMessage(selected.text);
      }
    }
  };

  const handleSave = async () => {
    try {
      const payload = {
        ticket_id: ticket.id,
        step_info: {
          text: editedMessage,
        },
        step_number: step,
      };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/api/tickets/update_step/specific?userId=1234&userAgent=user-test`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to save message");
      }

      toast.success("Message saved successfully");
      await fetchTicket(ticket.id);
    } catch (error) {
      console.error("Error saving message:", error);
      toast.error("Failed to save message");
    }
  };

  const handleNext = async () => {
    console.log("Handling next for Step 1");
    try {
      setLoading(true);
      
      // First save the current message
      await handleSave();
      
      // Then proceed with decoding and moving to next step
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/api/groq/customer_message_decode`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ customer_message: editedMessage }),
        }
      );

      if (!response.ok) throw new Error("Failed to decode message");
      const decoded_messages = await response.json();

      await fetch(
        `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/api/tickets/update_next_step/?userId=1234&userAgent=user-test`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ticket_id: ticket.id,
            step_info: { decoded_messages },
            step_number: step,
          }),
        }
      );

      await fetchTicket(ticket.id);
      setActiveStep("Step 2 : Message Decoded");
    } catch (error) {
      console.error("Error in Step 1 next handler:", error);
      toast.error("Error decoding message");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
      {!loading && (
        <>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">Step 1: Customer Message Received</h3>
            <div className="flex items-center space-x-4">
              {isCurrentStep && versions.length > 0 && (
                <select
                  value={selectedVersion}
                  onChange={(e) => handleVersionChange(e.target.value)}
                  className="border rounded px-2 py-1 text-sm"
                >
                  {allVersions.map(({version, time, id}) => (
                    <option key={id} value={version}>
                      {version === 'latest' ? 'Latest Version' : formatTime(time)}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">Customer Name:</label>
            <p className="text-gray-800">{customerName}</p>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">Person Name:</label>
            <p className="text-gray-800">{personName}</p>
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">Message:</label>
            <textarea
              value={editedMessage}
              onChange={(e) => setEditedMessage(e.target.value)}
              className="w-full h-32 p-2 border rounded"
              disabled={!isCurrentStep}
            />
          </div>

          <div className="flex items-center justify-end space-x-4">
            <Button
              onClick={handleSave}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              disabled={!isCurrentStep}
            >
              Save
            </Button>
            <Button
              onClick={handleNext}
              className={`font-bold py-2 px-4 rounded ${
                isCurrentStep
                  ? "bg-green-500 hover:bg-green-700 text-white"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
              disabled={!isCurrentStep}
            >
              Next
            </Button>
          </div>
        </>
      )}
      {loading && <h1>Loading ....</h1>}
    </div>
  );
};

export default Step1;
