'use client'
import React, { useState, useEffect } from "react";
import Button from "../../../components/Button";

interface Step7Props {
  ticketNumber: string;
  customerTemplate: string;
  personName: string; // Add this prop
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
  },
}

const Step7: React.FC<Step7Props> = ({
  ticketNumber,
  customerTemplate,
  personName, // Add this prop
  isCurrentStep,
  fetchTicket,
  setActiveStep,
  ticket,
}) => {
  const [template, setTemplate] = useState(customerTemplate);
  const [showPopup, setShowPopup] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sendingStatus, setSendingStatus] = useState<string | null>(null);

  const handleNext = async () => {
    console.log("Handling next for Step 7");
    // Update Step 8 with an empty string from client
    await fetch(
      `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/ticket/update_next_step/`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ticket_number: ticket.ticket_number,
          step_info: { text: "" },
          step_number: "Step 8 : Customer Response",
        }),
      }
    );
    fetchTicket(ticket._id);
    setActiveStep("Step 8 : Customer Response");
  };
  const handleUpdate = async (updatedTemplate:string) => {
    console.log("Updating Step 7 template:", updatedTemplate);
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
          step_number: "Step 7 : Customer Message Template",
        }),
      }
    );
    fetchTicket(ticket._id);
  };
  useEffect(() => {
    setTemplate(customerTemplate);
  }, [customerTemplate]);

  const handleSave = async () => {
    await handleUpdate(template);
  };

  const handleNextStep = async () => {
    await handleSave();
    await handleNext();
  };

  const handleSendMessage = () => {
    setShowPopup(true);
  };

  const handlePopupConfirm = async () => {
    setShowPopup(false);
    setIsSending(true);
    setSendingStatus(null);

    try {
      // Fetch person details
      const personResponse = await fetch(
        `${
          process.env.NEXT_PUBLIC_ENDPOINT_URL
        }/person/name/?person=${encodeURIComponent(personName)}`
      );
      const personData = await personResponse.json();

      if (!personData.person || !personData.person.phone) {
        throw new Error("Person details or phone number not found");
      }

      // Format the phone number
      let phoneNumber = personData.person.phone.replace(/\D/g, "");
      if (phoneNumber.length === 10) {
        phoneNumber = "91" + phoneNumber;
      }
      phoneNumber += "@c.us";

      // Send the message
      const sendMessageResponse = await fetch(
        `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/send_whatsapp_message/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            to: phoneNumber,
            message: template,
          }),
        }
      );

      const sendMessageData = await sendMessageResponse.json();
      console.log("Message sent:", sendMessageData);
      setSendingStatus("Message sent successfully");
    } catch (error) {
      console.error("Error sending message:", error);
      setSendingStatus("Failed to send message");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div>
      <h3 className="text-xl font-bold my-4">Step 7: Customer Message Template</h3>
      <textarea
        value={template}
        onChange={(e) => setTemplate(e.target.value)}
        className="w-full h-64 p-2 border rounded"
      />
      <div className="flex justify-between mt-4">
        <Button
          onClick={handleSave}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Save
        </Button>
        <Button
          onClick={handleSendMessage}
          className={`bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded ${
            (!isCurrentStep || isSending) && "opacity-50 cursor-not-allowed"
          }`}
          disabled={!isCurrentStep || isSending}
        >
          {isSending ? "Sending..." : "Send"}
        </Button>
        <Button
          onClick={handleNextStep}
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

      {sendingStatus && (
        <p
          className={`mt-2 ${
            sendingStatus.includes("success")
              ? "text-green-600"
              : "text-red-600"
          }`}
        >
          {sendingStatus}
        </p>
      )}

      {showPopup && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
          <div className="bg-white p-5 rounded-lg shadow-xl">
            <h2 className="text-xl font-bold mb-4">Sending Message...</h2>
            <p className="mb-4">
              Are you sure you want to send this message to the customer?
            </p>
            <div className="flex justify-end">
              <Button
                onClick={() => setShowPopup(false)}
                className="mr-2 bg-gray-300 hover:bg-gray-400 text-black font-bold py-2 px-4 rounded"
              >
                Cancel
              </Button>
              <Button
                onClick={handlePopupConfirm}
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

export default Step7;
