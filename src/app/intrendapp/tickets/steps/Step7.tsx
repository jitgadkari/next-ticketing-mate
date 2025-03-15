"use client";
import React, { useState, useEffect, useMemo } from "react";
import Button from "../../../components/Button";
import toast from "react-hot-toast";
import { FaWhatsapp } from "react-icons/fa";
import { MdEmail } from "react-icons/md";

interface Step7Props {
  ticketNumber: string;
  customerTemplate: string;
  messageSentStatus: any;
  personName: string;
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
    from_number: string;
  };
}

interface StepVersion {
  time: string;
  customer_message_template: string;
  messagesSent: {
    whatsApp: boolean;
    email: boolean;
  };
}

interface DecodedResponse {
  vendor_name: string;
  decoded_response: string;
}

interface DecodedMessages {
  [vendorId: string]: DecodedResponse;
}

const Step7: React.FC<Step7Props> = ({
  ticketNumber,
  customerTemplate,
  messageSentStatus,
  personName,
  isCurrentStep,
  fetchTicket,
  setActiveStep,
  ticket,
}) => {
  console.log("Step 7 props:", {
    ticketNumber,
    customerTemplate,
    messageSentStatus,
    personName,
    isCurrentStep,
    ticket,
  });
  const [template, setTemplate] = useState(customerTemplate);
  console.log(template);
  const [showPopup, setShowPopup] = useState({
    whatsAppPerson: false,
    whatsAppGroup: false,
    email: false,
    sendReminder: false,
  });
  const [isSending, setIsSending] = useState(false);
  const [sendingStatus, setSendingStatus] = useState<string | null>(null);
  const [messagesSent, setMessagesSent] = useState({
    whatsApp: messageSentStatus.whatsapp,
    email: messageSentStatus.email,
  });
  const [includeVendorName, setIncludeVendorName] = useState(true);
  const [includeCustomerMessage, setIncludeCustomerMessage] = useState(true);
  const [selectedContact, setSelectedContact] = useState<{id: string; name: string} | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<string>("");
  interface CustomerPerson {
    id: string;
    name: string;
    phone?: string;
  }

  interface CustomerData {
    customer_people_list: CustomerPerson[];
    group?: Record<string, string>;
  }

  const [customerData, setCustomerData] = useState<CustomerData | null>(null);
  const [peopleOptions, setPeopleOptions] = useState<string[]>([]);
  const [groupOptions, setGroupOptions] = useState<{ [key: string]: string }>({});
  const [selectedPersonPhone, setSelectedPersonPhone] = useState<string>("");

  const [selectedVersion, setSelectedVersion] = useState<string>("latest");

  const allVersions = useMemo(() => {
    const stepData = ticket.steps["Step 7 : Customer Message Template"] || {};
    const defaultData = {
      customer_message_template: "",
      messagesSent: { whatsApp: false, email: false },
    };

    const versions = (stepData.versions || []).map((version: StepVersion) => ({
      version: version.time,
      time: version.time,
      data: version,
    }));

    const versionList = [
      {
        version: "latest",
        time: stepData.latest?.time || new Date().toISOString(),
        data: stepData.latest || defaultData,
      },
      ...versions,
    ];

    return versionList.sort((a, b) => {
      if (a.version === "latest") return -1;
      if (b.version === "latest") return 1;
      return new Date(b.time).getTime() - new Date(a.time).getTime();
    });
  }, [ticket.steps]);

  useEffect(() => {
    const versionData = allVersions.find((v) => v.version === selectedVersion);
    if (versionData?.data) {
      setTemplate(versionData.data.customer_message_template);
      setMessagesSent(versionData.data.messagesSent);
    }
  }, [selectedVersion, allVersions]);

  const formatTime = (timestamp: string) => {
    if (timestamp === "No timestamp") return timestamp;
    try {
      const date = new Date(timestamp);
      return date.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } catch (error) {
      return "Invalid date";
    }
  };

  useEffect(() => {
    if (!customerTemplate.trim()) {
      // Only generate if empty
      (async () => {
        const generatedTemplate = await generateMessageTemplate(
          ticket.steps["Step 6 : Vendor Message Decoded"]?.latest?.decoded_messages || {},
          includeCustomerMessage,
          includeVendorName,
          ticket.customer_name,
          ticket.steps["Step 1 : Customer Message Received"]?.latest.text || "",
        );
        setTemplate(generatedTemplate);
      })();
    } else {
      setTemplate(customerTemplate); // Use existing template if available
    }
  }, []);

  const generateMessageTemplate = async (
    decoded_messages: DecodedMessages,
    includeCustomerMessage: boolean,
    includeVendorName: boolean,
    customerName: string,
    originalMessage: string
  ) => {
    console.log(decoded_messages, includeCustomerMessage, includeVendorName);
    const formattedVendorInfo = Object.entries(decoded_messages).reduce(
      (acc, [vendorId, vendorData]) => {
        acc[vendorData.vendor_name] = vendorData.decoded_response;
        return acc;
      },
      {} as Record<string, string>
    );

    console.log(formattedVendorInfo);
    // Create the correct request payload
    const requestPayload = {
      customer_name: customerName,
      customerMessage: originalMessage,
      vendor_delivery_info: formattedVendorInfo, // Send the correctly formatted object
      ticket_number: ticket.ticket_number,
      send_vendor_name: includeVendorName,
      customerMessageRequired: includeCustomerMessage,
    };

    console.log("Corrected Request Payload:", requestPayload);

    // Generate client message template
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/post_message_template_for_client_direct_message`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestPayload),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to generate client message template");
    }

    const data = await response.json();
    const clientMessageTemplate = data.client_message_template;
    console.log("Client Message Template:", clientMessageTemplate);
    return clientMessageTemplate;
  };

  const handleGroupSelect = (groupId: string) => {
    setSelectedGroup(groupId);
    // Find the group name from groupOptions
    const selectedGroupName = Object.entries(groupOptions).find(([name, id]) => id === groupId)?.[0];
    console.log("Selected Group Details:", {
      groupName: selectedGroupName,
      groupId: groupId,
    });
  };

  const toggleIncludeVendorName = () => {
    setIncludeVendorName((prev) => {
      const newIncludeVendorName = !prev;
      updateTemplate(includeCustomerMessage, newIncludeVendorName);
      return newIncludeVendorName;
    });
  };

  const toggleIncludeCustomerMessage = () => {
    setIncludeCustomerMessage((prev) => {
      const newIncludeCustomerMessage = !prev;
      updateTemplate(newIncludeCustomerMessage, includeVendorName);
      return newIncludeCustomerMessage;
    });
  };

  // Function to manually regenerate the template
  const updateTemplate = async (newIncludeCustomerMessage: boolean, newIncludeVendorName: boolean) => {
    const generatedTemplate = await generateMessageTemplate(
      ticket.steps["Step 6 : Vendor Message Decoded"]?.latest?.decoded_messages || {},
      newIncludeCustomerMessage,
      newIncludeVendorName,
      ticket.customer_name,
      ticket.steps["Step 1 : Customer Message Received"]?.latest.text || "",
    );
    setTemplate(generatedTemplate);
  };

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
      console.log("Customer Data", data);
      if (data.customers && data.customers.length > 0) {
        const customer = data.customers[0];
        // Initialize with default empty values following the pattern
        setCustomerData({
          customer_people_list: customer.customer_people_list || [],
          group: customer.group || {}
        });
        setPeopleOptions(customer.people || []);
        setGroupOptions(customer.group || {});
      } else {
        // Set default empty values if no data
        setCustomerData({
          customer_people_list: [],
          group: {}
        });
        setPeopleOptions([]);
        setGroupOptions({});
      }
    } catch (error) {
      console.error("Error fetching customer details:", error);
      toast.error("Failed to fetch customer details");
      // Set default empty values on error
      setCustomerData({
        customer_people_list: [],
        group: {}
      });
      setPeopleOptions([]);
      setGroupOptions({});
    }
  };

  const step5Messages = ticket.steps["Step 5: Messages from Vendors"];

  const keys = Object.keys(step5Messages);

  const [loading, setLoading] = useState(false);

  const handleNext = async () => {
    await fetch(
      `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/ticket/update_next_step/?user_id=1234&user_agent=user-test`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ticket_id: ticket.id,
          step_info: {
            customer_message_template: template,
            customer_response_received: false,
            customer_message_received: "",
            customer_response_received_time: null,
          },
          step_number: ticket.current_step,
        }),
      }
    );
    fetchTicket(ticket.id);
    setActiveStep("Step 8 : Customer Response");
    toast.success("Step 7 completed");
  };

  const handleUpdate = async (updatedTemplate: string) => {
    try {
      const whatsAppMessage = ticket?.steps?.["Step 7 : Customer Message Template"]?.whatsApp || "";
      const emailMessage = ticket?.steps?.["Step 7 : Customer Message Template"]?.email || "";

      await fetch(
        `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/ticket/update_step/specific?user_id=1234&user_agent=user-test`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ticket_id: ticket.id,
            step_info: {
              customer_message_template: updatedTemplate,
              whatsApp: whatsAppMessage,
              email: emailMessage,
              customer_message_template_time: new Date().toISOString(),
            },
            step_number: ticket.current_step,
          }),
        }
      );
      fetchTicket(ticket.id);
    } catch (error) {
      console.error("Error updating Step 7:", error);
      toast.error("Failed to update template");
    }
  };

  const handleSave = async () => {
    await handleUpdate(template);
  };

  const handleNextStep = async () => {
    setLoading(true);
    try {
      console.log("Starting Step 7 completion...");

      const whatsAppMessage = ticket?.steps?.["Step 7 : Customer Message Template"]?.whatsApp || "";
      const emailMessage = ticket?.steps?.["Step 7 : Customer Message Template"]?.email || "";

      console.log("Updating Step 7 template...");
      await handleUpdate(customerTemplate);

      console.log("Moving to next step...");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/ticket/update_next_step/?user_id=1234&user_agent=user-test`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ticket_id: ticket.id,
            step_info: {
              customer_message_template: customerTemplate,
              whatsApp: whatsAppMessage,
              email: emailMessage,
              customer_message_template_time: new Date().toISOString(),
            },
            step_number: ticket.current_step,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update step");
      }

      console.log("Refreshing ticket data...");
      await fetchTicket(ticket.id);

      setLoading(false);
      setActiveStep("Step 8: Message Sent");
      toast.success("Step 7 completed");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      console.error("Error moving to next step:", errorMessage);
      toast.error(`Failed to complete step: ${errorMessage}`);
      setLoading(false);
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
      if (type === "whatsAppPerson") {
        if (!selectedContact) {
          toast.error("Please select a contact");
          return;
        }
        if (!selectedPersonPhone) {
          toast.error("No phone number available for this contact");
          return;
        }

        // Validate message content
        if (!template || template.trim() === "") {
          toast.error("Message content cannot be empty");
          return;
        }

        console.log("Sending WhatsApp message to person:", selectedPersonPhone);
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/send_whatsapp_message/`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              to: `${selectedPersonPhone}@c.us`,
              message: template.trim()
            }),
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to send WhatsApp message: ${response.statusText}`);
        }

        const data = await response.json();
        console.log("WhatsApp message response:", data);
        setSendingStatus("WhatsApp message sent successfully");
        setMessagesSent((prev) => ({
          ...prev,
          whatsApp: true,
        }));
      } else if (type === "whatsAppGroup") {
        if (!selectedGroup) {
          toast.error("Please select a group");
          return;
        }
        // Add @g.us suffix for group if not already present
        const targetNumber = selectedGroup.endsWith("@g.us")
          ? selectedGroup
          : `${selectedGroup}@g.us`;
        console.log("Sending WhatsApp message to group:", targetNumber);

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/send_whatsapp_message/`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              to: targetNumber,
              message: template.trim()
            }),
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to send WhatsApp message: ${response.statusText}`);
        }

        const data = await response.json();
        console.log("WhatsApp message response:", data);
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

        if (!sendEmailResponse.ok) {
          throw new Error(`Failed to send email: ${sendEmailResponse.statusText}`);
        }

        const sendEmailData = await sendEmailResponse.json();
        console.log("Email API Response:", sendEmailData);
        setSendingStatus("Email sent successfully");
        setMessagesSent((prev) => ({
          ...prev,
          email: true,
        }));
      }
    } catch (error) {
      console.error(`Error sending ${type} message:`, error);
      setSendingStatus(`Failed to send ${type} message`);
      toast.error(`Failed to send ${type} message`);
    } finally {
      setIsSending(false);
    }
  };

  const handlePersonSelect = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const personId = e.target.value;
    if (personId) {
      try {
        console.log("Fetching details for person ID:", personId);
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/persons/${personId}`
        );
        const data = await response.json();
        console.log("Person data:", data);
        if (data.person && data.person[0]?.phone) {
          const person = data.person[0];
          console.log("Setting phone number:", person.phone);
          setSelectedPersonPhone(person.phone);
          setSelectedContact({
            id: personId,
            name: person.name || ''
          });
        } else {
          setSelectedPersonPhone("");
          setSelectedContact(null);
          toast.error("No phone number found for this person");
        }
      } catch (error) {
        console.error("Error fetching person details:", error);
        toast.error("Failed to fetch person details");
        setSelectedPersonPhone("");
        setSelectedContact(null);
      }
    } else {
      setSelectedPersonPhone("");
      setSelectedContact(null);
    }
  };

  return (
    <div>
      <div className="py-1 mb-4">
        <h1 className="text-xl font-bold ">Customer Message</h1>
        <div>{ticket.steps["Step 1 : Customer Message Received"].text}</div>
      </div>
      <div className="flex justify-between items-center my-4">
        <h3 className="text-xl font-bold">
          Step 7: Customer Message Template
        </h3>
        <div className="flex items-center gap-4">
          {isCurrentStep && (
            <select
              value={selectedVersion}
              onChange={(e) => setSelectedVersion(e.target.value)}
              className="px-3 py-2 border rounded-md text-sm"
            >
              {allVersions.map((version: { version: string; time: string }) => (
                <option key={version.version} value={version.version}>
                  {version.version === "latest" ? "Latest Version" : `Version from ${formatTime(version.time)}`}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>
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
        <div className="flex gap-4">
          <Button
            onClick={toggleIncludeCustomerMessage}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            {includeCustomerMessage
              ? "Remove Customer Message"
              : "Include Customer Message"}
          </Button>
          <Button
            onClick={toggleIncludeVendorName}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
          >
            {includeVendorName ? "Remove Vendor Name" : "Include Vendor Name"}
          </Button>
        </div>
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
                value={selectedContact?.id || ''}
                onChange={handlePersonSelect}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a contact...</option>
                {(customerData?.customer_people_list || []).map((person: CustomerPerson, index: number) => (
                  <option key={person.id || index} value={person.id}>
                    {person.name}
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
                onChange={(e) => handleGroupSelect(e.target.value)}
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
