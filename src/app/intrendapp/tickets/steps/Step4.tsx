import React, { useState, useEffect } from 'react';
import { MultiSelect, Option } from 'react-multi-select-component';
import Button from '../../../components/Button';

interface Step4Props {
  ticketNumber: string;
  selectedVendors: string[];
  template: string;
  handleNext: () => Promise<void>;
  handleUpdate: (updatedVendors: string[]) => Promise<void>;
}

const Step4: React.FC<Step4Props> = ({ ticketNumber, selectedVendors = [], template, handleNext, handleUpdate }) => {
  const [vendors, setVendors] = useState<Option[]>([]);
  const [selectedOptions, setSelectedOptions] = useState<Option[]>(selectedVendors.map(vendor => ({ label: vendor, value: vendor })));

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_ENDPOINT_URL}/vendors`);
        const data = await response.json();
        setVendors(data.vendors.map((vendor: string) => ({ label: vendor, value: vendor })));
      } catch (error) {
        console.error('Error fetching vendors:', error);
      }
    };
    fetchVendors();
  }, []);

  const handleVendorSelection = (selected: Option[]) => {
    setSelectedOptions(selected);
    handleUpdate(selected.map(option => option.value));
  };

  return (
    <div>
      <h3>Select Vendors</h3>
      <MultiSelect
        options={vendors}
        value={selectedOptions}
        onChange={handleVendorSelection}
        labelledBy="Select Vendors"
      />
      <Button onClick={handleNext}>Next and Send</Button>
    </div>
  );
};

export default Step4;
