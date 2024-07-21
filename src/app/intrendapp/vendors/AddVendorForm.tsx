"use client";

import { useState } from 'react';
import Input from '../../components/Input';
import Button from '../../components/Button';

interface AddVendorFormProps {
  onAdd: () => void;
}

const AddVendorForm = ({ onAdd }: AddVendorFormProps) => {
  const [formData, setFormData] = useState({
    name: '',
    fiber: '',
    width: '',
    content: '',
    type: '',
    certifications: '',
    approvals: '',
    weave: '',
    weave_type: '',
    designs: '',
    payment_terms: '',
    delivery_destination: '',
    delivery_terms: '',
    factory_location: '',
    state: '',
    contact: '',
    email: '',
    gst_number: '',
    pan_number: '',
    group: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form Data:', formData);

    try {
      const response = await fetch('http://localhost:8000/vendor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          fiber: formData.fiber.split(',').map(item => item.trim()),
          width: formData.width.split(',').map(item => item.trim()),
          content: formData.content.split(',').map(item => item.trim()),
          type: formData.type.split(',').map(item => item.trim()),
          certifications: formData.certifications.split(',').map(item => item.trim()),
          approvals: formData.approvals.split(',').map(item => item.trim()),
          weave: formData.weave.split(',').map(item => item.trim()),
          weave_type: formData.weave_type.split(',').map(item => item.trim()),
          designs: formData.designs.split(',').map(item => item.trim()),
          delivery_destination: formData.delivery_destination.split(',').map(item => item.trim()),
          delivery_terms: formData.delivery_terms.split(',').map(item => item.trim()),
        }),
      });

      if (response.ok) {
        onAdd();
      } else {
        const errorData = await response.json();
        console.error('Failed to add vendor', errorData);
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
        label="Fiber"
        type="text"
        name="fiber"
        value={formData.fiber}
        onChange={handleChange}
        required
      />
      <Input
        label="Width"
        type="text"
        name="width"
        value={formData.width}
        onChange={handleChange}
        required
      />
      <Input
        label="Content"
        type="text"
        name="content"
        value={formData.content}
        onChange={handleChange}
        required
      />
      <Input
        label="Type"
        type="text"
        name="type"
        value={formData.type}
        onChange={handleChange}
        required
      />
      <Input
        label="Certifications"
        type="text"
        name="certifications"
        value={formData.certifications}
        onChange={handleChange}
        required
      />
      <Input
        label="Approvals"
        type="text"
        name="approvals"
        value={formData.approvals}
        onChange={handleChange}
        required
      />
      <Input
        label="Weave"
        type="text"
        name="weave"
        value={formData.weave}
        onChange={handleChange}
        required
      />
      <Input
        label="Weave Type"
        type="text"
        name="weave_type"
        value={formData.weave_type}
        onChange={handleChange}
        required
      />
      <Input
        label="Designs"
        type="text"
        name="designs"
        value={formData.designs}
        onChange={handleChange}
        required
      />
      <Input
        label="Payment Terms"
        type="text"
        name="payment_terms"
        value={formData.payment_terms}
        onChange={handleChange}
        required
      />
      <Input
        label="Delivery Destination"
        type="text"
        name="delivery_destination"
        value={formData.delivery_destination}
        onChange={handleChange}
        required
      />
      <Input
        label="Delivery Terms"
        type="text"
        name="delivery_terms"
        value={formData.delivery_terms}
        onChange={handleChange}
        required
      />
      <Input
        label="Factory Location"
        type="text"
        name="factory_location"
        value={formData.factory_location}
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
        label="Contact"
        type="text"
        name="contact"
        value={formData.contact}
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
        label="GST Number"
        type="text"
        name="gst_number"
        value={formData.gst_number}
        onChange={handleChange}
        required
      />
      <Input
        label="PAN Number"
        type="text"
        name="pan_number"
        value={formData.pan_number}
        onChange={handleChange}
        required
      />
      <Input
        label="Group"
        type="text"
        name="group"
        value={formData.group}
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
