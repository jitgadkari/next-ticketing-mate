"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Input from '../../../components/Input';
import Button from '../../../components/Button';

interface Customer {
  _id: string;
  name: string;
  fiber: string[];
  certifications: string[];
  approvals: string[];
  people: string[];
  state: string;
  country: string;
  contact: string;
  email: string;
  gst_number: string;
  delivery_destination: string[];
  delivery_terms: string[];
  pan_number: string;
  group: string;
}

const CustomerDetailsPage = () => {
  const { id } = useParams();

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    fiber: '',
    certifications: '',
    approvals: '',
    people: '',
    state: '',
    country: '',
    contact: '',
    email: '',
    gst_number: '',
    delivery_destination: '',
    delivery_terms: '',
    pan_number: '',
    group: '',
  });

  useEffect(() => {
    if (id) {
      const fetchCustomer = async () => {
        try {
          const response = await fetch(`http://localhost:8000/customer/${id}`);
          const data = await response.json();
          setCustomer(data.customer);
          setFormData({
            name: data.customer.name,
            fiber: data.customer.fiber.join(', '),
            certifications: data.customer.certifications.join(', '),
            approvals: data.customer.approvals.join(', '),
            people: data.customer.people.join(', '),
            state: data.customer.state,
            country: data.customer.country,
            contact: data.customer.contact,
            email: data.customer.email,
            gst_number: data.customer.gst_number,
            delivery_destination: data.customer.delivery_destination.join(', '),
            delivery_terms: data.customer.delivery_terms.join(', '),
            pan_number: data.customer.pan_number,
            group: data.customer.group,
          });
        } catch (error) {
          console.error('Error fetching customer:', error);
        }
      };
      fetchCustomer();
    }
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleUpdate = async () => {
    try {
      const response = await fetch(`http://localhost:8000/customer`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: customer?._id,
          update_dict: {
            ...formData,
            fiber: formData.fiber.split(',').map(item => item.trim()),
            certifications: formData.certifications.split(',').map(item => item.trim()),
            approvals: formData.approvals.split(',').map(item => item.trim()),
            people: formData.people.split(',').map(item => item.trim()),
            delivery_destination: formData.delivery_destination.split(',').map(item => item.trim()),
            delivery_terms: formData.delivery_terms.split(',').map(item => item.trim()),
          },
        }),
      });

      if (response.ok) {
        setEditMode(false);
        const updatedCustomer = await response.json();
        setCustomer(updatedCustomer.customer);
      } else {
        const errorData = await response.json();
        console.error('Failed to update customer', errorData);
      }
    } catch (error) {
      console.error('Error updating customer:', error);
    }
  };

  if (!customer) return <div>Loading...</div>;

  return (
    <div className="p-8 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Customer Details</h1>
      {editMode ? (
        <form className="space-y-4">
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
            label="People"
            type="text"
            name="people"
            value={formData.people}
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
          <Button type="button" onClick={handleUpdate} className="w-full">
            Update Customer
          </Button>
        </form>
      ) : (
        <div>
          <p><strong>Name:</strong> {customer.name}</p>
          <p><strong>Fiber:</strong> {customer.fiber.join(', ')}</p>
          <p><strong>Certifications:</strong> {customer.certifications.join(', ')}</p>
          <p><strong>Approvals:</strong> {customer.approvals.join(', ')}</p>
          <p><strong>People:</strong> {customer.people.join(', ')}</p>
          <p><strong>State:</strong> {customer.state}</p>
          <p><strong>Country:</strong> {customer.country}</p>
          <p><strong>Contact:</strong> {customer.contact}</p>
          <p><strong>Email:</strong> {customer.email}</p>
          <p><strong>GST Number:</strong> {customer.gst_number}</p>
          <p><strong>Delivery Destination:</strong> {customer.delivery_destination.join(', ')}</p>
          <p><strong>Delivery Terms:</strong> {customer.delivery_terms.join(', ')}</p>
          <p><strong>PAN Number:</strong> {customer.pan_number}</p>
          <p><strong>Group:</strong> {customer.group}</p>
          <Button type="button" onClick={() => setEditMode(true)} className="mt-4">
            Edit Customer
          </Button>
        </div>
      )}
    </div>
  );
};

export default CustomerDetailsPage;
