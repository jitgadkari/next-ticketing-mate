"use client";

import { useState, useEffect } from "react";
import Input from "../../components/Input";
import Button from "../../components/Button";

interface AddTicketFormProps {
  onAdd: () => void;
}

export interface Customer {
  _id: string;
  name: string;
}

interface Person {
  _id: string;
  name: string;
  email: string;
  phone: string;
}

const AddTicketForm = ({ onAdd }: AddTicketFormProps) => {
  const [showDropDown, setShowDropDown] = useState(false);
  const [showPersonDropDown, setShowPersonDropDown] = useState(false);
  const [formData, setFormData] = useState({
    customer_name: "",
    person_name: "",
    message: "",
  });
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [people, setPeople] = useState<Person[]>([]); // Initialize as an empty array

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/customers`
        );
        const data = await response.json();
        setCustomers(data.customers);
      } catch (error) {
        console.error("Error fetching customers:", error);
      }
    };
    fetchCustomers();
  }, []);

  useEffect(() => {
    if (formData.customer_name) {
      fetchPeople(formData.customer_name);
    } else {
      setPeople([]); // Reset people when no customer is selected
    }
  }, [formData.customer_name]);

  const fetchPeople = async (customerName: string) => {
    try {
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_ENDPOINT_URL
        }/people/customer/?customer=${encodeURIComponent(customerName)}`
      );
      const data = await response.json();
      setPeople(data.person || []); // Use an empty array if data.person is undefined
    } catch (error) {
      console.error("Error fetching people:", error);
      setPeople([]); // Set to empty array in case of error
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form Data:", formData);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/ticket`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      if (response.ok) {
        onAdd();
        // Reset form after successful submission
        setFormData({
          customer_name: "",
          person_name: "",
          message: "",
        });
      } else {
        const errorData = await response.json();
        console.error("Failed to add ticket", errorData);
      }
    } catch (error) {
      console.error("Error adding ticket:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <>
        <label>Customer</label>
        <div className="mb-4">
          <button
            className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            type="button"
            onClick={() => setShowDropDown(!showDropDown)}
          >
            {formData.customer_name || "Select Customer"}
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

          <div
            className={`z-10 ${
              !showDropDown && "hidden"
            } bg-white divide-y divide-gray-100 rounded-lg shadow w-44 dark:bg-gray-700`}
          >
            <ul className="py-2 text-sm text-gray-700 dark:text-gray-200">
              {customers.map((customer) => (
                <li
                  key={customer._id}
                  className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white cursor-pointer"
                  onClick={() => {
                    setFormData({ ...formData, customer_name: customer.name });
                    setShowDropDown(false);
                  }}
                >
                  {customer.name}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </>
      {formData.customer_name && (
        <>
          <div className="mb-4">
            <div className="flex flex-col w-max gap-2">
              <label>Person</label>
              <button
                className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                type="button"
                onClick={() => setShowPersonDropDown(!showPersonDropDown)}
              >
                {formData.person_name || "Select Person"}
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
            </div>
            <div
              className={`z-10 ${
                !showPersonDropDown && "hidden"
              } bg-white divide-y divide-gray-100 rounded-lg shadow w-44 dark:bg-gray-700`}
            >
              <ul className="py-2 text-sm text-gray-700 dark:text-gray-200">
                {people.length > 0 ? (
                  people.map((person) => (
                    <li
                      key={person._id}
                      className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white cursor-pointer"
                      onClick={() => {
                        setFormData({ ...formData, person_name: person.name });
                        setShowPersonDropDown(false);
                      }}
                    >
                      {person.name}
                    </li>
                  ))
                ) : (
                  <li className="block px-4 py-2 text-gray-500">
                    No people available for this customer
                  </li>
                )}
              </ul>
            </div>
          </div>
        </>
      )}
      <Input
        label="Message"
        type="textarea"
        name="message"
        value={formData.message}
        onChange={handleChange}
        required
      />
      <Button
        type="submit"
        className="w-full"
        disabled={!formData.customer_name || !formData.person_name}
      >
        Add Ticket
      </Button>
    </form>
  );
};

export default AddTicketForm;
