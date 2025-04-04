"use client";

import Link from "next/link";
import { FaEye, FaTrash } from "react-icons/fa";
import Table from "../../components/Table";
import { Vendor } from "./page";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { pageFilter, pageInfo } from "../people/page";
import Pagination from "@/app/components/Pagination";
import { MdOutlineFolderDelete } from "react-icons/md";
import { getUserData, isAuthenticated } from "@/utils/auth";

interface VendorListProps {
  vendors: Vendor[];
  setVendors: (vendors: Vendor[]) => void;
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

const VendorList = ({
  vendors,
  setVendors,
  pageFilter,
  pageInfo,
  onPrevious,
  onNext,
  onPageChange,
}: VendorListProps) => {
  const [deleteVendorId, setDeleteVendorId] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>({ name: "", state: "" });
  const [allVendors, setAllVendors] = useState<Vendor[]>([]);  // New state for all vendors
  const [tempFilters, setTempFilters] = useState<FilterState>({ name: "", state: "" });
  const [availableStates, setAvailableStates] = useState<string[]>([]);
  const [showFilter, setShowFilter] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [softDeleteVendorId, setSoftDeleteVendorId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<'admin' | 'superuser' | 'general_user'>('general_user');

  // Populate filter options for states
  useEffect(() => {
    if (Array.isArray(vendors)) {
      const states = Array.from(new Set(vendors.map((vendor) => vendor.state))).filter(Boolean);
      setAvailableStates(states);
    }
  }, [vendors]);
  
  useEffect(() => {
    const isAuth = isAuthenticated();
    if (isAuth) {
      const userData = getUserData();
      console.log(userData);
      setUserRole(userData?.role || 'general_user');
    }
  }, []);
  // Fetch all vendors once from the `/vendors_all` API
  useEffect(() => {
    const fetchAllVendors = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_ENDPOINT_URL}/api/vendors`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        if (response.ok) {
          const data = await response.json();

          if (data.vendors && Array.isArray(data.vendors)) {
            setAllVendors(data.vendors);  // Store all vendors in state
            setVendors(data.vendors.slice(0, pageFilter.limit)); // Display first page of vendors
          } else {
            toast.error("No vendors found");
            setVendors([]);
          }
        } else {
          const errorText = await response.text();
          toast.error(`Failed to fetch vendors: ${errorText}`);
          console.error("Vendor fetch error:", errorText);
        }
      } catch (error) {
        console.error("Error fetching vendors:", error);
        toast.error("An error occurred while fetching vendors");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllVendors();
  }, [pageFilter.limit]);

  // Filter the vendors based on the selected filters
  useEffect(() => {
    const filteredVendors = allVendors.filter((vendor) => {
      const matchesName = vendor.name.toLowerCase().includes(filters.name.toLowerCase());
      const matchesState = filters.state ? vendor.state === filters.state : true;
      return matchesName && matchesState;
    });

    setVendors(filteredVendors.slice(0, pageFilter.limit)); // Show filtered vendors on the current page
  }, [filters, allVendors, pageFilter.limit]);

  // Handle filter changes
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const newFilters = { ...tempFilters, [name]: value };
    setTempFilters(newFilters);
    setFilters(newFilters);  // Apply filter immediately
  };

  const handleDelete = async (vendor_id: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/api/vendors/${vendor_id}?userId=1&userAgent=user-test`,
        {
          method: "DELETE",
        }
      );
      if (response.ok) {
        setVendors(vendors.filter((vendor) => vendor.id !== vendor_id));
        setDeleteVendorId(null);
        toast.success("Vendor deleted successfully");
      } else {
        console.error("Failed to delete vendor");
        toast.error("Failed to delete vendor");
      }
    } catch (error) {
      console.error("Error deleting vendor:", error);
      toast.error("An error occurred while deleting the vendor");
    }
  };

  const handleSoftDelete = async (vendor_id: string) => {
    console.log(vendor_id)
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/api/vendors/soft_delete/${vendor_id}?userId=1&userAgent=user-test`,
        {
          method: "DELETE",
        }
      );
      if (response.ok) {
        setVendors(vendors.filter((vendor) => vendor.id !== vendor_id));
        setSoftDeleteVendorId(null);
        toast.success("Vendor soft deleted successfully");
      } else {
        console.error("Failed to soft delete vendor");
        toast.error("Failed to soft delete vendor");
      }
    } catch (error) {
      console.error("Error soft deleting vendor:", error);
      toast.error("An error occurred while soft deleting the vendor");
    }
  };

  const columns = [
    "Name", "Contact", "Email", "State", "Country", "Code", "Actions"
  ];

  const renderRow = (vendor: Vendor) => (
    <>
      <td className="border p-2">{vendor.name}</td>
      <td className="border p-2 hidden md:table-cell">{vendor.phone}</td>
      <td className="border p-2">{vendor.email}</td>
      <td className="border p-2 hidden md:table-cell">{vendor.state}</td>
      <td className="border p-2 hidden md:table-cell">{vendor.country}</td>
      <td className="border p-2 hidden md:table-cell">{vendor.code}</td>
      <td className="border p-2">
        <div className="h-full flex justify-center space-x-2">
          <Link href={`vendors/${vendor.id}`} passHref>
            <span className="text-blue-500 hover:text-blue-700">
              <FaEye />
            </span>
          </Link>
          {userRole === 'admin' && (
            <FaTrash
              onClick={() => setDeleteVendorId(vendor.id)}
              className="text-red-500 cursor-pointer hover:text-red-700"
            />
          )}
          <MdOutlineFolderDelete
            onClick={() => setSoftDeleteVendorId(vendor.id)}
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
        <h1 className="text-2xl font-bold">Vendor List</h1>
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
          <p>Loading vendors...</p>
        </div>
      )}

      {/* Table */}
      <Table
        columns={columns}
        data={vendors}
        renderRow={renderRow}
      />

      {deleteVendorId && (
        <dialog open className="p-5 bg-white rounded shadow-lg fixed inset-0">
          <h2 className="text-xl font-bold mb-4">Confirm Delete</h2>
          <p>Are you sure you want to delete this vendor?</p>
          <div className="flex justify-end mt-4">
            <button
              onClick={() => setDeleteVendorId(null)}
              className="mr-2 bg-gray-300 hover:bg-gray-400 text-black font-bold py-2 px-4 rounded"
            >
              Cancel
            </button>
            <button
              onClick={() => handleDelete(deleteVendorId)}
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
            >
              Delete
            </button>
          </div>
        </dialog>
      )}
      {/* Soft Delete Dialog */}
      {softDeleteVendorId && (
        <dialog open className="p-5 bg-white rounded shadow-lg fixed inset-0">
          <h2 className="text-xl font-bold mb-4">Confirm Delete</h2>
          <p>Are you sure you want to Soft delete this vendor?</p>
          <p className="text-gray-500 text-sm">Vendor ID: {softDeleteVendorId}</p> {/* Debugging */}
          <div className="flex justify-end mt-4">
            <button
              onClick={() => setSoftDeleteVendorId(null)}
              className="mr-2 bg-gray-300 hover:bg-gray-400 text-black font-bold py-2 px-4 rounded"
            >
              Cancel
            </button>
            <button
              onClick={() => handleSoftDelete(softDeleteVendorId)}
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

export default VendorList;
