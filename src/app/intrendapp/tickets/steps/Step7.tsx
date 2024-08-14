import React, { useState, useEffect } from 'react';
import Button from '../../../components/Button';

interface Step7Props {
  ticketNumber: string;
  finalQuote: any;
  customerName: string;
  askedDetails: any;
  vendorDecodedMessages: any;
  handleNext: (customerTemplate: string) => Promise<void>;
  handleUpdate: (updatedQuote: any) => Promise<void>;
}

const Step7: React.FC<Step7Props> = ({ 
  ticketNumber, 
  finalQuote, 
  customerName, 
  askedDetails, 
  vendorDecodedMessages,
  handleNext, 
  handleUpdate 
}) => {
  const [quote, setQuote] = useState(finalQuote);
  const [customerTemplate, setCustomerTemplate] = useState('');
  const [showVendorNames, setShowVendorNames] = useState(true);

  useEffect(() => {
    fetchCustomerTemplate();
  }, [showVendorNames]);

  const fetchCustomerTemplate = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_ENDPOINT_URL}/post_message_template_for_client`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_name: customerName,
          askedDetails_json: JSON.stringify(askedDetails),
          vendor_delivery_info_json: JSON.stringify(vendorDecodedMessages),
          show_vendor_names: showVendorNames,
        }),
      });
      const data = await response.json();
      setCustomerTemplate(data.client_message_template);
    } catch (error) {
      console.error('Error fetching customer template:', error);
    }
  };

  const handleSave = async () => {
    await handleUpdate(quote);
  };

  const handleNextStep = async () => {
    await handleNext(customerTemplate);
  };

  const toggleVendorNames = () => {
    setShowVendorNames(!showVendorNames);
  };

  return (
    <div>
      <h3 className="text-xl font-bold mb-4">Final Quote</h3>
      <textarea
        value={JSON.stringify(quote, null, 2)}
        onChange={(e) => setQuote(JSON.parse(e.target.value))}
        className="w-full h-64 p-2 border rounded"
      />
      <h3 className="text-xl font-bold my-4">Customer Message Template</h3>
      <div className="mb-2">
        <Button 
          onClick={toggleVendorNames} 
          className={`${showVendorNames ? 'bg-red-500 hover:bg-red-700' : 'bg-green-500 hover:bg-green-700'} text-white font-bold py-2 px-4 rounded`}
        >
          {showVendorNames ? 'Hide Vendor Names' : 'Show Vendor Names'}
        </Button>
      </div>
      <textarea
        value={customerTemplate}
        onChange={(e) => setCustomerTemplate(e.target.value)}
        className="w-full h-64 p-2 border rounded"
      />
      <div className="flex justify-end space-x-4 mt-4">
        <Button onClick={handleSave} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Save Quote
        </Button>
        <Button onClick={handleNextStep} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
          Next
        </Button>
      </div>
    </div>
  );
};

export default Step7;