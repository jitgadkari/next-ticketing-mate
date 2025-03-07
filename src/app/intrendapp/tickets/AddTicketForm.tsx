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
  customer_people_list: Person[];
}

export interface Person {
  _id: string;
  name: string;
  email: string;
  phone: string;
}

const AddTicketForm = ({ onAdd, initialCustomer, disableCustomerSelect }: AddTicketFormProps) => {
  const [showDropDown, setShowDropDown] = useState(false);
  const [showPersonDropDown, setShowPersonDropDown] = useState(false);
  const [formData, setFormData] = useState({
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
        const response = await fetch(`${process.env.NEXT_PUBLIC_ENDPOINT_URL}/customers/all/`);
        const data = await response.json();
        setCustomers(data);

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
      customer_id: customer.id, // ✅ Set customer_id
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

    if (!formData.message.trim()) {
      toast.error("Message cannot be empty.");
      return;
    }

    // const fromNumberRegex = /^91.*@c\.us$/;
    // if (!fromNumberRegex.test(formData.from_number)) {
    //   toast.error("Invalid 'From Number'. It should start with '91' and end with '@c.us'");
    //   return;
    // }

    const payload = {
      customer_id: formData.customer_id, // ✅ Include customer_id
      customer_name: formData.customer_name,
      ticket_type: formData.ticket_type,
      customer_people_list: formData.customer_people_list,
      customer_message: formData.message,
      from_number: formData.from_number,
      assigned_internal_people_list: [],
      image_urls: [],
      status: "Active",
    };

    try {
      console.log("Submitting Ticket:", payload);

      const response = await fetch(`${process.env.NEXT_PUBLIC_ENDPOINT_URL}/ticket?user_id=573c7b4-0621-4d23-8d02-d964c66025b3&user_agent=user-test`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
console.log(response)
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
        const errorData = await response.json();
        console.error("Failed to add ticket", errorData);
      }
    } catch (error) {
      console.error("Error adding ticket:", error);
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
              {customers.map((customer) => (
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
          <label>Person</label>
          <button
            className="text-white bg-blue-700 hover:bg-blue-800 font-medium rounded-lg text-sm px-5 py-2.5"
            type="button"
            onClick={() => setShowPersonDropDown(!showPersonDropDown)}
          >
            {formData.person_name || "Select Person"}
          </button>

          {showPersonDropDown && (
            <div className="bg-white shadow rounded-lg w-44">
              <ul className="py-2 text-sm text-gray-700">
                {people.length > 0 ? (
                  people.map((person) => (
                    <li
                      key={person._id}
                      className="block px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => {
                        setFormData({
                          ...formData,
                          person_name: person.name,
                          from_number: person.phone + "@c.us",
                        });
                        setShowPersonDropDown(false);
                      }}
                    >
                      {person.name}
                    </li>
                  ))
                ) : (
                  <li className="block px-4 py-2 text-gray-500">No people available</li>
                )}
              </ul>
            </div>
          )}
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
