"use client";

import { useState } from 'react';
import Input from '../../components/Input';
import Button from '../../components/Button';

interface AddPersonFormProps {
  onAdd: () => void;
}

const AddPersonForm = ({ onAdd }: AddPersonFormProps) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    type_employee: 'internal', // default to internal
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form Data:', formData);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_ENDPOINT_URL}/person`, {
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
        console.error('Failed to add person', errorData);
      }
    } catch (error) {
      console.error('Error adding person:', error);
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
        label="Phone"
        type="text"
        name="phone"
        value={formData.phone}
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
      <div>
        <label className="block text-gray-700">Type of Employee</label>
        <select
          name="type_employee"
          value={formData.type_employee}
          onChange={handleChange}
          className="mt-1 block w-full"
          required
        >
          <option value="internal">Internal</option>
          <option value="external">External</option>
        </select>
      </div>
      <Button type="submit" className="w-full">
        Add Person
      </Button>
    </form>
  );
};

export default AddPersonForm;
