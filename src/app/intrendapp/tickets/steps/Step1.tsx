import React from 'react';
import Button from '../../../components/Button';

interface Step1Props {
  message: string;
  customerName: string;
  handleNext: () => void;
}

const Step1: React.FC<Step1Props> = ({ message, customerName, handleNext }) => {
  return (
    <div>
      <p><strong>Customer Name:</strong> {customerName}</p>
      <p><strong>Customer Message:</strong> {message}</p>
      <Button onClick={handleNext} className="mt-4">
        Next Step
      </Button>
    </div>
  );
};

export default Step1;
