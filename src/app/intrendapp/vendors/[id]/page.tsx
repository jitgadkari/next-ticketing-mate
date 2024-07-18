"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { FaTrash } from 'react-icons/fa';

interface Vendor {
  _id: string;
  Name: string;
  Email: string;
  Contact: string;
  State: string;
  Country: string;
  created_date?: string;
  updated_date?: string;
}

export default function VendorDetailPage() {
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const params = useParams();
  const { id } = params;

  useEffect(() => {
    const fetchVendor = async () => {
      try {
        console.log('Fetching vendor with ID:', id);
        const response = await fetch(`http://localhost:8000/vendor/${id}`);
        console.log(response);
        if (!response.ok) {
          throw new Error('Failed to fetch vendor data');
        }
        const data = await response.json();
        console.log('Received data:', data);
        setVendor(data.vendor || data);
      } catch (err) {
        setError('An error occurred while fetching the vendor data.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchVendor();
  }, [id]);

  const handleDelete = async () => {
    try {
      const response = await fetch(`http://localhost:8000/vendor/?vendor_id=${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        router.push('/intrendapp/vendors');
      } else {
        console.error('Failed to delete vendor');
      }
    } catch (error) {
      console.error('Error deleting vendor:', error);
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8 text-red-500">Error: {error}</div>;
  if (!vendor) return <div className="p-8">No vendor found</div>;

  return (
    <div className="p-8 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Vendor Details</h1>
      <div className="space-y-4">
        <p><strong>ID:</strong> {vendor._id}</p>
        <p><strong>Name:</strong> {vendor.Name}</p>
        <p><strong>Email:</strong> {vendor.Email}</p>
        <p><strong>Contact:</strong> {vendor.Contact}</p>
        <p><strong>State:</strong> {vendor.State}</p>
        <p><strong>Country:</strong> {vendor.Country}</p>
        {vendor.created_date && <p><strong>Created Date:</strong> {new Date(vendor.created_date).toLocaleString()}</p>}
        {vendor.updated_date && <p><strong>Updated Date:</strong> {new Date(vendor.updated_date).toLocaleString()}</p>}
      </div>
      <div className="mt-6 flex justify-between">
        <Link href="/intrendapp/vendors" className="p-2 bg-blue-500 text-white rounded hover:bg-blue-700">
          Back to Vendor List
        </Link>
        <button onClick={handleDelete} className="p-2 bg-red-500 text-white rounded hover:bg-red-700">
          <FaTrash className="inline-block mr-2" /> Delete
        </button>
      </div>
    </div>
  );
}
