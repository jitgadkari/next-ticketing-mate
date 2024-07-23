import React, { useState } from 'react';
import Button from '../../../components/Button';
import TextArea from '../../../components/TextArea';

interface Step6Props {
  ticketNumber: string;
  decodedMessages: Record<string, any>;
  handleNext: () => void;
  handleUpdate: (updatedDecodedMessages: Record<string, any>) => void;
}

const Step6: React.FC<Step6Props> = ({ ticketNumber, decodedMessages, handleNext, handleUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [messages, setMessages] = useState(JSON.stringify(decodedMessages, null, 2));

  const handleSave = async () => {
    const updatedDecodedMessages = JSON.parse(messages);
    await handleUpdate(updatedDecodedMessages);
    setIsEditing(false);
  };

  return (
    <div>
      <h3>Decoded Messages from Vendors</h3>
      {isEditing ? (
        <div>
          <TextArea
            label="Decoded Messages"
            name="decodedMessages"
            value={messages}
            onChange={(e) => setMessages(e.target.value)}
          />
          <Button onClick={handleSave}>Save</Button>
          <Button onClick={() => setIsEditing(false)}>Cancel</Button>
        </div>
      ) : (
        <div>
          <pre>{messages}</pre>
          <Button onClick={() => setIsEditing(true)}>Edit</Button>
        </div>
      )}
      <Button onClick={handleNext}>Next Step</Button>
    </div>
  );
};

export default Step6;
