"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaEye, FaTrash } from 'react-icons/fa';
import Button from '../../components/Button';
import Table from '../../components/Table';

interface Customer {
  _id: string;
  Name: string;
  Email: string;
  Contact: string;
  State: string;
  Country: string;
}

const CustomerList = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await fetch('http://localhost:8000/customers');
        const data = await response.json();
        setCustomers(data.customers);
      } catch (error) {
        console.error('Error fetching customers:', error);
      }
    };
    fetchCustomers();
  }, []);

  const handleDelete = async (customer_id: string) => {
    try {
      const response = await fetch(`http://localhost:8000/customer/?customer_id=${customer_id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setCustomers(customers.filter(customer => customer._id !== customer_id));
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
      <td className="border p-2">{customer.Name}</td>
      <td className="border p-2">{customer.Email}</td>
      <td className="border p-2">{customer.Contact}</td>
      <td className="border p-2">{customer.State}</td>
      <td className="border p-2">{customer.Country}</td>
      <td className="border p-2 flex space-x-2">
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
