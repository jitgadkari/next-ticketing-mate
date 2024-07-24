import React, { useState, useEffect } from 'react';
import Button from '../../../components/Button';
import TextArea from '../../../components/TextArea';

interface Step5Props {
  ticketNumber: string;
  vendorMessages: { label: string; value: string; }[];
  selectedVendors: string[];
  handleNext: () => void;
  handleUpdate: (updatedMessages: { label: string; value: string; }[]) => void;
}

const Step5: React.FC<Step5Props> = ({ ticketNumber, vendorMessages, selectedVendors, handleNext, handleUpdate }) => {
  const [messages, setMessages] = useState<{ label: string; value: string; }[]>(vendorMessages);

  const handleSave = () => {
    handleUpdate(messages);
  };

  const handleNextStep = async () => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_ENDPOINT_URL}/ticket/update_next_step/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ticket_number: ticketNumber, step_info: { list: messages }, step_number: "Step 6 : Vendor Message Decoded" }),
      });
      handleNext();
    } catch (error) {
      console.error('Error updating ticket:', error);
    }
  };

  return (
    <div>
      <h3>Messages from Vendors</h3>
      {selectedVendors.map((vendor, index) => (
        <div key={vendor}>
          <h4>{vendor}</h4>
          <TextArea
            label={`Message from ${vendor}`}
            name={vendor}
            value={messages[index]?.value || ''}
            onChange={(e) => {
              const newMessages = [...messages];
              newMessages[index] = { label: vendor, value: e.target.value };
              setMessages(newMessages);
            }}
          />
        </div>
      ))}
      <Button onClick={handleSave} className="mt-4">Save</Button>
      <Button onClick={handleNextStep} className="mt-4">Next Step</Button>
    </div>
  );
};

export default Step5;
