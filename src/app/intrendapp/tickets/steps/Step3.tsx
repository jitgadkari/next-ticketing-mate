import React, { useState } from 'react';
import Button from '../../../components/Button';
import TextArea from '../../../components/TextArea';

interface Step3Props {
  ticketNumber: string;
  template: string;
  customerName: string;
  askedDetails: Record<string, any>;
  handleNext: () => void;
  handleUpdate: (updatedTemplate: string) => void;
}

const Step3: React.FC<Step3Props> = ({ ticketNumber, template, customerName, askedDetails, handleNext, handleUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState(template);

  const handleSave = async () => {
    await handleUpdate(message);
    setIsEditing(false);
  };

  return (
    <div>
      <h3>Vendor Message Template</h3>
      {isEditing ? (
        <div>
          <TextArea
            label="Vendor Message Template"
            name="vendorMessageTemplate"
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

export default Step3;
