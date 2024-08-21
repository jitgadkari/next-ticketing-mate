import React from "react";
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
  const handleDelete = async (vendorId: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_ENDPOINT_URL}/vendor/${vendorId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setVendors(vendors.filter(vendor => vendor._id !== vendorId));
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
        <div className="flex flex-col space-y-4 text-sm">
          <div className="flex justify-between items-center">
            <div className="flex flex-col justify-center items-start text-start">
              <div className="font-semibold">{vendor.name}</div>
              <div className="">{vendor.phone}</div>
            </div>
            <div className="flex flex-col text-right">
              <div className="">{vendor.email}</div>
              <div className="">{vendor.state}</div>
            </div>
          </div>
  
          <div className="flex justify-end space-x-4">
            <Link href={`vendors/${vendor._id}`} passHref>
              <span className="text-blue-500 hover:text-blue-700">
                <FaEye />
              </span>
            </Link>
            <FaTrash
              onClick={() => handleDelete(vendor._id)}
              className="text-red-500 cursor-pointer hover:text-red-700"
            />
          </div>
        </div>
      </div>
    ))}
  </div>
  
  );
}
