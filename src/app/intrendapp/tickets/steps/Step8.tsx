import React, { useState } from 'react';
import Button from '../../../components/Button';

interface Step8Props {
  ticketNumber: string;
  customerTemplate: string;
  customerResponse: string;
  handleNext: () => Promise<void>;
  handleUpdate: (updatedResponse: string) => Promise<void>;
  isCurrentStep: boolean;
}

const Step8: React.FC<Step8Props> = ({ 
  ticketNumber, 
  customerTemplate, 
  customerResponse,
  handleNext, 
  handleUpdate,
  isCurrentStep
}) => {
  const [response, setResponse] = useState(customerResponse);

  const handleSave = async () => {
    await handleUpdate(response);
  };

  const handleNextStep = async () => {
    await handleUpdate(response);
    await handleNext();
  };

  return (
    <div>
      <h3 className="text-xl font-bold mb-4">Customer Message Template</h3>
      <div className="bg-gray-100 p-4 rounded mb-4">
        <pre className="whitespace-pre-wrap">{customerTemplate}</pre>
      </div>
      
      <h3 className="text-xl font-bold mb-4">Customer Response</h3>
      <textarea
        value={response}
        onChange={(e) => setResponse(e.target.value)}
        className="w-full h-32 p-2 border rounded mb-4"
        placeholder="Enter customer's response here..."
      />
      
      <div className="flex justify-end space-x-4 mt-4">
        <Button 
          onClick={handleSave} 
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Save
        </Button>
        <Button 
          onClick={handleNextStep} 
          className={`font-bold py-2 px-4 rounded ${
            isCurrentStep 
              ? 'bg-green-500 hover:bg-green-700 text-white' 
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
          disabled={!isCurrentStep}
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default Step8;