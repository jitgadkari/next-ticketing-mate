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
    _id: string;
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
  const [allDecodedMessages,setAllDecodedMessages]= useState(decodedMessages);
  const [selectedMessages, setSelectedMessages] =
    useState<DecodedMessages>(decodedMessages);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const handleInputChange = (
    vendor: string,
    type: string,
    field: keyof RateDetails | keyof ScheduleDetails,
    value: string | number
  ) => {
    setSelectedMessages((prev) => {
      const updated = { ...prev };
      const vendorDetails = updated[vendor][type];

      if (field in vendorDetails.rate) {
        // TypeScript knows here that `field` must be a key of `RateDetails`
        vendorDetails.rate[field as keyof RateDetails] = value as never;
      } else if (field in vendorDetails.schedule) {
        // TypeScript knows here that `field` must be a key of `ScheduleDetails`
        vendorDetails.schedule[field as keyof ScheduleDetails] = value as never;
      }

      return updated;
    });
  };

  const handleNext = async () => {
    console.log("Handling next for Step 6");
    fetchTicket(ticket._id);
    setLoading(false);
    setActiveStep("Step 7 : Customer Message Template");
    toast.success("Step 6 completed")
  };

  const handleUpdate = async (updatedDecodedMessages: DecodedMessages) => {
    console.log("Updating Step 6 messages:", updatedDecodedMessages);
    await fetch(
      `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/ticket/update_specific_step/`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ticket_number: ticket.ticket_number,
          step_number: "Step 6 : Vendor Message Decoded",
          step_info: updatedDecodedMessages,
        }),
      }
    );
    fetchTicket(ticket._id);
  };
  console.log(selectedMessages);
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

  const handleNextStep = async () => {
    try {
      setLoading(true);
      console.log(selectedMessages);
      // Update the current step with selected messages
      await handleUpdate(selectedMessages);
      console.log({
        client_name: customerName,
        customerMessage: originalMessage,
        vendor_delivery_info_json: JSON.stringify(selectedMessages),
      })
      // Generate client message template
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/post_message_template_for_client_direct_message_new`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            client_name: customerName,
            customerMessage: originalMessage,
            vendor_delivery_info_json: JSON.stringify(selectedMessages),
            ticket_number:ticket.ticket_number
          }),
        }
      );
console.log(response)
      if (!response.ok) {
        throw new Error("Failed to generate client message template");
      }

      const data = await response.json();
      const clientMessageTemplate = data.client_message_template;

      // Update Step 7 with the generated template
      await fetch(
        `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/ticket/update_next_step/`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ticket_number: ticketNumber,
            step_info: { text: clientMessageTemplate },
            step_number: "Step 7 : Customer Message Template",
          }),
        }
      );

      // Move to the next step
      handleNext();
    } catch (error) {
      console.error("Error preparing for next step:", error);
    }
  };

  return (
    <div>
      <h3 className="text-xl font-bold my-4">Step 6: Decoded Messages from Vendors</h3>
      <div className="flex justify-end items-center"  onClick={() => setIsEditing(!isEditing)}>
        <FaEdit
          className="text-black text-2xl"
         
        />
      </div>
      {!loading &&
        Object.keys(allDecodedMessages).map((vendor) => {
          const vendorData = allDecodedMessages[vendor];

          return (
            <div key={vendor} className="mb-4">
              <label className="block text-gray-700 font-bold">{vendor}</label>
              {Object.entries(vendorData).map(([type, details]) => {
                const vendorDetails = details as VendorDetails;

                return (
                  <div key={type} className="my-2">
                    <h4 className="font-semibold">{type}</h4>
                    <div className="ml-4 flex md:flex-row flex-col md: gap-3">
                      <div className="bg-gray-100 px-3 py-2 rounded-md">
                        <h5 className="font-medium">Rate:</h5>
                        {isEditing ? (
                          <>
                            <p>
                              Price per meter:
                              <input
                                type="number"
                                value={vendorDetails.rate.price_per_meter}
                                onChange={(e) =>
                                  handleInputChange(
                                    vendor,
                                    type,
                                    "price_per_meter",
                                    parseFloat(e.target.value)
                                  )
                                }
                                className="ml-2 border rounded pl-2"
                              />
                            </p>
                            <p>
                              Currency:
                              <input
                                type="text"
                                value={vendorDetails.rate.currency}
                                onChange={(e) =>
                                  handleInputChange(
                                    vendor,
                                    type,
                                    "currency",
                                    e.target.value
                                  )
                                }
                                className="ml-2 border rounded pl-2"
                              />
                            </p>
                            <p>
                              Quantity:
                              <input
                                type="number"
                                value={vendorDetails.rate.quantity}
                                onChange={(e) =>
                                  handleInputChange(
                                    vendor,
                                    type,
                                    "quantity",
                                    parseFloat(e.target.value)
                                  )
                                }
                                className="ml-2 border rounded pl-2"
                              />
                            </p>
                            <p>
                              Additional Charges:
                              <input
                                type="text"
                                value={vendorDetails.rate.additional_charges}
                                onChange={(e) =>
                                  handleInputChange(
                                    vendor,
                                    type,
                                    "additional_charges",
                                    e.target.value
                                  )
                                }
                                className="ml-2 border rounded pl-2"
                              />
                            </p>
                            <p>
                              Other Info:
                              <input
                                type="text"
                                value={vendorDetails.rate.other_info}
                                onChange={(e) =>
                                  handleInputChange(
                                    vendor,
                                    type,
                                    "other_info",
                                    e.target.value
                                  )
                                }
                                className="ml-2 border rounded"
                              />
                            </p>
                          </>
                        ) : (
                          <>
                            <p>
                              Price per meter:{" "}
                              {vendorDetails.rate.price_per_meter}{" "}
                              {vendorDetails.rate.currency}
                            </p>
                            <p>Quantity: {vendorDetails.rate.quantity}</p>
                            <p>
                              Additional Charges:{" "}
                              {vendorDetails.rate.additional_charges}
                            </p>
                            <p>Other Info: {vendorDetails.rate.other_info}</p>
                          </>
                        )}
                      </div>
                      <div className="bg-gray-100 px-3 py-2 rounded-md">
                        <h5 className="font-medium">Schedule:</h5>
                        {isEditing ? (
                          <>
                            <p>
                              Delivery Method:
                              <input
                                type="text"
                                value={vendorDetails.schedule.delivery_method}
                                onChange={(e) =>
                                  handleInputChange(
                                    vendor,
                                    type,
                                    "delivery_method",
                                    e.target.value
                                  )
                                }
                                className="ml-2 border rounded pl-2"
                              />
                            </p>
                            <p>
                              Delivery Time:
                              <input
                                type="text"
                                value={vendorDetails.schedule.delivery_time}
                                onChange={(e) =>
                                  handleInputChange(
                                    vendor,
                                    type,
                                    "delivery_time",
                                    e.target.value
                                  )
                                }
                                className="ml-2 border rounded pl-2"
                              />
                            </p>
                            <p>
                              Delivery Point:
                              <input
                                type="text"
                                value={vendorDetails.schedule.delivery_point}
                                onChange={(e) =>
                                  handleInputChange(
                                    vendor,
                                    type,
                                    "delivery_point",
                                    e.target.value
                                  )
                                }
                                className="ml-2 border rounded pl-2"
                              />
                            </p>
                          </>
                        ) : (
                          <>
                            <p>
                              Delivery Method:{" "}
                              {vendorDetails.schedule.delivery_method}
                            </p>
                            <p>
                              Delivery Time:{" "}
                              {vendorDetails.schedule.delivery_time}
                            </p>
                            <p>
                              Delivery Point:{" "}
                              {vendorDetails.schedule.delivery_point}
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              <input
                type="checkbox"
                onChange={(e) => handleSelectChange(vendor, e.target.checked)}
                className="mt-1"
              />
              <label className="ml-2">Unselect this quote</label>
            </div>
          );
        })}

      {loading && <h1>Loading...</h1>}
      <div className="flex justify-end">
        <Button
          onClick={handleNextStep}
          className={`mt-4 ml-2 font-bold py-2 px-4 rounded ${
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
  );
};

export default Step6;
