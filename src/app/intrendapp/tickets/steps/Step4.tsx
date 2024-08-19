import React, { useState, useEffect } from 'react';
import Button from '../../../components/Button';
import MultiSelect, { MultiSelectOption } from '../../../components/MultiSelect';
import { MultiValue } from 'react-select';

interface Vendor {
  _id: string;
  name: string;
  group: { [key: string]: string } | string;
}

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
  const [vendorDetails, setVendorDetails] = useState<Vendor[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [sendingStatus, setSendingStatus] = useState<Record<string, string>>({});

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
        setVendors(data.vendors.map((vendor: Vendor) => ({ label: vendor.name, value: vendor.name })));
        setVendorDetails(data.vendors);
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

  const handlePopupConfirm = async () => {
    setShowPopup(false);
    setIsSending(true);
    setSendingStatus({});

    for (const option of selectedOptions) {
      const vendor = vendorDetails.find(v => v.name === option.value);
      if (vendor && vendor.group) {
        const groupId = typeof vendor.group === 'string' ? vendor.group : Object.values(vendor.group)[0];
        if (groupId) {
          try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_ENDPOINT_URL}/send_whatsapp_message/`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                to: groupId,
                message: vendorMessages[option.value],
              }),
            });
            const data = await response.json();
            console.log(`Message sent to ${option.value}:`, data);
            setSendingStatus(prev => ({ ...prev, [option.value]: 'Sent' }));
          } catch (error) {
            console.error(`Error sending message to ${option.value}:`, error);
            setSendingStatus(prev => ({ ...prev, [option.value]: 'Failed' }));
          }
        } else {
          console.error(`No group ID found for vendor ${option.value}`);
          setSendingStatus(prev => ({ ...prev, [option.value]: 'No group ID' }));
        }
      } else {
        console.error(`Vendor details not found for ${option.value}`);
        setSendingStatus(prev => ({ ...prev, [option.value]: 'Vendor details not found' }));
      }
    }

    setIsSending(false);
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
              {sendingStatus[option.value] && (
                <p className={`mt-1 ${sendingStatus[option.value] === 'Sent' ? 'text-green-600' : 'text-red-600'}`}>
                  Status: {sendingStatus[option.value]}
                </p>
              )}
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
            (!isCurrentStep || selectedOptions.length === 0 || isSending) && 'opacity-50 cursor-not-allowed'
          }`}
          disabled={!isCurrentStep || selectedOptions.length === 0 || isSending}
        >
          {isSending ? 'Sending...' : 'Send Messages'}
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