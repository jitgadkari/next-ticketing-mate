import React, { useState, useEffect } from 'react';
import Button from '../../../components/Button';
import TextArea from '../../../components/TextArea';

interface Step2Props {
  ticketNumber: string;
  data: Record<string, any>;
  originalMessage: string;
  handleNext: () => Promise<void>;
  handleUpdate: (updatedData: Record<string, any>) => Promise<void>;
  isCurrentStep: boolean;
}

const Step2: React.FC<Step2Props> = ({ 
  ticketNumber, 
  data, 
  originalMessage,
  handleNext, 
  handleUpdate, 
  isCurrentStep 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState(JSON.stringify(data, null, 2));

  useEffect(() => {
    if (isCurrentStep) {
      handleUpdate(JSON.parse(message));
    }
  }, [isCurrentStep]);

  const handleSave = async () => {
    const updatedData = JSON.parse(message);
    console.log('updatedData from save button: ', updatedData);
    await handleUpdate(updatedData);
    setIsEditing(false);
  };

  const handleNextStep = async () => {
    try {
      const messageText = typeof originalMessage === 'string' 
        ? originalMessage 
        : JSON.parse(originalMessage).text || '';

      const response = await fetch(`${process.env.NEXT_PUBLIC_ENDPOINT_URL}/post_message_template_for_vendor_direct_message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          vendor_name: "{VENDOR}",
          customerMessage: messageText
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        throw new Error(`Failed to generate vendor message template: ${response.statusText}`);
      }

      const data = await response.json();
      const vendorMessageTemplate = data.vendor_message_template;

      await fetch(`${process.env.NEXT_PUBLIC_ENDPOINT_URL}/ticket/update_next_step/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          ticket_number: ticketNumber, 
          step_info: { text: vendorMessageTemplate }, 
          step_number: "Step 3 : Message Template for vendors" 
        }),
      });

      await handleNext();
    } catch (error) {
      console.error('Error preparing for next step:', error);
    }
  };

  return (
    <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
      <h3 className="text-xl font-bold mb-4">Step 2: Message Decoded</h3>
      {isEditing ? (
        <div>
          <TextArea
            label="Decoded Message"
            name="decodedMessage"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <Button onClick={handleSave} className="mt-4 mr-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Save</Button>
          <Button onClick={() => setIsEditing(false)} className="mt-4 bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">Cancel</Button>
        </div>
      ) : (
        <div>
          <pre className="bg-gray-100 p-4 rounded-lg whitespace-pre-wrap mb-4">{message}</pre>
          <Button onClick={() => setIsEditing(true)} className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded">Edit</Button>
        </div>
      )}
      <Button 
        onClick={handleNextStep} 
        className={`mt-4 font-bold py-2 px-4 rounded ${
          isCurrentStep 
            ? 'bg-blue-500 hover:bg-blue-700 text-white' 
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
        disabled={!isCurrentStep}
      >
        Next Step
      </Button>
    </div>
  );
};

export default Step2;