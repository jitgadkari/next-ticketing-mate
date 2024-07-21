"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Input from '../../../components/Input';
import Button from '../../../components/Button';

interface Ticket {
  _id: string;
  ticket_number: string;
  customer_name: string;
  current_step: string;
  created_date: string;
  updated_date: string;
  steps: {
    [key: string]: string | object | string[] | object[];
  };
}

const TicketDetailsPage = () => {
  const { id } = useParams();

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    ticket_number: '',
    customer_name: '',
    current_step: '',
    created_date: '',
    updated_date: '',
    steps: {},
  });

  useEffect(() => {
    if (id) {
      const fetchTicket = async () => {
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_ENDPOINT_URL}/ticket/${id}`);
          const data = await response.json();
          setTicket({
            _id: data.ticket._id,
            ticket_number: data.ticket.ticket_number,
            customer_name: data.ticket['customer Name'],
            current_step: data.ticket.current_step,
            created_date: data.ticket.created_data,
            updated_date: data.ticket.updated_date,
            steps: data.ticket.steps,
          });
          setFormData({
            ticket_number: data.ticket.ticket_number,
            customer_name: data.ticket['customer Name'],
            current_step: data.ticket.current_step,
            created_date: data.ticket.created_data,
            updated_date: data.ticket.updated_date,
            steps: data.ticket.steps,
          });
        } catch (error) {
          console.error('Error fetching ticket:', error);
        }
      };
      fetchTicket();
    }
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleUpdate = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_ENDPOINT_URL}/ticket`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ticket_number: ticket?.ticket_number,
          update_dict: formData,
        }),
      });

      if (response.ok) {
        setEditMode(false);
        const updatedTicket = await response.json();
        setTicket(updatedTicket.ticket);
      } else {
        const errorData = await response.json();
        console.error('Failed to update ticket', errorData);
      }
    } catch (error) {
      console.error('Error updating ticket:', error);
    }
  };

  if (!ticket) return <div>Loading...</div>;

  return (
    <div className="p-8 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Ticket Details</h1>
      {editMode ? (
        <form className="space-y-4">
          <Input
            label="Ticket Number"
            type="text"
            name="ticket_number"
            value={formData.ticket_number}
            onChange={handleChange}
            required
          />
          <Input
            label="Customer Name"
            type="text"
            name="customer_name"
            value={formData.customer_name}
            onChange={handleChange}
            required
          />
          <Input
            label="Current Step"
            type="text"
            name="current_step"
            value={formData.current_step}
            onChange={handleChange}
            required
          />
          <Input
            label="Created Date"
            type="text"
            name="created_date"
            value={formData.created_date}
            onChange={handleChange}
            required
          />
          <Input
            label="Updated Date"
            type="text"
            name="updated_date"
            value={formData.updated_date}
            onChange={handleChange}
            required
          />
          <Input
            label="Steps"
            type="text"
            name="steps"
            value={JSON.stringify(formData.steps)}
            onChange={handleChange}
            required
          />
          <Button type="button" onClick={handleUpdate} className="w-full">
            Update Ticket
          </Button>
        </form>
      ) : (
        <div>
          <p><strong>Ticket Number:</strong> {ticket.ticket_number}</p>
          <p><strong>Customer Name:</strong> {ticket.customer_name}</p>
          <p><strong>Current Step:</strong> {ticket.current_step}</p>
          <p><strong>Created Date:</strong> {ticket.created_date}</p>
          <p><strong>Updated Date:</strong> {ticket.updated_date}</p>
          <p><strong>Steps:</strong> {JSON.stringify(ticket.steps, null, 2)}</p>
          <Button type="button" onClick={() => setEditMode(true)} className="mt-4">
            Edit Ticket
          </Button>
        </div>
      )}
    </div>
  );
};

export default TicketDetailsPage;
