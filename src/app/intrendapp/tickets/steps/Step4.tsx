import React, { useState, useEffect } from 'react';
import Button from '../../../components/Button';
import MultiSelect, { MultiSelectOption } from '../../../components/MultiSelect';
import { MultiValue } from 'react-select';

interface Step4Props {
  ticketNumber: string;
  selectedVendors: string[];
  template: string;
  handleNext: (updatedVendors: Record<string, string>) => Promise<void>;
  handleUpdate: (updatedVendors: string[]) => Promise<void>;
  isCurrentStep: boolean;
}

const Step4: React.FC<Step4Props> = ({ 
  ticketNumber, 
  selectedVendors, 
  template, 
  handleNext, 
  handleUpdate,
  isCurrentStep
}) => {
  const [vendors, setVendors] = useState<MultiSelectOption[]>([]);
  const [selectedOptions, setSelectedOptions] = useState<MultiSelectOption[]>(
    selectedVendors.map(vendor => ({ label: vendor, value: vendor }))
  );
  const [vendorMessages, setVendorMessages] = useState<Record<string, string>>({});
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    fetchVendors();
  }, []);

  useEffect(() => {
    if (selectedOptions.length > 0 && template) {
      generateVendorMessages();
    }
  }, [selectedOptions, template]);

  const fetchVendors = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_ENDPOINT_URL}/vendors`);
      const data = await response.json();
      if (Array.isArray(data.vendors)) {
        setVendors(data.vendors.map((vendor: any) => ({ label: vendor.name, value: vendor.name })));
      } else {
        console.error('Unexpected response format:', data);
      }
    } catch (error) {
      console.error('Error fetching vendors:', error);
    }
  };

  const generateVendorMessages = async () => {
    const messages: Record<string, string> = {};
    for (const option of selectedOptions) {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_ENDPOINT_URL}/replace_vendor_with_name`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message_template: template,
            vendor_name: option.value,
          }),
        });
        const data = await response.json();
        messages[option.value] = data.message;
      } catch (error) {
        console.error(`Error generating message for vendor ${option.value}:`, error);
        messages[option.value] = 'Error generating message';
      }
    }
    setVendorMessages(messages);
  };

  const handleVendorChange = (selected: MultiValue<MultiSelectOption>) => {
    setSelectedOptions(selected as MultiSelectOption[]);
  };

  const handleSave = async () => {
    const updatedVendors = selectedOptions.map(option => option.value);
    await handleUpdate(updatedVendors);
  };

  const handleNextStep = async () => {
    await handleSave();
    await handleNext(vendorMessages);
  };

  const handleSendMessage = () => {
    setShowPopup(true);
  };

  const handlePopupConfirm = () => {
    // Implement the logic to send messages here
    console.log('Sending messages:', vendorMessages);
    setShowPopup(false);
    // You might want to call an API to send the messages here
  };

  return (
    <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
      <h3 className="text-xl font-bold mb-4">Step 4: Select Vendors</h3>
      <MultiSelect
        options={vendors}
        value={selectedOptions}
        onChange={handleVendorChange}
      />
      {selectedOptions.length > 0 && (
        <div className="mt-4">
          <h4 className="text-lg font-semibold mb-2">Vendor Messages</h4>
          {selectedOptions.map(option => (
            <div key={option.value} className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">{option.label}</label>
              <textarea
                value={vendorMessages[option.value] || ''}
                readOnly
                className="w-full h-32 p-2 border rounded"
              />
            </div>
          ))}
        </div>
      )}
      <div className="flex justify-between mt-4">
        <Button 
          onClick={handleSave} 
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          disabled={!isCurrentStep}
        >
          Save
        </Button>
        <Button 
          onClick={handleSendMessage} 
          className={`bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded ${
            !isCurrentStep && 'opacity-50 cursor-not-allowed'
          }`}
          disabled={!isCurrentStep || selectedOptions.length === 0}
        >
          Send Messages
        </Button>
        <Button 
          onClick={handleNextStep} 
          className={`font-bold py-2 px-4 rounded ${
            isCurrentStep 
              ? 'bg-blue-500 hover:bg-blue-700 text-white' 
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
          disabled={!isCurrentStep || selectedOptions.length === 0}
        >
          Next Step
        </Button>
      </div>

      {showPopup && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
          <div className="bg-white p-5 rounded-lg shadow-xl">
            <h2 className="text-xl font-bold mb-4">Sending Messages...</h2>
            <p className="mb-4">Are you sure you want to send messages to the selected vendors?</p>
            <div className="flex justify-end">
              <Button onClick={() => setShowPopup(false)} className="mr-2 bg-gray-300 hover:bg-gray-400 text-black font-bold py-2 px-4 rounded">
                Cancel
              </Button>
              <Button onClick={handlePopupConfirm} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                OK
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Step4;