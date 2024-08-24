"use client";

import { useEffect, useState } from 'react';
import VendorList from './VendorList';
import AddVendorForm from './AddVendorForm';
import Button from '../../components/Button';
import VendorMobileList from './VendorMobileList';

export interface Vendor {
  _id: string;
  name: string;
  phone: string;
  email: string;
  state: string;
  country: string;
  code:string;
}
const VendorsPage = () => {
  const [showForm, setShowForm] = useState(false);
  const [vendors, setVendors] = useState<Vendor[]>([]);

  const fetchVendors = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_ENDPOINT_URL}/vendors`);
      const data = await response.json();
      setVendors(data.vendors);
    } catch (error) {
      console.error('Error fetching vendors:', error);
    }
  };
  useEffect(() => {
    fetchVendors();
  }, []);

  const handleAdd = () => {
    setShowForm(false);
    fetchVendors()
  };

  return (
    <div className="p-8 bg-grey-100 rounded  text-black">
      <h1 className="text-2xl font-bold mb-4">Vendors</h1>
      <div className="flex justify-end mb-4">
      {!showForm?<Button onClick={() => setShowForm(true)}>
          Add Vendor
        </Button>:<Button onClick={() => setShowForm(false)}>
          Cancel
        </Button>}
      </div>
      {showForm && (
        <div className="mb-4">
          <AddVendorForm onAdd={handleAdd} />
        </div>
      )}
      <div className='hidden md:block'>
      <VendorList vendors={vendors} setVendors={setVendors}/>
      </div>
      <div className='md:hidden'>
        <VendorMobileList vendors={vendors} setVendors={setVendors}/>
      </div>
    </div>
  );
};

export default VendorsPage;
