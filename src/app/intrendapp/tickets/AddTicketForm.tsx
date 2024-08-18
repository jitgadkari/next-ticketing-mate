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

interface Person {
  _id: string;
  name: string;
  email: string;
  phone: string;
}

const AddTicketForm = ({ onAdd }: AddTicketFormProps) => {
  const [formData, setFormData] = useState({
    customer_name: '',
    person_name: '',
    message: '',
  });
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [people, setPeople] = useState<Person[]>([]); // Initialize as an empty array

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

  useEffect(() => {
    if (formData.customer_name) {
      fetchPeople(formData.customer_name);
    } else {
      setPeople([]); // Reset people when no customer is selected
    }
  }, [formData.customer_name]);

  const fetchPeople = async (customerName: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_ENDPOINT_URL}/people/customer/?customer=${encodeURIComponent(customerName)}`);
      const data = await response.json();
      setPeople(data.person || []); // Use an empty array if data.person is undefined
    } catch (error) {
      console.error('Error fetching people:', error);
      setPeople([]); // Set to empty array in case of error
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
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
        // Reset form after successful submission
        setFormData({
          customer_name: '',
          person_name: '',
          message: '',
        });
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
      <div className="mb-4">
        <label htmlFor="customer_name" className="block text-gray-700 text-sm font-bold mb-2">
          Customer
        </label>
        <select
          id="customer_name"
          name="customer_name"
          value={formData.customer_name}
          onChange={handleChange}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          required
        >
          <option value="" disabled>Select a customer</option>
          {customers.map((customer) => (
            <option key={customer._id} value={customer.name}>
              {customer.name}
            </option>
          ))}
        </select>
      </div>
      {formData.customer_name && (
        <div className="mb-4">
          <label htmlFor="person_name" className="block text-gray-700 text-sm font-bold mb-2">
            Person
          </label>
          <select
            id="person_name"
            name="person_name"
            value={formData.person_name}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          >
            <option value="" disabled>Select a person</option>
            {people.length > 0 ? (
              people.map((person) => (
                <option key={person._id} value={person.name}>
                  {person.name}
                </option>
              ))
            ) : (
              <option disabled>No people available for this customer</option>
            )}
          </select>
        </div>
      )}
      <Input
        label="Message"
        type="textarea"
        name="message"
        value={formData.message}
        onChange={handleChange}
        required
      />
      <Button type="submit" className="w-full" disabled={!formData.customer_name || !formData.person_name}>
        Add Ticket
      </Button>
    </form>
  );
};

export default AddTicketForm;