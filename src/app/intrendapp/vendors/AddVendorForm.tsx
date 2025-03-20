"use client";

import React, { useState, useEffect, ChangeEvent } from 'react';
import Input from '../../components/Input';
import Button from '../../components/Button';
import toast from 'react-hot-toast';

interface AddVendorFormProps {
  onAdd: () => void;
}

interface Attributes {
  group: Record<string, string>;
  fabric_type: string[];
  width: string[];
  content: string[];
  type: string[];
  certifications: string[];
  approvals: string[];
  weave: string[];
  weave_type: string[];
  designs: string[];
  payment_terms: string[];
  delivery_terms: string[];
}

const AddVendorForm: React.FC<AddVendorFormProps> = ({ onAdd }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    code:'',
    // fabric_type: [],
    // width: [],
    // content: [],
    // type: [],
    // certifications: [],
    // approvals: [],
    // weave: [],
    // weave_type: [],
    // designs: [],
    // people: [],
    // payment_terms: [],
    // delivery_destination: '',
    // delivery_terms: [],
    // factory_location: '',
    state: '',
    // gst_number: '',
    // pan_number: '',
    // group: '',
    // address: '',
    // remarks: '',
    // additional_info: '',
    country:''
  });

  const [defaultAttributes, setDefaultAttributes] = useState<Attributes | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDefaultAttributes();
  }, []);

  const fetchDefaultAttributes = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_ENDPOINT_URL}/api/attributes`);
      if (!response.ok) {
        throw new Error('Failed to fetch default attributes');
      }
      const data = await response.json();
      setDefaultAttributes(data.attributes.DefaultAttributes);
    } catch (error) {
      console.error('Error fetching default attributes:', error);
      setError('Failed to load default attributes. Please try again later.');
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prevData => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.name || !formData.email || !formData.phone || !formData.code || !formData.state) {
      setError('Please fill in all required fields.');
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_ENDPOINT_URL}/api/vendors/new?userId=1&userAgent=user-test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        onAdd();
        // Clear form after successful submission
        setFormData({
          name: '',
          email: '',
          phone: '',
          code:'',
          // fabric_type: [],
          // width: [],
          // content: [],
          // type: [],
          // certifications: [],
          // approvals: [],
          // weave: [],
          // weave_type: [],
          // designs: [],
          // people: [],
          // payment_terms: [],
          // delivery_destination: '',
          // delivery_terms: [],
          // factory_location: '',
          state: '',
          // gst_number: '',
          // pan_number: '',
          // group: '',
          // address: '',
          // remarks: '',
          // additional_info: '',
          country:''
        });
        toast.success("Vendor added successfully")
      } else {
        const errorData = await response.json();
        console.error('Failed to add vendor', errorData);
        setError('Failed to add vendor. Please try again.');
      }
    } catch (error) {
      console.error('Error adding vendor:', error);
      setError('An unexpected error occurred. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-black">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}
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
      <Input
        label="Code"
        type="text"
        name="code"
        value={formData.code}
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
      {/* <div>
        <label htmlFor="group" className="block text-sm font-medium text-gray-700">
          Group
        </label>
        <select
          id="group"
          name="group"
          value={formData.group}
          onChange={handleChange}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
        >
          <option value="">Select a group</option>
          {defaultAttributes && Object.entries(defaultAttributes.group).map(([key, value]) => (
            <option key={key} value={key}>
              {key}: {value}
            </option>
          ))}
        </select>
      </div> */}
      <Button type="submit" className="w-full">
        Add Vendor
      </Button>
    </form>
  );
};

export default AddVendorForm;