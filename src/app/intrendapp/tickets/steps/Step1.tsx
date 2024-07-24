import React from 'react';
import Button from '../../../components/Button';

interface Step1Props {
  ticketNumber: string;
  message: string;
  customerName: string;
  handleNext: () => Promise<void>;
}

const Step1: React.FC<Step1Props> = ({ ticketNumber, message, customerName, handleNext }) => {
  return (
    <div>
      <h3>Customer Name: {customerName}</h3>
      <p>Message: {message}</p>
      <Button onClick={handleNext}>Next</Button>
    </div>
  );
};

export default Step1;
