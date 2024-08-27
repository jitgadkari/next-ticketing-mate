'use client'
import React, { useState } from "react";
import Link from "next/link";
import { FaEye, FaTrash } from "react-icons/fa";
import { Vendor } from "./page";
interface VendorMobileListProps {
  vendors: Vendor[];
  setVendors: (vendors: Vendor[]) => void;
}

export default function VendorMobileList({
  vendors,
  setVendors,
}: VendorMobileListProps) {
  const [deleteVendorId, setDeleteVendorId] = useState<string | null>(null);
  const handleDelete = async (vendorId: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_ENDPOINT_URL}/vendor/${vendorId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setVendors(vendors.filter(vendor => vendor._id !== vendorId));
        setDeleteVendorId(null);
      } else {
        console.error('Failed to delete vendor');
      }
    } catch (error) {
      console.error('Error deleting vendor:', error);
    }
  };


  return (
    <div className="grid grid-cols-1 gap-4 md:hidden">
    {vendors.map((vendor) => (
      <div key={vendor._id} className="bg-white text-black p-4 rounded-lg shadow-lg">
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
            <Link href={`vendors/${vendor._id}`} passHref>
              <span className="text-blue-500 hover:text-blue-700">
                <FaEye />
              </span>
            </Link>
            <FaTrash
                onClick={() => setDeleteVendorId(vendor._id)}
              className="text-red-500 cursor-pointer hover:text-red-700"
            />
          </div>
          
        </div>
      </div>
    ))}
     {deleteVendorId && (
        <dialog open className="p-5 bg-white rounded shadow-lg">
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
  </div>
  
  
  );
}
