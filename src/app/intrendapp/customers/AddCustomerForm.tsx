"use client";

import { useState } from 'react';
import Input from '../../components/Input';
import Button from '../../components/Button';

interface AddCustomerFormProps {
  onAdd: () => void;
}

const AddCustomerForm = ({ onAdd }: AddCustomerFormProps) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    contact: '',
    state: '',
    country: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form Data:', formData);

    try {
      const response = await fetch('http://localhost:8000/customer', {
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
        console.error('Failed to add customer', errorData);
      }
    } catch (error) {
      console.error('Error adding customer:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Name"
        type="text"
        name="name"
        value={formData.name}
        onChange={handleChange}
        required
      />
      <Input
        label="Email"
        type="email"
        name="email"
        value={formData.email}
        onChange={handleChange}
        required
      />
      <Input
        label="Contact"
        type="text"
        name="contact"
        value={formData.contact}
        onChange={handleChange}
        required
      />
      <Input
        label="State"
        type="text"
        name="state"
        value={formData.state}
        onChange={handleChange}
        required
      />
      <Input
        label="Country"
        type="text"
        name="country"
        value={formData.country}
        onChange={handleChange}
        required
      />
      <Button type="submit" className="w-full">
        Add Customer
      </Button>
    </form>
  );
};

export default AddCustomerForm;
