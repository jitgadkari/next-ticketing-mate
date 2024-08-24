import React from "react";
import { Customer } from "./page";
import Link from "next/link";
import { FaEye, FaTrash } from "react-icons/fa";
interface CustomersMobileListProps {
  customers: Customer[];
  setCustomers: (customers: Customer[]) => void;
}

export default function CustomerMobileList({
  customers,
  setCustomers,
}: CustomersMobileListProps) {

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

  return (
    <div className="grid grid-cols-1 gap-4 md:hidden">
    {customers.map((customer) => (
      <div key={customer._id} className="bg-white text-black p-4 rounded-lg shadow-lg">
        <div className="flex flex-col space-y-4 text-sm w-full">
          
          <div className="flex justify-between items-center">
            <div className="flex">
              <span className="font-semibold mr-2">Name:</span>
              <span>{customer.name}</span>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex">
              <span className="font-semibold mr-2">Email:</span>
              <span>{customer.email}</span>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex">
              <span className="font-semibold mr-2">Phone:</span>
              <span>{customer.phone}</span>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex">
              <span className="font-semibold mr-2">Country:</span>
              <span>{customer.country}</span>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex">
              <span className="font-semibold mr-2">State:</span>
              <span>{customer.state}</span>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex">
              <span className="font-semibold mr-2">Code:</span>
              <span>{customer.code}</span>
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <Link href={`customers/${customer._id}`} passHref>
              <span className="text-blue-500 hover:text-blue-700">
                <FaEye />
              </span>
            </Link>
            <FaTrash
              onClick={() => handleDelete(customer._id)}
              className="text-red-500 cursor-pointer hover:text-red-700"
            />
          </div>
          
        </div>
      </div>
    ))}
  </div>
  
  );
}
