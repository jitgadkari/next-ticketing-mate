"use client";

import { useEffect, useState } from 'react';
import VendorList from './VendorList';
import AddVendorForm from './AddVendorForm';
import Button from '../../components/Button';
import VendorMobileList from './VendorMobileList';
import { pageFilter, pageInfo } from '../people/page';

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
  const [pageFilter,setPageFilter]=useState<pageFilter>({
    offset:0,
    limit:10,
  })
  const [pageInfo,setPageInfo]=useState<pageInfo>({
    current_page:null,
    has_next:null,
    total_pages:null,
    total_items:null
  })
  const fetchVendors = async () => {
    try {
      const queryParams = new URLSearchParams({
        offset: pageFilter.offset.toString(),
        limit: pageFilter.limit.toString(),
      });
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_ENDPOINT_URL}/vendors?${queryParams.toString()}`);
      const data = await response.json();
      setPageInfo((prev) => ({
        ...prev,
       total_pages:data.total_pages,
       current_page:data.current_page,
       has_next:data.has_next,
       total_items:data.total_vendors
      }));
      setVendors(data.vendors);
    } catch (error) {
      console.error('Error fetching vendors:', error);
    }
  };
  useEffect(() => {
    fetchVendors();
  }, [pageFilter]);

  const handleAdd = () => {
    setShowForm(false);
    fetchVendors()
  };

  const handlePrevious = () => {
    setPageFilter((prev) => ({
      ...prev,
      offset: Math.max(prev.offset - prev.limit, 0),
    }));
  };

  const handleNext = () => {
    setPageFilter((prev) => ({
      ...prev,
      offset: prev.offset + prev.limit,
    }));
  };
  const handlePageChange = (page: number) => {
    setPageFilter((prev) => ({
      ...prev,
      offset: (page - 1) * prev.limit,
    }));
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
      <VendorList vendors={vendors} setVendors={setVendors} pageFilter={pageFilter} pageInfo={pageInfo} onPageChange={handlePageChange} onNext={handleNext} onPrevious={handlePrevious}/>
      </div>
      <div className='md:hidden'>
        <VendorMobileList vendors={vendors} setVendors={setVendors} pageFilter={pageFilter} pageInfo={pageInfo} onPageChange={handlePageChange} onNext={handleNext} onPrevious={handlePrevious}/>
      </div>
    </div>
  );
};

export default VendorsPage;
