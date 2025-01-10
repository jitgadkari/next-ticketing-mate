"use client";
import React, { useState, useEffect } from "react";
import Button from "../../../components/Button";
import toast from "react-hot-toast";
import { AiOutlineEdit } from "react-icons/ai";

interface Step5Props {
  ticketNumber: string;
  vendorMessages: Record<string, string>;
  isCurrentStep: boolean;
  setActiveStep: (step: string) => void;
  fetchTicket: (ticketId: string) => Promise<void>;
  ticket: {
    _id: string;
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
  const [messages, setMessages] = useState<Record<string, string>>(vendorMessages);
  const [isDecoding, setIsDecoding] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [showReminderPopup, setShowReminderPopup] = useState(false);
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<string | null>(null);
  const [editPopupVendor, setEditPopupVendor] = useState<string | null>(null);
  const [editableVendors, setEditableVendors] = useState<Record<string, boolean>>({});

  const handleNext = async (data: any) => {
    console.log("Handling next for Step 5");
    const currentMessages = data.ticket.steps[step] as Record<string, string>;
    const vendorDecodedMessages: Record<string, any> = {};

    for (const [vendor, message] of Object.entries(currentMessages)) {
      console.log(message);
      let formatmsg = `query from customer :${ticket.steps["Step 1 : Customer Message Received"].text} vendor reply :${message}`;
      console.log(formatmsg);
      if (message.trim() !== "") {
        // generating null message
        const nullMessage = {
          "Bulk 1": {
            "query": "Not Found",
            "rate": {
              "price_per_meter": "Not Found",
              "currency": "INR",
              "quantity": "Not Found",
              "additional_charges": "Not Found",
              "other_info": "Not Found"
            },
            "schedule": {
              "delivery_time": "Not Found",
              "delivery_point": "Not Found",
              "delivery_method": "Not Found"
            }
          }
        }
        // Only decode non-empty messages
        try {

          
          

          // fetching decoded message
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/post_vendor_message_decode_groq`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ text: formatmsg }),
            }
          );
          if (!response.ok) {
            // throw new Error(`HTTP error! status: ${response.status}`);
            // adding null message if error occurs
            vendorDecodedMessages[vendor] = nullMessage
          }
          const decodedMessage = await response.json();
          vendorDecodedMessages[vendor] = decodedMessage;
        } catch (error) {
          console.error(`Error decoding message for ${vendor}:`, error);
          // vendorDecodedMessages[vendor] = {
          //   error: "Failed to decode message",
          // };

          vendorDecodedMessages[vendor] = nullMessage
        }
      } else {
        console.log(`Skipping empty message for ${vendor}`);
      }
    }

    console.log("Decoded vendor messages:", vendorDecodedMessages);

    if (Object.keys(vendorDecodedMessages).length > 0) {
      try {
        const updateResponse = await fetch(
          `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/ticket/update_next_step/`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              ticket_number: ticket.ticket_number,
              step_info: vendorDecodedMessages,
              step_number: "Step 6 : Vendor Message Decoded",
            }),
          }
        );
        if (!updateResponse.ok) {
          throw new Error(`HTTP error! status: ${updateResponse.status}`);
        }
      } catch (error) {
        console.error("Error updating next step:", error);
      }

      await fetchTicket(ticket._id);
      setActiveStep("Step 6 : Vendor Message Decoded");
    } else {
      console.error(
        "No messages to decode. Please enter messages for vendors."
      );
    }
  };

  const handleUpdate = async (updatedMessages: Record<string, string>) => {
    console.log("Updating Step 5 messages:", updatedMessages);
    await fetch(
      `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/ticket/update_specific_step/`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ticket_number: ticket.ticket_number,
          step_number: "Step 5: Messages from Vendors",
          step_info: updatedMessages,
        }),
      }
    );
    fetchTicket(ticket._id);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      window.location.reload();
    }, 50000);
    const allMessagesAreFilled = Object.values(messages).every(
      (message) => message.trim() !== ""
    );
    if (allMessagesAreFilled) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [messages]);

  const handleChange = (vendor: string, value: string) => {
    setMessages((prevMessage) => {
      const updatedMessages = {
        ...prevMessage,
        [vendor]: value,
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
    setIsDecoding(true);
    try {
      // First, save the current messages
      await handleSave();
      const updatedData = await updateTicket(ticket._id);
      // Then proceed to the next step
      await handleNext(updatedData);
    } finally {
      setIsDecoding(false);
    }
  };

  const updateTicket = async (ticketId: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/ticket/${ticketId}`
      );
      const data = await response.json();
      console.log(data);
      return data;
    } catch (error) {
      console.error("Error fetching ticket:", error);
    }
  };
  const fetchVendors = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/vendors_all`
      );
      const data = await response.json();
      console.log(data);
      return data;
    } catch (error) {
      console.error("Error fetching vendors:", error);
    }
  };
  const sendReminderToAllRemainingVendors = async () => {
    Object.entries(messages).map(async ([vendor, message]) => {
      const fetchedVendors = await fetchVendors();
      const vendors = fetchedVendors.vendors.filter(
        (fetchedVendor: any) => fetchedVendor.name === vendor
      );
      if (vendors.length > 0) {
        if (!message) {
          sendReminder(ticket.ticket_number, vendor);
        }
      }
    });
  };
  const sendReminder = async (ticket_number: string, vendorName: string) => {
    try {
      const fetchedVendors = await fetchVendors();
      const vendor = fetchedVendors.vendors.find(
        (vendor: any) => vendor.name === vendorName
      );
      const getGroup = Object.values(vendor.group)[0];
      if (!getGroup) {
        throw new Error("Group not found");
      }
      const vendorMessage = `Hello ${vendorName} \n \nWe are still waiting for your response on the ticket number ${ticket_number}.\n \nPlease respond as soon as possible.`;
      if (!vendor) {
        console.error(`Vendor ${vendorName} not found`);
        return;
      }
      await fetch(
        `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/send_whatsapp_message`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            to: getGroup,
            message: vendorMessage,
          }),
        }
      );
      toast.success(`Reminder sent to ${vendorName} successfully.`);
    } catch (error) {
      toast.error(`Failed to send reminder to ${vendorName}.`);
    }
  };

  const handleReminderClick = (vendor: string) => {
    setSelectedVendor(vendor);
    setShowReminderPopup(true);
  };

  const handleEditClick = (vendor: string) => {
    setEditPopupVendor(vendor);
    setShowEditPopup(true);
  };

  const confirmEdit = (vendor: string) => {
    setEditableVendors((prev) => ({
      ...prev,
      [vendor]: true
    }));
    setShowEditPopup(false);
  };

  return (
    <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
      <div className="py-1 mb-4">
        <h1 className="text-xl font-bold ">Customer Message</h1>
        <div>{ticket.steps["Step 1 : Customer Message Received"].text}</div>
      </div>
      <div className="flex justify-between py-2">
        <h3 className="text-xl font-bold mb-4">
          Step 5: Messages from Vendors
        </h3>
        <Button
          onClick={sendReminderToAllRemainingVendors}
          className="bg-gray-500 hover:bg-green-800 text-white font-bold  px-2 rounded"
        >
          Remind all
        </Button>
      </div>
      {Object.entries(messages).map(([vendor, message]) => (
        <div key={vendor} className="mb-4">
          <div className=" flex justify-between items-center">
            <label className="block text-gray-700 font-bold mb-2">
              {vendor}
            </label>
            <div className="flex space-x-2">
              {message === "" && (
                <Button
                  onClick={() => handleReminderClick(vendor)}
                  className="bg-gray-500 hover:bg-green-800 text-white font-bold py-2 px-4 rounded"
                  disabled={!isCurrentStep}
                >
                  Send Reminder
                </Button>
              )}
              {isCurrentStep && (
                <AiOutlineEdit
                  onClick={() => handleEditClick(vendor)}
                  className="text-gray-500 hover:text-green-800 cursor-pointer mt-3"
                  size={24}
                />
              )}
            </div>
          </div>
          <textarea
            value={message}
            onChange={(e) => handleChange(vendor, e.target.value)}
            className="w-full h-32 p-2 border rounded"
            readOnly={!editableVendors[vendor]}
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
          className={`font-bold py-2 px-4 rounded ${
            isCurrentStep
              ? "bg-green-500 hover:bg-green-700 text-white"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
          disabled={!isCurrentStep || isDecoding}
        >
          {isDecoding ? "Decoding..." : "Next"}
        </Button>
      </div>
      
      {/* Edit Confirmation Popup */}
      {showEditPopup && editPopupVendor && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
          <div className="bg-white p-5 rounded-lg shadow-xl">
            <h2 className="text-xl font-bold mb-4">Edit Message</h2>
            <p className="mb-4">
              Are you sure you want to enable editing for {editPopupVendor}?
            </p>
            <div className="flex justify-end">
              <Button
                onClick={() => setShowEditPopup(false)}
                className="mr-2 bg-gray-300 hover:bg-gray-400 text-black font-bold py-2 px-4 rounded"
              >
                Cancel
              </Button>
              <Button
                onClick={() => confirmEdit(editPopupVendor)}
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