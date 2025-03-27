"use client";
import React, { useState, useEffect, useMemo } from "react";
import Button from "../../../components/Button";
import toast from "react-hot-toast";
import { AiOutlineEdit } from "react-icons/ai";
interface VendorMessage {
  vendor_name: string;
  response_received: boolean;
  response_message: string;
  message_received_time: string | null;
}
interface DecodedMessage {
  query: string;
  rate: {
    price_per_meter: number | string;
    currency: string;
    quantity: string;
    additional_charges: string;
    other_info: string;
  };
  schedule: {
    delivery_time: string;
    delivery_point: string;
    delivery_method: string;
  };
}
interface VendorDecodedMessage {
  vendor_name: string;
  decoded_message: Record<string, DecodedMessage>;
  original_message: string;
  response_received_time: string;
}
interface StepVersion {
  time: string;
  vendors: Record<string, VendorMessage>;
}

interface Step5Props {
  ticketNumber: string;
  vendorMessages: Record<string, VendorMessage>;
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
  step: string;
}

const Step5: React.FC<Step5Props> = ({
  ticketNumber,
  vendorMessages,
  isCurrentStep,
  fetchTicket,
  setActiveStep,
  ticket,
  step,
}) => {
  const [messages, setMessages] = useState(vendorMessages || {});
  const [isDecoding, setIsDecoding] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [showReminderPopup, setShowReminderPopup] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<string>('latest');
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<string | null>(null);
  const [editPopupVendor, setEditPopupVendor] = useState<
    Record<string, string>
  >({});
  const [editableVendors, setEditableVendors] = useState<
    Record<string, boolean>
  >({});

  const allVersions = useMemo(() => {
    const stepData = ticket.steps["Step 5 : Messages from Vendors"] || {};
    const versions = stepData.versions || [];

    const versionList = [
      {
        version: 'latest',
        time: stepData.latest?.time || new Date().toISOString(),
        data: stepData.latest || {}
      },
      ...versions.map((v: StepVersion) => ({
        version: v.time,
        time: v.time,
        data: v
      }))
    ];

    return versionList.sort((a, b) => {
      if (a.version === 'latest') return -1;
      if (b.version === 'latest') return 1;
      return new Date(a.time).getTime() - new Date(b.time).getTime();
    });
  }, [ticket.steps]);

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

  useEffect(() => {
    const versionData = allVersions.find(v => v.version === selectedVersion);
    if (versionData && versionData.data.vendors) {
      setMessages(versionData.data.vendors);
    }
  }, [selectedVersion, allVersions]);

  const handleVersionChange = (version: string) => {
    setSelectedVersion(version);
    const selectedVersion = allVersions.find(v => v.version === version);
    if (selectedVersion && selectedVersion.data.vendors) {
      setMessages(selectedVersion.data.vendors);
    }
  };

  const handleNext = async () => {
    console.log("Handling next for Step 5", messages);
    const vendorDecodedMessages: any[] = [];

    for (const [vendorId, message] of Object.entries(messages)) {
      console.log("Processing vendor message:", message);

      if (message.response_message.trim() !== "") {
        console.log(message.response_message);
        const requestBody = {
          customer_query: ticket.steps["Step 1 : Customer Message Received"]?.latest?.text,
          vendor_reply: message.response_message
        };
        console.log("Request body:", requestBody);

        try {
          // Fetch decoded message
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/api/groq/vendor_message_decode`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(requestBody),
            }
          );

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const decodedMessage = await response.json();
          console.log("Decoded message:", decodedMessage);

          vendorDecodedMessages.push({
            vendor_id: vendorId,
            vendor_name: message.name,
            decoded_response: {
              message: decodedMessage // Wrapping in message object to match Step 6 structure
            },
            original_message: message.response_message,
            response_received_time: message.message_received_time,
          });
        } catch (error) {
          console.error("Error decoding message:", error);

          // If decoding fails, use a default structure
          vendorDecodedMessages.push({
            vendor_id: vendorId,
            vendor_name: message.name,
            decoded_response: {
              message: {
                Bulk: {
                  rate: {
                    price_per_meter: "NOT FOUND",
                    price_method: "Ex-mill",
                    currency: "NOT FOUND",
                    quantity: "NOT FOUND",
                    other_info: "NOT FOUND"
                  },
                  schedule: {
                    starting_delivery: { days: "NOT FOUND", quantity: "NOT FOUND" },
                    completion_delivery: { days: "NOT FOUND", quantity: "NOT FOUND" },
                    delivery_point: "NOT FOUND"
                  }
                }
              }
            },
            original_message: message.response_message,
            response_received_time: message.message_received_time,
          });
        }
      }
    }

    if (vendorDecodedMessages.length > 0) {
      try {
        const currentTime = new Date().toISOString();

        const payload = {
          ticket_id: ticket.id,
          step_info: {
            decoded_messages: vendorDecodedMessages,
            time: currentTime,
          },
          step_number: "Step 5 : Messages from Vendors",
          updated_date: currentTime,
        };

        console.log("Transformed payload:", payload);
        const updateResponse = await fetch(
          `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/api/tickets/update_next_step?userId=a8ccba22-4c4e-41d8-bc2c-bfb7e28720ea&userAgent=user-test`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          }
        );

        if (!updateResponse.ok) {
          throw new Error(`HTTP error! status: ${updateResponse.status}`);
        }

        await fetchTicket(ticket.id);
        setActiveStep("Step 6 : Vendor Message Decoded");
      } catch (error) {
        console.error("Error updating next step:", error);
        toast.error("Failed to update to next step");
      }
    } else {
      console.error(
        "No messages to decode. Please enter messages for vendors."
      );
      toast.error("No messages to decode. Please enter messages for vendors.");
    }
  };
  
  const handleUpdate = async (
    updatedMessages: Record<string, VendorMessage>
  ) => {
    console.log("Updating Step 5 messages:", updatedMessages);

    const formattedVendors = Object.entries(updatedMessages).map(
      ([vendorId, message]) => ({
        vendor_id: vendorId,
        name: message.name,  // Using the correct property name from the message object
        response_received: message.response_message.trim() !== "",
        response_message: message.response_message
      })
    );

    const payload = {
      ticket_id: ticket.id,
      step_info: {
        vendors: formattedVendors
      },
      step_number: "Step 5 : Messages from Vendors"
    };
    console.log("update payload.....", payload);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/api/tickets/update_step/specific?userId=a8ccba22-4c4e-41d8-bc2c-bfb7e28720ea&userAgent=user-test`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(payload)
        }
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      toast.success("Successfully updated vendor messages");
    } catch (error) {
      console.error("Error updating Step 5 messages:", error);
      toast.error("Failed to update vendor messages");
    }
    
    await fetchTicket(ticket.id);
  };

  const fetchVendorById = async (vendorId: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/api/vendors/${vendorId}`
      );
      const data = await response.json();
      return data.vendor;
    } catch (error) {
      console.error("Error fetching vendor by ID:", error);
      return null;
    }
  };

  const sendReminderToAllRemainingVendors = async () => {
    Object.entries(messages).map(async ([vendor_id, message]) => {
      if (!message.response_message) {
        sendReminder(ticket.ticket_number, vendor_id);
      }
    });
  };

  const sendReminder = async (ticket_number: string, vendorId: string) => {
    try {
      const vendor = await fetchVendorById(vendorId);
      console.log(vendor);
      if (!vendor) {
        throw new Error("Vendor not found");
      }

      const vendorMessage = `Hello ${vendor.name} \n \nWe are still waiting for your response on the ticket number ${ticket_number}.\n \nPlease respond as soon as possible.`;

      // Send to groups
      const groupPromises = Object.values(vendor.group || {}).map(groupId =>
        fetch(
          `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/api/whatsapp/send-message`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              to: groupId,
              content: vendorMessage,
            }),
          }
        )
      );

      // Send to personal number if available
      const personalPromises = vendor.phone ? [
        fetch(
          `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/api/whatsapp/send-message`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              to: `${vendor.phone}@c.us`,
              content: vendorMessage,
            }),
          }
        )
      ] : [];

      await Promise.all([...groupPromises, ...personalPromises]);
      toast.success(`Reminder sent to ${vendor.name} successfully.`);
    } catch (error) {
      console.error("Error sending reminder:", error);
      toast.error(`Failed to send reminder to vendor.`);
    }
  };

  const handleChange = (vendor: string, value: string) => {
    // Only allow changes if the vendor is editable
    if (!editableVendors[vendor]) {
      return;
    }

    setMessages((prevMessage) => {
      const updatedMessages = {
        ...prevMessage,
        [vendor]: {
          ...prevMessage[vendor],
          response_message: value,
        },
      };
      return updatedMessages;
    });
    console.log(`Updated messages for ${vendor}:`, value);
  };

  const handleSave = async () => {
    console.log("Saving messages:", messages);
    await handleUpdate(messages);
  };

  const handleNextStep = async () => {
    if (!Object.values(messages).some(msg => msg.response_message?.trim())) {
      toast.error("No messages to decode. Please enter messages for vendors.");
      return;
    }

    setIsDecoding(true);
    try {
      await handleNext();
    } catch (error) {
      console.error("Error in handleNextStep:", error);
      toast.error("Failed to decode messages. Please try again.");
    } finally {
      setIsDecoding(false);
    }
  };

  const handleEditClick = (vendor: string, vendorName: string) => {
    setEditPopupVendor({ vendor_name: vendorName, vendor_id: vendor });
    setSelectedVendor(vendor);
    setShowEditPopup(true);
  };

  const confirmEdit = (vendor: string) => {
    setEditableVendors((prev) => ({
      ...prev,
      [vendor]: true,
    }));
    setShowEditPopup(false);
  };

  const handleRefresh = async () => {
    console.log("Refreshing page...");
    await fetchTicket(ticket.id);

    // After fetchTicket completes, use the updated ticket prop
    const updatedVendorMessages =
      ticket.steps["Step 5 : Messages from Vendors"]?.latest?.vendors || {};
    console.log("Updated vendor messages:", updatedVendorMessages);
    // Update state with the latest vendor messages
    setMessages(updatedVendorMessages);
  };

  return (
    <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
      <div className="py-1 mb-4">
        <h1 className="text-xl font-bold ">Customer Message</h1>
        <div>
          {ticket.steps["Step 1 : Customer Message Received"]?.latest?.text}
        </div>
      </div>
      <div className="flex justify-between py-2">
        <div className="flex items-center space-x-4">
          <h3 className="text-xl font-bold mb-4">
            Step 5 : Messages from Vendors
          </h3>
          {isCurrentStep && allVersions.length > 1 && (
            <select
              value={selectedVersion}
              onChange={(e) => handleVersionChange(e.target.value)}
              className="border rounded px-2 py-1 text-sm ml-4"
            >
              {allVersions.map(({ version, time }) => (
                <option key={version} value={version}>
                  {version === 'latest' ? 'Latest Version' : formatTime(time)}
                </option>
              ))}
            </select>
          )}
        </div>
        <Button
          onClick={sendReminderToAllRemainingVendors}
          className="bg-gray-500 hover:bg-green-800 text-white font-bold  px-2 rounded"
        >
          Remind all
        </Button>
      </div>
      {Object?.entries(messages).map(([vendor_id, message]) => (
        <div key={vendor_id} className="mb-4">
          <div className=" flex justify-between items-center">
            <label className="block text-gray-700 font-bold mb-2">
              {message.name}
            </label>
            <label className="block text-gray-700 font-bold mb-2">
              Vendor Responded : {message.response_received ? "YES" : "NO"}
            </label>
            <div className="flex space-x-2">
              {message.response_message === "" && (
                <Button
                  onClick={() => sendReminder(ticket.ticket_number, vendor_id)}
                  className="bg-gray-500 hover:bg-green-800 text-white font-bold py-2 px-4 rounded"
                  disabled={!isCurrentStep}
                >
                  Send Reminder
                </Button>
              )}
              {isCurrentStep && (
                <AiOutlineEdit
                  onClick={() =>
                    handleEditClick(vendor_id, message.vendor_name)
                  }
                  className="text-gray-500 hover:text-green-800 cursor-pointer mt-3"
                  size={24}
                />
              )}
            </div>
          </div>
          <textarea
            value={message.response_message}
            onChange={(e) => handleChange(vendor_id, e.target.value)}
            className="w-full h-32 p-2 border rounded"
            readOnly={!editableVendors[vendor_id]}
          />
        </div>
      ))}
      <div className="flex justify-end space-x-4">
        <Button
          onClick={handleSave}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          disabled={!isCurrentStep}
        >
          Save
        </Button>
        <Button
          onClick={handleNextStep}
          className={`font-bold py-2 px-4 rounded ${isCurrentStep
              ? "bg-green-500 hover:bg-green-700 text-white"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          disabled={!isCurrentStep || isDecoding}
        >
          {isDecoding ? "Decoding..." : "Next"}
        </Button>
        <div className="mt-6 flex justify-center">
          <Button
            onClick={handleRefresh}
            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Edit Confirmation Popup */}
      {showEditPopup && editPopupVendor && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
          <div className="bg-white p-5 rounded-lg shadow-xl">
            <h2 className="text-xl font-bold mb-4">Edit Message</h2>
            <p className="mb-4">
              Are you sure you want to enable editing for{" "}
              {editPopupVendor.vendor_name}?
            </p>
            <div className="flex justify-end">
              <Button
                onClick={() => setShowEditPopup(false)}
                className="mr-2 bg-gray-300 hover:bg-gray-400 text-black font-bold py-2 px-4 rounded"
              >
                Cancel
              </Button>
              <Button
                onClick={() => confirmEdit(editPopupVendor.vendor_id)}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                OK
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Reminder Confirmation Popup */}
      {showReminderPopup && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
          <div className="bg-white p-5 rounded-lg shadow-xl">
            <h2 className="text-xl font-bold mb-4">Send Reminder</h2>
            <p className="mb-4">
              Are you sure you want to send a reminder to {selectedVendor} to
              respond to this ticket?
            </p>
            <div className="flex justify-end">
              <Button
                onClick={() => setShowReminderPopup(false)}
                className="mr-2 bg-gray-300 hover:bg-gray-400 text-black font-bold py-2 px-4 rounded"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  sendReminder(ticket.ticket_number, selectedVendor || "");
                  setShowReminderPopup(false);
                }}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                OK
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Step5;
