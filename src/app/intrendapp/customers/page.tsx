"use client";

import { useEffect, useState } from 'react';
import CustomerList from './CustomerList';
import AddCustomerForm from './AddCustomerForm';
import Button from '../../components/Button';
import CustomerMobileList from './CustomerMobileList';
export interface Customer {
  _id: string;
  name: string;
  email: string;
  phone: string;
  state: string;
  country: string;
  code:string;
}

const CustomersPage = () => {
  const [showForm, setShowForm] = useState(false);

  const [customers, setCustomers] = useState<Customer[]>([]);

  const fetchCustomers = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_ENDPOINT_URL}/customers`);
      const data = await response.json();
      setCustomers(data.customers);
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };
  useEffect(() => {
    fetchCustomers();
  }, []);
  const handleAdd = () => {
    setShowForm(false);
    fetchCustomers()
  };

  return (
    <div className="p-8 bg-gray-100 rounded  text-black">
      <h1 className="text-2xl font-bold mb-4">Customers</h1>
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
      <CustomerList customers={customers} setCustomers={setCustomers}/>
      </div>
      <div className='md:hidden'>
        <CustomerMobileList customers={customers} setCustomers={setCustomers}/>
      </div>
    </div>
  );
};

export default CustomersPage;
