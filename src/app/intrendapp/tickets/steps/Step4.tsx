import React, { useState, useEffect } from 'react';
import Button from '../../../components/Button';
import { MultiSelect,  Option } from 'react-multi-select-component';

interface Step4Props {
  ticketNumber: string;
  selectedVendors: string[];
  template: string;
  handleNext: () => void;
  handleUpdate: (updatedVendors: string[]) => void;
}

const Step4: React.FC<Step4Props> = ({ ticketNumber, selectedVendors, template, handleNext, handleUpdate }) => {
  const [vendors, setVendors] = useState<Option[]>([]);
  const [selectedOptions, setSelectedOptions] = useState<Option[]>(selectedVendors.map(vendor => ({ label: vendor, value: vendor })));

  useEffect(() => {
    const fetchVendors = async () => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_ENDPOINT_URL}/vendors`);
      const data = await response.json();
      const vendorOptions = data.vendors.map((vendor: any) => ({ label: vendor.name, value: vendor.name }));
      setVendors(vendorOptions);
    };
    fetchVendors();
  }, []);

  const handleSave = async () => {
    const updatedVendors = selectedOptions.map(option => option.value);
    await handleUpdate(updatedVendors);
  };

  return (
    <div>
      <h3>Select Vendors</h3>
      <MultiSelect
        options={vendors}
        value={selectedOptions}
        onChange={setSelectedOptions}
        labelledBy="Select Vendors"
      />
      <Button onClick={handleSave}>Save</Button>
      <Button onClick={handleNext}>Next Step</Button>
    </div>
  );
};

export default Step4;
