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
    whatsAppPerson: false,
    whatsAppGroup: false,
    email: false,
    sendReminder: false,
  });
  const [isSending, setIsSending] = useState(false);
  const [sendingStatus, setSendingStatus] = useState<string | null>(null);
  const [messagesSent, setMessagesSent] = useState({
    whatsApp: false,
    email: false,
  });

  const [selectedContact, setSelectedContact] = useState<string>('');
  const [selectedGroup, setSelectedGroup] = useState<string>('');
  const [customerData, setCustomerData] = useState<any>(null);
  const [peopleOptions, setPeopleOptions] = useState<string[]>([]);
  const [groupOptions, setGroupOptions] = useState<{[key: string]: string}>({});
  const [selectedPersonPhone, setSelectedPersonPhone] = useState<string>('');

  useEffect(() => {
    setTemplate(customerTemplate);
    fetchCustomerDetails();
  }, [customerTemplate]);

  const fetchCustomerDetails = async () => {
    try {
      const customerName = ticket.customer_name;
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/customers/?name=${encodeURIComponent(customerName)}`
      );
      const data = await response.json();
      if (data.customers && data.customers.length > 0) {
        const customer = data.customers[0];
        setCustomerData(customer);
        setPeopleOptions(customer.people || []);
        setGroupOptions(customer.group || {});
      }
    } catch (error) {
      console.error('Error fetching customer details:', error);
      toast.error('Failed to fetch customer details');
    }
  };

  const step5Messages = ticket.steps["Step 5: Messages from Vendors"];

  const keys = Object.keys(step5Messages);

  const handleNext = async () => {
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

  const handleSendMessage = (type: "whatsAppPerson" | "whatsAppGroup" | "email") => {
    setShowPopup((prev) => ({
      ...prev,
      [type]: true,
    }));
  };

  const handlePopupConfirm = async (type: "whatsAppPerson" | "whatsAppGroup" | "email") => {
    setShowPopup((prev) => ({
      ...prev,
      [type]: false,
    }));
    setIsSending(true);

    try {
      if (type === "whatsAppPerson" || type === "whatsAppGroup") {
        let targetNumber = '';
        
        if (type === "whatsAppPerson") {
          if (!selectedContact) {
            toast.error("Please select a contact");
            return;
          }
          targetNumber = selectedPersonPhone;
        } else {
          if (!selectedGroup) {
            toast.error("Please select a group");
            return;
          }
          targetNumber = selectedGroup;
        }

        const payload = {
          to: targetNumber,
          message: template,
        };
        
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/whatsapp/send`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          }
        );
        const data = await response.json();
        console.log('WhatsApp API Response:', data);
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
        console.log('Email API Response:', sendEmailData);
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

  const handlePersonSelect = async (personName: string) => {
    setSelectedContact(personName);
    if (personName) {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/person/${encodeURIComponent(personName)}`
        );
        const data = await response.json();
        console.log('Person details:', data);
        if (data.person && data.person.phone) {
          setSelectedPersonPhone(data.person.phone);
        } else {
          setSelectedPersonPhone('');
        }
      } catch (error) {
        console.error('Error fetching person details:', error);
        toast.error('Failed to fetch person details');
        setSelectedPersonPhone('');
      }
    } else {
      setSelectedPersonPhone('');
    }
  };

  return (
    <div>
      <div className="py-1 mb-4">
            <h1 className="text-xl font-bold ">Customer Message</h1>
            <div>{ticket.steps["Step 1 : Customer Message Received"].text}</div>
          </div>
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
        <div className="flex flex-col justify-center items-center gap-2">
          <div className="md:flex gap-2 items-center">
            <Button
              onClick={() => handleSendMessage("whatsAppPerson")}
              className={`bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded flex items-center gap-2 ${(!isCurrentStep || isSending) && "opacity-50 cursor-not-allowed"}`}
              disabled={!isCurrentStep || isSending}
            >
              {isSending ? "Sending..." : "Send to Person"}
              <FaWhatsapp />
            </Button>
            <Button
              onClick={() => handleSendMessage("whatsAppGroup")}
              className={`bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded flex items-center gap-2 ${(!isCurrentStep || isSending) && "opacity-50 cursor-not-allowed"}`}
              disabled={!isCurrentStep || isSending}
            >
              {isSending ? "Sending..." : "Send to Group"}
              <FaWhatsapp />
            </Button>
            <Button
              onClick={() => handleSendMessage("email")}
              className={`bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded flex items-center gap-2 ${(!isCurrentStep || isSending) && "opacity-50 cursor-not-allowed"}`}
              disabled={!isCurrentStep || isSending}
            >
              {isSending ? "Sending..." : "Send"}
              <MdEmail />
            </Button>
          </div>
     
        </div>
        <Button
          onClick={handleNextStep}
          className={`font-bold py-2 px-4 rounded ${isCurrentStep
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
          className={`mt-2 ${sendingStatus.includes("success")
            ? "text-green-600"
            : "text-red-600"
            }`}
        >
          {sendingStatus}
        </p>
      )}

      {showPopup.whatsAppPerson && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
          <div className="bg-white p-5 rounded-lg shadow-xl max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">Send WhatsApp Message to Person</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Contact
              </label>
              <select
                value={selectedContact}
                onChange={(e) => handlePersonSelect(e.target.value)}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a contact...</option>
                {peopleOptions.map((person, index) => (
                  <option key={index} value={person}>
                    {person}
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message Preview
              </label>
              <div className="py-1 mb-4">
                <div className="bg-gray-50 p-4 rounded border whitespace-pre-wrap h-48 overflow-y-auto">
                  {template}
                </div>
              </div>
            </div>
            <div className="flex justify-end">
              <Button
                onClick={() =>
                  setShowPopup((prev) => ({
                    ...prev,
                    whatsAppPerson: false,
                  }))
                }
                className="mr-2 bg-gray-300 hover:bg-gray-400 text-black font-bold py-2 px-4 rounded"
              >
                Cancel
              </Button>
              <Button
                onClick={() => handlePopupConfirm("whatsAppPerson")}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                Send
              </Button>
            </div>
          </div>
        </div>
      )}

      {showPopup.whatsAppGroup && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
          <div className="bg-white p-5 rounded-lg shadow-xl max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">Send WhatsApp Message to Group</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Group
              </label>
              <select
                value={selectedGroup}
                onChange={(e) => setSelectedGroup(e.target.value)}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a group...</option>
                {Object.entries(groupOptions).map(([groupName, groupId]) => (
                  <option key={groupId} value={groupId}>
                    {groupName}
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message Preview
              </label>
              <div className="py-1 mb-4">
                <div className="bg-gray-50 p-4 rounded border whitespace-pre-wrap h-48 overflow-y-auto">
                  {template}
                </div>
              </div>
            </div>
            <div className="flex justify-end">
              <Button
                onClick={() =>
                  setShowPopup((prev) => ({
                    ...prev,
                    whatsAppGroup: false,
                  }))
                }
                className="mr-2 bg-gray-300 hover:bg-gray-400 text-black font-bold py-2 px-4 rounded"
              >
                Cancel
              </Button>
              <Button
                onClick={() => handlePopupConfirm("whatsAppGroup")}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                Send
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
