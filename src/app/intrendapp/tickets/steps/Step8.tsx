import React, { useState } from 'react';
import Button from '../../../components/Button';
import TextArea from '../../../components/TextArea';

interface Step8Props {
  ticketNumber: string;
  customerTemplate: string;
  handleNext: () => void;
  handleUpdate: (updatedTemplate: string) => void;
}

const Step8: React.FC<Step8Props> = ({ ticketNumber, customerTemplate, handleNext, handleUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [template, setTemplate] = useState(customerTemplate);

  const handleSave = async () => {
    await handleUpdate(template);
    setIsEditing(false);
  };

  return (
    <div>
      <h3>Customer Message Template</h3>
      {isEditing ? (
        <div>
          <TextArea
            label="Customer Message Template"
            name="customerMessageTemplate"
            value={template}
            onChange={(e) => setTemplate(e.target.value)}
          />
          <Button onClick={handleSave}>Save</Button>
          <Button onClick={() => setIsEditing(false)}>Cancel</Button>
        </div>
      ) : (
        <div>
          <pre>{template}</pre>
          <Button onClick={() => setIsEditing(true)}>Edit</Button>
        </div>
      )}
      <Button onClick={handleNext}>Next Step</Button>
    </div>
  );
};

export default Step8;
