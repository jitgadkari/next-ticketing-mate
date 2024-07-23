// src/app/intrendapp/tickets/[id]/page.tsx

"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Step1 from '../steps/Step1';
import Step2 from '../steps/Step2';
import Step3 from '../steps/Step3';
import Step4 from '../steps/Step4';
import Step5 from '../steps/Step5';
import Step6 from '../steps/Step6';
import Step7 from '../steps/Step7';
import Step8 from '../steps/Step8';
import Step9 from '../steps/Step9';
import { Ticket, Step } from '../../../types/TicketInterfaces';

const TicketPage = () => {
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [currentStep, setCurrentStep] = useState<string>('');
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    const fetchTicket = async () => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_ENDPOINT_URL}/ticket/${id}`);
      const data = await response.json();
      setTicket(data.ticket);
      setCurrentStep(data.ticket.current_step);
    };
    fetchTicket();
  }, [id]);

  const handleNextStep = async () => {
    if (!ticket) return;

    // Get the current step index
    const stepIndex = Object.keys(ticket.steps).indexOf(currentStep);
    // Get the next step key
    const nextStep = Object.keys(ticket.steps)[stepIndex + 1];
    // Update the current step
    setCurrentStep(nextStep);
    // Update the ticket in the database
    const response = await fetch(`${process.env.NEXT_PUBLIC_ENDPOINT_URL}/ticket/step/`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ticket_number: ticket.ticket_number, step_info: ticket.steps[nextStep] }),
    });
    const data = await response.json();
    setTicket(data.ticket);
  };

  const updateTicketStep = async (stepInfo: Step) => {
    if (!ticket) return;

    const response = await fetch(`${process.env.NEXT_PUBLIC_ENDPOINT_URL}/ticket/step/`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ticket_number: ticket.ticket_number, step_info: stepInfo }),
    });
    const data = await response.json();
    setTicket((prevTicket) => ({
      ...prevTicket,
      steps: {
        ...prevTicket.steps,
        [currentStep]: stepInfo,
      },
      current_step: data.next_step, // assuming the response includes the next step
    }));
  };

  const renderStep = () => {
    if (!ticket) return <div>Loading...</div>;

    switch (currentStep) {
      case "Step 1 : Customer Message Received":
        return (
          <Step1
            message={ticket.steps[currentStep]?.text || ""}
            customerName={ticket.customer_name}
            handleNext={async () => {
              const response = await fetch(
                `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/post_client_message_decode?text=${encodeURIComponent(ticket.steps[currentStep]?.text || "")}`,
                {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                }
              );
              const decodedMessage = await response.json();
              await updateTicketStep({ text: decodedMessage });
              handleNextStep();
            }}
          />
        );

      case "Step 2 : Message Decoded":
        return (
          <Step2
            ticketNumber={ticket.ticket_number}
            decodedMessage={ticket.steps[currentStep] || {}}
            handleNext={handleNextStep}
            handleUpdate={async (updatedMessage) => {
              await updateTicketStep({ text: updatedMessage });
            }}
          />
        );

      case "Step 3 : Message Template for vendors":
        return (
          <Step3
            ticketNumber={ticket.ticket_number}
            template={ticket.steps[currentStep]?.text || ""}
            customerName={ticket.customer_name}
            askedDetails={ticket.steps["Step 2 : Message Decoded"] || {}}
            handleNext={handleNextStep}
            handleUpdate={async (updatedTemplate) => {
              await updateTicketStep({ text: updatedTemplate });
            }}
          />
        );

      case "Step 4 : Vendor Selection":
        return (
          <Step4
            ticketNumber={ticket.ticket_number}
            selectedVendors={ticket.steps[currentStep]?.list || []}
            template={ticket.steps["Step 3 : Message Template for vendors"]?.text || ""}
            handleNext={handleNextStep}
            handleUpdate={async (updatedVendors) => {
              await updateTicketStep({ list: updatedVendors });
            }}
          />
        );

      case "Step 5: Messages from Vendors":
        return (
          <Step5
            ticketNumber={ticket.ticket_number}
            vendorMessages={(ticket.steps[currentStep]?.list || []).map((vendor) => ({ label: vendor, value: '' }))}
            selectedVendors={ticket.steps["Step 4 : Vendor Selection"]?.list || []}
            askedDetails={ticket.steps["Step 2 : Message Decoded"] || {}}
            handleNext={handleNextStep}
            handleUpdate={async (updatedMessages) => {
              await updateTicketStep({ list: updatedMessages });
            }}
          />
        );

      case "Step 6 : Vendor Message Decoded":
        return (
          <Step6
            ticketNumber={ticket.ticket_number}
            decodedMessages={ticket.steps[currentStep] || {}}
            handleNext={handleNextStep}
            handleUpdate={async (updatedDecodedMessages) => {
              await updateTicketStep(updatedDecodedMessages);
            }}
          />
        );

      case "Step 7 : Final Quote":
        return (
          <Step7
            ticketNumber={ticket.ticket_number}
            finalQuote={ticket.steps[currentStep] || {}}
            handleNext={handleNextStep}
            handleUpdate={async (updatedQuote) => {
              await updateTicketStep(updatedQuote);
            }}
          />
        );

      case "Step 8 : Customer Message Template":
        return (
          <Step8
            ticketNumber={ticket.ticket_number}
            customerTemplate={ticket.steps[currentStep]?.text || ""}
            handleNext={handleNextStep}
            handleUpdate={async (updatedTemplate) => {
              await updateTicketStep({ text: updatedTemplate });
            }}
          />
        );

      case "Step 9: Final Status":
        return (
          <Step9
            ticketNumber={ticket.ticket_number}
            finalStatus={ticket.steps[currentStep]?.text || ""}
            handleNext={handleNextStep}
            handleUpdate={async (updatedStatus) => {
              await updateTicketStep({ text: updatedStatus });
            }}
          />
        );

      default:
        return <p>{ticket.steps[currentStep]?.text}</p>;
    }
  };

  return (
    <div>
      {renderStep()}
    </div>
  );
};

export default TicketPage;
