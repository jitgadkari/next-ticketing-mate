import React, { useState } from 'react';
import Button from '../../../components/Button';
import Select from '../../../components/Select';

interface Step9Props {
  ticketNumber: string;
  finalStatus: string;
  handleNext: () => void;
  handleUpdate: (updatedStatus: string) => void;
}

const Step9: React.FC<Step9Props> = ({ ticketNumber, finalStatus, handleNext, handleUpdate }) => {
  const [status, setStatus] = useState(finalStatus);

  const handleSave = async () => {
    await handleUpdate(status);
  };

  return (
    <div>
      <h3>Final Status</h3>
      <Select
        label="Final Status"
        name="finalStatus"
        value={status}
        options={[
          { label: 'Pending', value: 'pending' },
          { label: 'Approved', value: 'approved' },
          { label: 'Not Approved', value: 'not approved' },
        ]}
        onChange={(e) => setStatus(e.target.value)}
      />
      <Button onClick={handleSave}>Save</Button>
      <Button onClick={handleNext}>Finish</Button>
    </div>
  );
};

export default Step9;
