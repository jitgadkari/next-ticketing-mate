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
  const [isEditing, setIsEditing] = useState(false);
  const [quote, setQuote] = useState(JSON.stringify(finalQuote, null, 2));

  const handleSave = async () => {
    const updatedQuote = JSON.parse(quote);
    await handleUpdate(updatedQuote);
    setIsEditing(false);
  };

  return (
    <div>
      <h3>Final Quote</h3>
      {isEditing ? (
        <div>
          <TextArea
            label="Final Quote"
            name="finalQuote"
            value={quote}
            onChange={(e) => setQuote(e.target.value)}
          />
          <Button onClick={handleSave}>Save</Button>
          <Button onClick={() => setIsEditing(false)}>Cancel</Button>
        </div>
      ) : (
        <div>
          <pre>{quote}</pre>
          <Button onClick={() => setIsEditing(true)}>Edit</Button>
        </div>
      )}
      <Button onClick={handleNext}>Next Step</Button>
    </div>
  );
};

export default Step7;
