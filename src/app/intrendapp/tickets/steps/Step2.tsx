import React, { useState } from 'react';
import Button from '../../../components/Button';
import TextArea from '../../../components/TextArea';

interface Step2Props {
  ticketNumber: string;
  data: Record<string, any>;
  handleNext: () => Promise<void>;
  handleUpdate: (updatedData: Record<string, any>) => Promise<void>;
}

const Step2: React.FC<Step2Props> = ({ ticketNumber, data, handleNext, handleUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState(JSON.stringify(data, null, 2));

  const handleSave = async () => {
    const updatedData = JSON.parse(message);
    await handleUpdate(updatedData);
    setIsEditing(false);
  };

  return (
    <div>
      <h3>Decoded Message</h3>
      {isEditing ? (
        <div>
          <TextArea
            label="Decoded Message"
            name="decodedMessage"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <Button onClick={handleSave}>Save</Button>
          <Button onClick={() => setIsEditing(false)}>Cancel</Button>
        </div>
      ) : (
        <div>
          <pre>{message}</pre>
          <Button onClick={() => setIsEditing(true)}>Edit</Button>
        </div>
      )}
      <Button onClick={handleNext} className="mt-4">
        Next Step
      </Button>
    </div>
  );
};

export default Step2;
