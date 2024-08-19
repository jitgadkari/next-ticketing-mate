"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaEye, FaTrash } from 'react-icons/fa';
import Table from '../../components/Table';

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

const TicketList: React.FC<TicketListProps> = ({ refreshList }) => {
  const [tickets, setTickets] = useState<Ticket[]>([]);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_ENDPOINT_URL}/tickets`);
        const data = await response.json();
        const parsedTickets = data.tickets.map((ticket: any) => ({
          _id: ticket._id,
          ticket_number: ticket.ticket_number,
          customer_name: ticket.customer_name,
          current_step: ticket.current_step,
          created_date: ticket.created_date,
          updated_date: ticket.updated_date,
          status: ticket.steps["Step 9: Final Status"]?.status || 'open',
          final_decision: ticket.steps["Step 9: Final Status"]?.final_decision || 'pending',
        }));
        setTickets(parsedTickets);
      } catch (error) {
        console.error('Error fetching tickets:', error);
      }
    };
    fetchTickets();
  }, [refreshList]);

  const handleDelete = async (ticketId: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_ENDPOINT_URL}/ticket/${ticketId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setTickets(tickets.filter(ticket => ticket._id !== ticketId));
      } else {
        console.error('Failed to delete ticket');
      }
    } catch (error) {
      console.error('Error deleting ticket:', error);
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      day: 'numeric',
      month: 'short',
      year: '2-digit',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    };
    return new Intl.DateTimeFormat('en-GB', options).format(date);
  };

  const columns = ['Ticket Number', 'Customer Name', 'Current Step', 'Status', 'Decision', 'Created Date', 'Updated Date', 'Actions'];

  const renderRow = (ticket: Ticket) => (
    <>
      <td className="border p-2">{ticket.ticket_number}</td>
      <td className="border p-2">{ticket.customer_name}</td>
      <td className="border p-2">{ticket.current_step}</td>
      <td className="border p-2">
        <span className={`px-2 py-1 rounded ${ticket.status === 'closed' ? 'bg-red-200 text-red-800' : 'bg-green-200 text-green-800'}`}>
          {ticket.status}
        </span>
      </td>
      <td className="border p-2">
        <span className={`px-2 py-1 rounded ${
          ticket.final_decision === 'approved' ? 'bg-green-200 text-green-800' :
          ticket.final_decision === 'denied' ? 'bg-red-200 text-red-800' :
          'bg-yellow-200 text-yellow-800'
        }`}>
          {ticket.final_decision}
        </span>
      </td>
      <td className="border p-2">{formatDateTime(ticket.created_date)}</td>
      <td className="border p-2">{formatDateTime(ticket.updated_date)}</td>
      <td className="border p-2 ">
      <ul className='h-full flex justify-center space-x-2'>
        <Link href={`tickets/${ticket._id}`} passHref>
          <span className="text-blue-500 hover:text-blue-700">
            <FaEye />
          </span>
        </Link>
        <FaTrash
          onClick={() => handleDelete(ticket._id)}
          className="text-red-500 cursor-pointer hover:text-red-700"
          />
          </ul>
      </td>
    </>
  );

  return (
    <div className="p-8 bg-white rounded shadow text-black">
      <h1 className="text-2xl font-bold mb-4">Tickets List</h1>
      <Table columns={columns} data={tickets} renderRow={renderRow} />
    </div>
  );
};

export default TicketList;