import React, { useState, useEffect } from 'react';
import Button from '../../../components/Button';

interface Step5Props {
  ticketNumber: string;
  vendorMessages: { [key: string]: string };
  selectedVendors: string[];
  handleNext: () => Promise<void>;
  handleUpdate: (updatedMessages: { [key: string]: string }) => Promise<void>;
}

const Step5: React.FC<Step5Props> = ({ ticketNumber, vendorMessages, selectedVendors, handleNext, handleUpdate }) => {
  const [messages, setMessages] = useState<{ [key: string]: string }>(vendorMessages);

  useEffect(() => {
    // Initialize messages with empty strings for each selected vendor if not already present
    const initialMessages = selectedVendors.reduce((acc, vendor) => {
      if (!acc[vendor]) {
        acc[vendor] = '';
      }
      return acc;
    }, { ...vendorMessages });
    setMessages(initialMessages);
  }, [selectedVendors, vendorMessages]);

  const handleSave = async () => {
    console.log('Saving messages:', messages);
    await handleUpdate(messages);
  };

  const handleChange = (vendor: string, value: string) => {
    setMessages(prev => ({
      ...prev,
      [vendor]: value,
    }));
  };

  const handleNextStep = async () => {
    // First, save the current messages
    await handleUpdate(messages);

    // Then, proceed with moving to the next step
    await handleNext();
  };

  return (
    <div>
      <h3 className="text-xl font-bold mb-4">Messages from Vendors</h3>
      {selectedVendors.map((vendor) => (
        <div key={vendor} className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">{vendor}</label>
          <textarea
            value={messages[vendor] || ''}
            onChange={(e) => handleChange(vendor, e.target.value)}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            rows={4}
          />
        </div>
      ))}
      <div className="flex justify-end space-x-4">
        <Button onClick={handleSave} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Save
        </Button>
        <Button onClick={handleNextStep} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
          Next
        </Button>
      </div>
    </div>
  );
};

export default Step5;