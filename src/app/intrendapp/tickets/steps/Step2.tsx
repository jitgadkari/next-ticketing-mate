"use client";
import React, { useState, useEffect } from "react";
import Button from "../../../components/Button";
import { FaEdit } from "react-icons/fa";
import EditDecodedMessage from "@/app/components/step2/EditDecodedMessage";
import toast from "react-hot-toast";

interface Step2Props {
  ticketNumber: string;
  data: Record<string, any>;
  originalMessage: string;
  setActiveStep: (step: string) => void;
  fetchTicket: (ticketId: string) => Promise<void>;
  isCurrentStep: boolean;
  step: string
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

const NestedDataTable: React.FC<{ data: any; isEditing?: boolean; onEdit?: (field: string, value: any) => void }> = ({
  data,
  isEditing = false,
  onEdit,
}) => {
  const renderValue = (value: any): React.ReactNode => {
    if (typeof value === "object" && value !== null) {
      return (
        <table className="w-full nested-table">
          <tbody>
            {Object.entries(value).map(([subKey, subValue]) => (
              <tr key={subKey} className="border-b border-gray-100">
                <td className="py-1 px-2 text-sm font-medium capitalize w-1/3">{subKey.replace(/_/g, " ")}</td>
                <td className="py-1 px-2 text-sm">{renderValue(subValue)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    }
    
    if (isEditing && onEdit) {
      return (
        <input
          type={typeof value === "number" ? "number" : "text"}
          value={value?.toString() || ""}
          onChange={(e) => onEdit(value, e.target.value)}
          className="w-full border rounded px-2 py-1 text-sm"
        />
      );
    }
    
    return String(value) || "Not Found";
  };

  return (
    <table className="w-full border-collapse">
      <tbody>
        {Object.entries(data).map(([key, value]) => (
          <tr key={key} className="border-b">
            <td className="py-2 px-4 text-sm font-medium capitalize w-1/3 bg-gray-50">{key.replace(/_/g, " ")}</td>
            <td className="py-2 px-4 text-sm">{renderValue(value)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

const Step2: React.FC<Step2Props> = ({
  ticketNumber,
  data,
  originalMessage,
  fetchTicket,
  setActiveStep,
  isCurrentStep,
  ticket,
  step
}) => {
  console.log("Step 2 data:", data);
  console.log("Step 2 message:", originalMessage);
  console.log("Step 2 versions:", ticket.steps[step]);

  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState(JSON.stringify(data, null, 2));
  const [loading, setLoading] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<string>('latest');

  interface VersionData {
    time?: string;
    decoded_messages: Record<string, any>;
  }

  interface StepVersion {
    time: string;
    decoded_messages: Record<string, any>;
  }

  const stepData = ticket.steps[step] || {};
  const versions = stepData.versions || [];
  
  // Add latest version to the versions array for unified handling
  const allVersions = [
    {
      version: 'latest',
      time: stepData.latest?.time || 'No timestamp',
      decoded_messages: stepData.latest?.decoded_messages || {}
    },
    ...versions.map((v: StepVersion) => ({
      version: v.time, // Using time as version identifier
      time: v.time,
      decoded_messages: v.decoded_messages
    }))
  ];

  // Sort versions by time in descending order (newest first)
  allVersions.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

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
      const selectedVersion = allVersions.find(v => v.version === version);
      if (selectedVersion) {
        setMessage(JSON.stringify(selectedVersion.decoded_messages, null, 2));
      }
    }
  };
  // const [includeDecodedMessage, setIncludeDecodedMessage] = useState(true);
  const handleNext = async () => {
    console.log("Handling next for Step 2");
    await fetchTicket(ticket.id);
    setLoading(false);
    setActiveStep("Step 3 : Message Template for vendors");
    toast.success("Step 2 completed");
  };

  const handleUpdate = async (updatedData: Record<string, any>) => {
    console.log("Updating Step 2 data:", updatedData);
    const payload = {
      ticket_id: ticket.id,
      step_info: { decoded_messages: updatedData },
      step_number: step,
    };

    console.log("Payload:", JSON.stringify(payload));
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/ticket/update_step/specific?user_id=1234&user_agent=user-test`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Update failed:", errorData);
      } else {
        const responseData = await response.json();
        console.log("Update successful:", responseData);
      }
    } catch (error) {
      console.error("Error during fetch:", error);
    }
    fetchTicket(ticket.id);
  };

  // useEffect(() => {
  //   if (isCurrentStep) {
  //     handleUpdate(JSON.parse(message));
  //   }
  // }, [isCurrentStep]);

  const handleSave = async () => {
    const updatedData = JSON.parse(message);
    console.log("updatedData from save button: ", updatedData);
    await handleUpdate(updatedData);
    setIsEditing(false);
  };

  const handleNextStep = async () => {
    setLoading(true);
    try {
      const messageText =
        typeof originalMessage === "string"
          ? originalMessage
          : JSON.parse(originalMessage).text || "";
      console.log(ticket.ticket_number, messageText);
      console.log("payload...",JSON.stringify({
        vendor_name: "{VENDOR}",
        customerMessage: messageText,
        ticket_number: ticket.ticket_number,
        asked_details:ticket.steps["Step 2 : Message Decoded"].latest.decoded_messages,
        asked_details_required: false,
      }))
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/post_message_template_for_vendor_direct_message`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            vendor_name: "{VENDOR}",
            customerMessage: messageText,
            ticket_number: ticket.ticket_number,
            asked_details:ticket.steps["Step 2 : Message Decoded"].latest.decoded_messages,
            asked_details_required: false,
          }),
        }
      );
      console.log(response);
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error response:", errorData);
        throw new Error(
          `Failed to generate vendor message template: ${response.statusText}`
        );
      }

      const data = await response.json();
      console.log(data);
      const vendorMessageTemplate = data;
      console.log(vendorMessageTemplate);

      console.log("payload...",({
        ticket_id: ticket.id,
        step_info: { vendor_message_temp: vendorMessageTemplate },
        step_number: step,
      }))
      const updateResponse = await fetch(
        `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/ticket/update_next_step/?user_id=1234&user_agent=user-test`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ticket_id: ticket.id,
            step_info: { vendor_message_temp: vendorMessageTemplate },
            step_number: step,
          }),
        }
      );
      console.log(updateResponse);
      if (!updateResponse.ok) {
        const errorData = await updateResponse.json();
        console.error("Error response:", errorData);
        throw new Error(
          `Failed to update next step: ${updateResponse.statusText}`
        );
      }
      const responseData = await updateResponse.json();
      console.log("Update successful:", responseData);
      await handleNext();
    } catch (error) {
      console.error("Error preparing for next step:", error);
    }
  };
  console.log(message);
  // const handleIncludeDecodedMessage=()=>{
  //   setIncludeDecodedMessage(!includeDecodedMessage);
  // }
  const parsedMessage: Record<string, string> = JSON.parse(message);
  return (
    <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
      <div className="py-2">
        <h1 className="text-xl font-bold ">Customer Message</h1>
        <div>{ticket.steps["Step 1 : Customer Message Received"].text}</div>
      </div>
      {!isEditing ? (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">Step 2: Decoded Message</h3>
            <div className="flex items-center space-x-4">
              {isCurrentStep && versions.length > 0 && (
                <select
                  value={selectedVersion}
                  onChange={(e) => handleVersionChange(e.target.value)}
                  className="border rounded px-2 py-1 text-sm"
                >
                  {allVersions.map(({version, time}) => (
                    <option key={version} value={version}>
                      {version === 'latest' ? 'Latest Version' : formatTime(time)}
                    </option>
                  ))}
                </select>
              )}
              <div
                className="flex justify-end items-center cursor-pointer"
                onClick={() => setIsEditing(true)}
              >
                <FaEdit className="text-black text-2xl" />
              </div>
            </div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <NestedDataTable data={JSON.parse(message)} />
          </div>
        </div>
      ) : (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">Step 2: Decoded Message</h3>
            <div className="flex gap-2">
              <Button
                onClick={() => setIsEditing(false)}
                className="bg-red-500 text-white px-4 py-2 rounded"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                className="bg-green-500 text-white px-4 py-2 rounded"
              >
                Save
              </Button>
            </div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <EditDecodedMessage
              message={message}
              setMessage={setMessage}
              className="w-full"
            />
          </div>
        </div>
      )}

      <div className="flex justify-end mt-4">
        <Button
          onClick={handleNextStep}
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
    </div>
  );
};

export default Step2;
