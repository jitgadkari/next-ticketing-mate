import React, { useState } from 'react';
import Button from '../../../components/Button';

interface Step8Props {
  ticketNumber: string;
  customerTemplate: string;
  handleNext: () => Promise<void>;
  handleUpdate: (updatedTemplate: string) => Promise<void>;
}

const Step8: React.FC<Step8Props> = ({ 
  ticketNumber, 
  customerTemplate, 
  handleNext, 
  handleUpdate 
}) => {
  const [template, setTemplate] = useState(customerTemplate);

  const handleSave = async () => {
    await handleUpdate(template);
  };

  const handleNextStep = async () => {
    await handleUpdate(template);
    await handleNext();
  };

  return (
    <div>
      <h3 className="text-xl font-bold mb-4">Customer Message Template</h3>
      <textarea
        value={template}
        onChange={(e) => setTemplate(e.target.value)}
        className="w-full h-64 p-2 border rounded"
      />
      <div className="flex justify-end space-x-4 mt-4">
        <Button onClick={handleSave} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Save
        </Button>
        <Button onClick={handleNextStep} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
          Next
        </Button>
      </div>
    </div>
  );
};

export default Step8;