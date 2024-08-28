"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Button from "../../../components/Button";
import Step1 from "../steps/Step1";
import Step2 from "../steps/Step2";
import Step3 from "../steps/Step3";
import Step4 from "../steps/Step4";
import Step5 from "../steps/Step5";
import Step6 from "../steps/Step6";
import Step7 from "../steps/Step7";
import Step8 from "../steps/Step8";
import Step9 from "../steps/Step9";
import toast from "react-hot-toast";

interface Ticket {
  _id: string;
  ticket_number: string;
  person_name: string; // Add this line
  customer_name: string;
  current_step: string;
  steps: Record<string, any>;
  created_data: string;
  updated_date: string;
  from_number:string;
}

const stepsOrder = [
  "Step 1 : Customer Message Received",
  "Step 2 : Message Decoded",
  "Step 3 : Message Template for vendors",
  "Step 4 : Vendor Selection",
  "Step 5: Messages from Vendors",
  "Step 6 : Vendor Message Decoded",
  "Step 7 : Customer Message Template",
  "Step 8 : Customer Response",
  "Step 9: Final Status",
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
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/ticket/${ticketId}`
      );
      const data = await response.json();
      setTicket(data.ticket);
      setActiveStep(data.ticket.current_step);
    } catch (error) {
      console.error("Error fetching ticket:", error);
    }
  };
  console.log(activeStep)
  const listOfStepsWhereRefreshIsntAllowed = [
    "Step 1 : Customer Message Received",
    "Step 5: Messages from Vendors",
    "Step 6 : Vendor Message Decoded",
    "Step 7 : Customer Message Template",
  ];
  const handleRefresh = async (step: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to refresh this step? This will refresh all steps from the current step onward."
    );
    if (!confirmed) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/ticket/ticket_refresher/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ticket_number: ticket?.ticket_number,
            step_number: step,
          }),
        }
      );

      if (response.ok) {
        fetchTicket(ticket?._id!);
        setActiveStep(step);
        toast.success(`Ticket refreshed to: ${step} `)
      } else {
        console.error("Failed to refresh steps");
      }
    } catch (error) {
      console.error("Error refreshing steps:", error);
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
            personName={ticket.person_name} // Add this line
            isCurrentStep={step === ticket.current_step}
            ticket={ticket}
            step={step}
            setActiveStep={setActiveStep}
            fetchTicket={fetchTicket}
          />
        );

      case "Step 2 : Message Decoded":
        return (
          <Step2
            ticketNumber={ticket.ticket_number}
            data={ticket.steps[step]}
            originalMessage={
              ticket.steps["Step 1 : Customer Message Received"]?.text || ""
            }
            isCurrentStep={step === ticket.current_step}
            ticket={ticket}
            setActiveStep={setActiveStep}
            fetchTicket={fetchTicket}
          />
        );

      case "Step 3 : Message Template for vendors":
        return (
          <Step3
            ticketNumber={ticket.ticket_number}
            template={ticket.steps[step]?.text || ""}
            customerName={ticket.customer_name}
            originalMessage={
              ticket.steps["Step 1 : Customer Message Received"]?.text || ""
            }
            isCurrentStep={step === ticket.current_step}
            ticket={ticket}
            setActiveStep={setActiveStep}
            fetchTicket={fetchTicket}
          />
        );

      case "Step 4 : Vendor Selection":
        return (
          <Step4
            ticketNumber={ticket.ticket_number}
            selectedVendors={ticket.steps[step]?.list || []}
            template={
              ticket.steps["Step 3 : Message Template for vendors"]?.text || ""
            }
            isCurrentStep={step === ticket.current_step}
            ticket={ticket}
            setActiveStep={setActiveStep}
            fetchTicket={fetchTicket}
          />
        );

      case "Step 5: Messages from Vendors":
        return (
          <Step5
            ticketNumber={ticket.ticket_number}
            vendorMessages={ticket.steps[step] as Record<string, string>}
            ticket={ticket}
            setActiveStep={setActiveStep}
            fetchTicket={fetchTicket}
            step={step}
            isCurrentStep={step === ticket.current_step}
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
            decodedMessages={ticket.steps[step] || {}}
            isCurrentStep={step === ticket.current_step}
            customerName={ticket.customer_name}
            originalMessage={
              ticket.steps["Step 1 : Customer Message Received"]?.text || ""
            }
            ticket={ticket}
            setActiveStep={setActiveStep}
            fetchTicket={fetchTicket}
          />
        );

      // case "Step 7 : Customer Message Template":
      //   console.log('Step 7 data:', ticket.steps[step]);  // Debug log

      //   let customerTemplate = ticket.steps[step]?.text || '';

      //   // Ensure customerTemplate is a string
      //   if (typeof customerTemplate === 'object') {
      //     try {
      //       customerTemplate = JSON.stringify(customerTemplate, null, 2);
      //     } catch (error) {
      //       console.error('Error stringifying customerTemplate:', error);
      //       customerTemplate = 'Error: Unable to display template';
      //     }
      //   } else if (typeof customerTemplate !== 'string') {
      //     customerTemplate = String(customerTemplate);
      //   }

      //   return (
      //     <Step7
      //       ticketNumber={ticket.ticket_number}
      //       customerTemplate={customerTemplate}
      //       handleNext={async () => {
      //         console.log('Handling next for Step 7');
      //         // Update Step 8 with an empty string from client
      //         await fetch(`${process.env.NEXT_PUBLIC_ENDPOINT_URL}/ticket/update_next_step/`, {
      //           method: 'PUT',
      //           headers: {
      //             'Content-Type': 'application/json',
      //           },
      //           body: JSON.stringify({
      //             ticket_number: ticket.ticket_number,
      //             step_info: { text: '' },
      //             step_number: "Step 8 : Customer Response"
      //           }),
      //         });
      //         fetchTicket(ticket._id);
      //         setActiveStep("Step 8 : Customer Response");
      //       }}
      //       handleUpdate={async (updatedTemplate) => {
      //         console.log('Updating Step 7 template:', updatedTemplate);
      //         await fetch(`${process.env.NEXT_PUBLIC_ENDPOINT_URL}/ticket/update_specific_step/`, {
      //           method: 'PUT',
      //           headers: {
      //             'Content-Type': 'application/json',
      //           },
      //           body: JSON.stringify({
      //             ticket_number: ticket.ticket_number,
      //             step_info: { text: updatedTemplate },
      //             step_number: "Step 7 : Customer Message Template"
      //           }),
      //         });
      //         fetchTicket(ticket._id);
      //       }}
      //       isCurrentStep={step === ticket.current_step}
      //     />
      //   );

      case "Step 7 : Customer Message Template":
        console.log("Step 7 data:", ticket.steps[step]); // Debug log

        let customerTemplate = ticket.steps[step]?.text || "";

        // Ensure customerTemplate is a string
        if (typeof customerTemplate === "object") {
          try {
            customerTemplate = JSON.stringify(customerTemplate, null, 2);
          } catch (error) {
            console.error("Error stringifying customerTemplate:", error);
            customerTemplate = "Error: Unable to display template";
          }
        } else if (typeof customerTemplate !== "string") {
          customerTemplate = String(customerTemplate);
        }

        return (
          <Step7
            ticketNumber={ticket.ticket_number}
            customerTemplate={customerTemplate}
            personName={ticket.person_name} // Add this line
            ticket={ticket}
            setActiveStep={setActiveStep}
            fetchTicket={fetchTicket}
            isCurrentStep={step === ticket.current_step}
          />
        );

      case "Step 8 : Customer Response":
        return (
          <Step8
            ticketNumber={ticket.ticket_number}
            customerTemplate={
              ticket.steps["Step 7 : Customer Message Template"]?.text || ""
            }
            customerResponse={ticket.steps[step]?.text || ""}
            ticket={ticket}
            setActiveStep={setActiveStep}
            fetchTicket={fetchTicket}
            isCurrentStep={step === ticket.current_step}
          />
        );

      case "Step 9: Final Status":
        console.log("Rendering Step 9. Current step data:", ticket.steps[step]);
        return (
          <Step9
            ticketNumber={ticket.ticket_number}
            finalStatus={
              ticket.steps[step] as { status: string; final_decision: string }
            }
            fetchTicket={fetchTicket}
            ticket={ticket}
            isCurrentStep={step === ticket.current_step}
          />
        );

      default:
        return <p>{ticket.steps[step]}</p>;
    }
  };

  const getCurrentStepIndex = () => {
    return stepsOrder.indexOf(ticket?.current_step || "");
  };
  const stepFromTicket = activeStep || "";
  const isRefreshDisabled =
    listOfStepsWhereRefreshIsntAllowed.includes(stepFromTicket);

  console.log("Step from ticket:", `"${stepFromTicket}"`);
  console.log("Is refresh disabled:", isRefreshDisabled);

  // Debugging the list
  console.log(
    "List of steps where refresh isn't allowed:",
    listOfStepsWhereRefreshIsntAllowed
  );
  return (
    <div className="p-8 bg-white rounded shadow text-black max-w-full">
      <h1 className="text-2xl font-bold mb-4">Ticket Details</h1>
      {ticket ? (
        <div>
          <div className="mb-4">
            <h2 className="text-xl font-bold">
              Ticket Number: {ticket.ticket_number}
            </h2>
            <p className="text-lg">Customer: {ticket.customer_name}</p>
          </div>
          <div className="mb-4">
            <div className="flex items-center flex-wrap gap-y-2">
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
                    <div
                      className={`w-8 h-1 ${
                        index < getCurrentStepIndex()
                          ? "bg-blue-500"
                          : "bg-gray-300"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
          {ticket?.current_step !== "Step 1 : Customer Message Received" ? (
            <div className="flex justify-end mb-4">
              <Button
                onClick={() => handleRefresh(activeStep || ticket.current_step)}
                className={`bg-red-500 text-white ${
                  isRefreshDisabled ? "opacity-50 cursor-not-allowed " : ""
                }`}
                disabled={isRefreshDisabled}
              >
                Refresh Step
              </Button>
            </div>
          ) : (
            <></>
          )}
          <div>{renderStepPanel(activeStep || ticket.current_step)}</div>
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default TicketDetailsPage;
