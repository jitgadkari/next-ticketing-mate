"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { FaTrash } from 'react-icons/fa';

interface Ticket {
  _id: string;
  ticket_number: string;
  customer_name: string;
  status: string;
  created_date?: string;
  updated_date?: string;
}

export default function TicketDetailPage() {
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const params = useParams();
  const { id } = params;

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        console.log('Fetching ticket with ID:', id);
        const response = await fetch(`http://localhost:8000/ticket/${id}`);
        console.log(response);
        if (!response.ok) {
          throw new Error('Failed to fetch ticket data');
        }
        const data = await response.json();
        console.log('Received data:', data);
        setTicket(data.ticket || data);
      } catch (err) {
        setError('An error occurred while fetching the ticket data.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTicket();
  }, [id]);

  const handleDelete = async () => {
    try {
      const response = await fetch(`http://localhost:8000/ticket/?ticket_id=${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        router.push('/intrendapp/tickets');
      } else {
        console.error('Failed to delete ticket');
      }
    } catch (error) {
      console.error('Error deleting ticket:', error);
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8 text-red-500">Error: {error}</div>;
  if (!ticket) return <div className="p-8">No ticket found</div>;

  return (
    <div className="p-8 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Ticket Details</h1>
      <div className="space-y-4">
        <p><strong>ID:</strong> {ticket._id}</p>
        <p><strong>Ticket Number:</strong> {ticket.ticket_number}</p>
        <p><strong>Customer Name:</strong> {ticket.customer_name}</p>
        <p><strong>Status:</strong> {ticket.status}</p>
        {ticket.created_date && <p><strong>Created Date:</strong> {new Date(ticket.created_date).toLocaleString()}</p>}
        {ticket.updated_date && <p><strong>Updated Date:</strong> {new Date(ticket.updated_date).toLocaleString()}</p>}
      </div>
      <div className="mt-6 flex justify-between">
        <Link href="/intrendapp/tickets" className="p-2 bg-blue-500 text-white rounded hover:bg-blue-700">
          Back to Ticket List
        </Link>
        <button onClick={handleDelete} className="p-2 bg-red-500 text-white rounded hover:bg-red-700">
          <FaTrash className="inline-block mr-2" /> Delete
        </button>
      </div>
    </div>
  );
}
