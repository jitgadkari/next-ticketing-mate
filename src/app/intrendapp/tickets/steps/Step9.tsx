import React, { useState } from 'react';
import Button from '../../../components/Button';

interface Step9Props {
  ticketNumber: string;
  finalStatus: { status: string; final_decision: string };
  handleUpdate: (updatedStatus: { status: string; final_decision: string }) => Promise<void>;
  handleClose: () => Promise<void>;
}

const Step9: React.FC<Step9Props> = ({ ticketNumber, finalStatus, handleUpdate, handleClose }) => {
  const [status, setStatus] = useState(finalStatus.status || 'open');
  const [finalDecision, setFinalDecision] = useState(finalStatus.final_decision || '');

  const handleSave = async () => {
    const updatedStatus = { status, final_decision: finalDecision };
    console.log('Saving status:', updatedStatus);
    await handleUpdate(updatedStatus);
  };

  const handleCloseTicket = async () => {
    if (finalDecision === '') {
      alert('Please select a final decision before closing the ticket.');
      return;
    }
    await handleClose();
  };

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold">Final Status</h3>
      <div>
        <label className="block text-gray-700 font-bold mb-2">Status</label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full p-2 border rounded"
        >
          <option value="open">Open</option>
          <option value="closed">Closed</option>
        </select>
      </div>
      <div>
        <label className="block text-gray-700 font-bold mb-2">Final Decision</label>
        <select
          value={finalDecision}
          onChange={(e) => setFinalDecision(e.target.value)}
          className="w-full p-2 border rounded"
        >
          <option value="">Select a decision</option>
          <option value="approved">Approved</option>
          <option value="denied">Denied</option>
          <option value="pending">Pending</option>
        </select>
      </div>
      <div className="flex justify-end space-x-4">
        <Button onClick={handleSave} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Save
        </Button>
        <Button 
          onClick={handleCloseTicket} 
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
          disabled={status !== 'closed' || finalDecision === ''}
        >
          Close Ticket
        </Button>
      </div>
    </div>
  );
};

export default Step9;