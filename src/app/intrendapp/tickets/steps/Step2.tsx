import React, { useState } from 'react';
import Button from '../../../components/Button';
import Input from '../../../components/Input';

interface Step2Props {
  data: Record<string, any>;
  handleNext: () => void;
  handleUpdate: (updatedData: Record<string, any>) => void;
}

const Step2: React.FC<Step2Props> = ({ data, handleNext, handleUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [stepData, setStepData] = useState(data);

  const handleSave = () => {
    handleUpdate(stepData);
    setIsEditing(false);
  };

  return (
    <div>
      <pre>{JSON.stringify(stepData, null, 2)}</pre>
      {isEditing ? (
        <div>
          {Object.keys(stepData).map((key) => (
            <Input
              key={key}
              label={key}
              type="text"
              name={key}
              value={stepData[key]}
              onChange={(e) => setStepData({ ...stepData, [key]: e.target.value })}
            />
          ))}
          <Button onClick={handleSave}>Save</Button>
          <Button onClick={() => setIsEditing(false)}>Cancel</Button>
        </div>
      ) : (
        <Button onClick={() => setIsEditing(true)}>Edit</Button>
      )}
      <Button onClick={handleNext} className="mt-4">
        Next Step
      </Button>
    </div>
  );
};

export default Step2;
