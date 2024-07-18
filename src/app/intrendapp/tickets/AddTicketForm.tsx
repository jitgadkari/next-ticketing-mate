"use client";

import { useState } from 'react';
import Input from '../../components/Input';
import Button from '../../components/Button';

interface AddTicketFormProps {
  onAdd: () => void;
}

const AddTicketForm = ({ onAdd }: AddTicketFormProps) => {
  const [formData, setFormData] = useState({
    ticket_number: '',
    customer_name: '',
    status: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form Data:', formData);

    try {
      const response = await fetch('http://localhost:8000/ticket', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        onAdd();
      } else {
        const errorData = await response.json();
        console.error('Failed to add ticket', errorData);
      }
    } catch (error) {
      console.error('Error adding ticket:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
        label="Status"
        type="text"
        name="status"
        value={formData.status}
        onChange={handleChange}
        required
      />
      <Button type="submit" className="w-full">
        Add Ticket
      </Button>
    </form>
  );
};

export default AddTicketForm;
