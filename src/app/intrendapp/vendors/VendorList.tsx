"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaEye, FaTrash } from 'react-icons/fa';
import Button from '../../components/Button';
import Table from '../../components/Table';

interface Vendor {
  _id: string;
  Name: string;
  Email: string;
  Contact: string;
  State: string;
  Country: string;
}

const VendorList = () => {
  const [vendors, setVendors] = useState<Vendor[]>([]);

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const response = await fetch('http://localhost:8000/vendors');
        const data = await response.json();
        setVendors(data.vendors);
      } catch (error) {
        console.error('Error fetching vendors:', error);
      }
    };
    fetchVendors();
  }, []);

  const handleDelete = async (vendor_id: string) => {
    try {
      const response = await fetch(`http://localhost:8000/vendor/?vendor_id=${vendor_id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setVendors(vendors.filter(vendor => vendor._id !== vendor_id));
      } else {
        console.error('Failed to delete vendor');
      }
    } catch (error) {
      console.error('Error deleting vendor:', error);
    }
  };

  const columns = ['Name', 'Email', 'Contact', 'State', 'Country', 'Actions'];

  const renderRow = (vendor: Vendor) => (
    <>
      <td className="border p-2">{vendor.Name}</td>
      <td className="border p-2">{vendor.Email}</td>
      <td className="border p-2">{vendor.Contact}</td>
      <td className="border p-2">{vendor.State}</td>
      <td className="border p-2">{vendor.Country}</td>
      <td className="border p-2 flex space-x-2">
        <Link href={`vendors/${vendor._id}`} passHref>
          <span className="text-blue-500 hover:text-blue-700">
            <FaEye />
          </span>
        </Link>
        <FaTrash
          onClick={() => handleDelete(vendor._id)}
          className="text-red-500 cursor-pointer hover:text-red-700"
        />
      </td>
    </>
  );

  return (
    <div className="p-8 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Vendors List</h1>
      <Table columns={columns} data={vendors} renderRow={renderRow} />
    </div>
  );
};

export default VendorList;
