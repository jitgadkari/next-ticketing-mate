"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { FaTrash } from 'react-icons/fa';

interface Customer {
  _id: string;
  Name: string;
  Email: string;
  Contact: string;
  State: string;
  Country: string;
  created_date?: string;
  updated_date?: string;
}

export default function CustomerDetailPage() {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const params = useParams();
  const { id } = params;

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        console.log('Fetching customer with ID:', id);
        const response = await fetch(`http://localhost:8000/customer/${id}`);
        console.log(response);
        if (!response.ok) {
          throw new Error('Failed to fetch customer data');
        }
        const data = await response.json();
        console.log('Received data:', data);
        setCustomer(data.customer || data);
      } catch (err) {
        setError('An error occurred while fetching the customer data.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomer();
  }, [id]);

  const handleDelete = async () => {
    try {
      const response = await fetch(`http://localhost:8000/customer/?customer_id=${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        router.push('/intrendapp/customers');
      } else {
        console.error('Failed to delete customer');
      }
    } catch (error) {
      console.error('Error deleting customer:', error);
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8 text-red-500">Error: {error}</div>;
  if (!customer) return <div className="p-8">No customer found</div>;

  return (
    <div className="p-8 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Customer Details</h1>
      <div className="space-y-4">
        <p><strong>ID:</strong> {customer._id}</p>
        <p><strong>Name:</strong> {customer.Name}</p>
        <p><strong>Email:</strong> {customer.Email}</p>
        <p><strong>Contact:</strong> {customer.Contact}</p>
        <p><strong>State:</strong> {customer.State}</p>
        <p><strong>Country:</strong> {customer.Country}</p>
        {customer.created_date && <p><strong>Created Date:</strong> {new Date(customer.created_date).toLocaleString()}</p>}
        {customer.updated_date && <p><strong>Updated Date:</strong> {new Date(customer.updated_date).toLocaleString()}</p>}
      </div>
      <div className="mt-6 flex justify-between">
        <Link href="/intrendapp/customers" className="p-2 bg-blue-500 text-white rounded hover:bg-blue-700">
          Back to Customer List
        </Link>
        <button onClick={handleDelete} className="p-2 bg-red-500 text-white rounded hover:bg-red-700">
          <FaTrash className="inline-block mr-2" /> Delete
        </button>
      </div>
    </div>
  );
}
