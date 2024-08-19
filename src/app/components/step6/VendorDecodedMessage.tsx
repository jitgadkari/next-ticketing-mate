import React from 'react';

interface VendorDecodedMessageProps {
  message: string;
}

export default function VendorDecodedMessage({ message }: VendorDecodedMessageProps) {
  let parsedMessage: any = {};
  try {
    parsedMessage = JSON.parse(message);
  } catch (error) {
    console.error('Error parsing message:', error);
    return <div className="mb-4">Invalid message format</div>;
  }

  const isParsedMessageValid = (message: any) => 
    message && typeof message === 'object' && 'rate' in message && 'schedule' in message;

  if (!isParsedMessageValid(parsedMessage)) {
    return (
      <div className="mb-4">
        <p className="bg-gray-100 p-2 rounded">No valid data available</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="font-bold text-lg mb-2">Rate Details</h2>
      <div className="mb-4">
        <label className="block text-gray-700">Price per Meter:</label>
        <p className="bg-gray-100 p-2 rounded">{parsedMessage.rate?.price_per_meter || 'N/A'}</p>
      </div>
      <div className="mb-4">
        <label className="block text-gray-700">Currency:</label>
        <p className="bg-gray-100 p-2 rounded">{parsedMessage.rate?.currency || 'N/A'}</p>
      </div>
      <div className="mb-4">
        <label className="block text-gray-700">Delivery Method:</label>
        <p className="bg-gray-100 p-2 rounded">{parsedMessage.rate?.delivery_method || 'N/A'}</p>
      </div>
      <div className="mb-4">
        <label className="block text-gray-700">Additional Charges:</label>
        <p className="bg-gray-100 p-2 rounded">{parsedMessage.rate?.additional_charges || 'N/A'}</p>
      </div>

      <h2 className="font-bold text-lg mb-2">Schedule Details</h2>
      <div className="mb-4">
        <label className="block text-gray-700">Delivery Time:</label>
        <p className="bg-gray-100 p-2 rounded">{parsedMessage.schedule?.delivery_time || 'N/A'}</p>
      </div>
      <div className="mb-4">
        <label className="block text-gray-700">Delivery Point:</label>
        <p className="bg-gray-100 p-2 rounded">{parsedMessage.schedule?.delivery_point || 'N/A'}</p>
      </div>
    </div>
  );
}
