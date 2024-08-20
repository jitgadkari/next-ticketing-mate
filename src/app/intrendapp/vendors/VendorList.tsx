"use client";

import Link from 'next/link';
import { FaEye, FaTrash } from 'react-icons/fa';
import Table from '../../components/Table';
import { Vendor } from './page';

interface VendorListProps{
  vendors: Vendor[],
  setVendors: (vendors:Vendor[])=>void
}
const VendorList = ({vendors,setVendors}:VendorListProps) => {

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

  const columns = ['Name', 'Contact', 'Email', 'State', 'Country', 'Actions'];

  const renderRow = (vendor: Vendor) => (
    <>
      <td className="border p-2">{vendor.name}</td>
      <td className="border p-2 hidden md:table-cell">{vendor.phone}</td>
      <td className="border p-2">{vendor.email}</td>
      <td className="border p-2 hidden md:table-cell">{vendor.state}</td>
      <td className="border p-2 hidden md:table-cell">{vendor.country}</td>
      <td className="border p-2">
        <div className="h-full flex justify-center space-x-2">
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
      </td>
    </>
  );

  return (
    <div className="p-8 bg-white rounded shadow text-black overflow-x-scroll">
      <h1 className="text-2xl font-bold mb-4">Vendors List</h1>
      <Table columns={columns} data={vendors} renderRow={renderRow} />
    </div>
  );
};

export default VendorList;
