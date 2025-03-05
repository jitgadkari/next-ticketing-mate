"use client";
import React, { useState, useEffect } from "react";
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

interface FilterState {
  name: string;
  state: string;
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
  const [filters, setFilters] = useState<FilterState>({ name: "", state: "" });
  const [allCustomers, setAllCustomers] = useState<Customer[]>([]);
  const [availableStates, setAvailableStates] = useState<string[]>([]);
  const [showFilter, setShowFilter] = useState<boolean>(false);

  // Fetch all customers
  useEffect(() => {
    const fetchAllCustomers = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/customers`
        );
        if (response.ok) {
          const data = await response.json();
          setAllCustomers(data.customers as Customer[]);
          setCustomers((data.customers as Customer[]).slice(0, pageFilter.limit));
          const states = Array.from(
            new Set((data.customers as Customer[]).map((customer: Customer) => customer.state))
          ).filter(Boolean);
          setAvailableStates(states);
        } else {
          toast.error("Failed to fetch customers");
        }
      } catch (error) {
        console.error("Error fetching customers:", error);
      }
    };

    fetchAllCustomers();
  }, [pageFilter.limit, setCustomers]);

  // Apply filters to customers
  useEffect(() => {
    const filteredCustomers = allCustomers.filter((customer) => {
      const matchesName = customer.name
        .toLowerCase()
        .includes(filters.name.toLowerCase());
      const matchesState = filters.state
        ? customer.state === filters.state
        : true;
      return matchesName && matchesState;
    });
    setCustomers(filteredCustomers.slice(0, pageFilter.limit));
  }, [filters, allCustomers, pageFilter.limit, setCustomers]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

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
          customers.filter((customer) => customer.id !== customerId)
        );
        setDeleteCustomerId(null);
        toast.success("Customer deleted successfully");
      } else {
        toast.error("Failed to delete customer");
      }
    } catch (error) {
      console.error("Error deleting customer:", error);
      toast.error("An error occurred while deleting the customer");
    }
  };

  return (
    <div className="grid grid-cols-1 gap-4 md:hidden">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Customer List</h1>
        <button
          onClick={() => setShowFilter(!showFilter)}
          className="bg-blue-600 text-white font-bold py-2 px-4 rounded hover:bg-blue-700"
        >
          {showFilter ? "Hide Filter" : "Show Filter"}
        </button>
      </div>

      {showFilter && (
        <div className="mb-4">
          <input
            type="text"
            name="name"
            value={filters.name}
            onChange={handleFilterChange}
            placeholder="Search by Name"
            className="p-2 w-full border rounded mb-2"
          />
          <select
            name="state"
            value={filters.state}
            onChange={handleFilterChange}
            className="w-full p-2 border rounded"
          >
            <option value="">All States</option>
            {availableStates.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
        </div>
      )}

      {customers.map((customer) => (
        <div
          key={customer.id}
          className="bg-white text-black p-4 rounded-lg shadow-lg"
        >
          <div className="flex flex-col space-y-4 text-sm w-full">
            <div className="flex justify-between items-center">
              <span className="font-semibold">Name:</span>
              <span>{customer.name}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-semibold">Email:</span>
              <span>{customer.email}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-semibold">Phone:</span>
              <span>{customer.phone}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-semibold">Country:</span>
              <span>{customer.country}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-semibold">State:</span>
              <span>{customer.state}</span>
            </div>
            <div className="flex justify-end space-x-4">
              <Link href={`customers/${customer.id}`} passHref>
                <span className="text-blue-500 hover:text-blue-700">
                  <FaEye />
                </span>
              </Link>
              <FaTrash
                onClick={() => setDeleteCustomerId(customer.id)}
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
