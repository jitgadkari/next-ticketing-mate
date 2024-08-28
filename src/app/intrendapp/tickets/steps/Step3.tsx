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
    _id: string;
    ticket_number: string;
    customer_name: string;
    current_step: string;
    steps: Record<string, any>;
    created_data: string;
    updated_date: string;
  };
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
}) => {
  const [message, setMessage] = useState(template);
  const [includeCustomerName, setIncludeCustomerName] = useState(true);
  const [loading, setLoading] = useState(false);
  const handleNext = async () => {
    console.log("Handling next for Step 3");
    await fetch(
      `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/ticket/update_next_step/`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ticket_number: ticket.ticket_number,
          step_info: { list: [] },
          step_number: "Step 4 : Vendor Selection",
        }),
      }
    );
    fetchTicket(ticket._id);
    setLoading(false);
    setActiveStep("Step 4 : Vendor Selection");
    toast.success("Step 3 completed")
  };
  const handleUpdate = async (updatedTemplate: string) => {
    console.log("Updating Step 3 template:", updatedTemplate);
    await fetch(
      `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/ticket/update_specific_step/`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ticket_number: ticket.ticket_number,
          step_info: { text: updatedTemplate },
          step_number: "Step 3 : Message Template for vendors",
        }),
      }
    );
    fetchTicket(ticket._id);
  };

  useEffect(() => {
    fetchVendorTemplate();
  }, []);

  const fetchVendorTemplate = async () => {
    try {
      console.log(originalMessage);
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
          }),
        }
      );
      const data = await response.json();
      let initialMessage = data.vendor_message_template;

      // If the customer name should be included by default, append it
      if (includeCustomerName) {
        initialMessage += `\n\nCustomer Name: ${customerName}`;
      }
      setMessage(initialMessage);
    } catch (error) {
      console.error("Error fetching vendor template:", error);
    }
  };

  const handleNextStep = async () => {
    try {
      setLoading(true);
      await handleUpdate(message);
      await fetch(
        `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/ticket/update_next_step/`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ticket_number: ticketNumber,
            step_info: { list: [] },
            step_number: "Step 4 : Vendor Selection",
          }),
        }
      );

      handleNext();
    } catch (error) {
      console.error("Error updating ticket:", error);
    }
  };

  const handleSave = () => {
    handleUpdate(message);
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

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    setMessage(e.target.value);
  };

  return (
    <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
      {!loading && (
        <>
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
          <div className="flex justify-between mb-4 mt-4">
            <Button
              onClick={handleSave}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Save
            </Button>
            <Button
              onClick={toggleCustomerName}
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
            >
              {includeCustomerName
                ? "Remove Customer Name"
                : "Add Customer Name"}
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
