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
      <h3>Customer Message from {customerName}</h3>
      <p>{message}</p>
      <Button onClick={handleNext}>Next Step</Button>
    </div>
  );
};

export default Step1;
