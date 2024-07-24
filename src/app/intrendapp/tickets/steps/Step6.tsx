import React, { useState } from 'react';
import Button from '../../../components/Button';

interface Step6Props {
  ticketNumber: string;
  decodedMessages: { [key: string]: any };
  handleNext: () => Promise<void>;
  handleUpdate: (updatedDecodedMessages: { [key: string]: any }) => Promise<void>;
}

const Step6: React.FC<Step6Props> = ({ ticketNumber, decodedMessages, handleNext, handleUpdate }) => {
  const [selectedMessages, setSelectedMessages] = useState<{ [key: string]: any }>({});

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
    await fetch(`${process.env.NEXT_PUBLIC_ENDPOINT_URL}/ticket/update_next_step/`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ticket_number: ticketNumber, step_info: selectedMessages, step_number: "Step 7 : Final Quote" }),
    });
    handleNext();
  };

  return (
    <div>
      <h3>Decoded Messages from Vendors</h3>
      {Object.keys(decodedMessages).map((vendor) => (
        <div key={vendor} className="mb-4">
          <label className="block text-gray-700">{vendor}</label>
          <pre className="bg-gray-100 p-2 rounded">{JSON.stringify(decodedMessages[vendor], null, 2)}</pre>
          <input
            type="checkbox"
            onChange={(e) => handleSelectChange(vendor, e.target.checked)}
            className="mt-1"
          />
          <label className="ml-2">Select this quote</label>
        </div>
      ))}
      <div className="flex justify-end">
        <Button onClick={handleNextStep} className="mt-4 ml-2">Next</Button>
      </div>
    </div>
  );
};

export default Step6;
