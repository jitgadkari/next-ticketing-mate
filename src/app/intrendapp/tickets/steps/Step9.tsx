import React, { useState, useEffect } from 'react';
import Button from '../../../components/Button';

interface Step9Props {
  ticketNumber: string;
  finalStatus: { status: string; final_decision: string };
  handleUpdate: (updatedStatus: { status: string; final_decision: string }) => Promise<void>;
  handleClose: (finalStatus: { status: string; final_decision: string }) => Promise<void>;
  isCurrentStep: boolean;
}

const Step9: React.FC<Step9Props> = ({ ticketNumber, finalStatus, handleUpdate, handleClose, isCurrentStep }) => {
  const [status, setStatus] = useState(finalStatus.status || 'open');
  const [finalDecision, setFinalDecision] = useState(finalStatus.final_decision || '');

  useEffect(() => {
    console.log('finalStatus changed:', finalStatus);
    setStatus(finalStatus.status || 'open');
    setFinalDecision(finalStatus.final_decision || '');
  }, [finalStatus]);

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
    const closingStatus = { status: 'closed', final_decision: finalDecision };
    console.log('Closing ticket with status:', closingStatus);
    await handleClose(closingStatus);
  };

  console.log('Rendering Step9. Status:', status, 'Final Decision:', finalDecision);

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold">Final Status</h3>
      <div>
        <label className="block text-gray-700 font-bold mb-2">Status</label>
        <select
          value={status}
          onChange={(e) => {
            console.log('Status changed to:', e.target.value);
            setStatus(e.target.value);
          }}
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
          onChange={(e) => {
            console.log('Final Decision changed to:', e.target.value);
            setFinalDecision(e.target.value);
          }}
          className="w-full p-2 border rounded"
        >
          <option value="">Select a decision</option>
          <option value="approved">Approved</option>
          <option value="denied">Denied</option>
          <option value="pending">Pending</option>
        </select>
      </div>
      <div className="flex justify-end space-x-4">
        <Button 
          onClick={handleSave} 
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          disabled={!isCurrentStep}
        >
          Save
        </Button>
        <Button 
          onClick={handleCloseTicket} 
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
          disabled={!isCurrentStep || finalDecision === ''}
        >
          Close Ticket
        </Button>
      </div>
    </div>
  );
};

export default Step9;