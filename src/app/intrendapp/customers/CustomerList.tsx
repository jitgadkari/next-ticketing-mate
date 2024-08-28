"use client";

import Link from 'next/link';
import { FaEye, FaTrash } from 'react-icons/fa';
import Table from '../../components/Table';
import { Customer } from './page';
import { useState } from 'react';
import toast from 'react-hot-toast';
interface CustomerListProps{
  customers:Customer[],
  setCustomers:(customers:Customer[])=>void
}

const CustomerList = ({customers,setCustomers}:CustomerListProps) => {
  const [deleteCustomerId, setDeleteCustomerId] = useState<string | null>(null);


  const handleDelete = async (customerId: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_ENDPOINT_URL}/customer/${customerId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setCustomers(customers.filter(customer => customer._id !== customerId));
        setDeleteCustomerId(null);
        toast.success("Customer deleted successfully")
      } else {
        console.error('Failed to delete customer');
      }
    } catch (error) {
      console.error('Error deleting customer:', error);
    }
  };

  const columns = ['Name', 'Email', 'Contact', 'State', 'Country','Code', 'Actions'];

  const renderRow = (customer: Customer) => (
    <>
      <td className="border p-2">{customer.name}</td>
      <td className="border p-2">{customer.email}</td>
      <td className="border p-2 hidden md:table-cell">{customer.phone}</td>
      <td className="border p-2 hidden md:table-cell">{customer.state}</td>
      <td className="border p-2 hidden md:table-cell">{customer.country}</td>
      <td className="border p-2 hidden md:table-cell">{customer.code}</td>
      <td className="border p-2 ">
      <div className='h-full flex justify-center space-x-2'>
        <Link href={`customers/${customer._id}`} passHref>
          <span className="text-blue-500 hover:text-blue-700">
            <FaEye />
          </span>
        </Link>
        <FaTrash
         onClick={() => setDeleteCustomerId(customer._id)}
          className="text-red-500 cursor-pointer hover:text-red-700"
          />
          </div>
      </td>
    </>
  );

  return (
    <div className="p-8 bg-white rounded shadow text-black overflow-x-scroll">
      <h1 className="text-2xl font-bold mb-4">Customers List</h1>
      <Table columns={columns} data={customers} renderRow={renderRow} />
      {deleteCustomerId && (
        <dialog open className="p-5 bg-white rounded shadow-lg">
          <h2 className="text-xl font-bold mb-4">Confirm Delete</h2>
          <p>Are you sure you want to delete this customer?</p>
          <div className="flex justify-end mt-4">
            <button
              onClick={() => setDeleteCustomerId(null)}
              className="mr-2 bg-gray-300 hover:bg-gray-400 text-black font-bold py-2 px-4 rounded"
            >
              Cancel
            </button>
            <button
              onClick={() => handleDelete(deleteCustomerId)}
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
            >
              Delete
            </button>
          </div>
        </dialog>
      )}
    </div>
  );
};

export default CustomerList;
