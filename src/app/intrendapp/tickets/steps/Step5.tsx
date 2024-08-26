"use client";
import React, { useState, useEffect } from "react";
import Button from "../../../components/Button";

interface Step5Props {
  ticketNumber: string;
  vendorMessages: Record<string, string>;
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
  isCurrentStep: boolean;
}

const Step5: React.FC<Step5Props> = ({
  ticketNumber,
  vendorMessages,
  fetchTicket,
  setActiveStep,
  ticket,
  step,
  isCurrentStep,
}) => {
  const [messages, setMessages] = useState<Record<string, string>>({});
  const [isDecoding, setIsDecoding] = useState(false);

  const handleNext = async (data: any) => {
    console.log("Handling next for Step 5");
    const currentMessages = data.ticket.steps[step] as Record<string, string>;
    const vendorDecodedMessages: Record<string, any> = {};

    for (const [vendor, message] of Object.entries(currentMessages)) {
      if (message.trim() !== "") {
        // Only decode non-empty messages
        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/post_vendor_message_decode_groq`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ text: message }),
            }
          );
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const decodedMessage = await response.json();
          vendorDecodedMessages[vendor] = decodedMessage;
        } catch (error) {
          console.error(`Error decoding message for ${vendor}:`, error);
          vendorDecodedMessages[vendor] = {
            error: "Failed to decode message",
          };
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
    try {
      const response = await fetch(
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
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error("Error updating Step 5:", error);
    }
    await fetchTicket(ticket._id);
  };
  useEffect(() => {
    // Ensure we're setting the initial messages correctly
    if (Object.keys(vendorMessages).length > 0) {
      setMessages(vendorMessages);
    }
  }, [vendorMessages]);

  const handleChange = (vendor: string, value: string) => {
    setMessages((prev) => {
      const updatedMessages = {
        ...prev,
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
      return data;
    } catch (error) {
      console.error("Error fetching ticket:", error);
    }
  };

  return (
    <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
      <h3 className="text-xl font-bold mb-4">Messages from Vendors</h3>
      {Object.entries(messages).map(([vendor, message]) => (
        <div key={vendor} className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">{vendor}</label>
          <textarea
            value={message}
            onChange={(e) => handleChange(vendor, e.target.value)}
            className="w-full h-32 p-2 border rounded"
            readOnly={!isCurrentStep}
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
    </div>
  );
};

export default Step5;
