"use client";

import { useState, useEffect } from "react";
import Input from "../../components/Input";
import Button from "../../components/Button";
import toast from "react-hot-toast";

interface AddTicketFormProps {
  onAdd: () => void;
  initialCustomer?: string;
  disableCustomerSelect?: boolean;
}

export interface Customer {
  id: string;
  name: string;
  status: 'Active' | 'Inactive';
  customer_people_list: Person[];
}

export interface Person {
  id: string;
  name: string;
}

interface FormData {
  customer_id: string;
  customer_name: string;
  person_name: string;
  message: string;
  from_number: string;
  ticket_type: string;
  customer_people_list: Person[];
}

const AddTicketForm = ({ onAdd, initialCustomer, disableCustomerSelect }: AddTicketFormProps) => {
  const [showDropDown, setShowDropDown] = useState(false);
  const [showPersonDropDown, setShowPersonDropDown] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    customer_id: "",
    customer_name: initialCustomer || "",
    person_name: "",
    message: "",
    from_number: "",
    ticket_type: "General Inquiry",
    customer_people_list: [],
  });
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [people, setPeople] = useState<Person[]>([]);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_ENDPOINT_URL}/api/customers`);
        const data = await response.json();
        console.log("Customer Data",data)
        setCustomers(data.customers);

        if (initialCustomer) {
          const selectedCustomer = data.find((c: Customer) => c.name === initialCustomer);
          setPeople(selectedCustomer?.customer_people_list || []);
          setFormData((prev) => ({
            ...prev,
            customer_id: selectedCustomer?.id || "",
            customer_people_list: selectedCustomer?.customer_people_list || [],
          }));
        }
      } catch (error) {
        console.error("Error fetching customers:", error);
      }
    };
    fetchCustomers();
  }, []);

  useEffect(() => {
    if (initialCustomer) {
      setFormData((prev) => ({
        ...prev,
        customer_name: initialCustomer,
      }));
    }
  }, [initialCustomer]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCustomerSelect = (customer: Customer) => {
    setFormData({
      ...formData,
      customer_id: customer.id, // Set customer_id
      customer_name: customer.name,
      person_name: "",
      from_number: "",
      customer_people_list: customer.customer_people_list || [],
    });
    setPeople(customer.customer_people_list || []);
    setShowDropDown(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.customer_id) {
      toast.error("Please select a customer");
      return;
    }

    if (!formData.person_name) {
      toast.error("Please select a person");
      return;
    }

    if (!formData.message.trim()) {
      toast.error("Message cannot be empty");
      return;
    }

    const currentDate = new Date().toISOString();

    const payload = {
      customer_id: formData.customer_id,
      customer_name: formData.customer_name,
      ticket_type: formData.ticket_type,
      customer_people_list: formData.customer_people_list,
      assigned_internal_people_list: [],
      customer_message: formData.message,
      image_urls: [],
      from_number: formData.from_number || "",
      // created_date: currentDate,
      // updated_date: currentDate,
      status: "Active"
    };

    try {
      console.log("Submitting Ticket:", payload);

      const response = await fetch(`${process.env.NEXT_PUBLIC_ENDPOINT_URL}/api/tickets/create?userId=573c7b4-0621-4d23-8d02-d964c66025b3&userAgent=user-test`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(payload),
      });

      const responseData = await response.json().catch(() => ({}));
      console.log("Server response:", responseData);

      if (response.ok) {
        onAdd();
        setFormData({
          customer_id: "",
          customer_name: "",
          person_name: "",
          message: "",
          from_number: "",
          ticket_type: "General Inquiry",
          customer_people_list: [],
        });
        toast.success("Ticket added successfully");
      } else {
        const errorMessage = responseData.error?.message || responseData.message || "Failed to add ticket";
        toast.error(errorMessage);
        console.error("Failed to add ticket", responseData);
      }
    } catch (error) {
      console.error("Error adding ticket:", error);
      toast.error("Network error while adding ticket");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Customer Selection */}
      <label>Customer</label>
      <div className="mb-4">
        <button
          className="text-white bg-blue-700 hover:bg-blue-800 font-medium rounded-lg text-sm px-5 py-2.5"
          type="button"
          onClick={() => setShowDropDown(!showDropDown)}
          disabled={disableCustomerSelect}
        >
          {formData.customer_name || "Select Customer"}
        </button>

        {showDropDown && (
          <div className="bg-white shadow rounded-lg w-full max-h-40 overflow-auto">
            <ul className="py-2 text-sm text-gray-700">
              {Array.isArray(customers) && customers.filter(customer => customer.status === 'Active').map((customer) => (
                <li
                  key={customer.id}
                  className="block px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => handleCustomerSelect(customer)}
                >
                  {customer.name}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Ticket Type Selection */}
      <div className="mb-4">
        <label>Ticket Type</label>
        <select
          name="ticket_type"
          value={formData.ticket_type}
          onChange={handleChange}
          className="border rounded-lg px-4 py-2 w-full"
        >
          <option value="General Inquiry">General Inquiry</option>
          <option value="Technical Issue">Technical Issue</option>
          <option value="Billing Support">Billing Support</option>
        </select>
      </div>

      {/* Person Selection */}
      {formData.customer_people_list.length > 0 && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Person</label>
          <select
            name="person_name"
            value={formData.person_name}
            onChange={handleChange}
            className="border rounded-lg px-4 py-2 w-full bg-white"
            required
          >
            <option value="">Select Person</option>
            {formData.customer_people_list.map((person) => (
              <option key={person.id} value={person.name}>
                {person.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Message Input */}
      <Input label="Message" type="textarea" name="message" value={formData.message} onChange={handleChange} required />

      {/* Submit Button */}
      <Button type="submit" className="w-full" disabled={!formData.customer_id || !formData.person_name}>
        Add Ticket
      </Button>
    </form>
  );
};

export default AddTicketForm;
