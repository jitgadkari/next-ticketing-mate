"use client";

import React, { useState } from 'react';
import Input from '../../components/Input';
import Button from '../../components/Button';

interface AddCustomerFormProps {
  onAdd: () => void;
}

const AddCustomerForm: React.FC<AddCustomerFormProps> = ({ onAdd }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
};

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form Data:', formData);

    // Prepare the data to send to the server
    const customerData = {
      ...formData,
      fabric_type: [],
      certifications: [],
      approvals: [],
      people: [],
      state: '',
      country: '',
      gst_number: '',
      delivery_destination: '',
      delivery_terms: [],
      payment_terms: [],
      pan_number: '',
      group: '',
      address: '',
      remarks: '',
      additional_info: ''
    };

    try {
      const response = await fetch('http://localhost:8000/customer/new/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(customerData),
      });

      if (response.ok) {
        onAdd();
        // Clear form after successful submission
        setFormData({
          name: '',
          email: '',
          phone: ''
        });
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
        label="Phone"
        type="tel"
        name="phone"
        value={formData.phone}
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