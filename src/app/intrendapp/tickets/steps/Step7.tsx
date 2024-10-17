"use client";
import React, { useState, useEffect } from "react";
import Button from "../../../components/Button";
import toast from "react-hot-toast";
import { FaWhatsapp } from "react-icons/fa";
import { MdEmail } from "react-icons/md";

interface Step7Props {
  ticketNumber: string;
  customerTemplate: string;
  personName: string;
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
    from_number: string;
  };
}

const Step7: React.FC<Step7Props> = ({
  ticketNumber,
  customerTemplate,
  personName,
  isCurrentStep,
  fetchTicket,
  setActiveStep,
  ticket,
}) => {
  const [template, setTemplate] = useState(customerTemplate);
  const [showPopup, setShowPopup] = useState({
    whatsApp: false,
    email: false,
    sendReminder: false,
  });
  const [isSending, setIsSending] = useState(false);
  const [sendingStatus, setSendingStatus] = useState<string | null>(null);
  const [messagesSent, setMessagesSent] = useState({
    whatsApp: false,
    email: false,
  });

  const handleNext = async () => {
    console.log("Handling next for Step 7");
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
    toast.success("Step 7 completed");
  };

  const handleUpdate = async (updatedTemplate: string) => {
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
    if (!messagesSent.whatsApp || !messagesSent.email) {
      setShowPopup((prev) => ({
        ...prev,
        sendReminder: true,
      }));
    } else {
      await handleSave();
      await handleNext();
    }
  };

  const handleSendMessage = (type: "whatsApp" | "email") => {
    setShowPopup((prev) => ({
      ...prev,
      [type]: true,
    }));
  };

  const handlePopupConfirm = async (type: "whatsApp" | "email") => {
    setShowPopup((prev) => ({
      ...prev,
      [type]: false,
    }));
    setIsSending(true);
    setSendingStatus(null);

    try {
      if (type === "whatsApp") {
        const fromNumberRegex = /^91.*@c\.us$/;
        const fromGroupRegex = /^.*@g\.us$/;

        if (
          !fromNumberRegex.test(ticket.from_number) &&
          !fromGroupRegex.test(ticket.from_number)
        ) {
          toast.error("Invalid 'phone or group number'");
          return;
        }

        const sendMessageResponse = await fetch(
          `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/send_whatsapp_message/`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              to: ticket.from_number,
              message: template,
            }),
          }
        );

        const sendMessageData = await sendMessageResponse.json();
        console.log("WhatsApp message sent:", sendMessageData);
        setSendingStatus("WhatsApp message sent successfully");
        setMessagesSent((prev) => ({
          ...prev,
          whatsApp: true,
        }));
      } else if (type === "email") {
        const sendEmailResponse = await fetch(
          `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/send_email/`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              to: ticket.customer_name,
              subject: "Customer Message",
              body: template,
            }),
          }
        );

        const sendEmailData = await sendEmailResponse.json();
        console.log("Email sent:", sendEmailData);
        setSendingStatus("Email sent successfully");
        setMessagesSent((prev) => ({
          ...prev,
          email: true,
        }));
      }
    } catch (error) {
      console.error(`Error sending ${type} message:`, error);
      setSendingStatus(`Failed to send ${type} message`);
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
        <div className="md:flex gap-2 items-center">
          <Button
            onClick={() => handleSendMessage("whatsApp")}
            className={`bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded flex items-center gap-2 ${
              (!isCurrentStep || isSending) && "opacity-50 cursor-not-allowed"
            }`}
            disabled={!isCurrentStep || isSending}
          >
            {isSending ? "Sending..." : "Send"}
            <FaWhatsapp />
          </Button>
          <Button
            onClick={() => handleSendMessage("email")}
            className={`bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded flex items-center gap-2 ${
              (!isCurrentStep || isSending) && "opacity-50 cursor-not-allowed"
            }`}
            disabled={!isCurrentStep || isSending}
          >
            {isSending ? "Sending..." : "Send"}
            <MdEmail />
          </Button>
        </div>
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

      {showPopup.whatsApp && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
          <div className="bg-white p-5 rounded-lg shadow-xl">
            <h2 className="text-xl font-bold mb-4">Sending WhatsApp Message...</h2>
            <p className="mb-4">
              Are you sure you want to send this WhatsApp message to the customer?
            </p>
            <div className="flex justify-end">
              <Button
                onClick={() =>
                  setShowPopup((prev) => ({
                    ...prev,
                    whatsApp: false,
                  }))
                }
                className="mr-2 bg-gray-300 hover:bg-gray-400 text-black font-bold py-2 px-4 rounded"
              >
                Cancel
              </Button>
              <Button
                onClick={() => handlePopupConfirm("whatsApp")}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                OK
              </Button>
            </div>
          </div>
        </div>
      )}

      {showPopup.email && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
          <div className="bg-white p-5 rounded-lg shadow-xl">
            <h2 className="text-xl font-bold mb-4">Sending Email...</h2>
            <p className="mb-4">
              Are you sure you want to send this email to the customer?
            </p>
            <div className="flex justify-end">
              <Button
                onClick={() =>
                  setShowPopup((prev) => ({
                    ...prev,
                    email: false,
                  }))
                }
                className="mr-2 bg-gray-300 hover:bg-gray-400 text-black font-bold py-2 px-4 rounded"
              >
                Cancel
              </Button>
              <Button
                onClick={() => handlePopupConfirm("email")}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                OK
              </Button>
            </div>
          </div>
        </div>
      )}

      {showPopup.sendReminder && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
          <div className="bg-white p-5 rounded-lg shadow-xl">
            <h2 className="text-xl font-bold mb-4">Unsent Messages</h2>
            <p className="mb-4">
              {`You haven't sent all messages yet. Would you like to proceed without sending ?`}
            </p>
            <div className="flex justify-end">
              <Button
                onClick={() => setShowPopup((prev) => ({ ...prev, sendReminder: false }))}
                className="mr-2  bg-blue-500 hover:bg-blue-700 text-whitefont-bold py-2 px-4 rounded"
              >
                Cancel
              </Button>
              <Button
                onClick={async () => {
                  await handleNext();
                  setShowPopup((prev) => ({ ...prev, sendReminder: false }));
                }}
                className=" bg-gray-300 hover:bg-gray-400 text-black  font-bold py-2 px-4 rounded"
              >
                Proceed without sending
              </Button>
              {/* <Button
                onClick={() => {
                  if (!messagesSent.whatsApp) handleSendMessage("whatsApp");
                  if (!messagesSent.email) handleSendMessage("email");
                  setShowPopup((prev) => ({ ...prev, sendReminder: false }));
                }}
                className="ml-2 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
              >
                Send now
              </Button> */}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Step7;
