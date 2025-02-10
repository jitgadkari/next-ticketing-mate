"use client";

import { useState, useEffect } from "react";

interface Customer {
  _id: string;
  name: string;
}

interface SelectCustomerDropdownProps {
  onSelect: (customerName: string) => void;
}

const SelectCustomerDropdown = ({ onSelect }: SelectCustomerDropdownProps) => {
  const [showDropDown, setShowDropDown] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState("");

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/customers_all`
        );
        const data = await response.json();
        setCustomers(data.customers);
      } catch (error) {
        console.error("Error fetching customers:", error);
      }
    };

    fetchCustomers();
  }, []);

  return (
    <div className="relative">
      <button
        className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
        type="button"
        onClick={() => setShowDropDown(!showDropDown)}
      >
        {selectedCustomer || "Select Customer"}
        <svg
          className="w-2.5 h-2.5 ms-3"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 10 6"
        >
          <path
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="m1 1 4 4 4-4"
          />
        </svg>
      </button>

      {showDropDown && (
        <div className="absolute z-10 bg-white divide-y divide-gray-100 rounded-lg shadow w-full dark:bg-gray-700 overflow-auto max-h-40 mt-2">
          <ul className="py-2 text-sm text-gray-700 dark:text-gray-200 flex flex-col">
            {customers.map((customer) => (
              <li
                key={customer._id}
                className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white cursor-pointer"
                onClick={() => {
                  setSelectedCustomer(customer.name);
                  onSelect(customer.name);
                  setShowDropDown(false);
                }}
              >
                {customer.name}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SelectCustomerDropdown;
