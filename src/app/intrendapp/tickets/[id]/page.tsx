"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Button from '../../../components/Button';
import Input from '../../../components/Input';
import { MultiSelect, Option } from 'react-multi-select-component';

interface Ticket {
  _id: string;
  ticket_number: string;
  customer_name: string;
  current_step: string;
  steps: Record<string, any>;
  created_data: string;
  updated_date: string;
}

const stepsOrder = [
  "Step 1 : Customer Message Received",
  "Step 2 : Message Decoded",
  "Step 3 : Message Template for vendors",
  "Step 4 : Vendor Selection",
  "Step 5: Messages from Vendors",
  "Step 6 : Vendor Message Decoded",
  "Step 7 : Final Quote",
  "Step 8 : Customer Message Template",
  "Step 9: Final Status"
];

const TicketDetailsPage = () => {
  const router = useRouter();
  const { id } = useParams();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [stepData, setStepData] = useState<string>('');
  const [isEditing, setIsEditing] = useState<boolean>(false);

  useEffect(() => {
    if (id) {
      fetchTicket(id as string);
    }
  }, [id]);

  const fetchTicket = async (ticketId: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_ENDPOINT_URL}/ticket/${ticketId}`);
      const data = await response.json();
      setTicket(data.ticket);
    } catch (error) {
      console.error('Error fetching ticket:', error);
    }
  };

  const handleNextStep = async () => {
    if (ticket) {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_ENDPOINT_URL}/update_ticket_step`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ ticket_number: ticket.ticket_number, step_info: stepData }),
        });

        if (response.ok) {
          fetchTicket(ticket._id);
          setIsEditing(false);
        } else {
          const errorData = await response.json();
          console.error('Failed to update ticket', errorData);
        }
      } catch (error) {
        console.error('Error updating ticket:', error);
      }
    }
  };

  const handleUpdateStep = async () => {
    if (ticket) {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_ENDPOINT_URL}/update_specific_step`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ ticket_number: ticket.ticket_number, step_info_dict: { [ticket.current_step]: stepData } }),
        });

        if (response.ok) {
          fetchTicket(ticket._id);
          setIsEditing(false);
        } else {
          const errorData = await response.json();
          console.error('Failed to update step', errorData);
        }
      } catch (error) {
        console.error('Error updating step:', error);
      }
    }
  };

  const renderStepPanel = (step: string) => {
    if (!ticket) return null;

    switch (step) {
      case "Step 1 : Customer Message Received":
        return <p>{ticket.steps[step]}</p>;

      case "Step 2 : Message Decoded":
        return (
          <div>
            <p>{JSON.stringify(ticket.steps[step], null, 2)}</p>
            {isEditing ? (
              <div>
                <Input
                  label="Update Step Info"
                  type="text"
                  name="stepData"
                  value={stepData}
                  onChange={(e) => setStepData(e.target.value)}
                />
                <Button onClick={handleUpdateStep}>Update</Button>
                <Button onClick={() => setIsEditing(false)}>Cancel</Button>
              </div>
            ) : (
              <Button onClick={() => setIsEditing(true)}>Edit</Button>
            )}
          </div>
        );

      case "Step 3 : Message Template for vendors":
        return (
          <div>
            <p>{ticket.steps[step]}</p>
            {isEditing ? (
              <div>
                <Input
                  label="Update Template"
                  type="text"
                  name="stepData"
                  value={stepData}
                  onChange={(e) => setStepData(e.target.value)}
                />
                <Button onClick={handleUpdateStep}>Update</Button>
                <Button onClick={() => setIsEditing(false)}>Cancel</Button>
              </div>
            ) : (
              <Button onClick={() => setIsEditing(true)}>Edit</Button>
            )}
          </div>
        );

      case "Step 4 : Vendor Selection":
        return (
          <div>
            <p>{JSON.stringify(ticket.steps[step], null, 2)}</p>
            {isEditing ? (
              <div>
                <MultiSelect
                  options={[]}  // Populate with vendor options
                  value={[]}  // Populate with selected vendor options
                  onChange={(selected: Option[]) => setStepData(JSON.stringify(selected))}
                  labelledBy="Select Vendors"
                />
                <Button onClick={handleUpdateStep}>Update</Button>
                <Button onClick={() => setIsEditing(false)}>Cancel</Button>
              </div>
            ) : (
              <Button onClick={() => setIsEditing(true)}>Edit</Button>
            )}
          </div>
        );

      // Continue similar logic for other steps
      default:
        return <p>{ticket.steps[step]}</p>;
    }
  };

  const getCurrentStepIndex = () => {
    return stepsOrder.indexOf(ticket?.current_step || "");
  };

  return (
    <div className="p-8 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Ticket Details</h1>
      {ticket ? (
        <div>
          <div className="mb-4">
            <h2 className="text-xl font-bold">Ticket Number: {ticket.ticket_number}</h2>
            <p className="text-lg">Customer: {ticket.customer_name}</p>
          </div>
          <div className="mb-4">
            <div className="flex items-center">
              {stepsOrder.map((step, index) => (
                <div key={index} className="flex items-center">
                  <Button
                    onClick={() => {}}
                    className={`px-4 py-2 rounded-full ${
                      index <= getCurrentStepIndex()
                        ? "bg-blue-500 text-white"
                        : "bg-gray-300 text-gray-700"
                    }`}
                  >
                    {index + 1}
                  </Button>
                  {index < stepsOrder.length - 1 && (
                    <div className={`w-8 h-1 ${index < getCurrentStepIndex() ? "bg-blue-500" : "bg-gray-300"}`} />
                  )}
                </div>
              ))}
            </div>
          </div>
          <div>{renderStepPanel(ticket.current_step)}</div>
          {ticket.current_step !== "Step 9: Final Status" && (
            <Button onClick={handleNextStep} className="mt-4">
              Next Step
            </Button>
          )}
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default TicketDetailsPage;
