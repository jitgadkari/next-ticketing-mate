import React, { useState } from 'react';
import Button from '../../../components/Button';
import TextArea from '../../../components/TextArea';

interface VendorMessage {
  label: string;
  value: string;
}

interface Step5Props {
  ticketNumber: string;
  vendorMessages: VendorMessage[];
  selectedVendors: string[];
  askedDetails: Record<string, any>;
  handleNext: () => void;
  handleUpdate: (updatedMessages: VendorMessage[]) => void;
}

const Step5: React.FC<Step5Props> = ({ ticketNumber, vendorMessages, selectedVendors, askedDetails, handleNext, handleUpdate }) => {
  const [messages, setMessages] = useState<VendorMessage[]>(vendorMessages);

  const handleChange = (index: number, value: string) => {
    const newMessages = [...messages];
    newMessages[index].value = value;
    setMessages(newMessages);
  };

  const handleSave = async () => {
    await handleUpdate(messages);
  };

  return (
    <div>
      <h3>Messages from Vendors</h3>
      {selectedVendors.map((vendor, index) => (
        <div key={vendor}>
          <h4>{vendor}</h4>
          <TextArea
            label={`Message from ${vendor}`}
            name={`message_${vendor}`}
            value={messages[index]?.value || ""}
            onChange={(e) => handleChange(index, e.target.value)}
          />
        </div>
      ))}
      <Button onClick={handleSave}>Save</Button>
      <Button onClick={handleNext}>Next Step</Button>
    </div>
  );
};

export default Step5;
