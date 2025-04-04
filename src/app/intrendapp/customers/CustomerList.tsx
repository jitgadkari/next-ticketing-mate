"use client";

import Link from "next/link";
import { FaEye, FaTrash } from "react-icons/fa";
import Table from "../../components/Table";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { pageFilter, pageInfo } from "../people/page";
import Pagination from "@/app/components/Pagination";
import { MdOutlineFolderDelete } from "react-icons/md";
import { getUserData, isAuthenticated } from "@/utils/auth";

interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  state: string;
  country: string;
  code: string;
}

interface CustomerListProps {
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

const CustomerList = ({
  customers,
  setCustomers,
  pageFilter,
  pageInfo,
  onPrevious,
  onNext,
  onPageChange,
}: CustomerListProps) => {
  const [deleteCustomerId, setDeleteCustomerId] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>({ name: "", state: "" });
  const [allCustomers, setAllCustomers] = useState<Customer[]>([]); // New state for all customers
  const [tempFilters, setTempFilters] = useState<FilterState>({ name: "", state: "" });
  const [availableStates, setAvailableStates] = useState<string[]>([]);
  const [showFilter, setShowFilter] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [softDeleteCustomerId, setSoftDeleteCustomerId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<'admin' | 'superuser' | 'general_user'>('general_user');
  // Populate filter options for states
  useEffect(() => {
    const states = Array.from(new Set(customers.map((customer) => customer.state))).filter(Boolean);
    setAvailableStates(states);
  }, [customers]);

  useEffect(() => {
    const isAuth = isAuthenticated();
    if (isAuth) {
      const userData = getUserData();
      console.log(userData);
      setUserRole(userData?.role || 'general_user');
    }
  }, []);

  // Fetch all customers once from the `/customers_all` API
  useEffect(() => {
    const fetchAllCustomers = async () => {
      setIsLoading(true);
      try {
        // const response = await fetch(`${process.env.NEXT_PUBLIC_ENDPOINT_URL}/customers`, {
        //   method: 'GET',
        //   headers: {
        //     'Content-Type': 'application/json',
        //   },
        // });
        const response = await fetch("http://localhost:5001/api/customers?status=Active&limit=10&offset=0", {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        if (response.ok) {
          const data = await response.json();
          console.log(data)
          if (data.customers && Array.isArray(data.customers)) {
            setAllCustomers(data.customers); // Store all customers in state
            setCustomers(data.customers.slice(0, pageFilter.limit)); // Display first page of customers
          } else {
            toast.error("No customers found");
            setCustomers([]);
          }
        } else {
          const errorText = await response.text();
          toast.error(`Failed to fetch customers: ${errorText}`);
          console.error("Customer fetch error:", errorText);
        }
      } catch (error) {
        console.error("Error fetching customers:", error);
        toast.error("An error occurred while fetching customers");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllCustomers();
  }, [pageFilter.limit]);

  // Filter the customers based on the selected filters
  useEffect(() => {
    const filteredCustomers = allCustomers.filter((customer) => {
      const matchesName = customer.name.toLowerCase().includes(filters.name.toLowerCase());
      const matchesState = filters.state ? customer.state === filters.state : true;
      return matchesName && matchesState;
    });

    setCustomers(filteredCustomers.slice(0, pageFilter.limit)); // Show filtered customers on the current page
  }, [filters, allCustomers, pageFilter.limit]);

  // Handle filter changes
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const newFilters = { ...tempFilters, [name]: value };
    setTempFilters(newFilters);
    setFilters(newFilters); // Apply filter immediately
  };

  const handleDelete = async (customer_id: string) => {
    console.log(customer_id)

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/api/customers/${customer_id}`,
        {
          method: "DELETE",
        }
      );
      if (response.ok) {
        setCustomers(customers.filter((customer) => customer.id !== customer_id));
        setDeleteCustomerId(null);
        toast.success("Customer deleted successfully");
      } else {
        console.error("Failed to delete customer");
        toast.error("Failed to delete customer");
      }
    } catch (error) {
      console.error("Error deleting customer:", error);
      toast.error("An error occurred while deleting the customer");
    }
  };
  const handleSoftDelete = async (customer_id: string) => {
    console.log(customer_id)
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/api/customers/soft_delete/${customer_id}`,
        {
          method: "DELETE",
        }
      );
      if (response.ok) {
        setCustomers(customers.filter((customer) => customer.id !== customer_id));
        setDeleteCustomerId(null);
        toast.success("Customer deleted successfully");
      } else {
        console.error("Failed to delete customer");
        toast.error("Failed to delete customer");
      }
    } catch (error) {
      console.error("Error deleting customer:", error);
      toast.error("An error occurred while deleting the customer");
    }
  };
  const columns = [
    "Name", "Contact", "Email", "State", "Country", "Code", "Actions"
  ];

  const renderRow = (customer: Customer) => (
    <>
      <td className="border p-2">{customer.name}</td>
      <td className="border p-2 hidden md:table-cell">{customer.phone}</td>
      <td className="border p-2">{customer.email}</td>
      <td className="border p-2 hidden md:table-cell">{customer.state}</td>
      <td className="border p-2 hidden md:table-cell">{customer.country}</td>
      <td className="border p-2 hidden md:table-cell">{customer.code}</td>
      <td className="border p-2">
        <div className="h-full flex justify-center space-x-2">
          <Link href={`customers/${customer.id}`} passHref>
            <span className="text-blue-500 hover:text-blue-700">
              <FaEye />
            </span>
          </Link>
          {userRole === 'admin' && (
          <FaTrash
            onClick={() => {
              console.log("Delete button clicked for customer ID:", customer.id); // Debugging log
              setDeleteCustomerId(customer.id);
            }}
            className="text-red-500 cursor-pointer hover:text-red-700"
          />
          )}
          <MdOutlineFolderDelete
            onClick={() => setSoftDeleteCustomerId(customer.id)}
            className="text-yellow-500 cursor-pointer hover:text-yellow-700 ml-2"
            title="Soft Delete"
          />
        </div>
      </td>
    </>
  );

  return (
    <div className="p-8 bg-white rounded-2xl shadow text-black">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Customer List</h1>
        <button
          onClick={() => setShowFilter(!showFilter)}
          className="bg-blue-600 text-white font-bold py-2 px-4 rounded hover:bg-blue-700"
        >
          {showFilter ? "Hide Filter" : "Show Filter"}
        </button>
      </div>

      {/* Filter UI (Only shown if showFilter is true) */}
      {showFilter && (
        <div className="mb-6">
          <div className="flex space-x-4">
            <input
              type="text"
              name="name"
              value={tempFilters.name}
              onChange={handleFilterChange}
              placeholder="Search by Name"
              className="p-2 w-full border rounded"
            />
            <select
              name="state"
              value={tempFilters.state}
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
        </div>
      )}

      {/* Loading Indicator */}
      {isLoading && (
        <div className="text-center py-4">
          <p>Loading customers...</p>
        </div>
      )}

      {/* Table */}
      <Table
        columns={columns}
        data={customers}
        renderRow={renderRow}
      />

      {deleteCustomerId && (
        <dialog open className="p-5 bg-white rounded shadow-lg fixed inset-0">
          <h2 className="text-xl font-bold mb-4">Confirm Delete</h2>
          <p>Are you sure you want to delete this customer?</p>
          <p className="text-gray-500 text-sm">Customer ID: {deleteCustomerId}</p> {/* Debugging */}
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

      {/* Soft Delete Dialog */}
      {softDeleteCustomerId && (
        <dialog open className="p-5 bg-white rounded shadow-lg fixed inset-0">
          <h2 className="text-xl font-bold mb-4">Confirm Delete</h2>
          <p>Are you sure you want to Soft delete this customer?</p>
          <p className="text-gray-500 text-sm">Customer ID: {softDeleteCustomerId}</p> {/* Debugging */}
          <div className="flex justify-end mt-4">
            <button
              onClick={() => setSoftDeleteCustomerId(null)}
              className="mr-2 bg-gray-300 hover:bg-gray-400 text-black font-bold py-2 px-4 rounded"
            >
              Cancel
            </button>
            <button
              onClick={() => handleSoftDelete(softDeleteCustomerId)}
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
            >
              Delete
            </button>
          </div>
        </dialog>
      )}
      {/* Pagination */}
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
};

export default CustomerList;
