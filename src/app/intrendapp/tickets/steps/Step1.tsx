"use client";
import React, { useEffect, useState } from "react";
import Button from "../../../components/Button";

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
    created_data: string;
    updated_date: string;
  };
  step: string;
  setActiveStep: (step: string) => void;
  fetchTicket: (ticketId: string) => Promise<void>;
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

  useEffect(() => {
    if (isCurrentStep) {
      handleNext();
    }
  }, [isCurrentStep]);

  const handleNext = async () => {
    console.log("Handling next for Step 1");
    try {
      // Decode the message
      setLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/post_customer_message_decode`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            customer_message: ticket.steps[step].latest.text,
          }),
        }
      );
      if (!response.ok) {
        throw new Error("Failed to decode message");
      }

      const decoded_messages = await response.json();
      const parsedMessage = JSON.parse(decoded_messages);
      // console.log(parsedMessage);
      console.log("payload", {
        ticket_id: ticket.id,
        step_info:  { decoded_messages: parsedMessage },
        step_number: step,
      });
      // Update Step 2 with the decoded message
    if(ticket.id, decoded_messages){
      const updateResponse = await fetch(
        `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/ticket/update_next_step/?user_id=1234&user_agent=user-test`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ticket_id: ticket.id,
            step_info:  { decoded_messages: parsedMessage },
            step_number: step,
          }),
        }
      );
      console.log("update response", updateResponse);
    }
      // Fetch the updated ticket and move to the next step
      await fetchTicket(ticket.id);
      setActiveStep("Step 2 : Message Decoded");
    } catch (error) {
      console.error("Error in Step 1 next handler:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
      {!loading && (
        <>
          <h3 className="text-xl font-bold mb-4">
            Step 1: Customer Message Received
          </h3>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Customer Name:
            </label>
            <p className="text-gray-800">{customerName}</p>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Person Name:
            </label>
            <p className="text-gray-800">{personName}</p>
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Message:
            </label>
            <div className="bg-gray-100 p-4 rounded-lg whitespace-pre-wrap">
              {message}
            </div>
          </div>
          <div className="flex items-center justify-end">
            <Button
              onClick={handleNext}
              className={`font-bold py-2 px-4 rounded ${
                isCurrentStep
                  ? "bg-blue-500 hover:bg-blue-700 text-white"
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
