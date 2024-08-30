"use client";
import React, { useState, useEffect } from "react";
import Button from "../../../components/Button";
import MultiSelect, {
  MultiSelectOption,
} from "../../../components/MultiSelect";
import { MultiValue } from "react-select";
import { FaWhatsapp } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import toast from "react-hot-toast";

interface Vendor {
  _id: string;
  name: string;
  group: { [key: string]: string } | string;
  email: string;
}

interface Step4Props {
  ticketNumber: string;
  selectedVendors: string[];
  template: string;
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
  isCurrentStep: boolean;
}

const Step4: React.FC<Step4Props> = ({
  ticketNumber,
  selectedVendors,
  template,
  isCurrentStep,
  fetchTicket,
  setActiveStep,
  ticket,
}) => {
  const [vendors, setVendors] = useState<MultiSelectOption[]>([]);
  const [selectedOptions, setSelectedOptions] = useState<MultiSelectOption[]>(
    selectedVendors.map((vendor) => ({ label: vendor, value: vendor }))
  );
  const [vendorMessages, setVendorMessages] = useState<Record<string, string>>(
    {}
  );
  const [showPopup, setShowPopup] = useState(false);
  const [showEmailPopup, setShowEmailPopup] = useState(false);
  const [vendorDetails, setVendorDetails] = useState<Vendor[]>([]);
  const [isEmailSending, setIsEmailSending] = useState(false);
  const [isWhatsAppSending, setIsWhatsAppSending] = useState(false);
  const [emailSendingStatus, setEmailSendingStatus] = useState<Record<string, string>>(
    {}
  );
  const [whatsappSendingStatus, setWhatsappSendingStatus] = useState<Record<string, string>>(
    {}
  );
  const [isMessageSent, setIsMessageSent] = useState({
    emailSent: false,
    whatsappMessageSent: false,
  });
  const [showResendWhatsappMessage,setShowResendWhatsappMessage]=useState(false);
  const [showResendEmail, setShowResendEmail] = useState(false);

  const [loading, setLoading] = useState(false);
  const handleNext = async (updatedVendors: Record<string, string>) => {
    console.log("Handling next for Step 4");
    console.log("Step 4 updated vendors:", updatedVendors);

    try {
      // Save Step 4 data
      await fetch(
        `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/ticket/update_specific_step/`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ticket_number: ticket.ticket_number,
            step_number: "Step 4 : Vendor Selection",
            step_info: { list: Object.keys(updatedVendors) },
          }),
        }
      );

      // Initialize Step 5 with empty messages
      const emptyVendorMessages = Object.keys(updatedVendors).reduce(
        (acc, vendor) => {
          acc[vendor] = "";
          return acc;
        },
        {} as Record<string, string>
      );

      console.log("Step 5 initial vendor messages:", emptyVendorMessages);
  
      await fetch(
        `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/ticket/update_next_step/`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ticket_number: ticket.ticket_number,
            step_info: emptyVendorMessages,
            step_number: "Step 5: Messages from Vendors",
          }),
        }
      );

      await fetchTicket(ticket._id);
      setLoading(false);
      setActiveStep("Step 5: Messages from Vendors");
      toast.success("Step 4 completed");
    } catch (error) {
      console.error("Error updating steps:", error);
    }
  };

  const handleUpdate = async (updatedVendors: string[]) => {
    console.log("Updating Step 4 vendors:", updatedVendors);
    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/ticket/update_specific_step/`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ticket_number: ticket.ticket_number,
            step_number: "Step 4 : Vendor Selection",
            step_info: { list: updatedVendors },
          }),
        }
      );
      await fetchTicket(ticket._id);
    } catch (error) {
      console.error("Error updating Step 4:", error);
    }
  };
  useEffect(() => {
    fetchVendors();
  }, []);

  useEffect(() => {
    if (selectedOptions.length > 0 && template) {
      generateVendorMessages();
    }
  }, [selectedOptions, template]);

  const fetchVendors = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/vendors`
      );
      const data = await response.json();
      if (Array.isArray(data.vendors)) {
        setVendors(
          data.vendors.map((vendor: Vendor) => ({
            label: vendor.name,
            value: vendor.name,
          }))
        );
        setVendorDetails(data.vendors);
      } else {
        console.error("Unexpected response format:", data);
      }
    } catch (error) {
      console.error("Error fetching vendors:", error);
    }
  };

  const generateVendorMessages = async () => {
    const messages: Record<string, string> = {};
    for (const option of selectedOptions) {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/replace_vendor_with_name`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              message_template: template,
              vendor_name: option.value,
            }),
          }
        );
        const data = await response.json();
        console.log(data.message);
        messages[
          option.value
        ] = `${data.message}\n Ticket Number: ${ticket.ticket_number}`;
      } catch (error) {
        console.error(
          `Error generating message for vendor ${option.value}:`,
          error
        );
        messages[option.value] = "Error generating message";
      }
    }
    console.log(messages);
    setVendorMessages(messages);
  };

  const handleVendorChange = (selected: MultiValue<MultiSelectOption>) => {
    setSelectedOptions(selected as MultiSelectOption[]);
  };

  const handleSave = async () => {
    const updatedVendors = selectedOptions.map((option) => option.value);
    await handleUpdate(updatedVendors);
  };

  const handleNextStep = async () => {
    setLoading(true);
    await handleSave();
    await handleNext(vendorMessages);
  };

  const handleSendMessage = () => {
    setShowPopup(true);
  };

  const handleSendEmail = () => {
    setShowEmailPopup(true);
  };
  const handleEmailPopupConfirm = async () => {
    setShowEmailPopup(false);
    setIsEmailSending(true);
    setEmailSendingStatus({});
    if (isMessageSent.emailSent) {
      if (!showResendEmail) {
        toast.error("Email already sent!");
        setShowResendEmail(true);
      }
    }else{
      setIsMessageSent((prev) => {
        const updated = { ...prev, emailSent: true };
        return updated;
      });
      for (const option of selectedOptions) {
        console.log(option);
        const vendor = vendorDetails.find((v) => v.name === option.value);
        
        if (vendor) {
          try {
            console.log(vendor.email);
            const response = await fetch(
              `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/send_email/`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  to: vendor.email,
                  subject: "Vendor Message",
                  message: JSON.stringify(vendorMessages[option.value]),
                }),
              }
            );
            const data = await response.json();
            console.log(`Email sent to ${option.value}:`, data);
            setEmailSendingStatus((prev) => ({ ...prev, [option.value]: "Email Sent" }));
          } catch (error) {
            console.error(`Error sending email to ${option.value}:`, error);
            setEmailSendingStatus((prev) => ({ ...prev, [option.value]: "Failed" }));
            setIsMessageSent((prev) => {
              const updated = { ...prev, emailSent: false };
              return updated;
            });
          }
        } else {
          console.error(`Vendor details not found for ${option.value}`);
          setEmailSendingStatus((prev) => ({
            ...prev,
            [option.value]: "Vendor details not found",
          }));
          setIsMessageSent((prev) => {
            const updated = { ...prev, emailSent: false };
            return updated;
          });
        }
      } 
    }
    setIsEmailSending(false);
    };
    
    const handlePopupConfirm = async () => {
      setShowPopup(false);
      setIsWhatsAppSending(true);
      setWhatsappSendingStatus({});
    if(isMessageSent.whatsappMessageSent){
      if(!showResendWhatsappMessage){
      toast.error("Message already sent!")
      setShowResendWhatsappMessage(true)
      }
    }else{
    setIsMessageSent((prev) => {
      const updated = { ...prev, whatsappMessageSent: true };
      return updated;
    });

    for (const option of selectedOptions) {
      const vendor = vendorDetails.find((v) => v.name === option.value);
      if (vendor && vendor.group) {
        const groupId =
          typeof vendor.group === "string"
            ? vendor.group
            : Object.values(vendor.group)[0];
        if (groupId) {
          try {
            const response = await fetch(
              `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/send_whatsapp_message/`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  to: groupId,
                  message: vendorMessages[option.value],
                }),
              }
            );
            const data = await response.json();
            console.log(`Message sent to ${option.value}:`, data);
            setWhatsappSendingStatus((prev) => ({
              ...prev,
              [option.value]: "Whatsapp Message Sent",
            }));
          } catch (error) {
            console.error(`Error sending message to ${option.value}:`, error);
            setWhatsappSendingStatus((prev) => ({
              ...prev,
              [option.value]: "Failed",
            }));
            setIsMessageSent((prev) => {
              const updated = { ...prev,whatsappMessageSent: false };
              return updated;
            });
          }
        } else {
          console.error(`No group ID found for vendor ${option.value}`);
          setWhatsappSendingStatus((prev) => ({
            ...prev,
            [option.value]: "Vendor details not found",
          }));
          setIsMessageSent((prev) => {
            const updated = { ...prev,whatsappMessageSent: false };
            return updated;
          });
        }
      } else {
        console.error(`Vendor details not found for ${option.value}`);
        setWhatsappSendingStatus((prev) => ({
          ...prev,
          [option.value]: "Vendor details not found",
        }));
        setIsMessageSent((prev) => {
          return { ...prev, whatsappMessageSent: false };
        });
      }
      }
    }
  
  setIsWhatsAppSending(false);

  };

  return (
    <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
      {!loading && (
        <>
          <h3 className="text-xl font-bold mb-4">Step 4: Select Vendors</h3>
          <MultiSelect
            options={vendors}
            value={selectedOptions}
            onChange={handleVendorChange}
          />
          {selectedOptions.length > 0 && (
            <div className="mt-4">
              <h4 className="text-lg font-semibold mb-2">Vendor Messages</h4>
              {selectedOptions.map((option) => (
                <div key={option.value} className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {option.label}
                  </label>
                  <textarea
                    value={vendorMessages[option.value] || ""}
                    readOnly
                    className="w-full h-32 p-2 border rounded"
                  />
                  {emailSendingStatus[option.value] && (
                    <p
                      className={`mt-1 ${
                        emailSendingStatus[option.value] === "Email Sent"
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      Status: {emailSendingStatus[option.value]}
                    </p>
                  )}
                  {whatsappSendingStatus[option.value] && (
                    <p
                      className={`mt-1 ${
                        whatsappSendingStatus[option.value] === "Whatsapp Message Sent"
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      Status: {whatsappSendingStatus[option.value]}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
          <div className="flex justify-between mt-4">
            <Button
              onClick={handleSave}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              disabled={!isCurrentStep}
            >
              Save
            </Button>
            <Button
              onClick={handleSendMessage}
              className={`bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded flex items-center gap-2 ${
                (!isCurrentStep || selectedOptions.length === 0 || isWhatsAppSending) &&
                "opacity-50 cursor-not-allowed"
              }`}
              disabled={
                !isCurrentStep || selectedOptions.length === 0 || isWhatsAppSending
              }
            >
             <span>{isWhatsAppSending ? "Sending..." : showResendWhatsappMessage ? "Resend" : "Send"}</span>

              <FaWhatsapp />
            </Button>
            <Button
              onClick={handleSendEmail}
              className={`bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded flex items-center gap-2 ${
                (!isCurrentStep || selectedOptions.length === 0 || isEmailSending) &&
                "opacity-50 cursor-not-allowed "
              }`}
              disabled={
                !isCurrentStep || selectedOptions.length === 0 || isEmailSending
              }
            >
            <span>{isEmailSending ? "Sending..." : showResendEmail ? "Resend" : "Send"}</span>
              <MdEmail />
            </Button>
            <Button
              onClick={handleNextStep}
              className={`font-bold py-2 px-4 rounded ${
                isCurrentStep
                  ? "bg-blue-500 hover:bg-blue-700 text-white"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
              disabled={!isCurrentStep || selectedOptions.length === 0}
            >
              Next
            </Button>
          </div>
        </>
      )}
      {loading && <h1>Loading...</h1>}

      {showPopup && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
          <div className="bg-white p-5 rounded-lg shadow-xl">
            <h2 className="text-xl font-bold mb-4">Sending Messages...</h2>
            {!showResendWhatsappMessage&&<p className="mb-4">
              Are you sure you want to send messages to the selected vendors?
            </p>}
            {showResendWhatsappMessage && (
            <p>Messages have already been sent. Do you want to resend them?</p>
          )}
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
               {!showResendWhatsappMessage ? "OK" : "Resend"}
              </Button>
            </div>
          </div>
        </div>
      )}
     {showEmailPopup && (
  <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
    <div className="bg-white p-5 rounded-lg shadow-xl">
      <h2 className="text-xl font-bold mb-4">Sending Emails...</h2>
      {!showResendEmail && (
        <p className="mb-4">Are you sure you want to send emails to the selected vendors?</p>
      )}
      {showResendEmail && (
        <p>Emails have already been sent. Do you want to resend them?</p>
      )}
      <div className="flex justify-end">
        <Button
          onClick={() => setShowEmailPopup(false)}
          className="mr-2 bg-gray-300 hover:bg-gray-400 text-black font-bold py-2 px-4 rounded"
        >
          Cancel
        </Button>
        <Button
          onClick={handleEmailPopupConfirm}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          {!showResendEmail ? "OK" : "Resend"}
        </Button>
      </div>
    </div>
  </div>
)}
      {!isCurrentStep && (
        <h1 className="text-end text-yellow-500">Messages Already Sent!</h1>
      )}
    </div>
  );
};

export default Step4;
