"use client";

import { useState, useEffect } from 'react';
import Input from '../../components/Input';
import Button from '../../components/Button';

interface AddTicketFormProps {
  onAdd: () => void;
}

interface Customer {
  _id: string;
  name: string;
}

const AddTicketForm = ({ onAdd }: AddTicketFormProps) => {
  const [formData, setFormData] = useState({
    customer_name: '',
    message: '',
  });
  const [customers, setCustomers] = useState<Customer[]>([]);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_ENDPOINT_URL}/customers`);
        const data = await response.json();
        setCustomers(data.customers);
      } catch (error) {
        console.error('Error fetching customers:', error);
      }
    };
    fetchCustomers();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form Data:', formData);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_ENDPOINT_URL}/ticket`, {
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
      <label className="block">
        <span className="text-gray-700">Customer</span>
        <select
          name="customer_name"
          value={formData.customer_name}
          onChange={handleChange}
          className="mt-1 block w-full"
          required
        >
          <option value="" disabled>Select a customer</option>
          {customers.map((customer) => (
            <option key={customer._id} value={customer.name}>
              {customer.name}
            </option>
          ))}
        </select>
      </label>
      <Input
        label="Message"
        type="text"
        name="message"
        value={formData.message}
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
