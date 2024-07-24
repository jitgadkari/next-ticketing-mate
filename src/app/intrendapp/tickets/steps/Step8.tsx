import React, { useState, useEffect } from 'react';
import Button from '../../../components/Button';
import TextArea from '../../../components/TextArea';

interface Step8Props {
  ticketNumber: string;
  customerTemplate: string;
  handleNext: () => void;
  handleUpdate: (updatedTemplate: string) => void;
}

const Step8: React.FC<Step8Props> = ({ ticketNumber, customerTemplate, handleNext, handleUpdate }) => {
  const [message, setMessage] = useState(customerTemplate);

  const handleNextStep = async () => {
    await fetch(`${process.env.NEXT_PUBLIC_ENDPOINT_URL}/ticket/update_next_step/`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ticket_number: ticketNumber, step_info: { text: message }, step_number: "Step 9: Final Status" }),
    });
    handleNext();
  };

  const handleSave = () => {
    handleUpdate(message);
  };

  return (
    <div>
      <h3>Customer Message Template</h3>
      <TextArea
        label="Customer Template"
        name="customerTemplate"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <Button onClick={handleSave} className="mt-4">Save</Button>
      <Button onClick={handleNextStep} className="mt-4">Send and Next</Button>
    </div>
  );
};

export default Step8;
