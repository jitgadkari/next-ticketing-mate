"use client";
import React, { useState, useEffect } from "react";
import Button from "../../../components/Button";
import { useRouter } from "next/navigation";
import { FaEye } from "react-icons/fa";
import toast from "react-hot-toast";
interface Step9Props {
  ticketNumber: string;
  finalStatus: { status: string; final_decision: string };
  isCurrentStep: boolean;
  fetchTicket: (ticketId: string) => Promise<void>;
  ticket: {
    _id: string;
    ticket_number: string;
    customer_name: string;
    current_step: string;
    steps: Record<string, any>;
    created_data: string;
    updated_date: string;
  };
}

const Step9: React.FC<Step9Props> = ({
  ticketNumber,
  finalStatus,
  isCurrentStep,
  fetchTicket,
  ticket,
}) => {
  const [status, setStatus] = useState(finalStatus.status || "open");
  const [finalDecision, setFinalDecision] = useState(
    finalStatus.final_decision || "pending"
  );
  const [showOptions, setShowOptions] = useState({
    status: true,
    finalDecision: true,
  });
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const handleClose = async (finalStatus: {
    status: string;
    final_decision: string;
  }) => {
    console.log("Handling close for Step 9");
    console.log("Closing ticket with status:", finalStatus);
    setLoading(true);
    await fetch(
      `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/ticket/update_specific_step/`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ticket_number: ticket.ticket_number,
          step_info: finalStatus,
          step_number: "Step 9: Final Status",
        }),
      }
    );
    setLoading(false);
    alert("Ticket process completed and closed.");
    router.push("/intrendapp/tickets");
    toast.success("Ticket process completed and closed!")
  };

  const handleUpdate = async (updatedStatus: {
    status: string;
    final_decision: string;
  }) => {
    console.log("Updating Step 9 status:", updatedStatus);
    await fetch(
      `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/ticket/update_specific_step/`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ticket_number: ticket.ticket_number,
          step_info: updatedStatus,
          step_number: "Step 9: Final Status",
        }),
      }
    );
    await fetchTicket(ticket._id);
    console.log("Ticket fetched after update");
  };
  useEffect(() => {
    console.log("finalStatus changed:", finalStatus);
    setStatus(finalStatus.status || "open");
    setFinalDecision(finalStatus.final_decision || "");
  }, [finalStatus]);

  const handleSave = async () => {
    const updatedStatus = { status, final_decision: finalDecision };
    console.log("Saving status:", updatedStatus);
    await handleUpdate(updatedStatus);
  };

  const handleCloseTicket = async () => {
    if (finalDecision === "") {
      alert("Please select a final decision before closing the ticket.");
      return;
    }
    const closingStatus = { status: "closed", final_decision: finalDecision };
    console.log("Closing ticket with status:", closingStatus);
    await handleClose(closingStatus);
  };

  console.log(
    "Rendering Step9. Status:",
    status,
    "Final Decision:",
    finalDecision
  );

  return (
    <div className="space-y-4">
       <div className="py-1 mb-4">
            <h1 className="text-xl font-bold ">Customer Message</h1>
            <div>{ticket.steps["Step 1 : Customer Message Received"].text}</div>
          </div>
      <h3 className="text-xl font-bold">Step 9: Final Status</h3>
      <div className="flex items-center gap-2">
      <label
        className="block text-gray-700 font-bold mb-2"
      
      >
        Status{" "}
      </label>
        <span className="text-blue-500 hover:text-blue-700">
          <FaEye   onClick={() =>
          setShowOptions((prev) => ({ ...prev, status: !prev.status }))
        }/>
        </span>
        </div>
      {showOptions.status && (
        <div
          className={`z-10  bg-white divide-y divide-gray-100 rounded-lg shadow w-44 `}
        >
          <ul className=" text-sm text-gray-700 dark:text-gray-200">
            <li
              className={`block px-4 py-2 rounded-lg text-black cursor-pointer ${status ==='open'&& "bg-green-600 text-white"}`}
              onClick={() => setStatus("open")}
            >
              Open{" "}
            </li>
            <li
              className={`block px-4 py-2 rounded-lg text-black  cursor-pointer ${status ==='close'&& "bg-green-600 text-white"} `}
              onClick={() => setStatus("close")}
            >
              Closed{" "}
            </li>
          </ul>
        </div>
      )}
      <div className="flex items-center  gap-2">
        <label
          className=" text-gray-700 font-bold mb-2"
        >
          Final Decision{" "}
        </label>
          <span className="text-blue-500 hover:text-blue-700" onClick={() =>
            setShowOptions((prev) => ({
              ...prev,
              finalDecision: !prev.finalDecision,
            }))
          }>
            <FaEye />
          </span>
      </div>
      {showOptions.finalDecision && (
        <div
          className={`z-10  bg-white divide-y divide-gray-100 rounded-lg shadow w-44 `}
        >
          <ul className=" text-sm text-gray-700 dark:text-gray-200">
            <button disabled={true} className="w-full px-4 py-2 ">
              Select a decision
            </button>
            <li
              className={`block px-4 py-2 cursor-pointer rounded-lg text-black  ${finalDecision ==='approved' && 'bg-green-500 text-white'}`}
              onClick={() => setFinalDecision("approved")}
            >
              Approved
            </li>
            <li
              className={`block px-4 py-2 cursor-pointer rounded-lg text-black  ${finalDecision ==='denied' && 'bg-green-500 text-white'}`}
              onClick={() => setFinalDecision("denied")}
            >
              Denied
            </li>
            <li
              className={`block px-4 py-2 cursor-pointer rounded-lg  text-black  ${finalDecision ==='pending' && 'bg-green-500 text-white'}`}
              onClick={() => setFinalDecision("pending")}
            >
              Pending
            </li>
          </ul>
        </div>
      )}

      <div className="flex justify-end space-x-4">
        <Button
          onClick={handleSave}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          disabled={!isCurrentStep}
        >
          Save
        </Button>
        <Button
          onClick={handleCloseTicket}
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
          disabled={!isCurrentStep || finalDecision === ""}
        >
          Close Ticket
        </Button>
        {loading && <h1>Loading...</h1>}
      </div>
    </div>
  );
};

export default Step9;
