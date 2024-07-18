"use client";

import { useState, useEffect } from 'react';
import Input from '../../components/Input';
import Button from '../../components/Button';

interface AddPersonFormProps {
  onAdd: () => void;
}

interface Entity {
  _id: string;
  Name: string;
}

const AddPersonForm = ({ onAdd }: AddPersonFormProps) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    type_employee: 'internal',
    linked: 'No',
    linked_to: '',
    linked_to_id: '',
  });

  const [customers, setCustomers] = useState<Entity[]>([]);
  const [vendors, setVendors] = useState<Entity[]>([]);

  useEffect(() => {
    const fetchCustomersAndVendors = async () => {
      try {
        const customersResponse = await fetch('http://localhost:8000/customers');
        if (customersResponse.ok) {
          const customersData = await customersResponse.json();
          setCustomers(customersData.customers);
        } else {
          throw new Error('Failed to fetch customers');
        }

        const vendorsResponse = await fetch('http://localhost:8000/vendors');
        if (vendorsResponse.ok) {
          const vendorsData = await vendorsResponse.json();
          setVendors(vendorsData.vendors);
        } else {
          throw new Error('Failed to fetch vendors');
        }
      } catch (error) {
        console.error('Error fetching customers and vendors:', error);
      }
    };
    fetchCustomersAndVendors();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form Data:', formData);

    try {
      const response = await fetch('http://localhost:8000/person', {
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
          className="w-full p-2 border border-gray-300 rounded mt-1"
        >
          <option value="internal">Internal</option>
          <option value="external">External</option>
        </select>
      </div>
      <div>
        <label className="block text-gray-700">Linked</label>
        <select
          name="linked"
          value={formData.linked}
          onChange={handleChange}
          className="w-full p-2 border border-gray-300 rounded mt-1"
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
              value={formData.linked_to}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded mt-1"
            >
              <option value="">Select</option>
              <option value="Customer">Customer</option>
              <option value="Vendor">Vendor</option>
            </select>
          </div>
          {formData.linked_to === 'Customer' && (
            <div>
              <label className="block text-gray-700">Linked to ID</label>
              <select
                name="linked_to_id"
                value={formData.linked_to_id}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded mt-1"
              >
                <option value="">Select Customer</option>
                {customers.map((customer: Entity) => (
                  <option key={customer._id} value={customer.Name}>
                    {customer.Name}
                  </option>
                ))}
              </select>
            </div>
          )}
          {formData.linked_to === 'Vendor' && (
            <div>
              <label className="block text-gray-700">Linked to ID</label>
              <select
                name="linked_to_id"
                value={formData.linked_to_id}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded mt-1"
              >
                <option value="">Select Vendor</option>
                {vendors.map((vendor: Entity) => (
                  <option key={vendor._id} value={vendor.Name}>
                    {vendor.Name}
                  </option>
                ))}
              </select>
            </div>
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
