"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Input from '../../../components/Input';
import Button from '../../../components/Button';
import { FaEdit } from 'react-icons/fa';

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

const PersonDetailsPage: React.FC = () => {
  const router = useRouter();
  const { id } = useParams();
  const [person, setPerson] = useState<Person | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);

  useEffect(() => {
    if (id) {
      fetchPerson(id as string);
      fetchCustomers();
      fetchVendors();
    }
  }, [id]);

  const fetchPerson = async (personId: string): Promise<void> => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_ENDPOINT_URL}/people/${personId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch person');
      }
      const data = await response.json();
      setPerson(data.person);
    } catch (error) {
      console.error('Error fetching person:', error);
    }
  };

  const fetchCustomers = async (): Promise<void> => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_ENDPOINT_URL}/customers`);
      if (!response.ok) {
        throw new Error('Failed to fetch customers');
      }
      const data = await response.json();
      setCustomers(data.customers);
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const fetchVendors = async (): Promise<void> => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_ENDPOINT_URL}/vendors`);
      if (!response.ok) {
        throw new Error('Failed to fetch vendors');
      }
      const data = await response.json();
      setVendors(data.vendors);
    } catch (error) {
      console.error('Error fetching vendors:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>): void => {
    if (person) {
      const { name, value } = e.target;
      setPerson(prevPerson => {
        if (!prevPerson) return null;
        const updatedPerson = { ...prevPerson, [name]: value };

        // Reset linked fields when type_employee changes
        if (name === 'type_employee' && value === 'Internal') {
          updatedPerson.linked = 'No';
          updatedPerson.linked_to = null;
          updatedPerson.linked_to_id = null;
        }

        // Reset linked_to and linked_to_id when linked changes
        if (name === 'linked' && value === 'No') {
          updatedPerson.linked_to = null;
          updatedPerson.linked_to_id = null;
        }

        // Reset linked_to_id when linked_to changes
        if (name === 'linked_to') {
          updatedPerson.linked_to_id = null;
        }

        return updatedPerson;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (person) {
      try {
        console.log('person: ', person);
        const response = await fetch(`${process.env.NEXT_PUBLIC_ENDPOINT_URL}/person`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name: person.name, update_dict: person }),
        });

        if (response.ok) {
          setIsEditing(false);
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
    <div className="p-8 bg-white rounded shadow text-black">
      <h1 className="text-2xl font-bold mb-4">Person Details</h1>
      { !isEditing &&<div className='flex justify-end items-center' onClick={() => setIsEditing(true)} > <FaEdit className='text-blue-500 text-2xl' /></div>}
      {!isEditing ? (
        <>
          <div className="space-y-4 text-black">
          <div className="grid grid-cols-2 gap-4">
            <p><strong>Name:</strong> {person.name}</p>
            <p><strong>Phone:</strong> {person.phone}</p>
            <p><strong>Email:</strong> {person.email}</p>
            <p><strong>Type of Employee:</strong> {person.type_employee}</p>
            <p><strong>Linked:</strong> {person.linked}</p>
            {person.linked === 'Yes' && (
              <>
                <p><strong>Linked To:</strong> {person.linked_to}</p>
                <p><strong>Linked To ID:</strong> {person.linked_to_id}</p>
              </>
            )}
          </div>
          </div>
        </>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Name"
            type="text"
            name="name"
            value={person.name}
            onChange={() => {}} // No-op function
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
              <option value="Internal">Internal</option>
              <option value="External">External</option>
            </select>
          </div>
          {person.type_employee === 'External' && (
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
                <>
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
                  {person.linked_to && (
                    <div>
                      <label className="block text-gray-700">{person.linked_to} ID</label>
                      <select
                        name="linked_to_id"
                        value={person.linked_to_id || ''}
                        onChange={handleChange}
                        className="mt-1 block w-full"
                        required
                      >
                        <option value="">Select...</option>
                        {person.linked_to === 'Customer'
                          ? customers.map((customer) => (
                              <option key={customer.name} value={customer.name}>
                                {customer.name}
                              </option>
                            ))
                          : vendors.map((vendor) => (
                              <option key={vendor.name} value={vendor.name}>
                                {vendor.name}
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
            Update Person
          </Button>
        </form>
      )}
    </div>
  );
};

export default PersonDetailsPage;