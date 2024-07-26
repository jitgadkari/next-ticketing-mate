import React, { useState, useEffect } from 'react';
import Button from '../../../components/Button';
import TextArea from '../../../components/TextArea';

interface Step3Props {
  ticketNumber: string;
  template: string;
  customerName: string;
  askedDetails: Record<string, any>;
  handleNext: () => void;
  handleUpdate: (updatedTemplate: string) => void;
}

const Step3: React.FC<Step3Props> = ({ ticketNumber, template, customerName, askedDetails, handleNext, handleUpdate }) => {
  const [message, setMessage] = useState(template);

  useEffect(() => {
    if (!template) {
      fetchVendorTemplate();
    }
  }, [template]);

  const fetchVendorTemplate = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_ENDPOINT_URL}/post_message_template_for_vendor`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ vendor_name: "{VENDOR}", askedDetails_json: JSON.stringify(askedDetails) }),
      });
      const data = await response.json();
      setMessage(data.vendor_message_template);
    } catch (error) {
      console.error('Error fetching vendor template:', error);
    }
  };

  const handleNextStep = async () => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_ENDPOINT_URL}/ticket/update_next_step/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          ticket_number: ticketNumber, 
          step_info: { list: [] }, 
          step_number: "Step 4 : Vendor Selection" }),
      });

      handleNext();
    } catch (error) {
      console.error('Error updating ticket:', error);
    }
  };

  const handleSave = () => {
    handleUpdate(message);
  };

  return (
    <div>
      <h3>Message Template for Vendors</h3>
      <TextArea
        label="Vendor Template"
        name="vendorTemplate"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <Button onClick={handleSave}>Save</Button>
      <Button onClick={handleNextStep} className="mt-4">Next Step</Button>
    </div>
  );
};

export default Step3;
