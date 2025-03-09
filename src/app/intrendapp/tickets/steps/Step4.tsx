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
  id: string;
  name: string;
  group: { [key: string]: string } | string;
  email: string;
}

interface Step4Props {
  ticketNumber: string;
  selectedVendors: string[];
  selectedVendors1: any;
  template: string;
  setActiveStep: (step: string) => void;
  fetchTicket: (ticketId: string) => Promise<void>;
  ticket: {
    id: string;
    ticket_number: string;
    customer_name: string;
    customer_id: string;
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
  selectedVendors1,
  template,
  isCurrentStep,
  fetchTicket,
  setActiveStep,
  ticket,
}) => {
  console.log(template);
  console.log("selectedVendors:", selectedVendors);
  console.log("selectedVendors1:", selectedVendors1);
  const [vendors, setVendors] = useState<MultiSelectOption[]>([]);
  console.log("selectedVendors:", selectedVendors);
  console.log("selectedVendors1:", selectedVendors1);
  const [selectedOptions, setSelectedOptions] = useState<MultiSelectOption[]>(
    Object.entries(selectedVendors1.vendors || {}).map(([id, vendor]) => ({
      label: vendor.vendor_name,
      value: vendor.vendor_name,
      id: id,
    }))
  );
  console.log("selectedOptions:", selectedOptions);
  const [vendorMessages, setVendorMessages] = useState<Record<string, string>>(
    {}
  );
  const [showWhatsappPopup, setShowWhatsappPopup] = useState(false);
  const [showEmailPopup, setShowEmailPopup] = useState(false);
  const [showReminderPopUp, setShowReminderPopUp] = useState(false);
  const [vendorDetails, setVendorDetails] = useState<any[]>([]);
  const [isEmailSending, setIsEmailSending] = useState(false);
  const [isWhatsAppSending, setIsWhatsAppSending] = useState(false);
  const [emailSendingStatus, setEmailSendingStatus] = useState<
    Record<string, string>
  >({});
  const [whatsappSendingStatus, setWhatsappSendingStatus] = useState<
    Record<string, string>
  >({});
  const [isMessageSent, setIsMessageSent] = useState({
    emailSent: false,
    whatsappMessageSent: false,
  });
  const [showResendWhatsappMessage, setShowResendWhatsappMessage] =
    useState(false);
  const [showResendEmail, setShowResendEmail] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleNext = async (updatedVendors: string[]) => {
    console.log("Handling next for Step 4");
    console.log("Step 4 updated vendors:", updatedVendors);
    const vendorsToUpdate = updatedVendors.map((vendorName) => {
      const vendor = vendorDetails.find((v) => v.name === vendorName);
      return {
        vendor_id: vendor?.id, // Use optional chaining to avoid errors
        vendor_name: vendorName,
        message_temp: vendorMessages[vendorName] || "", // Get the message from vendorMessages
        message_sent: false,
      };
    });

    console.log("mapped vendors", vendorsToUpdate);
    try {
      // Save Step 4 data
      await fetch(
        `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/ticket/update_specific_step/?user_id=1234&user_agent=user-test`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ticket_id: ticket.id,
            step_number: ticket.current_step,
            step_info: { vendors: vendorsToUpdate },
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

      // await fetch(
      //   `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/ticket/update_next_step/?user_id=1234&user_agent=user-test`,
      //   {
      //     method: "PUT",
      //     headers: {
      //       "Content-Type": "application/json",
      //     },
      //     body: JSON.stringify({
      //       ticket_id: ticket.id,
      //       step_info: emptyVendorMessages,
      //       step_number: ticket.current_step,
      //     }),
      //   }
      // );

      // await fetchTicket(ticket.id);
      // setLoading(false);
      // setActiveStep("Step 5: Messages from Vendors");
      // toast.success("Step 4 completed");
    } catch (error) {
      console.error("Error updating steps:", error);
    }
  };

  const handleUpdate = async (updatedVendors: string[]) => {
    console.log("Updating Step 4 vendors:", updatedVendors);
    console.log("vendor details", vendorDetails);

    // Map updatedVendors to the desired structure
    const vendorsToUpdate = updatedVendors
      .map((vendorName) => {
        const vendor = vendorDetails.find((v) => v.name === vendorName);
        // If vendor or vendor._id is not found, skip this entry or provide a fallback
        if (!vendor || !vendor.id) {
          console.error(`Vendor ID not found for ${vendorName}`);
          return null; // or return a fallback object if appropriate
        }
        return {
          vendor_id: vendor.id, // Ensured to be a string
          vendor_name: vendorName,
          message_temp: vendorMessages[vendorName] || "",
          message_sent: {
            whatsapp: false,
            email: false,
          },
        };
      })
      .filter((vendor) => vendor !== null); // remove any null entries

    console.log("mapped vendors......", vendorsToUpdate);

    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/ticket/update_step/specific?user_id=1234&user_agent=user-test`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ticket_id: ticket.id,
            step_number: ticket.current_step,
            step_info: { vendors: vendorsToUpdate }, // Use the mapped vendors
          }),
        }
      );
      await fetchTicket(ticket.id);
    } catch (error) {
      console.error("Error updating Step 4:", error);
    }
  };

  useEffect(() => {
    console.log("Vendors updated:", vendors);
  }, [vendors]);

  useEffect(() => {
    console.log("Vendor Details updated:", vendorDetails);
  }, [vendorDetails]);

  useEffect(() => {
    fetchVendors();
  }, []);

  console.log("selectedOptions", selectedOptions);
  console.log("template", template);
  useEffect(() => {
    if (selectedOptions.length > 0 && template) {
      console.log("Selected options:", selectedOptions);
      generateVendorMessages();
    }
  }, [selectedOptions, template]);

  // const fetchCustomer=async()=>{
  //   try {
  //     const response = await fetch(
  //       `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/customer/${ticket.customer_id}`
  //     );
  //     const data = await response.json();
  //     console.log(data);
  //     return data;
  //   } catch (error) {
  //     console.error("Error fetching customer:", error);
  //   }
  // }
  const fetchVendors = async () => {
    console.log("fetching vendors.....")
    try {
      // const customer = await fetchCustomer();
      // console.log("Fetched Customer:", customer);
      const decoded_messages = ticket.steps["Step 2 : Message Decoded"].latest;
      // console.log("Customer Fabric Type:", customer.customer.fabric_type);
      // console.log("Customer certifications:", customer.customer.certifications);
      // console.log("Customer approvals:", customer.customer.approvals);
      // console.log("decoded_messages", decoded_messages);
      // const requestBody = {
      //   ...(decoded_messages.decoded_messages.fabric_type
      //     ? { fabric_type: [decoded_messages.decoded_messages.fabric_type] }
      //     : {}),
      //   ...(decoded_messages.decoded_messages.content
      //     ? { content: [decoded_messages.decoded_messages.content] }
      //     : {}),
      //   ...(decoded_messages.decoded_messages.certifications !== "Null" &&
      //   decoded_messages.decoded_messages.certifications !== null
      //     ? {
      //         certifications: [
      //           decoded_messages.decoded_messages.certifications,
      //         ],
      //       }
      //     : {}),
      //   ...(decoded_messages.decoded_messages.approvals !== "Null" &&
      //   decoded_messages.decoded_messages.approvals !== null
      //     ? { approvals: [decoded_messages.decoded_messages.approvals] }
      //     : {}),
      //   ...(decoded_messages.decoded_messages.weave !== "Null" &&
      //   decoded_messages.decoded_messages.weave !== null
      //     ? { weave: [decoded_messages.decoded_messages.weave] }
      //     : {}),
      //   ...(decoded_messages.decoded_messages.weave_type !== "Null" &&
      //   decoded_messages.decoded_messages.weave_type !== null
      //     ? { weave_type: [decoded_messages.decoded_messages.weave_type] }
      //     : {}),
      //   ...(decoded_messages.decoded_messages.width1 !== "Null" ||
      //   decoded_messages.decoded_messages.width2 !== "Null" ||
      //   decoded_messages.decoded_messages.width3 !== "Null"
      //     ? {
      //         width: [
      //           decoded_messages.decoded_messages.width1,
      //           decoded_messages.decoded_messages.width2,
      //           decoded_messages.decoded_messages.width3,
      //         ].filter(Boolean),
      //       }
      //     : {}),
      // };

      // console.log("Request Body: for vendors filtered", requestBody);
      // const response = await fetch(
      //   `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/vendors_filtered`,
      //   {
      //     method: "POST",
      //     headers: {
      //       "Content-Type": "application/json",
      //     },
      //     body: JSON.stringify(requestBody),
      //   }
      // );

      // const data = await response.json();
      const response = await fetch(`${process.env.NEXT_PUBLIC_ENDPOINT_URL}/vendors/all/ `,    {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      console.log("Response Data:", data);

      if (Array.isArray(data)) {
        console.log("Fetched vendors:", data);
        setVendors(
          data.map((vendor: any) => ({
            label: vendor.name,
            value: vendor.name,
            id: vendor.id,
          }))
        );
        console.log("Vendors:", vendors);
        setVendorDetails(data);
        console.log("Vendor Details:", vendorDetails);
      } else {
        console.error("Unexpected response format:", data);
      }
    } catch (error) {
      console.error("Error fetching vendors:", error);
    }
  };

  const handleVendorMessageChange = (vendorName: string, message: string) => {
    console.log(`Vendor ${vendorName} message updated: ${message}`);
    setVendorMessages((prev) => ({
      ...prev,
      [vendorName]: message,
    }));
  };

  const generateVendorMessages = async () => {
    console.log("Generating vendor messages...");
    const messages: Record<string, string> = {};
    for (const option of selectedOptions) {
      console.log(option);
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
        console.log("generated message:", data);
        messages[
          option.value
        ] = `${data}\n Ticket Number: ${ticket.ticket_number}`;
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
    console.log("Selected vendors:.....", selected);
    setSelectedOptions(selected as MultiSelectOption[]);
  };

  const handleSave = async () => {
    const updatedVendors = selectedOptions.map((option) => option.value);
    await handleUpdate(updatedVendors);
  };

  console.log(ticket.steps[ticket.current_step].latest);

  const handleSendMessage = async () => {
    try {
      const messagePromises = selectedOptions.map(async (option) => {
        const vendor = vendorDetails.find((v) => v.name === option.value);
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/send_whatsapp`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              to: vendor.phone,
              message: vendorMessages[option.value],
            }),
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to send WhatsApp to ${option.value}`);
        }

        // Return vendor info with updated message_sent status
        return {
          vendor_id: vendor.id,
          vendor_name: vendor.name,
          message_temp: vendorMessages[option.value] || "",
          message_sent: {
            whatsapp: true,
            email: false, // unchanged for now
          },
        };
      });

      const results = await Promise.all(messagePromises);
      await updateTicketWithSentStatus(results);
      toast.success("WhatsApp messages sent successfully!");
    } catch (error) {
      console.error("Error sending WhatsApp messages:", error);
      toast.error("Failed to send WhatsApp messages.");
    }
  };

  const updateTicketWithSentStatus = async (results) => {
    try {
      // Here, results already contain the updated vendor data.
      await fetch(
        `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/ticket/update_step/specific?user_id=1234&user_agent=user-test`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ticket_id: ticket.id,
            step_number: ticket.current_step,
            step_info: { vendors: results },
          }),
        }
      );
      await fetchTicket(ticket.id);
    } catch (error) {
      console.error("Error updating ticket status:", error);
    }
  };

  const handleSendEmail = async () => {
    try {
      // Assuming you send email for each selected vendor
      const emailPromises = selectedOptions.map(async (option) => {
        const vendor = vendorDetails.find((v) => v.name === option.value);
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/send_email`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              vendor_name: vendor.name,
              message: vendorMessages[option.value],
            }),
          }
        );
        if (!response.ok) {
          throw new Error(`Failed to send email to ${vendor.name}`);
        }
        // Return vendor info with updated email status
        return {
          vendor_id: vendor.id,
          vendor_name: vendor.name,
          message_temp: vendorMessages[option.value] || "",
          message_sent: {
            whatsapp: false, // unchanged here
            email: true,
          },
        };
      });

      const results = await Promise.all(emailPromises);
      await updateTicketWithSentStatusEmail(results);
      toast.success("Emails sent successfully!");
      return results;
    } catch (error) {
      console.error("Error sending email:", error);
      toast.error("Failed to send email.");
    }
  };

  const handleSendEmailPopUp = () => {
    setShowEmailPopup(true);
  };
  const handleWhatsAppPopUp = () => {
    setShowWhatsappPopup(true);
  };

  const handleEmailPopupConfirm = async () => {
    setShowEmailPopup(false); // Close the confirmation dialog
    await handleSendEmail(); // Send emails and update the ticket status
  };
  const updateTicketWithSentStatusEmail = async (results) => {
    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/ticket/update_step/specific?user_id=1234&user_agent=user-test`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ticket_id: ticket.id,
            step_number: ticket.current_step,
            step_info: { vendors: results },
          }),
        }
      );
      await fetchTicket(ticket.id);
    } catch (error) {
      console.error("Error updating ticket status for email:", error);
    }
  };

 
  // This function now builds the Step 5 payload as an array of vendor objects
  const handleNextStep = async () => {
    // Get vendor names from the selected options
    const updatedVendors = selectedOptions.map((option) => option.value);
    console.log("Next Step vendors:", updatedVendors);
  
    // For each vendor, use saved message status if it exists; otherwise default to false
    const vendorsToUpdate = updatedVendors.map((vendorName) => {
      const vendor = vendorDetails.find((v) => v.name === vendorName);
      // Look for any saved data for this vendor from Step 4 using the vendor's _id as key
      const savedData = ticket.steps[ticket.current_step]?.latest[vendor?.id] || {};
      return {
        vendor_id: vendor?.id,
        vendor_name: vendorName,
        message_temp: vendorMessages[vendorName] || "",
        message_sent: savedData.message_sent
          ? savedData.message_sent
          : { whatsapp: false, email: false },
      };
    });
  
    console.log("Mapped vendors for Step 4 update:", vendorsToUpdate);
    console.log("payload", JSON.stringify({
      ticket_id: ticket.id,
      step_number: ticket.current_step,
      step_info: { vendors: vendorsToUpdate },
    }));
  
    try {
      // Update Step 4 with the vendor details (including the message sent status)
      await fetch(
        `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/ticket/update_step/specific?user_id=1234&user_agent=user-test`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ticket_id: ticket.id,
            step_number: ticket.current_step,
            step_info: { vendors: vendorsToUpdate },
          }),
        }
      );
  
      // Initialize Step 5 payload as an array instead of an object
      const emptyVendorMessages = selectedOptions.map((option) => {
        const vendor = vendorDetails.find((v) => v.name === option.value);
        return {
          vendor_id: vendor?.id,
          vendor_name: vendor?.name,
          response_received: false,
          response_message: "",
          message_received_time: "", // Could also be a timestamp if needed
        };
      });
  
      console.log("Step 5 initial vendor messages:", emptyVendorMessages);
  
      // Update Step 5 with the empty messages array
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/ticket/update_next_step/?user_id=1234&user_agent=user-test`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ticket_id: ticket.id,
            step_info: { vendors: emptyVendorMessages },
            step_number: ticket.current_step,
          }),
        }
      );
      console.log(response);
  
      // Optionally fetch updated ticket data and move to Step 5
      await fetchTicket(ticket.id);
      setLoading(false);
      setActiveStep("Step 5: Messages from Vendors");
      toast.success("Step 4 completed");
    } catch (error) {
      console.error("Error updating steps:", error);
    }
  };
  

  const handlePopupConfirm = async () => {
    setShowWhatsappPopup(false); // Close the confirmation dialog
    await handleSendMessage(); // Call the function to send messages
  };

  useEffect(() => {
    // Get the saved vendor data from the ticket
    const vendorsLatest =
      ticket.steps[ticket.current_step]?.latest || {};
    // Check if any selected vendor has whatsapp set to true
    const anyWhatsappSent = selectedOptions.some((option) => {
      const vendorData = vendorsLatest[option.id];
      return (
        vendorData &&
        vendorData.message_sent &&
        vendorData.message_sent.whatsapp === true
      );
    });
    setShowResendWhatsappMessage(anyWhatsappSent);
  }, [ticket, selectedOptions]);

  console.log("Vendor Messages:", vendorMessages);

  console.log("selected options....",selectedOptions);
  return (
    <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
      {!loading && (
        <>
          <div className="py-1 mb-4">
            <h1 className="text-xl font-bold ">Customer Message</h1>
            <div>
              {ticket.steps["Step 1 : Customer Message Received"].latest.text}
            </div>
          </div>
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
                    {option.value}
                  </label>
                  {/* <textarea
                    value={
                      ticket.steps[ticket.current_step].latest.vendors[
                        option.id
                      ]?.message_temp   
                    }
                    onChange={(e) =>
                      handleVendorMessageChange(option.value, e.target.value)
                    }
                    className={`w-full h-32 p-2 border rounded mt-2 ${ticket.steps[ticket.current_step].latest.vendors[
                      option.id
                    ]?.message_temp? "" : "hidden"}`}
                  /> */}
                  <textarea
                    value={
                     vendorMessages[option.value]  
                    }
                    onChange={(e) =>
                      handleVendorMessageChange(option.value, e.target.value)
                    }
                    className={`w-full h-32 p-2 border rounded mt-2 `}
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
                        whatsappSendingStatus[option.value] ===
                        "Whatsapp Message Sent"
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
              onClick={handleWhatsAppPopUp}
              className={`bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded flex items-center gap-2 ${
                (!isCurrentStep ||
                  selectedOptions.length === 0 ||
                  isWhatsAppSending) &&
                "opacity-50 cursor-not-allowed"
              }`}
              disabled={
                !isCurrentStep ||
                selectedOptions.length === 0 ||
                isWhatsAppSending
              }
            >
              <span>
                {isWhatsAppSending
                  ? "Sending..."
                  : showResendWhatsappMessage
                  ? "Resend"
                  : "Send"}
              </span>

              <FaWhatsapp />
            </Button>
            <Button
              onClick={handleSendEmailPopUp}
              className={`bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded flex items-center gap-2 ${
                (!isCurrentStep ||
                  selectedOptions.length === 0 ||
                  isEmailSending) &&
                "opacity-50 cursor-not-allowed "
              }`}
              disabled={
                !isCurrentStep || selectedOptions.length === 0 || isEmailSending
              }
            >
              <span>
                {isEmailSending
                  ? "Sending..."
                  : showResendEmail
                  ? "Resend"
                  : "Send"}
              </span>
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

      {showWhatsappPopup && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
          <div className="bg-white p-5 rounded-lg shadow-xl">
            <h2 className="text-xl font-bold mb-4">Sending Messages...</h2>
            {!showResendWhatsappMessage && (
              <p className="mb-4">
                Are you sure you want to send messages to the selected vendors?
              </p>
            )}
            {showResendWhatsappMessage && (
              <p>
                Messages have already been sent. Do you want to resend them?
              </p>
            )}

            <div className="flex justify-end">
              <Button
                onClick={() => setShowWhatsappPopup(false)}
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
              <p className="mb-4">
                Are you sure you want to send emails to the selected vendors?
              </p>
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
      {showReminderPopUp && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
          <div className="bg-white p-5 rounded-lg shadow-xl">
            <h2 className="text-xl font-bold mb-4">Unsent Messages</h2>
            <p className="mb-4">
              {`You haven't sent ${!isMessageSent.emailSent ? "Email" : ""}${
                !isMessageSent.emailSent && !isMessageSent.whatsappMessageSent
                  ? ", "
                  : ""
              }${
                !isMessageSent.whatsappMessageSent ? "WhatsApp" : ""
              } messages yet. Would you like to proceed without sending?`}
            </p>

            <div className="flex justify-end">
              <Button
                onClick={() => setShowReminderPopUp(false)}
                className="mr-2 bg-blue-500 hover:bg-blue-700 text-black font-bold py-2 px-4 rounded"
              >
                Cancel
              </Button>
              <Button
                onClick={async () => {
                  await handleNextStep();
                  setShowReminderPopUp(false);
                }}
                className=" bg-gray-300 hover:bg-gray-400 text-black  font-bold py-2 px-4 rounded"
              >
                Proceed without sending
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
