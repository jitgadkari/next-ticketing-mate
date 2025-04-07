"use client";

import React, { useState, useEffect } from "react";
import Button from "../../../components/Button";
import Input from "../../../components/Input";
import toast from "react-hot-toast";

interface Step3Props {
  ticketNumber: string;
  template: Template;
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
    created_date: string;
    updated_date: string;
  };
  step: string;
}

type Template = {
  message: string;
};

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
  interface StepVersion {
    time: string;
    vendor_message_temp: string;
  }

  const stepData = ticket.steps[step] || {};
  const versions = stepData.versions || [];

  // Add latest version to the versions array for unified handling
  const allVersions = [
    {
      version: "latest",
      time: stepData.latest?.time || "No timestamp",
      vendor_message_temp: stepData.latest?.vendor_message_temp || "",
    },
    ...versions.map((v: StepVersion) => ({
      version: v.time,
      time: v.time,
      vendor_message_temp: v.vendor_message_temp,
    })),
  ];

  // Sort versions by time in descending order (newest first)
  allVersions.sort(
    (a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()
  );

  const [selectedVersion, setSelectedVersion] = useState<string>("latest");

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

  const handleVersionChange = async (version: string) => {
    if (!isCurrentStep) return;

    setSelectedVersion(version);

    const selected = allVersions.find((v) => v.version === version);
    if (!selected) return;

    const newMsg = selected.vendor_message_temp;
    setMessage(newMsg);

    // ✅ Update toggles for Customer Name & Sample Query
    setIncludeCustomerName(newMsg.includes(`Customer Name: ${customerName}`));
    setIncludeSampleQuery(newMsg.includes("This is a Sample Query"));

    // ✅ Decode and match to enable/disable the decoded toggle
    try {
      const decodedTemplate = await message_decoder(
        originalMessage,
        ticket,
        true
      );

      if (newMsg.trim() === decodedTemplate.trim()) {
        setIncludeDecodedMessage(true);
      } else {
        setIncludeDecodedMessage(false);
      }
    } catch (err) {
      console.error("Error decoding version message:", err);
      setIncludeDecodedMessage(false); // fallback just in case
    }
  };

  console.log("template", template);
  const [message, setMessage] = useState(() => {
    // Initialize from latest version if available, otherwise use template
    if (stepData.latest?.vendor_message_temp) {
      return stepData.latest.vendor_message_temp;
    }
    return template?.message ?? "";
  });
  console.log("message", message);
  // Initialize includeCustomerName based on whether the template includes customer name
  const [includeCustomerName, setIncludeCustomerName] = useState(() => {
    // Support both active and inactive customers per SelectCustomerDropdown requirements
    const templateMessage = template?.message ?? "";
    return templateMessage.includes(`Customer Name: ${customerName}`);
  });
  const [includeSampleQuery, setIncludeSampleQuery] = useState(() => {
    const templateMessage = template?.message ?? "";
    return templateMessage.includes("This is a Sample Query");
  });
  const [includeDecodedMessage, setIncludeDecodedMessage] = useState(() => {
    // Initialize based on whether the template includes decoded messages
    return template &&
      ticket.steps["Step 2 : Message Decoded"]?.latest?.decoded_messages
      ? message === template.message // If template exists, check if current message matches it
      : false;
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;

    const initializeState = async () => {
      try {
        // Check for existing step data
        if (stepData.latest?.vendor_message_temp) {
          if (mounted) setMessage(stepData.latest.vendor_message_temp);
          return;
        }

        // Fallback to the template message
        if (template?.message) {
          if (mounted) setMessage(template.message);
          try {
            const decodedTemplate = await message_decoder(
              originalMessage,
              ticket,
              true
            );
            if (mounted)
              setIncludeDecodedMessage(template.message === decodedTemplate);
          } catch (error) {
            console.error(
              "Error checking initial decoded message state:",
              error
            );
          }
        } else {
          // Attempt to fetch the ticket data if no message or template
          if (mounted) await fetchTicket(ticket.id);
        }
      } catch (error) {
        console.error("Error in initializeState:", error);
        if (mounted) toast.error("Failed to initialize message template");
      }
    };

    initializeState();

    return () => {
      mounted = false;
    };
  }, [template, stepData, ticket.id]);

  const handleUpdate = async (updatedTemplate: string) => {
    console.log(updatedTemplate);
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/api/tickets/update_step/specific?userId=a8ccba22-4c4e-41d8-bc2c-bfb7e28720ea&userAgent=user-test`,
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
          step_number: "Step 3 : Message Template for vendors",
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

      const nextStepResponse = await fetch(
        `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/api/tickets/update_next_step?userId=a8ccba22-4c4e-41d8-bc2c-bfb7e28720ea&userAgent=user-test`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ticket_id: ticket.id,
            step_info: { vendors: [] },
            step_number: "Step 3 : Message Template for vendors",
          }),
        }
      );

      if (!nextStepResponse.ok) {
        const errorData = await nextStepResponse.json();
        throw new Error(
          `Failed to update next step: ${
            errorData.message || nextStepResponse.statusText
          }`
        );
      }

      const nextStepData = await nextStepResponse.json();
      console.log("Next step update successful:", nextStepData);

      setActiveStep("Step 4 : Vendor Selection");
      toast.success("Step 3 completed");
      await fetchTicket(ticket.id);
    } catch (error) {
      console.error("Error updating ticket:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update ticket"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    await handleUpdate(message);
    // Update states based on current message content
    toast.success("Message template saved successfully");
    setIncludeCustomerName(message.includes(`Customer Name: ${customerName}`));
    setIncludeSampleQuery(message.includes("This is a Sample Query"));

    // Check if the saved message matches what would be returned with decoded messages
    try {
      const decodedTemplate = await message_decoder(
        originalMessage,
        ticket,
        true
      );

      // Only update includeDecodedMessage if message *matches* the decoded template
      // (don’t forcibly reset it if message was custom-edited)
      if (message === decodedTemplate) {
        setIncludeDecodedMessage(true);
      }
    } catch (error) {
      console.error("Error checking decoded message state:", error);
    }
  };

  const toggleCustomerName = () => {
    setIncludeCustomerName(!includeCustomerName);
    if (!includeCustomerName) {
      setMessage(
        (prevMessage: string) =>
          `${prevMessage}\n\nCustomer Name: ${customerName}`
      );
    } else {
      setMessage((prevMessage: string) =>
        prevMessage.replace(`\n\nCustomer Name: ${customerName}`, "")
      );
    }
  };

  const toggleSampleQuery = () => {
    setIncludeSampleQuery(!includeSampleQuery);
    if (!includeSampleQuery) {
      setMessage(
        (prevMessage: string) => `${prevMessage}\n\nThis is a Sample Query`
      );
    } else {
      setMessage((prevMessage: string) =>
        prevMessage.replace(`\n\nThis is a Sample Query`, "")
      );
    }
  };
  const handleIncludeDecodedMessage = async () => {
    setIncludeDecodedMessage((prevState) => !prevState); // Toggle state first
    const newState = !includeDecodedMessage; // Get new state

    try {
      const vendorMessageTemplate = await message_decoder(
        originalMessage,
        ticket,
        newState
      );
      let updatedMessage = vendorMessageTemplate;

      // ✅ Append customer name if needed
      if (
        includeCustomerName &&
        !updatedMessage.includes(`\n\nCustomer Name: ${customerName}`)
      ) {
        updatedMessage += `\n\nCustomer Name: ${customerName}`;
      }

      // ✅ Append sample query if needed
      if (
        includeSampleQuery &&
        !updatedMessage.includes(`\n\nThis is a Sample Query`)
      ) {
        updatedMessage += `\n\nThis is a Sample Query`;
      }

      setMessage(updatedMessage);
    } catch (error) {
      console.error("Error including decoded message:", error);
      toast.error("Failed to include decoded message.");
    }
  };

  const message_decoder = async (
    originalMessage: string,
    ticket: any,
    includeDecodedMessage: boolean
  ) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/api/template/vendor_message_template`,
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
              ticket.steps["Step 2 : Message Decoded"]?.latest
                ?.decoded_messages,
            asked_details_required: includeDecodedMessage,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error response:", errorData);
        throw new Error(
          `Failed to generate vendor message template: ${response.statusText}`
        );
      }

      const data = await response.json();
      return data.message;
    } catch (error) {
      console.error("Error in message_decoder:", error);
      return "";
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const newMessage = e.target.value;
    setMessage(newMessage);
    setIncludeCustomerName(
      newMessage.includes(`Customer Name: ${customerName}`)
    );
    setIncludeSampleQuery(newMessage.includes("This is a Sample Query"));

    // Use a timeout to debounce the message decoding check
    setTimeout(async () => {
      try {
        const decodedTemplate = await message_decoder(
          originalMessage,
          ticket,
          true
        );
        setIncludeDecodedMessage(newMessage === decodedTemplate);
      } catch (error) {
        console.error("Error checking decoded message state:", error);
      }
    }, 300); // Debounce interval
  };

  return (
    <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
      {!loading && (
        <>
          <div className="py-1 mb-4">
            <h1 className="text-xl font-bold">Customer Message</h1>
            <div>
              {ticket.steps["Step 1 : Customer Message Received"]?.latest?.text}
            </div>
          </div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">
              Step 3: Message Template for Vendors
            </h3>
            {isCurrentStep && versions.length > 0 && (
              <select
                value={selectedVersion}
                onChange={(e) => handleVersionChange(e.target.value)}
                className="border rounded px-2 py-1 text-sm"
              >
                {allVersions.map(({ version, time }) => (
                  <option key={version} value={version}>
                    {version === "latest" ? "Latest Version" : formatTime(time)}
                  </option>
                ))}
              </select>
            )}
          </div>
          <Input
            label="Vendor Template"
            type="textarea"
            name="vendorTemplate"
            value={message}
            onChange={handleInputChange}
            rows={15}
            disabled={!isCurrentStep}
            className={!isCurrentStep ? "bg-gray-100 cursor-not-allowed" : ""}
          />
          <div className="flex flex-wrap gap-4 mb-4 mt-4">
            <Button
              onClick={handleSave}
              className={`font-bold py-2 px-4 rounded ${
                isCurrentStep
                  ? "bg-blue-500 hover:bg-blue-700 text-white"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
              disabled={!isCurrentStep}
            >
              Save
            </Button>

            <Button
              onClick={toggleSampleQuery}
              className={`font-bold py-2 px-4 rounded ${
                isCurrentStep
                  ? "bg-blue-500 hover:bg-blue-700 text-white"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
              disabled={!isCurrentStep}
            >
              {includeSampleQuery ? "Remove Sample Query" : "Add Sample Query"}
            </Button>

            <Button
              onClick={toggleCustomerName}
              className={`font-bold py-2 px-4 rounded ${
                isCurrentStep
                  ? "bg-green-500 hover:bg-green-700 text-white"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
              disabled={!isCurrentStep}
            >
              {includeCustomerName
                ? "Remove Customer Name"
                : "Add Customer Name"}
            </Button>

            {/* 🚀 Push this one to the right */}
            <div className="ml-auto">
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
