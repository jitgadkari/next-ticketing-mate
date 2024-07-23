import React, { useState } from 'react';
import Button from '../../../components/Button';
import TextArea from '../../../components/TextArea';

interface Step2Props {
  ticketNumber: string;
  decodedMessage: Record<string, any>;
  handleNext: () => void;
  handleUpdate: (updatedMessage: Record<string, any>) => void;
}

const Step2: React.FC<Step2Props> = ({ ticketNumber, decodedMessage, handleNext, handleUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState(JSON.stringify(decodedMessage, null, 2));

  const handleSave = async () => {
    const updatedMessage = JSON.parse(message);
    await handleUpdate(updatedMessage);
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
      <Button onClick={handleNext}>Next Step</Button>
    </div>
  );
};

export default Step2;
