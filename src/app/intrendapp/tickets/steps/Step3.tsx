"use client";

import React, { useState, useEffect } from "react";
import Button from "../../../components/Button";
import Input from "../../../components/Input";
import toast from "react-hot-toast";

interface Step3Props {
  ticketNumber: string;
  template: string;
  customerName: string;
  originalMessage: string;
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

const Step3: React.FC<Step3Props> = ({
  ticketNumber,
  template,
  customerName,
  originalMessage,
  isCurrentStep,
  fetchTicket,
  setActiveStep,
  ticket,
  step,
}) => {
  console.log(template);
  console.log(customerName);
  console.log(originalMessage);
  console.log(ticket);
  const [message, setMessage] = useState(template);
  // Initialize includeCustomerName based on whether the template includes customer name
  const [includeCustomerName, setIncludeCustomerName] = useState(() => {
    return template ? template.includes(`Customer Name: ${customerName}`) : true;
  });
  const [includeSampleQuery, setIncludeSampleQuery] = useState(() => {
    return template ? template.includes('This is a Sample Query') : false;
  });
  const [includeDecodedMessage, setIncludeDecodedMessage] = useState(() => {
    // Initialize based on whether the template includes decoded messages
    return template && ticket.steps["Step 2 : Message Decoded"]?.latest?.decoded_messages
      ? message === template // If template exists, check if current message matches it
      : false;
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const initializeState = async () => {
      if (!template) {
        fetchTicket(ticket.id);
        return;
      }
      setMessage(template);

      // Check if the initial template matches what would be returned with decoded messages
      try {
        const decodedTemplate = await message_decoder(true);
        setIncludeDecodedMessage(template === decodedTemplate);
      } catch (error) {
        console.error('Error checking initial decoded message state:', error);
      }
    };

    initializeState();
  }, [template]);

  const handleUpdate = async (updatedTemplate: string) => {
    console.log(updatedTemplate);
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/ticket/update_step/specific?user_id=1234&user_agent=user-test`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ticket_id: ticket.id,
          step_info: {
            vendor_message_temp: updatedTemplate,
          },
          step_number: step,
        }),
      }
    );
    const jsonResponse = await response.json();
    console.log(jsonResponse);
    await fetchTicket(ticket.id);
  };

  const handleNextStep = async () => {
    try {
      setLoading(true);
      await handleUpdate(message);
      await fetch(
        `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/ticket/update_next_step/?user_id=1234&user_agent=user-test`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ticket_id: ticket.id,
            step_info: { vendors: [] },
            step_number: step,
          }),
        }
      );

      setActiveStep("Step 4 : Vendor Selection");
      toast.success("Step 3 completed");
      await fetchTicket(ticket.id);
    } catch (error) {
      console.error("Error updating ticket:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    await handleUpdate(message);
    // Update states based on current message content
    setIncludeCustomerName(message.includes(`Customer Name: ${customerName}`));
    setIncludeSampleQuery(message.includes('This is a Sample Query'));

    // Check if the saved message matches what would be returned with decoded messages
    try {
      const decodedTemplate = await message_decoder(true);
      setIncludeDecodedMessage(message === decodedTemplate);
    } catch (error) {
      console.error('Error checking decoded message state:', error);
    }
  };

  const toggleCustomerName = () => {
    setIncludeCustomerName(!includeCustomerName);
    if (!includeCustomerName) {
      setMessage(
        (prevMessage) => `${prevMessage}\n\nCustomer Name: ${customerName}`
      );
    } else {
      setMessage((prevMessage) =>
        prevMessage.replace(`\n\nCustomer Name: ${customerName}`, "")
      );
    }
  };

  const toggleSampleQuery = () => {
    setIncludeSampleQuery(!includeSampleQuery);
    if (!includeSampleQuery) {
      setMessage((prevMessage) => `${prevMessage}\n\nThis is a Sample Query`);
    } else {
      setMessage((prevMessage) =>
        prevMessage.replace(`\n\nThis is a Sample Query`, "")
      );
    }
  };
  const handleIncludeDecodedMessage = async () => {
    setIncludeDecodedMessage((prevState) => !prevState); // Toggle state first
    const newState = !includeDecodedMessage; // Get new state

    try {
      const vendorMessageTemplate = await message_decoder(newState); // ✅ Await API call

      let updatedMessage = vendorMessageTemplate; // Start with decoded message

      // ✅ Check if customer name should be included
      if (
        includeCustomerName &&
        !updatedMessage.includes(`\n\nCustomer Name: ${customerName}`)
      ) {
        updatedMessage += `\n\nCustomer Name: ${customerName}`;
      }

      // ✅ Check if sample query should be included
      if (
        includeSampleQuery &&
        !updatedMessage.includes(`\n\nThis is a Sample Query`)
      ) {
        updatedMessage += `\n\nThis is a Sample Query`;
      }

      setMessage(updatedMessage);
    } catch (error) {
      console.error("Error including decoded message:", error);
    }
  };

  const message_decoder = async (includeDecodedMessage: boolean) => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/post_message_template_for_vendor_direct_message`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          vendor_name: "{VENDOR}",
          customerMessage: originalMessage,
          ticket_number: ticket.ticket_number,
          asked_details:
            ticket.steps["Step 2 : Message Decoded"].latest.decoded_messages,
          asked_details_required: includeDecodedMessage,
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
    return vendorMessageTemplate;
  };

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const newMessage = e.target.value;
    setMessage(newMessage);
    // Update states based on current input
    setIncludeCustomerName(newMessage.includes(`Customer Name: ${customerName}`));
    setIncludeSampleQuery(newMessage.includes('This is a Sample Query'));

    // Check if the new message matches what would be returned with decoded messages
    try {
      const decodedTemplate = await message_decoder(true);
      setIncludeDecodedMessage(newMessage === decodedTemplate);
    } catch (error) {
      console.error('Error checking decoded message state:', error);
    }
  };

  return (
    <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
      {!loading && (
        <>
          <div className="py-1 mb-4">
            <h1 className="text-xl font-bold">Customer Message</h1>
            <div>{ticket.steps["Step 1 : Customer Message Received"].text}</div>
          </div>
          <h3 className="text-xl font-bold mb-4">
            Step 3: Message Template for Vendors
          </h3>
          <Input
            label="Vendor Template"
            type="textarea"
            name="vendorTemplate"
            value={message}
            onChange={handleInputChange}
            rows={15}
          />
          <div className="flex flex-wrap gap-4 mb-4 mt-4">
            <Button
              onClick={handleSave}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Save
            </Button>
            <Button
              onClick={toggleSampleQuery}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              {includeSampleQuery ? "Remove Sample Query" : "Add Sample Query"}
            </Button>
            <Button
              onClick={toggleCustomerName}
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
            >
              {includeCustomerName
                ? "Remove Customer Name"
                : "Add Customer Name"}
            </Button>
            <Button
              onClick={handleIncludeDecodedMessage}
              className={`font-bold py-2 px-4 rounded ${
                isCurrentStep
                  ? "bg-blue-500 hover:bg-blue-700 text-white"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
              disabled={!isCurrentStep}
            >
              {includeDecodedMessage
                ? "Remove Decoded Message from Template"
                : "Include Decoded Message in Template"}
            </Button>
          </div>
          <Button
            onClick={handleNextStep}
            className={`mt-4 font-bold py-2 px-4 rounded ${
              isCurrentStep
                ? "bg-blue-500 hover:bg-blue-700 text-white"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
            disabled={!isCurrentStep}
          >
            Next Step
          </Button>
        </>
      )}
      {loading && <h1>Loading...</h1>}
    </div>
  );
};

export default Step3;
