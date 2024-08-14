import React, { useState, useEffect } from 'react';
import Button from '../../../components/Button';

interface Step7Props {
  ticketNumber: string;
  customerTemplate: string;
  handleNext: () => Promise<void>;
  handleUpdate: (updatedTemplate: string) => Promise<void>;
  isCurrentStep: boolean;
}

const Step7: React.FC<Step7Props> = ({ 
  ticketNumber, 
  customerTemplate,
  handleNext, 
  handleUpdate,
  isCurrentStep
}) => {
  const [template, setTemplate] = useState(customerTemplate);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    setTemplate(customerTemplate);
  }, [customerTemplate]);

  const handleSave = async () => {
    await handleUpdate(template);
  };

  const handleNextStep = async () => {
    await handleSave();
    await handleNext();
  };

  const handleSendMessage = () => {
    setShowPopup(true);
  };

  const handlePopupConfirm = () => {
    console.log('Sending messages...');
    setShowPopup(false);
  };

  return (
    <div>
      <h3 className="text-xl font-bold my-4">Customer Message Template</h3>
      <textarea
        value={template}
        onChange={(e) => setTemplate(e.target.value)}
        className="w-full h-64 p-2 border rounded"
      />
      <div className="flex justify-between mt-4">
        <Button onClick={handleSave} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Save Template
        </Button>
        <Button 
          onClick={handleSendMessage} 
          className={`bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded ${
            !isCurrentStep && 'opacity-50 cursor-not-allowed'
          }`}
          disabled={!isCurrentStep}
        >
          Send Message
        </Button>
        <Button 
          onClick={handleNextStep} 
          className={`font-bold py-2 px-4 rounded ${
            isCurrentStep 
              ? 'bg-blue-500 hover:bg-blue-700 text-white' 
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
          disabled={!isCurrentStep}
        >
          Next
        </Button>
      </div>

      {showPopup && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
          <div className="bg-white p-5 rounded-lg shadow-xl">
            <h2 className="text-xl font-bold mb-4">Sending Message...</h2>
            <p className="mb-4">Are you sure you want to send this message to the customer?</p>
            <div className="flex justify-end">
              <Button onClick={() => setShowPopup(false)} className="mr-2 bg-gray-300 hover:bg-gray-400 text-black font-bold py-2 px-4 rounded">
                Cancel
              </Button>
              <Button onClick={handlePopupConfirm} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                OK
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Step7;