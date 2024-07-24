"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Button from '../../../components/Button';
import Step1 from '../steps/Step1';
import Step2 from '../steps/Step2';
import Step3 from '../steps/Step3';
import Step4 from '../steps/Step4';
import Step5 from '../steps/Step5';
import Step6 from '../steps/Step6';
import Step7 from '../steps/Step7';
import Step8 from '../steps/Step8';
import Step9 from '../steps/Step9';

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

  const handleRefresh = async (step: string) => {
    const confirmed = window.confirm("Are you sure you want to refresh this step? This will refresh all steps from the current step onward.");
    if (!confirmed) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_ENDPOINT_URL}/ticket/ticket_refresher/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ticket_number: ticket?.ticket_number, step_number: step }),
      });

      if (response.ok) {
        fetchTicket(ticket?._id!);
        setActiveStep(step);
      } else {
        console.error('Failed to refresh steps');
      }
    } catch (error) {
      console.error('Error refreshing steps:', error);
    }
  };

  const renderStepPanel = (step: string) => {
    if (!ticket) return null;

    switch (step) {
      case "Step 1 : Customer Message Received":
        return (
          <Step1
            ticketNumber={ticket.ticket_number}
            message={ticket.steps[step].text}
            customerName={ticket.customer_name}
            handleNext={async () => {
              console.log('Handling next for Step 1');
              const response = await fetch(`${process.env.NEXT_PUBLIC_ENDPOINT_URL}/post_client_message_decode?text=${encodeURIComponent(ticket.steps["Step 1 : Customer Message Received"].text)}`, {
                method: 'POST',
                headers: {
                  'accept': 'application/json',
                },
                body: '',
              });
              const decodedMessage = await response.json();
              await fetch(`${process.env.NEXT_PUBLIC_ENDPOINT_URL}/ticket/update_next_step/`, {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ticket_number: ticket.ticket_number, step_info: decodedMessage, step_number: "Step 2 : Message Decoded" }),
              });
              fetchTicket(ticket._id);
              setActiveStep("Step 2 : Message Decoded");
            }}
          />
        );

      case "Step 2 : Message Decoded":
        return (
          <Step2
            ticketNumber={ticket.ticket_number}
            data={ticket.steps[step]}
            handleNext={async () => {
              console.log('Handling next for Step 2');
              const response = await fetch(`${process.env.NEXT_PUBLIC_ENDPOINT_URL}/post_message_template_for_vendor?vendor_name={VENDOR}`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(ticket.steps[step]),
              });
              const vendorMessageTemplate = await response.json();
              await fetch(`${process.env.NEXT_PUBLIC_ENDPOINT_URL}/ticket/update_next_step/`, {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ticket_number: ticket.ticket_number, step_info: { text: vendorMessageTemplate.vendor_message_template }, step_number: "Step 3 : Message Template for vendors" }),
              });
              fetchTicket(ticket._id);
              setActiveStep("Step 3 : Message Template for vendors");
            }}
            handleUpdate={async (updatedData) => {
              console.log('Updating Step 2 data:', updatedData);
              await fetch(`${process.env.NEXT_PUBLIC_ENDPOINT_URL}/ticket/update_specific_step/`, {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ticket_number: ticket.ticket_number, step_info: updatedData, step_number: "Step 2 : Message Decoded" }),
              });
              fetchTicket(ticket._id);
            }}
          />
        );

      case "Step 3 : Message Template for vendors":
        return (
          <Step3
            ticketNumber={ticket.ticket_number}
            template={ticket.steps[step].text}
            customerName={ticket.customer_name}
            askedDetails={ticket.steps["Step 2 : Message Decoded"]}
            handleNext={async () => {
              console.log('Handling next for Step 3');
              await fetch(`${process.env.NEXT_PUBLIC_ENDPOINT_URL}/ticket/update_next_step/`, {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ticket_number: ticket.ticket_number, step_info: { text: ticket.steps[step].text }, step_number: "Step 4 : Vendor Selection" }),
              });
              fetchTicket(ticket._id);
              setActiveStep("Step 4 : Vendor Selection");
            }}
            handleUpdate={async (updatedTemplate) => {
              console.log('Updating Step 3 template:', updatedTemplate);
              await fetch(`${process.env.NEXT_PUBLIC_ENDPOINT_URL}/ticket/update_specific_step/`, {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ticket_number: ticket.ticket_number, step_info: { text: updatedTemplate }, step_number: "Step 3 : Message Template for vendors" }),
              });
              fetchTicket(ticket._id);
            }}
          />
        );

      case "Step 4 : Vendor Selection":
        return (
          <Step4
            ticketNumber={ticket.ticket_number}
            selectedVendors={ticket.steps[step].list}
            template={ticket.steps["Step 3 : Message Template for vendors"].text}
            handleNext={async () => {
              console.log('Handling next for Step 4');
              await fetch(`${process.env.NEXT_PUBLIC_ENDPOINT_URL}/ticket/update_next_step/`, {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ticket_number: ticket.ticket_number, step_info: { list: ticket.steps[step].list }, step_number: "Step 5: Messages from Vendors" }),
              });
              fetchTicket(ticket._id);
              setActiveStep("Step 5: Messages from Vendors");
            }}
            handleUpdate={async (updatedVendors) => {
              console.log('Updating Step 4 vendors:', updatedVendors);
              await fetch(`${process.env.NEXT_PUBLIC_ENDPOINT_URL}/ticket/update_specific_step/`, {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ticket_number: ticket.ticket_number, step_info: { list: updatedVendors }, step_number: "Step 4 : Vendor Selection" }),
              });
              fetchTicket(ticket._id);
            }}
          />
        );

      case "Step 5: Messages from Vendors":
        return (
          <Step5
            ticketNumber={ticket.ticket_number}
            vendorMessages={ticket.steps[step]?.list || []}
            selectedVendors={ticket.steps["Step 4 : Vendor Selection"]?.list || []}
            handleNext={async () => {
              console.log('Handling next for Step 5');
              const vendorDecodedMessages: Record<string, any> = {};
              for (const vendor of ticket.steps["Step 4 : Vendor Selection"]?.list || []) {
                const response = await fetch(`${process.env.NEXT_PUBLIC_ENDPOINT_URL}/post_vendor_message_decode`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({ text: ticket.steps[step]?.list[vendor] || '' }),
                });
                vendorDecodedMessages[vendor] = await response.json();
              }
              await fetch(`${process.env.NEXT_PUBLIC_ENDPOINT_URL}/ticket/update_next_step/`, {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ticket_number: ticket.ticket_number, step_info: vendorDecodedMessages, step_number: "Step 6 : Vendor Message Decoded" }),
              });
              fetchTicket(ticket._id);
              setActiveStep("Step 6 : Vendor Message Decoded");
            }}
            handleUpdate={async (updatedMessages) => {
              console.log('Updating Step 5 messages:', updatedMessages);
              await fetch(`${process.env.NEXT_PUBLIC_ENDPOINT_URL}/ticket/update_specific_step/`, {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ticket_number: ticket.ticket_number, step_info: { list: updatedMessages }, step_number: "Step 5: Messages from Vendors" }),
              });
              fetchTicket(ticket._id);
            }}
          />
        );

      case "Step 6 : Vendor Message Decoded":
        return (
          <Step6
            ticketNumber={ticket.ticket_number}
            decodedMessages={ticket.steps[step]}
            handleNext={async () => {
              console.log('Handling next for Step 6');
              await fetch(`${process.env.NEXT_PUBLIC_ENDPOINT_URL}/ticket/update_next_step/`, {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ticket_number: ticket.ticket_number, step_info: ticket.steps[step], step_number: "Step 7 : Final Quote" }),
              });
              fetchTicket(ticket._id);
              setActiveStep("Step 7 : Final Quote");
            }}
            handleUpdate={async (updatedDecodedMessages) => {
              console.log('Updating Step 6 messages:', updatedDecodedMessages);
              await fetch(`${process.env.NEXT_PUBLIC_ENDPOINT_URL}/ticket/update_specific_step/`, {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ticket_number: ticket.ticket_number, step_info: updatedDecodedMessages, step_number: "Step 6 : Vendor Message Decoded" }),
              });
              fetchTicket(ticket._id);
            }}
          />
        );

      case "Step 7 : Final Quote":
        return (
          <Step7
            ticketNumber={ticket.ticket_number}
            finalQuote={ticket.steps[step]}
            handleNext={async () => {
              console.log('Handling next for Step 7');
              const response = await fetch(`${process.env.NEXT_PUBLIC_ENDPOINT_URL}/post_message_template_for_client`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  client_name: ticket.customer_name,
                  askedDetails_json: JSON.stringify(ticket.steps["Step 2 : Message Decoded"]),
                  vendor_delivery_info_json: JSON.stringify(ticket.steps["Step 6 : Vendor Message Decoded"]),
                }),
              });
              const clientMessageTemplate = await response.json();
              await fetch(`${process.env.NEXT_PUBLIC_ENDPOINT_URL}/ticket/update_next_step/`, {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ticket_number: ticket.ticket_number, step_info: { text: clientMessageTemplate.client_message_template }, step_number: "Step 8 : Customer Message Template" }),
              });
              fetchTicket(ticket._id);
              setActiveStep("Step 8 : Customer Message Template");
            }}
            handleUpdate={async (updatedQuote) => {
              console.log('Updating Step 7 quote:', updatedQuote);
              await fetch(`${process.env.NEXT_PUBLIC_ENDPOINT_URL}/ticket/update_specific_step/`, {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ticket_number: ticket.ticket_number, step_info: updatedQuote, step_number: "Step 7 : Final Quote" }),
              });
              fetchTicket(ticket._id);
            }}
          />
        );

      case "Step 8 : Customer Message Template":
        return (
          <Step8
            ticketNumber={ticket.ticket_number}
            customerTemplate={ticket.steps[step].text}
            handleNext={async () => {
              console.log('Handling next for Step 8');
              await fetch(`${process.env.NEXT_PUBLIC_ENDPOINT_URL}/ticket/update_next_step/`, {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ticket_number: ticket.ticket_number, step_info: { text: ticket.steps[step].text }, step_number: "Step 9: Final Status" }),
              });
              fetchTicket(ticket._id);
              setActiveStep("Step 9: Final Status");
            }}
            handleUpdate={async (updatedTemplate) => {
              console.log('Updating Step 8 template:', updatedTemplate);
              await fetch(`${process.env.NEXT_PUBLIC_ENDPOINT_URL}/ticket/update_specific_step/`, {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ticket_number: ticket.ticket_number, step_info: { text: updatedTemplate }, step_number: "Step 8 : Customer Message Template" }),
              });
              fetchTicket(ticket._id);
            }}
          />
        );

      case "Step 9: Final Status":
        return (
          <Step9
            ticketNumber={ticket.ticket_number}
            finalStatus={ticket.steps[step].text}
            handleNext={async () => {
              console.log('Handling next for Step 9');
              await fetch(`${process.env.NEXT_PUBLIC_ENDPOINT_URL}/ticket/update_specific_step/`, {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ticket_number: ticket.ticket_number, step_info: { text: ticket.steps[step].text }, step_number: "Step 9: Final Status" }),
              });
              alert('Ticket process completed.');
              router.push('/intrendapp/tickets');
            }}
            handleUpdate={async (updatedStatus) => {
              console.log('Updating Step 9 status:', updatedStatus);
              await fetch(`${process.env.NEXT_PUBLIC_ENDPOINT_URL}/ticket/update_specific_step/`, {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ticket_number: ticket.ticket_number, step_info: { text: updatedStatus }, step_number: "Step 9: Final Status" }),
              });
              fetchTicket(ticket._id);
            }}
          />
        );

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
                    disabled={index > getCurrentStepIndex()}
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
          <div className="flex justify-end mb-4">
            <Button
              onClick={() => handleRefresh(activeStep || ticket.current_step)}
              style={{ backgroundColor: 'red', color: 'white' }}
            >
              Refresh Step
            </Button>
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
