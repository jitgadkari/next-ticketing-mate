import React, { useState } from 'react';
import Button from '../../../components/Button';

interface Step5Props {
  ticketNumber: string;
  vendorMessages: { [key: string]: string };
  selectedVendors: string[];
  handleNext: () => Promise<void>;
  handleUpdate: (updatedMessages: { [key: string]: string }) => Promise<void>;
}

const Step5: React.FC<Step5Props> = ({ ticketNumber, vendorMessages, selectedVendors, handleNext, handleUpdate }) => {
  const [messages, setMessages] = useState(vendorMessages);

  const handleSave = async () => {
    await handleUpdate(messages);
  };

  const handleChange = (vendor: string, value: string) => {
    setMessages(prev => ({
      ...prev,
      [vendor]: value,
    }));
  };

  const handleNextStep = async () => {
    const vendorDecodedMessages: Record<string, any> = {};
    for (const vendor of selectedVendors) {
      const response = await fetch(`${process.env.NEXT_PUBLIC_ENDPOINT_URL}/post_vendor_message_decode`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: messages[vendor] || '' }),
      });
      vendorDecodedMessages[vendor] = await response.json();
    }
    await fetch(`${process.env.NEXT_PUBLIC_ENDPOINT_URL}/ticket/update_next_step/`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ticket_number: ticketNumber, step_info: vendorDecodedMessages, step_number: "Step 6 : Vendor Message Decoded" }),
    });
    handleNext();
  };

  return (
    <div>
      <h3>Messages from Vendors</h3>
      {selectedVendors.map((vendor) => (
        <div key={vendor} className="mb-4">
          <label className="block text-gray-700">{vendor}</label>
          <textarea
            value={messages[vendor] || ''}
            onChange={(e) => handleChange(vendor, e.target.value)}
            className="mt-1 block w-full"
          />
        </div>
      ))}
      <div className="flex justify-end">
        <Button onClick={handleSave} className="mt-4">Save</Button>
        <Button onClick={handleNextStep} className="mt-4 ml-2">Next</Button>
      </div>
    </div>
  );
};

export default Step5;
