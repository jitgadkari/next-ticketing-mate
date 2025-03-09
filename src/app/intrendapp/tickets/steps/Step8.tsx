'use client'
import React, { useState } from 'react';
import Button from '../../../components/Button';
import toast from 'react-hot-toast';

interface Step8Props {
  ticketNumber: string;
  customerTemplate: string;
  customerResponse: string;
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
  },
}

const Step8: React.FC<Step8Props> = ({ 
  ticketNumber, 
  customerTemplate, 
  customerResponse,
  isCurrentStep,
  fetchTicket,
  setActiveStep,
  ticket,
}) => {
  console.log(ticket)
  const [response, setResponse] = useState(customerResponse);
  const [loading,setLoading] = useState(false);
 const  handleNext=async () => {
    console.log("Handling next for Step 8");
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
            "final_decision": `pending`,
            "status": "Closed",
        },
          step_number: ticket.current_step,
        }),
      }
    );
    fetchTicket(ticket.id);
    setLoading(false)
    setActiveStep("Step 9: Final Status");
    toast.success("Step 8 completed")
  }

  const handleUpdate=async (updatedResponse:string) => {
    console.log("Updating Step 8 response:", updatedResponse);
    let responseRecieved=false
    if(response !=="") {
      responseRecieved=true
    }
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
            "customer_message_template": customerTemplate,
            "customer_response_received": responseRecieved,
            "customer_message_received": response,
            "customer_response_received_time": new Date().toISOString(),
          },
          step_number: ticket.current_step,
        }),
      }
    );
    fetchTicket(ticket.id);
  }
  const handleSave = async () => {
    await handleUpdate(response);
  };

  const handleNextStep = async () => {
    setLoading(true)
    await handleUpdate(response);
    await handleNext();
  };

  return (
    <div>
      <div className="py-1 mb-4">
            <h1 className="text-xl font-bold ">Customer Message</h1>
            <div>{ticket.steps["Step 1 : Customer Message Received"].text}</div>
          </div>
      <h3 className="text-xl font-bold mb-4">Step 8: Message Sent</h3>
     {!loading && <>
      <div className="bg-gray-100 p-4 rounded mb-4">
        <pre className="whitespace-pre-wrap">{customerTemplate}</pre>
      </div>
      <h3 className="text-xl font-bold mb-4">Customer Response</h3>
      <textarea
        value={response}
        onChange={(e) => setResponse(e.target.value)}
        className="w-full h-32 p-2 border rounded mb-4"
        placeholder="Enter customer's response here..."
        />
        </>
        }
        {loading && <h1>Loading...</h1>}
      <div className="flex justify-end space-x-4 mt-4">
        <Button 
          onClick={handleSave} 
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Save
        </Button>
        <Button 
          onClick={handleNextStep} 
          className={`font-bold py-2 px-4 rounded ${
            isCurrentStep 
              ? 'bg-green-500 hover:bg-green-700 text-white' 
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
          disabled={!isCurrentStep}
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default Step8;