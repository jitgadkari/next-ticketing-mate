"use client";
import React, { useState, useEffect } from "react";
import Button from "../../../components/Button";
import { FaEdit } from "react-icons/fa";
import EditDecodedMessage from "@/app/components/step2/EditDecodedMessage";
import toast from "react-hot-toast";

interface Step2Props {
  ticketNumber: string;
  data: Record<string, any>;
  originalMessage: string;
  setActiveStep: (step: string) => void;
  fetchTicket: (ticketId: string) => Promise<void>;
  isCurrentStep: boolean;
  step: string
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

const Step2: React.FC<Step2Props> = ({
  ticketNumber,
  data,
  originalMessage,
  fetchTicket,
  setActiveStep,
  isCurrentStep,
  ticket,
  step
}) => {
  console.log("Step 2 data:", data);
  console.log("Step 2 message:", originalMessage);
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState(JSON.stringify(data, null, 2));
  const [loading, setLoading] = useState(false);
  // const [includeDecodedMessage, setIncludeDecodedMessage] = useState(true);
  const handleNext = async () => {
    console.log("Handling next for Step 2");
    await fetchTicket(ticket.id);
    setLoading(false);
    setActiveStep("Step 3 : Message Template for vendors");
    toast.success("Step 2 completed");
  };

  const handleUpdate = async (updatedData: Record<string, any>) => {
    console.log("Updating Step 2 data:", updatedData);
    const payload = {
      ticket_id: ticket.id,
      step_info: { decoded_messages: updatedData },
      step_number: step,
    };

    console.log("Payload:", JSON.stringify(payload));
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/ticket/update_step/specific?user_id=1234&user_agent=user-test`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Update failed:", errorData);
      } else {
        const responseData = await response.json();
        console.log("Update successful:", responseData);
      }
    } catch (error) {
      console.error("Error during fetch:", error);
    }
    fetchTicket(ticket.id);
  };

  // useEffect(() => {
  //   if (isCurrentStep) {
  //     handleUpdate(JSON.parse(message));
  //   }
  // }, [isCurrentStep]);

  const handleSave = async () => {
    const updatedData = JSON.parse(message);
    console.log("updatedData from save button: ", updatedData);
    await handleUpdate(updatedData);
    setIsEditing(false);
  };

  const handleNextStep = async () => {
    setLoading(true);
    try {
      const messageText =
        typeof originalMessage === "string"
          ? originalMessage
          : JSON.parse(originalMessage).text || "";
      console.log(ticket.ticket_number, messageText);
      console.log("payload...",JSON.stringify({
        vendor_name: "{VENDOR}",
        customerMessage: messageText,
        ticket_number: ticket.ticket_number,
        asked_details:ticket.steps["Step 2 : Message Decoded"].latest.decoded_messages,
        asked_details_required: false,
      }))
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/post_message_template_for_vendor_direct_message`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            vendor_name: "{VENDOR}",
            customerMessage: messageText,
            ticket_number: ticket.ticket_number,
            asked_details:ticket.steps["Step 2 : Message Decoded"].latest.decoded_messages,
            asked_details_required: false,
          }),
        }
      );
      console.log(response);
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error response:", errorData);
        throw new Error(
          `Failed to generate vendor message template: ${response.statusText}`
        );
      }

      const data = await response.json();
      console.log(data);
      const vendorMessageTemplate = data;
      console.log(vendorMessageTemplate);

      console.log("payload...",({
        ticket_id: ticket.id,
        step_info: { vendor_message_temp: vendorMessageTemplate },
        step_number: step,
      }))
      const updateResponse = await fetch(
        `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/ticket/update_next_step/?user_id=1234&user_agent=user-test`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ticket_id: ticket.id,
            step_info: { vendor_message_temp: vendorMessageTemplate },
            step_number: step,
          }),
        }
      );
      console.log(updateResponse);
      if (!updateResponse.ok) {
        const errorData = await updateResponse.json();
        console.error("Error response:", errorData);
        throw new Error(
          `Failed to update next step: ${updateResponse.statusText}`
        );
      }
      const responseData = await updateResponse.json();
      console.log("Update successful:", responseData);
      await handleNext();
    } catch (error) {
      console.error("Error preparing for next step:", error);
    }
  };
  console.log(message);
  // const handleIncludeDecodedMessage=()=>{
  //   setIncludeDecodedMessage(!includeDecodedMessage);
  // }
  const parsedMessage: Record<string, string> = JSON.parse(message);
  return (
    <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
      <div className="py-2">
        <h1 className="text-xl font-bold ">Customer Message</h1>
        <div>{ticket.steps["Step 1 : Customer Message Received"].text}</div>
      </div>
      {!isEditing ? (
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold mb-4">Step 2: Decoded Message</h3>
          <div
            className="flex justify-end items-center"
            onClick={() => setIsEditing(true)}
          >
            {" "}
            <FaEdit className="text-black text-2xl" />
          </div>
        </div>
      ) : (
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold ">Step 2: Decoded Message</h3>
          <Button
            onClick={() => setIsEditing(false)}
            className=" bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
          >
            Cancel
          </Button>
        </div>
      )}
      {isEditing ? (
        <div className="text-black">
          {loading && <h1>Loading...</h1>}
          <EditDecodedMessage message={message} setMessage={setMessage} />
          <Button
            onClick={handleSave}
            className="mt-4 mr-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Save
          </Button>
        </div>
      ) : (
        <div className=" bg-white rounded-md shadow-md ">
          <div className="overflow-x-auto">
            {!loading && (
              <table className="min-w-full bg-white border border-gray-200">
                <tbody>
                  {Object.entries(parsedMessage).map(([key, value]) => (
                    <tr key={key} className="border-b">
                      <td className="px-4 py-2 font-medium text-gray-700 bg-gray-50">
                        {key.replace(/_/g, " ")}
                      </td>
                      <td className="px-4 py-2 text-gray-800">
                        {String(value !== "Null" ? value : "N/A")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {loading && <h1>Loading...</h1>}
          </div>
        </div>
      )}
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
      {/* <Button
        onClick={handleIncludeDecodedMessage}
        className={`mt-4 ml-4 font-bold py-2 px-4 rounded ${
          isCurrentStep
            ? "bg-blue-500 hover:bg-blue-700 text-white"
            : "bg-gray-300 text-gray-500 cursor-not-allowed"
        }`}
        disabled={!isCurrentStep}
      >
       {includeDecodedMessage?"Remove Decoded Message from template":"Include Decoded Message in Template"}
      </Button> */}
    </div>
  );
};

export default Step2;
