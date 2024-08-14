"use client";

import React, { useState } from 'react';
import Input from '../../components/Input';
import Button from '../../components/Button';

interface AddVendorFormProps {
  onAdd: () => void;
}

const AddVendorForm: React.FC<AddVendorFormProps> = ({ onAdd }) => {
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
    const vendorData = {
      ...formData,
      fabric_type: [],
      width: [],
      content: [],
      type: [],
      certifications: [],
      approvals: [],
      weave: [],
      weave_type: [],
      designs: [],
      people: [],
      payment_terms: [],
      delivery_destination: '',
      delivery_terms: [],
      factory_location: "",
      state: '',
      gst_number: '',
      pan_number: '',
      group: '',
      address: '',
      remarks: '',
      additional_info: ''
    };

    try {
      const response = await fetch('http://localhost:8000/vendor/new/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(vendorData),
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
        console.error('Failed to add vendor', errorData);
        console.log('Sent vendor data:', vendorData);
      }
    } catch (error) {
      console.error('Error adding vendor:', error);
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
        Add Vendor
      </Button>
    </form>
  );
};

export default AddVendorForm;