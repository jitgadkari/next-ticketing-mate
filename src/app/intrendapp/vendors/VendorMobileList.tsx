"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { FaEye, FaTrash } from "react-icons/fa";
import { MdOutlineFolderDelete } from "react-icons/md";
import { Vendor } from "./page";
import toast from "react-hot-toast";
import Pagination from "@/app/components/Pagination";
import { pageFilter, pageInfo } from "../people/page";
import { getUserData, isAuthenticated } from "@/utils/auth";

interface VendorMobileListProps {
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

export default function VendorMobileList({
  vendors,
  setVendors,
  pageFilter,
  pageInfo,
  onPrevious,
  onNext,
  onPageChange,
}: VendorMobileListProps) {
  const [deleteVendorId, setDeleteVendorId] = useState<string | null>(null);
  const [softDeleteVendorId, setSoftDeleteVendorId] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>({ name: "", state: "" });
  const [allVendors, setAllVendors] = useState<Vendor[]>([]);  // State for all vendors
  const [tempFilters, setTempFilters] = useState<FilterState>({ name: "", state: "" });
  const [availableStates, setAvailableStates] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showFilter, setShowFilter] = useState<boolean>(false); // State to toggle filter visibility
  const [userRole, setUserRole] = useState<'admin' | 'superuser' | 'general_user'>('general_user');

  useEffect(() => {
    const isAuth = isAuthenticated();
    if (isAuth) {
      const userData = getUserData();
      setUserRole(userData?.role || 'general_user');
    }
  }, []);
  useEffect(() => {
    if (!vendors || !Array.isArray(vendors)) {
      console.warn("Vendors data is not an array or is undefined:", vendors);
      return;
    }
    const states = Array.from(new Set(vendors.map((vendor) => vendor.state))).filter(Boolean);
    setAvailableStates(states);
  }, [vendors]);
  

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

  const handleDelete = async (vendorId: string) => {
    if (userRole !== 'admin') {
      toast.error("You do not have permission to delete vendors");
      return;
    }
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/api/vendors/${vendorId}`,
        {
          method: "DELETE",
        }
      );
      if (response.ok) {
        setVendors(vendors.filter((vendor) => vendor.id !== vendorId));
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

  const handleSoftDelete = async (vendorId: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/api/vendors/soft_delete/${vendorId}?userId=1&userAgent=user-test`,
        {
          method: "DELETE",
        }
      );
      if (response.ok) {
        setVendors(vendors.filter((vendor) => vendor.id !== vendorId));
        setSoftDeleteVendorId(null);
        toast.success("Vendor soft deleted successfully");
      } else {
        toast.error("Failed to soft delete vendor");
      }
    } catch (error) {
      console.error("Error soft deleting vendor:", error);
      toast.error("An error occurred while soft deleting the vendor");
    }
  };

  return (
    <div className="grid grid-cols-1 gap-4 md:hidden">
      {/* Header with filter toggle button */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Vendor List</h1>
        <button
          onClick={() => setShowFilter(!showFilter)}
          className="bg-blue-600 text-white font-bold py-2 px-4 rounded hover:bg-blue-700"
        >
          {showFilter ? "Hide Filter" : "Show Filter"}
        </button>
      </div>

      {/* Filter UI with toggle visibility */}
      {showFilter && (
        <div className="flex space-x-4 mb-4">
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
      )}

      {/* Loading Indicator */}
      {isLoading && (
        <div className="text-center py-4">
          <p>Loading vendors...</p>
        </div>
      )}

      {/* Display vendor details */}
      {Array.isArray(vendors) && vendors.length > 0 ? (
        vendors.map((vendor) => (
          <div key={vendor.id} className="bg-white text-black p-4 rounded-lg shadow-lg">
            <div className="flex flex-col space-y-4 text-sm w-full">
              <div className="flex justify-between items-center">
                <div className="flex">
                  <span className="font-semibold mr-2">Name:</span>
                  <span>{vendor.name}</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex">
                  <span className="font-semibold mr-2">Email:</span>
                  <span>{vendor.email}</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex">
                  <span className="font-semibold mr-2">Phone:</span>
                  <span>{vendor.phone}</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex">
                  <span className="font-semibold mr-2">State:</span>
                  <span>{vendor.state}</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex">
                  <span className="font-semibold mr-2">Code:</span>
                  <span>{vendor.code}</span>
                </div>
              </div>
              <div className="flex justify-end space-x-4">
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
                      className="text-yellow-500 cursor-pointer hover:text-yellow-700"
                      title="Soft Delete"
                    />
              </div>
            </div>
          </div>
        ))
      ) : (
        <p className="text-gray-500 text-center">No vendors available</p>
      )}

      {/* Delete Confirmation */}
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
          <h2 className="text-xl font-bold mb-4">Confirm Soft Delete</h2>
          <p>Are you sure you want to soft delete this vendor?</p>
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
}
