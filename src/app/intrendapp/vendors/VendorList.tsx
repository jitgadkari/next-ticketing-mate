"use client";

import Link from "next/link";
import { FaEye, FaTrash } from "react-icons/fa";
import Table from "../../components/Table";
import { Vendor } from "./page";
import { useState } from "react";
import toast from "react-hot-toast";
import { pageFilter, pageInfo } from "../people/page";
import Pagination from "@/app/components/Pagination";

interface VendorListProps {
  vendors: Vendor[];
  setVendors: (vendors: Vendor[]) => void;
  pageFilter: pageFilter;
  pageInfo: pageInfo;
  onPrevious?: () => void;
  onNext?: () => void;
  onPageChange: (page: number) => void;
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
  const handleDelete = async (vendorId: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/vendor/${vendorId}`,
        {
          method: "DELETE",
        }
      );
      if (response.ok) {
        setVendors(vendors.filter((vendor) => vendor._id !== vendorId));
        setDeleteVendorId(null);
        toast.success("Vendor deleted successfully");
      } else {
        console.error("Failed to delete vendor");
      }
    } catch (error) {
      console.error("Error deleting vendor:", error);
    }
  };

  const columns = [
    "Name",
    "Contact",
    "Email",
    "State",
    "Country",
    "Code",
    "Actions",
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
      </td>
    </>
  );

  return (
    <div className="p-8 bg-white rounded shadow text-black overflow-x-scroll">
      <h1 className="text-2xl font-bold mb-4">Vendors List</h1>
      <Table columns={columns} data={vendors} renderRow={renderRow} />
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
