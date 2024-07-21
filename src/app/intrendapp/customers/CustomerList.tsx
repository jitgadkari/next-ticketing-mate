"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaEye, FaTrash } from 'react-icons/fa';
import Table from '../../components/Table';

interface Customer {
  _id: string;
  name: string;
  email: string;
  contact: string;
  state: string;
  country: string;
}

const CustomerList = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_ENDPOINT_URL}/customers`);
        const data = await response.json();
        setCustomers(data.customers);
      } catch (error) {
        console.error('Error fetching customers:', error);
      }
    };
    fetchCustomers();
  }, []);

  const handleDelete = async (customerId: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_ENDPOINT_URL}/customer/${customerId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setCustomers(customers.filter(customer => customer._id !== customerId));
      } else {
        console.error('Failed to delete customer');
      }
    } catch (error) {
      console.error('Error deleting customer:', error);
    }
  };

  const columns = ['Name', 'Email', 'Contact', 'State', 'Country', 'Actions'];

  const renderRow = (customer: Customer) => (
    <>
      <td className="border p-2">{customer.name}</td>
      <td className="border p-2">{customer.email}</td>
      <td className="border p-2">{customer.contact}</td>
      <td className="border p-2">{customer.state}</td>
      <td className="border p-2">{customer.country}</td>
      <td className="border p-2 flex justify-center space-x-2">
        <Link href={`customers/${customer._id}`} passHref>
          <span className="text-blue-500 hover:text-blue-700">
            <FaEye />
          </span>
        </Link>
        <FaTrash
          onClick={() => handleDelete(customer._id)}
          className="text-red-500 cursor-pointer hover:text-red-700"
        />
      </td>
    </>
  );

  return (
    <div className="p-8 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Customers List</h1>
      <Table columns={columns} data={customers} renderRow={renderRow} />
    </div>
  );
};

export default CustomerList;
