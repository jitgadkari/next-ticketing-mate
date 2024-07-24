import React, { useState } from 'react';
import { MultiSelect, Option } from 'react-multi-select-component';
import Button from '../../../components/Button';

interface Step6Props {
  ticketNumber: string;
  decodedMessages: Record<string, any>;
  handleNext: () => void;
  handleUpdate: (updatedDecodedMessages: Record<string, any>) => void;
}

const Step6: React.FC<Step6Props> = ({ ticketNumber, decodedMessages, handleNext, handleUpdate }) => {
  const [selectedOptions, setSelectedOptions] = useState<Option[]>([]);

  const handleNextStep = async () => {
    try {
      const updatedDecodedMessages = selectedOptions.reduce((acc: Record<string, any>, option: Option) => {
        acc[option.label] = decodedMessages[option.label];
        return acc;
      }, {});

      await fetch(`${process.env.NEXT_PUBLIC_ENDPOINT_URL}/ticket/update_next_step/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ticket_number: ticketNumber, step_info: updatedDecodedMessages, step_number: "Step 7 : Final Quote" }),
      });

      handleUpdate(updatedDecodedMessages);
      handleNext();
    } catch (error) {
      console.error('Error updating ticket:', error);
    }
  };

  return (
    <div>
      <h3>Decoded Messages from Vendors</h3>
      <MultiSelect
        options={Object.keys(decodedMessages).map(key => ({ label: key, value: key }))}
        value={selectedOptions}
        onChange={setSelectedOptions}
        labelledBy="Select Decoded Messages"
      />
      <Button onClick={handleNextStep} className="mt-4">Next Step</Button>
    </div>
  );
};

export default Step6;
