import Link from "next/link";
import React, { useEffect, useState } from "react";
import { FaEye, FaTrash } from "react-icons/fa";

interface Ticket {
  _id: string;
  ticket_number: string;
  customer_name: string;
  current_step: string;
  created_date: string;
  updated_date: string;
  status: string;
  final_decision: string;
}

interface TicketListProps {
  refreshList: () => void;
}

export default function TicketsMobileList({ refreshList }: TicketListProps) {
  const [tickets, setTickets] = useState<Ticket[]>([]);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/tickets`
        );
        const data = await response.json();
        const parsedTickets = data.tickets.map((ticket: any) => ({
          _id: ticket._id,
          ticket_number: ticket.ticket_number,
          customer_name: ticket.customer_name,
          current_step: ticket.current_step,
          created_date: ticket.created_date,
          updated_date: ticket.updated_date,
          status: ticket.steps["Step 9: Final Status"]?.status || "open",
          final_decision:
            ticket.steps["Step 9: Final Status"]?.final_decision || "pending",
        }));
        setTickets(parsedTickets);
      } catch (error) {
        console.error("Error fetching tickets:", error);
      }
    };
    fetchTickets();
  }, [refreshList]);

  const handleDelete = async (ticketId: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/ticket/${ticketId}`,
        {
          method: "DELETE",
        }
      );
      if (response.ok) {
        setTickets(tickets.filter((ticket) => ticket._id !== ticketId));
      } else {
        console.error("Failed to delete ticket");
      }
    } catch (error) {
      console.error("Error deleting ticket:", error);
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      day: "numeric",
      month: "short",
      year: "2-digit",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    };
    return new Intl.DateTimeFormat("en-GB", options).format(date);
  };
  return (
    <div className="grid grid-cols-1 gap-4 md:hidden">
     {tickets.map((ticket) => (
  <div key={ticket._id} className="bg-white text-black p-4 rounded-lg shadow-lg">
    <div className="flex flex-col space-y-4 text-sm w-full">
      
      <div className="flex justify-between items-center">
        <div className="flex">
          <span className="font-semibold mr-2">Customer Name:</span>
          <span>{ticket.customer_name}</span>
        </div>
        <div className="flex">
          <span className="font-semibold mr-2">Final Decision:</span>
          <span className="text-right">{ticket.final_decision}</span>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div className="flex">
          <span className="font-semibold mr-2">Ticket Number:</span>
          <span>{ticket.ticket_number}</span>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div className="flex">
          <span className="font-semibold mr-2">Current Step:</span>
          <span>{ticket.current_step}</span>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div className="flex">
          <span className="font-semibold mr-2">Updated Date:</span>
          <span>{formatDateTime(ticket.updated_date)}</span>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div className="flex">
          <span className="font-semibold mr-2">Created Date:</span>
          <span className="text-right">{formatDateTime(ticket.created_date)}</span>
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        <Link href={`tickets/${ticket._id}`} passHref>
          <span className="text-blue-500 hover:text-blue-700">
            <FaEye />
          </span>
        </Link>
        <FaTrash
          onClick={() => handleDelete(ticket._id)}
          className="text-red-500 cursor-pointer hover:text-red-700"
        />
      </div>
    </div>
  </div>
))}

    </div>
  );
}
