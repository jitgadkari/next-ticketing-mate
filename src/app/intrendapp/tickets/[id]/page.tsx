"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Button from '../../../components/Button';
import Step1 from '../steps/Step1';
import Step2 from '../steps/Step2';

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
  const [activeStep, setActiveStep] = useState<string | null>(null);

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
      setActiveStep(data.ticket.current_step);
    } catch (error) {
      console.error('Error fetching ticket:', error);
    }
  };

  const handleNextStep = async () => {
    if (ticket) {
      const nextStep = stepsOrder[stepsOrder.indexOf(ticket.current_step) + 1];
      if (ticket.current_step === "Step 1 : Customer Message Received") {
        // Call the API to decode the client message if Step 2 data is empty
        if (!ticket.steps["Step 2 : Message Decoded"] || Object.keys(ticket.steps["Step 2 : Message Decoded"]).length === 0) {
          try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_ENDPOINT_URL}/post_client_message_decode?text=${encodeURIComponent(ticket.steps["Step 1 : Customer Message Received"])}`, {
              method: 'POST',
              headers: {
                'accept': 'application/json',
              },
              body: '',
            });

            if (response.ok) {
              const decodedMessage = await response.json();
              // Update step 2 in the database with the decoded message
              const updateResponse = await fetch(`${process.env.NEXT_PUBLIC_ENDPOINT_URL}/ticket/step/`, {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ticket_number: ticket.ticket_number, step_info:decodedMessage  }),
              });

              if (updateResponse.ok) {
                fetchTicket(ticket._id);
                setActiveStep(nextStep);
              } else {
                const errorData = await updateResponse.json();
                console.error('Failed to update ticket', errorData);
              }
            } else {
              const errorData = await response.json();
              console.error('Failed to decode message', errorData);
            }
          } catch (error) {
            console.error('Error decoding message:', error);
          }
        }
      } else {
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_ENDPOINT_URL}/ticket/step/`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ ticket_number: ticket.ticket_number, step_info: ticket.steps[ticket.current_step] }),
          });

          if (response.ok) {
            fetchTicket(ticket._id);
            setActiveStep(nextStep);
          } else {
            const errorData = await response.json();
            console.error('Failed to update ticket', errorData);
          }
        } catch (error) {
          console.error('Error updating ticket:', error);
        }
      }
    }
  };

  const renderStepPanel = (step: string) => {
    if (!ticket) return null;

    switch (step) {
      case "Step 1 : Customer Message Received":
        return (
          <Step1
            message={ticket.steps[step]}
            customerName={ticket.customer_name}
            handleNext={handleNextStep}
          />
        );

      case "Step 2 : Message Decoded":
        return (
          <Step2
            data={ticket.steps[step]}
            handleNext={handleNextStep}
            handleUpdate={(updatedData) => {
              const updatedSteps = { ...ticket.steps, [step]: updatedData };
              setTicket({ ...ticket, steps: updatedSteps });
            }}
          />
        );

      // Add similar logic for other steps
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
                    onClick={() => setActiveStep(step)}
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
          <div>{renderStepPanel(activeStep || ticket.current_step)}</div>
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default TicketDetailsPage;
