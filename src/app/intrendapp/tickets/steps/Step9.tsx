import React, { useState } from 'react';
import Button from '../../../components/Button';

interface Step9Props {
  ticketNumber: string;
  finalStatus: { status: string; final_decision: string };
  handleUpdate: (updatedStatus: { status: string; final_decision: string }) => Promise<void>;
  handleClose: () => Promise<void>;
}

const Step9: React.FC<Step9Props> = ({ ticketNumber, finalStatus, handleUpdate, handleClose }) => {
  const [status, setStatus] = useState(finalStatus.status || 'closed');
  const [finalDecision, setFinalDecision] = useState(finalStatus.final_decision || 'pending');

  const handleSave = async () => {
    const updatedStatus = { status, final_decision: finalDecision };
    await handleUpdate(updatedStatus);
  };

  return (
    <div>
      <h3>Final Status</h3>
      <div className="mb-4">
        <label className="block text-gray-700">Decision</label>
        <select
          value={finalDecision}
          onChange={(e) => setFinalDecision(e.target.value)}
          className="mt-1 block w-full"
        >
          <option value="approved">Approved</option>
          <option value="denied">Denied</option>
          <option value="pending">Pending</option>
        </select>
      </div>
      <div className="flex justify-end">
        <Button onClick={handleSave} className="mt-4">
          Save
        </Button>
        <Button onClick={handleClose} className="mt-4 ml-2">
          Close Ticket
        </Button>
      </div>
    </div>
  );
};

export default Step9;
