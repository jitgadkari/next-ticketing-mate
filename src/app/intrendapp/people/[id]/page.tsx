"use client";

import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Input from '../../../components/Input';
import Button from '../../../components/Button';

interface Person {
  _id: string;
  name: string;
  phone: string;
  email: string;
  type_employee: string;
  linked: string;
  linked_to: string | null;
  linked_to_id: string | null;
}

interface Customer {
  _id: string;
  name: string;
}

interface Vendor {
  _id: string;
  name: string;
}

const PersonDetailsPage = () => {
  const router = useRouter();
  const { id } = useParams();
  const [person, setPerson] = useState<Person | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);

  useEffect(() => {
    if (id) {
      fetchPerson(id as string);
      fetchCustomers();
      fetchVendors();
    }
  }, [id]);

  const fetchPerson = async (personId: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_ENDPOINT_URL}/people/${personId}`);
      const data = await response.json();
      setPerson(data.person);
    } catch (error) {
      console.error('Error fetching person:', error);
    }
  };

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

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (person) {
      setPerson({ ...person, [name]: value });
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (person) {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_ENDPOINT_URL}/person`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name: person.name, update_dict: person }),
        });

        if (response.ok) {
          router.push('/intrendapp/people');
        } else {
          const errorData = await response.json();
          console.error('Failed to update person', errorData);
        }
      } catch (error) {
        console.error('Error updating person:', error);
      }
    }
  };

  if (!person) return <div>Loading...</div>;

  return (
    <div className="p-8 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Edit Person</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Name"
          type="text"
          name="name"
          value={person.name}
          onChange={handleChange}
          required
        />
        <Input
          label="Phone"
          type="text"
          name="phone"
          value={person.phone}
          onChange={handleChange}
          required
        />
        <Input
          label="Email"
          type="email"
          name="email"
          value={person.email}
          onChange={handleChange}
          required
        />
        <div>
          <label className="block text-gray-700">Type of Employee</label>
          <select
            name="type_employee"
            value={person.type_employee}
            onChange={handleChange}
            className="mt-1 block w-full"
            required
          >
            <option value="internal">Internal</option>
            <option value="external">External</option>
          </select>
        </div>
        {person.type_employee === 'external' && (
          <>
            <div>
              <label className="block text-gray-700">Linked</label>
              <select
                name="linked"
                value={person.linked}
                onChange={handleChange}
                className="mt-1 block w-full"
                required
              >
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
            </div>
            {person.linked === 'Yes' && (
              <div>
                <label className="block text-gray-700">Linked To</label>
                <select
                  name="linked_to"
                  value={person.linked_to || ''}
                  onChange={handleChange}
                  className="mt-1 block w-full"
                  required
                >
                  <option value="">Select...</option>
                  <option value="Vendor">Vendor</option>
                  <option value="Customer">Customer</option>
                </select>
              </div>
            )}
            {person.linked === 'Yes' && person.linked_to === 'Customer' && (
              <div>
                <label className="block text-gray-700">Customer</label>
                <select
                  name="linked_to_id"
                  value={person.linked_to_id || ''}
                  onChange={handleChange}
                  className="mt-1 block w-full"
                  required
                >
                  <option value="">Select...</option>
                  {customers.map((customer) => (
                    <option key={customer._id} value={customer._id}>
                      {customer.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            {person.linked === 'Yes' && person.linked_to === 'Vendor' && (
              <div>
                <label className="block text-gray-700">Vendor</label>
                <select
                  name="linked_to_id"
                  value={person.linked_to_id || ''}
                  onChange={handleChange}
                  className="mt-1 block w-full"
                  required
                >
                  <option value="">Select...</option>
                  {vendors.map((vendor) => (
                    <option key={vendor._id} value={vendor._id}>
                      {vendor.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </>
        )}
        <Button type="submit" className="w-full">
          Update Person
        </Button>
      </form>
    </div>
  );
};

export default PersonDetailsPage;
