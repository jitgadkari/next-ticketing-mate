import React from 'react';
import Button from '../../../components/Button';

interface Step1Props {
  ticketNumber: string;
  message: string;
  customerName: string;
  personName: string;  // Add this line
  handleNext: () => Promise<void>;
  isCurrentStep: boolean;
}

const Step1: React.FC<Step1Props> = ({ ticketNumber, message, customerName, personName, handleNext, isCurrentStep }) => {
  return (
    <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
      <h3 className="text-xl font-bold mb-4">Step 1: Customer Message Received</h3>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Customer Name:
        </label>
        <p className="text-gray-800">{customerName}</p>
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Person Name:
        </label>
        <p className="text-gray-800">{personName}</p>
      </div>
      <div className="mb-6">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Message:
        </label>
        <div className="bg-gray-100 p-4 rounded-lg whitespace-pre-wrap">
          {message}
        </div>
      </div>
      <div className="flex items-center justify-end">
        <Button 
          onClick={handleNext} 
          className={`font-bold py-2 px-4 rounded ${
            isCurrentStep 
              ? 'bg-blue-500 hover:bg-blue-700 text-white' 
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

export default Step1;