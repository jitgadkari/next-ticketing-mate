import React, { useState } from 'react';
import Button from '../../../components/Button';
import VendorDecodedMessage from '@/app/components/step6/VendorDecodedMessage';

interface Step6Props {
  ticketNumber: string;
  decodedMessages: { [key: string]: any };
  isCurrentStep: boolean;
  customerName: string;  // Add this prop
  originalMessage: string;  // Add this prop
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
  },
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
  const [selectedMessages, setSelectedMessages] = useState<{ [key: string]: any }>({});
  const [loading,setLoading] = useState(false);
  const handleNext=async () => {
    console.log("Handling next for Step 6");
    fetchTicket(ticket._id);
    setLoading(false)
    setActiveStep("Step 7 : Customer Message Template");
  }
 const handleUpdate=async (updatedDecodedMessages: { [key: string]: any }) => {
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
  }
  const handleSelectChange = (vendor: string, isChecked: boolean) => {
    setSelectedMessages(prev => {
      const updated = { ...prev };
      if (isChecked) {
        updated[vendor] = decodedMessages[vendor];
      } else {
        delete updated[vendor];
      }
      return updated;
    });
  };

  const handleNextStep = async () => {
    try {
      setLoading(true)
      // First, update the current step with selected messages
      await handleUpdate(selectedMessages);

      // Generate client message template
      const response = await fetch(`${process.env.NEXT_PUBLIC_ENDPOINT_URL}/post_message_template_for_client_direct_message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_name: customerName,
          customerMessage: originalMessage,
          vendor_delivery_info_json: JSON.stringify(selectedMessages)
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate client message template');
      }

      const data = await response.json();
      const clientMessageTemplate = data.client_message_template;

      // Update Step 7 with the generated template
      await fetch(`${process.env.NEXT_PUBLIC_ENDPOINT_URL}/ticket/update_next_step/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          ticket_number: ticketNumber, 
          step_info: { text: clientMessageTemplate }, 
          step_number: "Step 7 : Customer Message Template" 
        }),
      });

      // Move to the next step
      handleNext();
    } catch (error) {
      console.error('Error preparing for next step:', error);
    }
  };

  return (
    <div>
      <h3>Decoded Messages from Vendors</h3>
      {!loading &&(Object.keys(decodedMessages).map((vendor) => {
           let decodedMessage = JSON.stringify(decodedMessages[vendor])
        return(
        <div key={vendor} className="mb-4">
          <label className="block text-gray-700">{vendor}</label>
          <VendorDecodedMessage message={decodedMessage} />
          <input
            type="checkbox"
            onChange={(e) => handleSelectChange(vendor, e.target.checked)}
            className="mt-1"
          />
          <label className="ml-2">Select this quote</label>
        </div>
      )}))}
      {loading && <h1>Loading...</h1>}
      <div className="flex justify-end">
        <Button 
          onClick={handleNextStep} 
          className={`mt-4 ml-2 font-bold py-2 px-4 rounded ${
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

export default Step6;