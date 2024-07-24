import React, { useState } from 'react';
import Button from '../../../components/Button';
import TextArea from '../../../components/TextArea';

interface Step7Props {
  ticketNumber: string;
  finalQuote: Record<string, any>;
  handleNext: () => void;
  handleUpdate: (updatedQuote: Record<string, any>) => void;
}

const Step7: React.FC<Step7Props> = ({ ticketNumber, finalQuote, handleNext, handleUpdate }) => {
  const [quote, setQuote] = useState(JSON.stringify(finalQuote, null, 2));

  const handleSave = () => {
    handleUpdate(JSON.parse(quote));
  };

  const handleNextStep = async () => {
    await fetch(`${process.env.NEXT_PUBLIC_ENDPOINT_URL}/ticket/update_next_step/`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ticket_number: ticketNumber, step_info: JSON.parse(quote), step_number: "Step 8 : Customer Message Template" }),
    });
    handleNext();
  };

  return (
    <div>
      <h3>Final Quote</h3>
      <TextArea
        label="Final Quote"
        name="finalQuote"
        value={quote}
        onChange={(e) => setQuote(e.target.value)}
      />
      <Button onClick={handleSave} className="mt-4">Save</Button>
      <Button onClick={handleNextStep} className="mt-4">Next Step</Button>
    </div>
  );
};

export default Step7;
