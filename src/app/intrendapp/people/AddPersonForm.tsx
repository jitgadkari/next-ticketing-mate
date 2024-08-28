"use client";

import React, { useEffect, useState } from 'react';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { Customer } from '../customers/page';
import { Vendor } from '../vendors/page';
import toast from 'react-hot-toast';

interface AddPersonFormProps {
  onAdd: () => void;
}

interface FormData {
  name: string;
  phone: string;
  email: string;
  type_employee: string;
  linked: string;
  linked_to: string | null;
  linked_to_id: string | null;
}

const AddPersonForm: React.FC<AddPersonFormProps> = ({ onAdd }) => {

  const [formData, setFormData] = useState<FormData>({
    name: '',
    phone: '',
    email: '',
    type_employee: 'Internal',
    linked: 'No',
    linked_to: "Null",
    linked_to_id: "Null",
  });

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);

  useEffect(() => {
    if (formData.linked_to === 'Customer') {
      fetchCustomers();
    } else if (formData.linked_to === 'Vendor') {
      fetchVendors();
    }
  }, [formData.linked_to]);
  const fetchCustomers = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_ENDPOINT_URL}/customers`);
      const data = await response.json();
      setCustomers(data.customers);
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const fetchVendors = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_ENDPOINT_URL}/vendors`);
      const data = await response.json();
      setVendors(data.vendors);
    } catch (error) {
      console.error('Error fetching vendors:', error);
    }
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>): void => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value,
      ...(name === 'type_employee' && value === 'Internal' ? { linked: 'No', linked_to: null, linked_to_id: null } : {}),
    }));
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    const fromNumberRegex = /^91.*@u\.cs$/;
    if (!fromNumberRegex.test(formData.phone)) {
      toast.error("Invalid 'From Number'. It should start with '91' and end with '@u.cs'");
      return; 
    }
    const submitData = {
      ...formData,
      linked: formData.type_employee === 'External' ? formData.linked : 'No',
      linked_to: formData.type_employee === 'External' && formData.linked === 'Yes' ? formData.linked_to : null,
      linked_to_id: formData.type_employee === 'External' && formData.linked === 'Yes' ? formData.linked_to_id : null,
    };

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_ENDPOINT_URL}/person`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      if (response.ok) {
        onAdd();
        toast.success("Person added successfully");
      } else {
        const errorData = await response.json();
        console.error('Failed to add person', errorData);
      }
    } catch (error) {
      console.error('Error adding person:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-black">
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
      <div >
        <label className="block text-gray-700">Type of Employee</label>
        <select
          name="type_employee"
          value={formData.type_employee}
          onChange={handleChange}
          className="mt-1 block w-full"
          required
        >
          <option value="Internal">Internal</option>
          <option value="External">External</option>
        </select>
      </div>
      {formData.type_employee === 'External' && (
        <>
          <div>
            <label className="block text-gray-700">Linked</label>
            <select
              name="linked"
              value={formData.linked}
              onChange={handleChange}
              className="mt-1 block w-full"
              required
            >
              <option value="No">No</option>
              <option value="Yes">Yes</option>
            </select>
          </div>
          {formData.linked === 'Yes' && (
            <>
              <div>
                <label className="block text-gray-700">Linked To</label>
                <select
                  name="linked_to"
                  value={formData.linked_to || ''}
                  onChange={handleChange}
                  className="mt-1 block w-full"
                  required
                >
                  <option value="">Select...</option>
                  <option value="Vendor">Vendor</option>
                  <option value="Customer">Customer</option>
                </select>
              </div>
              {formData.linked_to && (
                <div>
                  <label className="block text-gray-700">{`${formData.linked_to} ID`}</label>
                  <select
                    name="linked_to_id"
                    value={formData.linked_to_id || ''}
                    onChange={handleChange}
                    className="mt-1 block w-full"
                    required
                  >
                    <option value="">Select...</option>
                    {(formData.linked_to === 'Customer' ? customers : vendors).map((option) => (
                      <option key={option._id} value={option.name}>
                        {option.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </>
          )}
        </>
      )}
      <Button type="submit" className="w-full">
        Add Person
      </Button>
    </form>
  );
};

export default AddPersonForm;