"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Input from "../../../components/Input";
import Button from "../../../components/Button";
import { FaEdit } from "react-icons/fa";
import toast from "react-hot-toast";

interface Person {
  id: string;
  name: string;
  phone: string;
  email: string;
  type_employee: string;
  linked: boolean;
  linked_to: string | null;
  linked_to_id: { id: string; name: string } | null;
  additional_info: {
    role?: string;
    department?: string;
    [key: string]: any;
  };
  versions: any[];
  created_date: string;
  updated_date: string;
  status: string;
}

interface Customer {
  id: string;
  name: string;
}

interface Vendor {
  id: string;
  name: string;
}

const PersonDetailsPage: React.FC = () => {
  const router = useRouter();
  const { id } = useParams();
  const [person, setPerson] = useState<Person | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);

  useEffect(() => {
    if (id) {
      fetchPerson(id as string);
      fetchCustomers();
      fetchVendors();
    }
  }, [id]);

  const fetchPerson = async (person_id: string): Promise<void> => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/api/persons/${person_id}`
      );
      if (!response.ok) throw new Error("Failed to fetch person");

      const data = await response.json();
      console.log("Person Data:", data);
      setPerson(data.person);
    } catch (error) {
      console.error("Error fetching person:", error);
    }
  };

  const fetchCustomers = async (): Promise<void> => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/api/customers`
      );
      if (!response.ok) throw new Error("Failed to fetch customers");

      const data = await response.json();
      setCustomers(data.customers);
    } catch (error) {
      console.error("Error fetching customers:", error);
    }
  };

  const fetchVendors = async (): Promise<void> => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/api/vendors`
      );
      if (!response.ok) throw new Error("Failed to fetch vendors");

      const data = await response.json();
      setVendors(data.vendors);
    } catch (error) {
      console.error("Error fetching vendors:", error);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    if (!person) return;
    const { name, value } = e.target;
    let updatedValue: any = value;
    if (name === "linked") updatedValue = value === "true";

    setPerson((prevPerson) => {
      if (!prevPerson) return null;
      const updatedPerson = { ...prevPerson, [name]: updatedValue };

      // Reset linked fields when type_employee changes to Internal
      if (name === "type_employee" && value === "Internal") {
        updatedPerson.linked = false;
        updatedPerson.linked_to = null;
        updatedPerson.linked_to_id = null;
      }

      // Reset linked data if linked is set to "No"
      if (name === "linked" && !updatedValue) {
        updatedPerson.linked_to = null;
        updatedPerson.linked_to_id = null;
      }

      // Reset linked_to_id when linked_to changes
      if (name === "linked_to") {
        updatedPerson.linked_to_id = null;
      }

      return updatedPerson;
    });
  };

  const handleLinkedToIdChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    if (!person || !person.linked_to) return;

    const selectedEntity =
      person.linked_to === "customer"
        ? customers.find((c) => c.id === selectedId)
        : vendors.find((v) => v.id === selectedId);

    if (selectedEntity) {
      setPerson((prevPerson) =>
        prevPerson
          ? {
              ...prevPerson,
              linked_to_id: { id: selectedEntity.id, name: selectedEntity.name },
            }
          : null
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!person) return;

    try {
      // Construct the update payload
      const updatePayload = {
        name: person.name || "",
        email: person.email || "",
        phone: person.phone || "",
        type_employee: person.type_employee || "External",
        status: person.status || "Active",
        linked: Boolean(person.linked)
      };

      // Only include these fields if they are relevant
      if (person.linked && person.type_employee === "External") {
        Object.assign(updatePayload, {
          linked_to: person.linked_to || null,
          linked_to_id: person.linked_to_id?.id ? { id: person.linked_to_id.id } : null
        });
      }

      // Only include additional_info if it has content
      if (person.additional_info && Object.keys(person.additional_info).length > 0) {
        Object.assign(updatePayload, {
          additional_info: person.additional_info
        });
      }

      console.log("Submitting Person:", updatePayload);

      // First, get the current person data
      const getCurrentPerson = await fetch(
        `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/api/persons/${person.id}`
      );
      
      if (!getCurrentPerson.ok) {
        throw new Error('Failed to get current person data');
      }
      
      const currentData = await getCurrentPerson.json();
      
      // Merge the current data with our updates
      const finalPayload = {
        ...currentData.person,
        ...updatePayload
      };
      
      console.log('Final update payload:', finalPayload);
      
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/api/persons/${person.id}?userId=1&userAgent=user-test`,
        {
          method: "PUT",
          headers: { 
            "Content-Type": "application/json"
          },
          body: JSON.stringify(finalPayload),
        }
      );

      if (response.ok) {
        setIsEditing(false);
        router.push("/intrendapp/people");
        toast.success("Person updated successfully");
      } else {
        const errorData = await response.json();
        console.error("Failed to update person", errorData);
        toast.error("Failed to update person");
      }
    } catch (error) {
      console.error("Error updating person:", error);
      toast.error("An error occurred while updating person");
    }
  };

  if (!person) return <div>Loading...</div>;

  return (
    <div className="p-3 md:p-8 bg-white rounded shadow text-black text-xs md:text-base">
      <h1 className="text-2xl font-bold mb-4">Person Details</h1>
      {!isEditing ? (
        <>
          <div className="flex justify-end items-center mb-4" onClick={() => setIsEditing(true)}>
            <FaEdit className="text-blue-500 text-2xl cursor-pointer" />
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <p><strong>Name:</strong> {person.name}</p>
              <p><strong>Email:</strong> {person.email}</p>
              <p><strong>Phone:</strong> {person.phone}</p>
              <p><strong>Type:</strong> {person.type_employee}</p>
              <p>
                <strong>Status:</strong>{" "}
                <span className={`${person.status === 'Active' ? 'text-green-600' : 'text-red-600'}`}>
                  {person.status}
                </span>
              </p>
              <p><strong>Linked:</strong> {person.linked ? "Yes" : "No"}</p>
              {person.linked_to && (
                <p><strong>Linked To:</strong> {person.linked_to}</p>
              )}
              {person.linked_to_id && (
                <p><strong>Linked Entity:</strong> {person.linked_to_id.name} (ID: {person.linked_to_id.id})</p>
              )}
              
              {/* Additional Info Section */}
              {person.additional_info && Object.keys(person.additional_info).length > 0 && (
                <div className="col-span-2">
                  <strong>Additional Information:</strong>
                  <ul className="list-disc pl-4 mt-2">
                    {Object.entries(person.additional_info).map(([key, value]) => (
                      <li key={key}>
                        <strong>{key.charAt(0).toUpperCase() + key.slice(1)}:</strong> {value}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* Dates Section */}
              <p><strong>Created Date:</strong> {new Date(person.created_date).toLocaleString()}</p>
              <p><strong>Updated Date:</strong> {new Date(person.updated_date).toLocaleString()}</p>
            </div>
          </div>
        </>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Phone" type="text" name="phone" value={person.phone} onChange={handleChange} required />
          <Input label="Email" type="email" name="email" value={person.email} onChange={handleChange} required />

          <div className="space-y-2">
            <label className="block text-gray-700">Type of Employee</label>
            <select 
              name="type_employee" 
              value={person.type_employee} 
              onChange={handleChange} 
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="Internal">Internal</option>
              <option value="External">External</option>
            </select>
          </div>

          {person.type_employee === "External" && (
            <div className="space-y-2">
              <label className="block text-gray-700">Linked</label>
              <select 
                name="linked" 
                value={person.linked.toString()} 
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="false">No</option>
                <option value="true">Yes</option>
              </select>

              {person.linked && (
                <>
                  <div className="space-y-2">
                    <label className="block text-gray-700">Link To</label>
                    <select 
                      name="linked_to" 
                      value={person.linked_to || ""} 
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    >
                      <option value="">Select...</option>
                      <option value="customer">Customer</option>
                      <option value="vendor">Vendor</option>
                    </select>
                  </div>

                  {person.linked_to && (
                    <div className="space-y-2">
                      <label className="block text-gray-700">
                        Select {person.linked_to.charAt(0).toUpperCase() + person.linked_to.slice(1)}
                      </label>
                      <select
                        onChange={handleLinkedToIdChange}
                        value={person.linked_to_id?.id || ""}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      >
                        <option value="">Select...</option>
                        {person.linked_to === "customer"
                          ? customers.map((customer) => (
                              <option key={customer.id} value={customer.id}>
                                {customer.name}
                              </option>
                            ))
                          : vendors.map((vendor) => (
                              <option key={vendor.id} value={vendor.id}>
                                {vendor.name}
                              </option>
                            ))}
                      </select>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          <div className="flex justify-end space-x-4 mt-6">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Save
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default PersonDetailsPage;
