import React, { useState, useEffect } from 'react';
import Button from '../../../components/Button';
import MultiSelect, { MultiSelectOption } from '../../../components/MultiSelect';
import { MultiValue } from 'react-select';

interface Step4Props {
  ticketNumber: string;
  selectedVendors: string[];
  template: string;
  handleNext: (updatedVendors: string[]) => Promise<void>;
  handleUpdate: (updatedVendors: string[]) => Promise<void>;
}

const Step4: React.FC<Step4Props> = ({ ticketNumber, selectedVendors, template, handleNext, handleUpdate }) => {
  const [vendors, setVendors] = useState<MultiSelectOption[]>([]);
  const [selectedOptions, setSelectedOptions] = useState<MultiSelectOption[]>(selectedVendors.map(vendor => ({ label: vendor, value: vendor })));

  useEffect(() => {
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
    fetchVendors();
  }, []);

  const handleVendorChange = (selected: MultiValue<MultiSelectOption>) => {
    setSelectedOptions(selected as MultiSelectOption[]);
  };

  const handleSave = async () => {
    const updatedVendors = selectedOptions.map(option => option.value);
    await handleUpdate(updatedVendors);
  };

  const handleNextStep = async () => {
    const updatedVendors = selectedOptions.map(option => option.value);
    
    // First, save the selected vendors
    await handleUpdate(updatedVendors);

    // Then, prepare vendor messages and move to next step
    const vendorMessages = updatedVendors.reduce((acc, vendor) => {
      acc[vendor] = '';
      return acc;
    }, {} as Record<string, string>);
    
    await handleNext(updatedVendors);
  };

  return (
    <div>
      <h3>Select Vendors</h3>
      <MultiSelect
        options={vendors}
        value={selectedOptions}
        onChange={handleVendorChange}
      />
      <div className="flex justify-end">
        <Button onClick={handleSave} className="mt-4">
          Save
        </Button>
        <Button onClick={handleNextStep} className="mt-4 ml-2">
          Next
        </Button>
      </div>
    </div>
  );
};

export default Step4;