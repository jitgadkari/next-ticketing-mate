"use client";

import { useEffect, useState } from 'react';
import CustomerList from './CustomerList';
import AddCustomerForm from './AddCustomerForm';
import Button from '../../components/Button';
import CustomerMobileList from './CustomerMobileList';
import { pageFilter, pageInfo } from '../people/page';
export interface Customer {
  _id: string;
  name: string;
  email: string;
  phone: string;
  state: string;
  country: string;
  code:string;
}
const getOffset = () => {
  const offset = localStorage.getItem("customerListOffset");
  return offset ? parseInt(offset, 10) : 0;
};
const CustomersPage = () => {
  const [showForm, setShowForm] = useState(false);
  const [pageFilter,setPageFilter]=useState<pageFilter>({
    offset:getOffset(),
    limit:10,
  })
  const [pageInfo,setPageInfo]=useState<pageInfo>({
    current_page:null,
    has_next:null,
    total_pages:null,
    total_items:null
  })
  const [customers, setCustomers] = useState<Customer[]>([]);

  const fetchCustomers = async () => {
    try {
      const queryParams = new URLSearchParams({
        offset: pageFilter.offset.toString(),
        limit: pageFilter.limit.toString(),
      });
      const response = await fetch(`${process.env.NEXT_PUBLIC_ENDPOINT_URL}/customers?${queryParams.toString()}`);
      const data = await response.json();
    
      setPageInfo((prev) => ({
        ...prev,
       total_pages:data.total_pages,
       current_page:data.current_page,
       has_next:data.has_next,
       total_items:data.total_customers
      }));
      setCustomers(data.customers);
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };
  useEffect(() => {
    fetchCustomers();
  }, [pageFilter]);
  const handleAdd = () => {
    setShowForm(false);
    fetchCustomers()
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
useEffect(() => {
  localStorage.setItem("customerListOffset", pageFilter.offset.toString());
}, [pageFilter.offset]);
  return (
    <div className="p-2 bg-gray-100 rounded  text-black">
      <div className="flex justify-end mb-4">
      {!showForm?<Button onClick={() => setShowForm(true)}>
        Add Customer
        </Button>:<Button onClick={() => setShowForm(false)}>
          Cancel
        </Button>}
      </div>
      {showForm && (
        <div className="mb-4">
          <AddCustomerForm onAdd={handleAdd} />
        </div>
      )}
      <div className='hidden md:block'>
      <CustomerList customers={customers} setCustomers={setCustomers}  pageFilter={pageFilter} pageInfo={pageInfo} onPageChange={handlePageChange} onNext={handleNext} onPrevious={handlePrevious}/>
      </div>
      <div className='md:hidden'>
        <CustomerMobileList customers={customers} setCustomers={setCustomers}  pageFilter={pageFilter} pageInfo={pageInfo} onPageChange={handlePageChange} onNext={handleNext} onPrevious={handlePrevious}/>
      </div>
    </div>
  );
};

export default CustomersPage;
