"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaEye, FaTrash } from 'react-icons/fa';
import Button from '../../components/Button';
import Table from '../../components/Table';

interface Ticket {
  _id: string;
  ticket_number: string;
  customer_name: string;
  status: string;
  created_date: string;
}

const TicketList = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const response = await fetch('http://localhost:8000/tickets');
        const data = await response.json();
        setTickets(data.tickets);
      } catch (error) {
        console.error('Error fetching tickets:', error);
      }
    };
    fetchTickets();
  }, []);

  const handleDelete = async (ticket_id: string) => {
    try {
      const response = await fetch(`http://localhost:8000/ticket/${ticket_id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setTickets(tickets.filter(ticket => ticket._id !== ticket_id));
      } else {
        console.error('Failed to delete ticket');
      }
    } catch (error) {
      console.error('Error deleting ticket:', error);
    }
  };

  const columns = ['Ticket Number', 'Customer Name', 'Status', 'Created Date', 'Actions'];

  const renderRow = (ticket: Ticket) => (
    <>
      <td className="border p-2">{ticket.ticket_number}</td>
      <td className="border p-2">{ticket.customer_name}</td>
      <td className="border p-2">{ticket.status}</td>
      <td className="border p-2">{new Date(ticket.created_date).toLocaleString()}</td>
      <td className="border p-2 flex space-x-2">
        <Link href={`tickets/${ticket.ticket_number}`} passHref>
          <span className="text-blue-500 hover:text-blue-700">
            <FaEye />
          </span>
        </Link>
        <FaTrash
          onClick={() => handleDelete(ticket.ticket_number)}
          className="text-red-500 cursor-pointer hover:text-red-700"
        />
      </td>
    </>
  );

  return (
    <div className="p-8 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Tickets List</h1>
      <Table columns={columns} data={tickets} renderRow={renderRow} />
    </div>
  );
};

export default TicketList;
