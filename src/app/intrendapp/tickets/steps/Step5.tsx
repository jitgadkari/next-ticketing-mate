import React, { useState, useEffect } from 'react';
import Button from '../../../components/Button';

interface Step5Props {
  ticketNumber: string;
  vendorMessages: Record<string, string>;
  handleNext: () => Promise<void>;
  handleUpdate: (updatedMessages: Record<string, string>) => Promise<void>;
  isCurrentStep: boolean;
}

const Step5: React.FC<Step5Props> = ({ 
  ticketNumber, 
  vendorMessages, 
  handleNext, 
  handleUpdate,
  isCurrentStep 
}) => {
  const [messages, setMessages] = useState<Record<string, string>>(vendorMessages);

  useEffect(() => {
    setMessages(vendorMessages);
  }, [vendorMessages]);

  const handleChange = (vendor: string, value: string) => {
    setMessages(prev => ({
      ...prev,
      [vendor]: value,
    }));
  };

  const handleSave = async () => {
    console.log('Saving messages:', messages);
    await handleUpdate(messages);
  };

  const handleNextStep = async () => {
    await handleSave();
    await handleNext();
  };

  return (
    <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
      <h3 className="text-xl font-bold mb-4">Messages from Vendors</h3>
      {Object.entries(messages).map(([vendor, message]) => (
        <div key={vendor} className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">{vendor}</label>
          <textarea
            value={message}
            onChange={(e) => handleChange(vendor, e.target.value)}
            className="w-full h-32 p-2 border rounded"
            readOnly={!isCurrentStep}
          />
        </div>
      ))}
      <div className="flex justify-end space-x-4">
        <Button 
          onClick={handleSave} 
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          disabled={!isCurrentStep}
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

export default Step5;