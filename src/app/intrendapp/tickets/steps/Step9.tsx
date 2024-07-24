import React, { useState } from 'react';
import Button from '../../../components/Button';

interface Step9Props {
  ticketNumber: string;
  finalStatus: any;
  handleUpdate: (updatedStatus: Record<string, any>) => Promise<void>;
}

const Step9: React.FC<Step9Props> = ({ ticketNumber, finalStatus, handleUpdate }) => {
  const [status, setStatus] = useState(finalStatus);

  const handleFinish = async () => {
    await handleUpdate(status);
    alert('Ticket process completed.');
  };

  return (
    <div>
      <h3>Final Status</h3>
      <textarea value={status.text} onChange={(e) => setStatus({ ...status, text: e.target.value })} />
      <Button onClick={handleFinish}>Finish</Button>
    </div>
  );
};

export default Step9;
