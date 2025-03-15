import React, { useState, useEffect, useMemo } from "react";
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

interface BulkDetails {
  rate: RateDetails;
  schedule: ScheduleDetails;
  query?: string;
}

interface VendorDetails {
  vendor_name: string;
  query: string;
  rate: RateDetails;
  schedule: ScheduleDetails;
  original_message: string;
  response_received_time: string;
  decoded_response: Record<string, any>;
}

interface DecodedMessages {
  [vendor: string]: {
    [type: string]: VendorDetails;
  };
}

const NestedDataTable: React.FC<{ data: any; isEditing?: boolean; onEdit?: (path: string[], value: any) => void }> = ({
  data,
  isEditing = false,
  onEdit,
}) => {
  const renderInput = (path: string[], value: any) => (
    <input
      type={typeof value === "number" ? "number" : "text"}
      value={value?.toString() || ""}
      onChange={(e) => {
        const newValue = e.target.type === "number" ? 
          (e.target.value === "" ? "" : parseFloat(e.target.value)) : 
          e.target.value;
        onEdit?.(path, newValue);
      }}
      className="w-full border rounded px-2 py-1 text-sm"
    />
  );

  const renderValue = (path: string[], value: any): React.ReactNode => {
    if (typeof value === "object" && value !== null) {
      return (
        <table className="w-full nested-table">
          <tbody>
            {Object.entries(value).map(([key, val]) => (
              <tr key={key} className="border-b border-gray-100">
                <td className="py-1 px-2 text-sm font-medium capitalize w-1/3">
                  {key.replace(/_/g, " ")}
                </td>
                <td className="py-1 px-2 text-sm">
                  {isEditing && onEdit && typeof val !== "object" ? 
                    renderInput([...path, key], val) : 
                    renderValue([...path, key], val)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    }
    
    return isEditing && onEdit ? 
      renderInput(path, value) : 
      String(value) || "Not Found";
  };

  return (
    <table className="w-full border-collapse">
      <tbody>
        {Object.entries(data).map(([key, value]) => (
          <tr key={key} className="border-b">
            <td className="py-2 px-4 text-sm font-medium capitalize w-1/3 bg-gray-50">
              {key.replace(/_/g, " ")}
            </td>
            <td className="py-2 px-4 text-sm">
              {renderValue([key], value)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

interface StepVersion {
  time: string;
  decoded_messages: {
    [key: string]: {
      vendor_name: string;
      decoded_response: {
        [key: string]: {
          rate: {
            currency: string;
            quantity: string;
            other_info: string;
            price_method: string;
            price_per_meter: string;
          };
          schedule: {
            delivery_point: string;
            starting_delivery: {
              days: string;
              quantity: string;
            };
            completion_delivery: {
              days: string;
              quantity: string;
            };
          };
        };
      };
      original_message: string;
    };
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
 
  const [selectedVersion, setSelectedVersion] = useState<string>('latest');

  const allVersions = useMemo(() => {
    const stepData = ticket.steps["Step 6 : Vendor Message Decoded"] || {};
    console.log('Step 6 - Step data:', stepData);

    // Following initialization pattern from MEMORY
    const defaultData = { decoded_messages: {} };

    // Get versions array
    const versions = (stepData.versions || []).map((version: StepVersion) => ({
      version: version.time,
      time: version.time,
      data: version
    }));

    // Add latest version
    const versionList = [
      {
        version: 'latest',
        time: stepData.latest?.time || new Date().toISOString(),
        data: stepData.latest || defaultData
      },
      ...versions
    ];

    console.log('Step 6 - Version list:', versionList);
    return versionList.sort((a, b) => {
      if (a.version === 'latest') return -1;
      if (b.version === 'latest') return 1;
      return new Date(b.time).getTime() - new Date(a.time).getTime();
    });
  }, [ticket.steps]);

  const formatTime = (timestamp: string) => {
    if (timestamp === 'No timestamp') return timestamp;
    try {
      const date = new Date(timestamp);
      return date.toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  useEffect(() => {
    console.log('Step 6 - Selected version:', selectedVersion);
    const versionData = allVersions.find(v => v.version === selectedVersion);
    console.log('Step 6 - Version data found:', versionData);
    
    if (versionData?.data) {
      // Following initialization pattern from MEMORY
      const decodedMessages = versionData.data.decoded_messages || {};
      console.log('Step 6 - Setting messages:', decodedMessages);
      
      // Always provide default values for decoded_messages state
      const newState = { decoded_messages: decodedMessages };
      setAllDecodedMessages(newState);
      setSelectedMessages(newState);
    }
  }, [selectedVersion, allVersions]);


  const handleInputChange = (
    vendor: string,
    type: string,
    path: string[],
    value: string | number
  ) => {
    setAllDecodedMessages((prev) => {
      const updated = structuredClone(prev);
      const bulkData = updated.decoded_messages[vendor].decoded_response[type];

      // Navigate to the correct nested object using the path
      let target = bulkData;
      const lastKey = path[path.length - 1];
      
      // Navigate through the path except the last key
      for (let i = 0; i < path.length - 1; i++) {
        target = target[path[i]];
      }

      // Update the value at the final path
      if (target && typeof target === 'object') {
        target[lastKey] = value;
      }

      // Also update selectedMessages to stay in sync
      setSelectedMessages(structuredClone(updated));
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
      const updated = structuredClone(prev);
      if (!updated.decoded_messages) updated.decoded_messages = {};
      
      if (isChecked) {
        // Remove this vendor's messages
        delete updated.decoded_messages[vendor];
      } else {
        // Add this vendor's messages back
        updated.decoded_messages[vendor] = allDecodedMessages.decoded_messages[vendor];
      }
      
      return updated;
    });
  };

  const isVendorSelected = (vendorId: string): boolean => {
    return !selectedMessages.decoded_messages?.[vendorId];
  };

  const handleUpdate = async () => {
    console.log("Updating Step 6 messages:", allDecodedMessages);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/ticket/update_step/specific?user_id=1234&user_agent=user-test`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ticket_id: ticket.id,
            step_number: ticket.current_step,
            step_info: allDecodedMessages
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update');
      }

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
      await handleUpdate();
    }
    // Toggle edit mode
    setIsEditing(!isEditing);
  };

  const handleCancel = () => {
    // Reset to original data
    setAllDecodedMessages(decodedMessages);
    setSelectedMessages(decodedMessages);
    setIsEditing(false);
    toast.success('Changes cancelled');
  };

  const handleNextStep = async () => {
    try {
        setLoading(true);
        console.log("Selected Messages:", selectedMessages);

        // Extract vendor information properly (excluding unnecessary metadata)
        // const formattedVendorInfo = Object.entries(selectedMessages.decoded_messages).reduce(
        //     (acc, [vendorId, vendorData]) => {
        //         acc[vendorData.vendor_name] = vendorData.decoded_response;
        //         return acc;
        //     }, 
        //     {} as Record<string, any>
        // );

        // // Create the correct request payload
        // const requestPayload = {
        //     customer_name: customerName,
        //     customerMessage: originalMessage,
        //     vendor_delivery_info: formattedVendorInfo, // Send the correctly formatted object
        //     ticket_number: ticket.ticket_number,
        //     send_vendor_name: true,
        //     customerMessageRequired: true,
        // };

        // console.log("Corrected Request Payload:", requestPayload);

        // // Generate client message template
        // const response = await fetch(
        //     `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/post_message_template_for_client_direct_message`,
        //     {
        //         method: "POST",
        //         headers: {
        //             "Content-Type": "application/json",
        //         },
        //         body: JSON.stringify(requestPayload), 
        //     }
        // );

        // if (!response.ok) {
        //     throw new Error("Failed to generate client message template");
        // }

        // const data = await response.json();
        // const clientMessageTemplate = data.client_message_template;
        // console.log("Client Message Template:", clientMessageTemplate);

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
                        customer_message_template: "",
                        message_sent: { whatsapp: false, email: false },
                    },
                    step_number: ticket.current_step,
                }),
            }
        );

        handleNext(); // Proceed to the next step
    } catch (error) {
        console.error("Error preparing for next step:", error);
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

      <div className="flex justify-between items-center my-4">
        <h3 className="text-xl font-bold">
          Step 6: Decoded Messages from Vendors
        </h3>
        {isCurrentStep && <div className="flex items-center gap-4">
          <select
            value={selectedVersion}
            onChange={(e) => setSelectedVersion(e.target.value)}
            className="px-3 py-2 border rounded-md text-sm"
          >
            {allVersions.map((version: { version: string; time: string }) => (
              <option key={version.version} value={version.version}>
                {version.version === 'latest' ? 'Latest Version' : `Version from ${formatTime(version.time)}`}
              </option>
            ))}
          </select>
        </div>}
      </div>

      <div className="flex justify-end items-center gap-4 mb-4">
        {isEditing ? (
          <>
            <button
              onClick={handleCancel}
              className="flex items-center gap-2 text-red-600 hover:text-red-800"
            >
              Cancel
            </button>
            <button
              onClick={handleEditSaveToggle}
              className="flex items-center gap-2 text-green-600 hover:text-green-800"
            >
              <FaEdit className="text-xl" />
              Save
            </button>
          </>
        ) : (
          <button
            onClick={handleEditSaveToggle}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
          >
            <FaEdit className="text-xl" />
            Edit
          </button>
        )}
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
                        <h6 className="font-medium mb-2 text-blue-600">Rate Details</h6>
                        <NestedDataTable 
                          data={bulkData.rate} 
                          isEditing={isEditing}
                          onEdit={(path, value) => handleInputChange(vendorId, key, ['rate', ...path], value)}
                        />
                      </div>

                      {/* Schedule Details */}
                      <div className="bg-white p-3 rounded shadow-sm">
                        <h6 className="font-medium mb-2 text-blue-600">Schedule Details</h6>
                        <NestedDataTable 
                          data={bulkData.schedule} 
                          isEditing={isEditing}
                          onEdit={(path, value) => handleInputChange(vendorId, key, ['schedule', ...path], value)}
                        />
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
                  checked={isVendorSelected(vendorId)}
                  onChange={(e) =>
                    handleSelectChange(vendorId, e.target.checked)
                  }
                  className="form-checkbox h-4 w-4 text-blue-600"
                />
                <span className="text-sm text-gray-700">
                  {isVendorSelected(vendorId) ? 'Select this quote' : 'Unselect this quote'}
                </span>
              </label>
            </div>
          </div>
        )
      )}

      {/* Bottom Action Buttons */}
      <div className="space-y-4">
       

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
