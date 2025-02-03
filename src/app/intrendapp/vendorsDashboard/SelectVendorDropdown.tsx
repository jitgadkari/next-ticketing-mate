"use client";

import { useState, useEffect } from "react";

interface SelectVendorDropdownProps {
  onSelect: (vendorName: string) => void;
}

interface Vendor {
  _id: string;
  name: string;
}

export default function SelectVendorDropdown({ onSelect }: SelectVendorDropdownProps) {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [selectedVendor, setSelectedVendor] = useState("");

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const response = await fetch("http://139.59.53.5:8000/vendors_all/");
        const data = await response.json();
        setVendors(data.vendors);
      } catch (error) {
        console.error("Error fetching vendors:", error);
      }
    };
    fetchVendors();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const vendorName = e.target.value;
    setSelectedVendor(vendorName);
    onSelect(vendorName);
  };

  return (
    <div className="w-64">
      <select
        value={selectedVendor}
        onChange={handleChange}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">Select Vendor</option>
        {vendors.map((vendor) => (
          <option key={vendor._id} value={vendor.name}>
            {vendor.name}
          </option>
        ))}
      </select>
    </div>
  );
}
