"use client";

import { useState } from 'react';
import CustomerList from './CustomerList';
import AddCustomerForm from './AddCustomerForm';
import Button from '../../components/Button';

const CustomersPage = () => {
  const [showForm, setShowForm] = useState(false);

  const handleAdd = () => {
    setShowForm(false);
  };

  return (
    <div className="p-8 bg-white rounded shadow text-black">
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
      <CustomerList />
    </div>
  );
};

export default CustomersPage;
