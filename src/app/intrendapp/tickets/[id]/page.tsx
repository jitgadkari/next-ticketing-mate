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
              const requestPayload = {
                vendor_name: "{VENDOR}",
                askedDetails_json: JSON.stringify(ticket.steps[step])
              };
              console.log("Data sent for post_message:", requestPayload);
              
              const response = await fetch(`${process.env.NEXT_PUBLIC_ENDPOINT_URL}/post_message_template_for_vendor`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestPayload),
              });

              if (!response.ok) {
                const errorText = await response.text();
                console.error('Error response:', errorText);
                throw new Error('Failed to fetch vendor message template');
              }

              const vendorMessageTemplate = await response.json();
              console.log('Vendor message template:', vendorMessageTemplate);

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
              const payload = {
                ticket_number: ticket.ticket_number,
                step_info: updatedData,
                step_number: "Step 2 : Message Decoded"
              };

              console.log('Payload:', JSON.stringify(payload));

              try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_ENDPOINT_URL}/ticket/update_specific_step/`, {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
              });
              if (!response.ok) {
                const errorData = await response.json();
                console.error('Update failed:', errorData);
              } else {
                const responseData = await response.json();
                console.log('Update successful:', responseData);
              }
            } catch (error) {
              console.error('Error during fetch:', error);
            }
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
              console.log('Step 3 template:', ticket.steps[step].text);
              
              await fetch(`${process.env.NEXT_PUBLIC_ENDPOINT_URL}/ticket/update_next_step/`, {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ticket_number: ticket.ticket_number, step_info: { list: [] }, step_number: "Step 4 : Vendor Selection" }),
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
      selectedVendors={ticket.steps[step]?.list || []}
      template={ticket.steps["Step 3 : Message Template for vendors"].text}
      handleNext={async (updatedVendors) => {
        console.log('Handling next for Step 4');
        console.log('Step 4 updated vendors:', updatedVendors);

        // Save Step 4 data
        await fetch(`${process.env.NEXT_PUBLIC_ENDPOINT_URL}/ticket/update_specific_step/`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ticket_number: ticket.ticket_number,
            step_number: "Step 4 : Vendor Selection",
            step_info: updatedVendors  // This now saves the vendor messages
          }),
        });

        // Initialize Step 5 with empty messages
        const emptyVendorMessages = Object.keys(updatedVendors).reduce((acc, vendor) => {
          acc[vendor] = '';
          return acc;
        }, {} as Record<string, string>);
        
        console.log('Step 5 initial vendor messages:', emptyVendorMessages);

        await fetch(`${process.env.NEXT_PUBLIC_ENDPOINT_URL}/ticket/update_next_step/`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ticket_number: ticket.ticket_number,
            step_info: emptyVendorMessages,
            step_number: "Step 5: Messages from Vendors"
          }),
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
          body: JSON.stringify({
            ticket_number: ticket.ticket_number,
            step_number: "Step 4 : Vendor Selection",
            step_info: updatedVendors  // This now saves the vendor messages
          }),
        });
        fetchTicket(ticket._id);
      }}
    />
  );

case "Step 5: Messages from Vendors":
  return (
    <Step5
      ticketNumber={ticket.ticket_number}
      vendorMessages={ticket.steps[step] || {}}
      selectedVendors={Object.keys(ticket.steps["Step 4 : Vendor Selection"] || {})}
      handleNext={async () => {
        console.log('Handling next for Step 5');
        const vendorDecodedMessages: Record<string, any> = {};
        for (const vendor of Object.keys(ticket.steps["Step 4 : Vendor Selection"] || {})) {
          const response = await fetch(`${process.env.NEXT_PUBLIC_ENDPOINT_URL}/post_vendor_message_decode`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text: ticket.steps[step]?.[vendor] || '' }),
          });
          vendorDecodedMessages[vendor] = await response.json();
        }
        
        // Save decoded messages to Step 6
        await fetch(`${process.env.NEXT_PUBLIC_ENDPOINT_URL}/ticket/update_next_step/`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            ticket_number: ticket.ticket_number, 
            step_info: vendorDecodedMessages, 
            step_number: "Step 6 : Vendor Message Decoded" 
          }),
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
          body: JSON.stringify({ 
            ticket_number: ticket.ticket_number, 
            step_number: "Step 5: Messages from Vendors",
            step_info: updatedMessages
          }),
        });
        fetchTicket(ticket._id);
      }}
    />
  );

        // case "Step 4 : Vendor Selection":
        //   return (
        //     <Step4
        //       ticketNumber={ticket.ticket_number}
        //       selectedVendors={ticket.steps[step]?.list || []}
        //       template={ticket.steps["Step 3 : Message Template for vendors"].text}
        //       handleNext={async (updatedVendors) => {
        //         console.log('Handling next for Step 4');
        //         console.log('Step 4 updated vendors:', updatedVendors);
        
        //         const vendorMessages = updatedVendors.reduce((acc, vendor) => {
        //           acc[vendor] = '';
        //           return acc;
        //         }, {} as Record<string, string>);
        //         console.log('Step 5 vendor messages:', vendorMessages);
        
        //         // Update Step 5
        //         await fetch(`${process.env.NEXT_PUBLIC_ENDPOINT_URL}/ticket/update_next_step/`, {
        //           method: 'PUT',
        //           headers: {
        //             'Content-Type': 'application/json',
        //           },
        //           body: JSON.stringify({
        //             ticket_number: ticket.ticket_number,
        //             step_info: vendorMessages,
        //             step_number: "Step 5: Messages from Vendors"
        //           }),
        //         });
        
        //         fetchTicket(ticket._id);
        //         setActiveStep("Step 5: Messages from Vendors");
        //       }}
        //       handleUpdate={async (updatedVendors) => {
        //         console.log('Updating Step 4 vendors:', updatedVendors);
        //         await fetch(`${process.env.NEXT_PUBLIC_ENDPOINT_URL}/ticket/update_specific_step/`, {
        //           method: 'PUT',
        //           headers: {
        //             'Content-Type': 'application/json',
        //           },
        //           body: JSON.stringify({
        //             ticket_number: ticket.ticket_number,
        //             step_number: "Step 4 : Vendor Selection",
        //             step_info: { list: updatedVendors }
        //           }),
        //         });
        //         fetchTicket(ticket._id);
        //       }}
        //     />
        //   );

          // case "Step 5: Messages from Vendors":
          //   return (
          //     <Step5
          //       ticketNumber={ticket.ticket_number}
          //       vendorMessages={ticket.steps[step] || {}}
          //       selectedVendors={ticket.steps["Step 4 : Vendor Selection"]?.list || []}
          //       handleNext={async () => {
          //         console.log('Handling next for Step 5');
          //         const vendorDecodedMessages: Record<string, any> = {};
          //         for (const vendor of ticket.steps["Step 4 : Vendor Selection"]?.list || []) {
          //           const response = await fetch(`${process.env.NEXT_PUBLIC_ENDPOINT_URL}/post_vendor_message_decode`, {
          //             method: 'POST',
          //             headers: {
          //               'Content-Type': 'application/json',
          //             },
          //             body: JSON.stringify({ text: ticket.steps[step]?.[vendor] || '' }),
          //           });
          //           vendorDecodedMessages[vendor] = await response.json();
          //         }
          //         await fetch(`${process.env.NEXT_PUBLIC_ENDPOINT_URL}/ticket/update_next_step/`, {
          //           method: 'PUT',
          //           headers: {
          //             'Content-Type': 'application/json',
          //           },
          //           body: JSON.stringify({ 
          //             ticket_number: ticket.ticket_number, 
          //             step_info: vendorDecodedMessages, 
          //             step_number: "Step 6 : Vendor Message Decoded" 
          //           }),
          //         });
          //         fetchTicket(ticket._id);
          //         setActiveStep("Step 6 : Vendor Message Decoded");
          //       }}
          //       handleUpdate={async (updatedMessages) => {
          //         console.log('Updating Step 5 messages:', updatedMessages);
          //         await fetch(`${process.env.NEXT_PUBLIC_ENDPOINT_URL}/ticket/update_specific_step/`, {
          //           method: 'PUT',
          //           headers: {
          //             'Content-Type': 'application/json',
          //           },
          //           body: JSON.stringify({ 
          //             ticket_number: ticket.ticket_number, 
          //             step_number: "Step 5: Messages from Vendors",
          //             step_info: updatedMessages
          //           }),
          //         });
          //         fetchTicket(ticket._id);
          //       }}
          //     />
          //   );

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
                body: JSON.stringify({ ticket_number: ticket.ticket_number, step_number: "Step 6 : Vendor Message Decoded" , step_info: updatedDecodedMessages }),
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
              customerName={ticket.customer_name}
              askedDetails={ticket.steps["Step 2 : Message Decoded"]}
              vendorDecodedMessages={ticket.steps["Step 6 : Vendor Message Decoded"]}
              handleNext={async (customerTemplate) => {
                console.log('Handling next for Step 7');
                await fetch(`${process.env.NEXT_PUBLIC_ENDPOINT_URL}/ticket/update_next_step/`, {
                  method: 'PUT',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({ 
                    ticket_number: ticket.ticket_number, 
                    step_info: { text: customerTemplate }, 
                    step_number: "Step 8 : Customer Message Template" 
                  }),
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
                  body: JSON.stringify({ 
                    ticket_number: ticket.ticket_number, 
                    step_info: updatedQuote, 
                    step_number: "Step 7 : Final Quote" 
                  }),
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
                  body: JSON.stringify({ 
                    ticket_number: ticket.ticket_number, 
                    step_info: { status: "open", final_decision: "" }, 
                    step_number: "Step 9: Final Status" 
                  }),
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
                  body: JSON.stringify({ 
                    ticket_number: ticket.ticket_number, 
                    step_info: { text: updatedTemplate }, 
                    step_number: "Step 8 : Customer Message Template" 
                  }),
                });
                fetchTicket(ticket._id);
              }}
            />
          );

          case "Step 9: Final Status":
  return (
    <Step9
      ticketNumber={ticket.ticket_number}
      finalStatus={ticket.steps[step]}
      handleClose={async () => {
        console.log('Handling close for Step 9');
        const finalStatus = {
          status: "closed",
          final_decision: ticket.steps[step].final_decision
        };
        await fetch(`${process.env.NEXT_PUBLIC_ENDPOINT_URL}/ticket/update_specific_step/`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            ticket_number: ticket.ticket_number, 
            step_info: finalStatus, 
            step_number: "Step 9: Final Status" 
          }),
        });
        alert('Ticket process completed and closed.');
        router.push('/intrendapp/tickets');
      }}
      handleUpdate={async (updatedStatus) => {
        console.log('Updating Step 9 status:', updatedStatus);
        await fetch(`${process.env.NEXT_PUBLIC_ENDPOINT_URL}/ticket/update_specific_step/`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            ticket_number: ticket.ticket_number, 
            step_info: updatedStatus, 
            step_number: "Step 9: Final Status" 
          }),
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
              className="bg-red-500 text-white"
            >
              Refresh Step
            </Button>
          </div>
          <div>{renderStepPanel( activeStep || ticket.current_step )}</div>
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default TicketDetailsPage;
