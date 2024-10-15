"use client";
import React, { useState } from "react";
import { Customer } from "./page";
import Link from "next/link";
import { FaEye, FaTrash } from "react-icons/fa";
import toast from "react-hot-toast";
import { pageFilter, pageInfo } from "../people/page";
import Pagination from "@/app/components/Pagination";
interface CustomersMobileListProps {
  customers: Customer[];
  setCustomers: (customers: Customer[]) => void;
  pageFilter: pageFilter;
  pageInfo: pageInfo;
  onPrevious?: () => void;
  onNext?: () => void;
  onPageChange: (page: number) => void;

}

export default function CustomerMobileList({
  customers,
  setCustomers,
  pageFilter,
  pageInfo,
  onPrevious,
  onNext,
  onPageChange,
  
}: CustomersMobileListProps) {
  const [deleteCustomerId, setDeleteCustomerId] = useState<string | null>(null);

  const handleDelete = async (customerId: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/customer/${customerId}`,
        {
          method: "DELETE",
        }
      );
      if (response.ok) {
        setCustomers(
          customers.filter((customer) => customer._id !== customerId)
        );
        setDeleteCustomerId(null);
        toast.success("Customer deleted successfully")
      } else {
        console.error("Failed to delete customer");
      }
    } catch (error) {
      console.error("Error deleting customer:", error);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-4 md:hidden">
      {customers.map((customer) => (
        <div
          key={customer._id}
          className="bg-white text-black p-4 rounded-lg shadow-lg"
        >
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
                onClick={() => setDeleteCustomerId(customer._id)}
                className="text-red-500 cursor-pointer hover:text-red-700"
              />
            </div>
          </div>
        </div>
      ))}
      {deleteCustomerId && (
        <dialog open className="p-5 bg-white rounded shadow-lg fixed inset-0">
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
        <Pagination
        limit={pageFilter.limit}
        offset={pageFilter.offset}
        total_items={pageInfo.total_items}
        current_page={pageInfo.current_page}
        total_pages={pageInfo.total_pages}
        has_next={pageInfo.has_next}
        onPrevious={onPrevious}
        onNext={onNext}
        onPageChange={onPageChange}
      />
    </div>
  );
}
