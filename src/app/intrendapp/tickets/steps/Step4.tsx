// Step4.tsx
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
}

const Step4: React.FC<Step4Props> = ({ ticketNumber, selectedVendors, template, handleNext, handleUpdate }) => {
  const [vendors, setVendors] = useState<MultiSelectOption[]>([]);
  const [selectedOptions, setSelectedOptions] = useState<MultiSelectOption[]>(
    selectedVendors.map(vendor => ({ label: vendor, value: vendor }))
  );
  const [vendorMessages, setVendorMessages] = useState<Record<string, string>>({});

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

  return (
    <div>
      <h3 className="text-xl font-bold mb-4">Select Vendors</h3>
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
      <div className="flex justify-end mt-4">
        <Button onClick={handleSave} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2">
          Save
        </Button>
        <Button onClick={handleNextStep} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
          Next
        </Button>
      </div>
    </div>
  );
};

export default Step4;