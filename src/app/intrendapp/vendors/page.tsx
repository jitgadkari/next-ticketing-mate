"use client";

import { useState } from 'react';
import VendorList from './VendorList';
import AddVendorForm from './AddVendorForm';
import Button from '../../components/Button';

const VendorsPage = () => {
  const [showForm, setShowForm] = useState(false);

  const handleAdd = () => {
    setShowForm(false);
  };

  return (
    <div className="p-8 bg-white rounded shadow text-black">
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
      <VendorList />
    </div>
  );
};

export default VendorsPage;
