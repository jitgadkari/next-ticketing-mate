import React, { useState, useEffect } from 'react';
import Button from '../../../components/Button';
import Input from '../../../components/Input';

interface Step3Props {
  ticketNumber: string;
  template: string;
  customerName: string;
  originalMessage: string;
  handleNext: () => void;
  handleUpdate: (updatedTemplate: string) => void;
  isCurrentStep: boolean;
}

const Step3: React.FC<Step3Props> = ({ 
  ticketNumber, 
  template, 
  customerName, 
  originalMessage,
  handleNext, 
  handleUpdate,
  isCurrentStep 
}) => {
  const [message, setMessage] = useState(template);
  const [includeCustomerName, setIncludeCustomerName] = useState(false);

  useEffect(() => {
    if (isCurrentStep && !template) {
      fetchVendorTemplate();
    }
  }, [isCurrentStep, template]);

  const fetchVendorTemplate = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_ENDPOINT_URL}/post_message_template_for_vendor_direct_message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          vendor_name: "{VENDOR}", 
          customerMessage: originalMessage 
        }),
      });
      const data = await response.json();
      setMessage(data.vendor_message_template);
      handleUpdate(data.vendor_message_template);  // Update the backend immediately
    } catch (error) {
      console.error('Error fetching vendor template:', error);
    }
  };

  const handleNextStep = async () => {
    try {
      await handleUpdate(message);  // Ensure the latest message is saved before moving to next step
      handleNext();
    } catch (error) {
      console.error('Error updating ticket:', error);
    }
  };

  const handleSave = () => {
    handleUpdate(message);
  };

  const toggleCustomerName = () => {
    setIncludeCustomerName(!includeCustomerName);
    let updatedMessage;
    if (!includeCustomerName) {
      updatedMessage = `${message}\n\nCustomer Name: ${customerName}`;
    } else {
      updatedMessage = message.replace(`\n\nCustomer Name: ${customerName}`, '');
    }
    setMessage(updatedMessage);
    handleUpdate(updatedMessage);  // Update the backend immediately
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setMessage(e.target.value);
  };

  return (
    <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
      <h3 className="text-xl font-bold mb-4">Step 3: Message Template for Vendors</h3>
      <Input
        label="Vendor Template"
        type="textarea"
        name="vendorTemplate"
        value={message}
        onChange={handleInputChange}
        rows={15}
      />
      <div className="flex justify-between mb-4 mt-4">
        <Button onClick={handleSave} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Save
        </Button>
        <Button 
          onClick={toggleCustomerName} 
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
        >
          {includeCustomerName ? 'Remove Customer Name' : 'Add Customer Name'}
        </Button>
      </div>
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

export default Step3;