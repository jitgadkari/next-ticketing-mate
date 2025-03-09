import React, { useState } from "react";
import Button from "../../../components/Button";
import { FaEdit } from "react-icons/fa";
import toast from "react-hot-toast";

interface Step6Props {
  ticketNumber: string;
  decodedMessages: DecodedMessages;
  isCurrentStep: boolean;
  customerName: string;
  originalMessage: string;
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
}

interface RateDetails {
  price_per_meter: number;
  currency: string;
  quantity: number;
  additional_charges: string;
  other_info: string;
}

interface ScheduleDetails {
  delivery_method: string;
  delivery_time: string;
  delivery_point: string;
}

interface VendorDetails {
  vendor_name: string;
  query: string;
  rate: RateDetails;
  schedule: ScheduleDetails;
}

interface DecodedMessages {
  [vendor: string]: {
    [type: string]: VendorDetails;
  };
}

const Step6: React.FC<Step6Props> = ({
  ticketNumber,
  decodedMessages,
  isCurrentStep,
  customerName,
  originalMessage,
  fetchTicket,
  setActiveStep,
  ticket,
}) => {
  console.log("step 6 props", decodedMessages, ticket);
  const [allDecodedMessages, setAllDecodedMessages] = useState(decodedMessages);
  const [selectedMessages, setSelectedMessages] =
    useState<DecodedMessages>(decodedMessages);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [includeVendorName, setIncludeVendorName] = useState(true);
  const [includeCustomerMessage, setIncludeCustomerMessage] = useState(true);

  const toggleIncludeVendorName = () => {
    setIncludeVendorName((prev) => !prev);
  };

  const toggleIncludeCustomerMessage = () => {
    setIncludeCustomerMessage((prev) => !prev);
  };
  const handleInputChange = (
    vendor: string,
    type: string,
    field: keyof RateDetails | keyof ScheduleDetails,
    value: string | number | object
  ) => {
    setSelectedMessages((prev) => {
      const updated = structuredClone(prev); // Deep clone to ensure reactivity
  
      // Ensure vendor exists
      if (!updated[vendor]) {
        updated[vendor] = {};
      }
  
      // Ensure type exists (e.g., "Bulk")
      if (!updated[vendor][type]) {
        updated[vendor][type] = {
          rate: {},
          schedule: {},
        } as VendorDetails;
      }
  
      const vendorDetails = updated[vendor][type];
  
      if (field in vendorDetails.rate) {
        vendorDetails.rate[field as keyof RateDetails] = value as never;
      } else if (field in vendorDetails.schedule) {
        vendorDetails.schedule[field as keyof ScheduleDetails] = value as never;
      }
  
      return updated;
    });
  };
  
  

  const handleNext = async () => {
    console.log("Handling next for Step 6");
    fetchTicket(ticket.id);
    setLoading(false);
    setActiveStep("Step 7 : Customer Message Template");
    toast.success("Step 6 completed");
  };

  const handleSelectChange = (vendor: string, isChecked: boolean) => {
    setSelectedMessages((prev) => {
      const updated = { ...prev };
      if (!isChecked) {
        updated[vendor] = decodedMessages[vendor];
      } else {
        delete updated[vendor];
      }
      return updated;
    });
  };

  const handleUpdate = async (updatedDecodedMessages: DecodedMessages) => {
    console.log("Updating Step 6 messages:", updatedDecodedMessages);
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
            step_info: {
              decoded_messages: updatedDecodedMessages,
            },
          }),
        }
      );
      await fetchTicket(ticket.id);
      toast.success("Changes saved successfully");
    } catch (error) {
      console.error("Error updating messages:", error);
      toast.error("Failed to save changes");
    }
  };
  const handleEditSaveToggle = async () => {
    if (isEditing) {
      // If currently editing, save changes
      await handleUpdate(selectedMessages);
    }
    // Toggle edit mode
    setIsEditing(!isEditing);
  };

  const handleNextStep = async () => {
    try {
        setLoading(true);
        console.log("Selected Messages:", selectedMessages);

        // ✅ Extract vendor information properly (excluding unnecessary metadata)
        const formattedVendorInfo = Object.entries(selectedMessages.decoded_messages).reduce(
            (acc, [vendorId, vendorData]) => {
                acc[vendorData.vendor_name] = vendorData.decoded_response;
                return acc;
            }, 
            {} as Record<string, any>
        );

        // ✅ Create the correct request payload
        const requestPayload = {
            customer_name: customerName,
            customerMessage: originalMessage,
            vendor_delivery_info: formattedVendorInfo, // ✅ Send the correctly formatted object
            ticket_number: ticket.ticket_number,
            send_vendor_name: includeVendorName,
            customerMessageRequired: includeCustomerMessage,
        };

        console.log("🚀 Corrected Request Payload:", requestPayload);

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
        console.log("✅ Client Message Template:", clientMessageTemplate);

        // Update Step 7 with the generated template
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
                        customer_message_template: clientMessageTemplate,
                        message_sent: { whatsapp: false, email: false },
                    },
                    step_number: ticket.current_step,
                }),
            }
        );

        handleNext(); // Proceed to the next step
    } catch (error) {
        console.error("❌ Error preparing for next step:", error);
        toast.error("Failed to proceed to next step");
    } finally {
        setLoading(false);
    }
};

  console.log("allDecodedMessages", allDecodedMessages);
  return (
    <div>
      <div className="py-1 mb-4">
        <h1 className="text-xl font-bold">Customer Message</h1>
        <div>
          {ticket.steps["Step 1 : Customer Message Received"].latest.text}
        </div>
      </div>

      <h3 className="text-xl font-bold my-4">
        Step 6: Decoded Messages from Vendors
      </h3>

      <div className="flex justify-end items-center mb-4">
        <button
          onClick={handleEditSaveToggle}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
        >
          <FaEdit className="text-xl" />
          {isEditing ? "Save" : "Edit"}
        </button>
      </div>

      {Object.entries(allDecodedMessages.decoded_messages).map(
        ([vendorId, vendorData]) => (
          <div
            key={vendorId}
            className="mb-8 border rounded-lg p-4 bg-white shadow"
          >
            {/* Vendor Header Information */}
            <div className="mb-4 border-b pb-4">
              <h4 className="text-lg font-semibold text-blue-600">
                {vendorData.vendor_name}
              </h4>
              <p className="text-sm text-gray-600">
                Original Message: {vendorData.original_message}
              </p>
              <p className="text-sm text-gray-600">
                Response Time:{" "}
                {new Date(vendorData.response_received_time).toLocaleString()}
              </p>
            </div>

            {/* Bulk Details */}
            {Object.entries(vendorData.decoded_response).map(([key, value]) => {
              if (key.startsWith("Bulk")) {
                const bulkData = value as BulkDetails;
                return (
                  <div key={key} className="mb-4 bg-gray-50 p-4 rounded-lg">
                    <h5 className="font-medium text-lg mb-2">{key}</h5>
                    {/* <p className="mb-3 text-gray-700">
                    <span className="font-medium">Query:</span> {bulkData.query}
                  </p> */}

                    {/* Rate Details */}
                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <div className="bg-white p-3 rounded shadow-sm">
                        <h6 className="font-medium mb-2 text-blue-600">
                          Rate Details
                        </h6>
                        {isEditing ? (
                          <div className="space-y-2">
                            {Object.entries(bulkData.rate).map(
                              ([field, value]) => (
                                <div key={field} className="flex items-center">
                                  <label className="w-1/2 text-sm capitalize">
                                    {field.replace(/_/g, " ")}:
                                  </label>
                                  <input
                                    type={
                                      field === "price_per_meter" ||
                                      field === "quantity"
                                        ? "number"
                                        : "text"
                                    }
                                    value={value}
                                    onChange={(e) =>
                                      handleInputChange(
                                        vendorId,
                                        key,
                                        field as keyof RateDetails,
                                        e.target.value
                                      )
                                    }
                                    className="w-1/2 border rounded px-2 py-1 text-sm"
                                  />
                                </div>
                              )
                            )}
                          </div>
                        ) : (
                          <div className="space-y-1">
                            {Object.entries(bulkData.rate).map(
                              ([field, value]) => (
                                <p key={field} className="text-sm">
                                  <span className="font-medium capitalize">
                                    {field.replace(/_/g, " ")}:
                                  </span>{" "}
                                  {typeof value === "object"
                                    ? JSON.stringify(value)
                                    : String(value) || "Not Found"}
                                </p>
                              )
                            )}
                          </div>
                        )}
                      </div>

                      {/* Schedule Details */}
                      <div className="bg-white p-3 rounded shadow-sm">
                        <h6 className="font-medium mb-2 text-blue-600">
                          Schedule Details
                        </h6>
                        {isEditing ? (
                          <div className="space-y-2">
                            {Object.entries(bulkData.schedule).map(
                              ([field, value]) => (
                                <div key={field} className="flex items-center">
                                  <label className="w-1/2 text-sm capitalize">
                                    {field.replace(/_/g, " ")}:
                                  </label>

                                  {typeof value === "object" &&
                                  value !== null ? (
                                    // If value is an object, render its properties as separate inputs
                                    <div className="w-1/2 space-y-1">
                                      {Object.entries(value).map(
                                        ([subField, subValue]) => (
                                          <div
                                            key={subField}
                                            className="flex items-center"
                                          >
                                            <label className="w-1/2 text-xs capitalize">
                                              {subField.replace(/_/g, " ")}:
                                            </label>
                                            <input
                                              type="text"
                                              value={subValue as string}
                                              onChange={(e) =>
                                                handleInputChange(
                                                  vendorId,
                                                  key,
                                                  field as keyof ScheduleDetails,
                                                  {...value,[subField]: e.target.value,} // Update nested object
                                                )
                                              }
                                              className="w-1/2 border rounded px-2 py-1 text-sm"
                                            />
                                          </div>
                                        )
                                      )}
                                    </div>
                                  ) : (
                                    <input
                                      type="text"
                                      value={value as string}
                                      onChange={(e) =>
                                        handleInputChange(
                                          vendorId,
                                          key,
                                          field as keyof ScheduleDetails,
                                          e.target.value
                                        )
                                      }
                                      className="w-1/2 border rounded px-2 py-1 text-sm"
                                    />
                                  )}
                                </div>
                              )
                            )}
                          </div>
                        ) : (
                          <div className="space-y-1">
                            {Object.entries(bulkData.schedule).map(
                              ([field, value]) => (
                                <p key={field} className="text-sm">
                                  <span className="font-medium capitalize">
                                    {field.replace(/_/g, " ")}:
                                  </span>{" "}
                                  {typeof value === "object"
                                    ? JSON.stringify(value)
                                    : String(value) || "Not Found"}
                                </p>
                              )
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              }
              return null;
            })}

            {/* Vendor Selection Checkbox */}
            <div className="mt-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  onChange={(e) =>
                    handleSelectChange(vendorId, e.target.checked)
                  }
                  className="form-checkbox h-4 w-4 text-blue-600"
                />
                <span className="text-sm text-gray-700">
                  Unselect this quote
                </span>
              </label>
            </div>
          </div>
        )
      )}

      {/* Bottom Action Buttons */}
      <div className="space-y-4">
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

        <div className="flex justify-end">
          <Button
            onClick={handleNextStep}
            className={`font-bold py-2 px-4 rounded ${
              isCurrentStep
                ? "bg-green-500 hover:bg-green-700 text-white"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
            disabled={!isCurrentStep}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Step6;
