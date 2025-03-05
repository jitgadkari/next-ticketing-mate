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
  additional_info?: {
    role?: string;
    department?: string;
  };
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
        `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/persons/${person_id}`
      );
      if (!response.ok) throw new Error("Failed to fetch person");

      const data = await response.json();
      console.log("[LOG] Person Data:", data.person[0]);
      setPerson(data.person[0]);
    } catch (error) {
      console.error("Error fetching person:", error);
    }
  };

  const fetchCustomers = async (): Promise<void> => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/customers`
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
        `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/vendors`
      );
      if (!response.ok) throw new Error("Failed to fetch vendors");

      const data = await response.json();
      setVendors(data.vendors);
    } catch (error) {
      console.error("Error fetching vendors:", error);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
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
      console.log("[LOG] Submitting Person:", person);

      const updatePayload = {
        update_dict: {
          ...person,
          updated_date: new Date().toISOString(),
        },
      };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/persons/${person.id}?user_id=1&user_agent=user-test`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatePayload),
        }
      );

      if (response.ok) {
        setIsEditing(false);
        router.push("/intrendapp/people");
        toast.success("Person updated successfully");
      } else {
        const errorData = await response.json();
        console.error("[ERROR] Failed to update person", errorData);
      }
    } catch (error) {
      console.error("[ERROR] Error updating person:", error);
    }
  };

  if (!person) return <div>Loading...</div>;

  return (
    <div className="p-3 md:p-8 bg-white rounded shadow text-black text-xs md:text-base">
      <h1 className="text-2xl font-bold mb-4">Person Details</h1>
      {!isEditing && (
        <div className="flex justify-end items-center" onClick={() => setIsEditing(true)}>
          <FaEdit className="text-blue-500 text-2xl" />
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Phone" type="text" name="phone" value={person.phone} onChange={handleChange} required />
        <Input label="Email" type="email" name="email" value={person.email} onChange={handleChange} required />

        <label className="block text-gray-700">Type of Employee</label>
        <select name="type_employee" value={person.type_employee} onChange={handleChange} className="mt-1 block w-full">
          <option value="Internal">Internal</option>
          <option value="External">External</option>
        </select>

        {person.type_employee === "External" && (
          <>
            <label className="block text-gray-700">Linked</label>
            <select name="linked" value={String(person.linked)} onChange={handleChange} className="mt-1 block w-full">
              <option value="false">No</option>
              <option value="true">Yes</option>
            </select>

            {person.linked && (
              <>
                <label className="block text-gray-700">Linked To</label>
                <select name="linked_to" value={person.linked_to || ""} onChange={handleChange} className="mt-1 block w-full">
                  <option value="">Select...</option>
                  <option value="customer">Customer</option>
                  <option value="vendor">Vendor</option>
                </select>
              </>
            )}

            {person.linked_to && (
              <select name="linked_to_id" value={person.linked_to_id?.id || ""} onChange={handleLinkedToIdChange} className="mt-1 block w-full" required>
                <option value="">Select...</option>
                {(person.linked_to === "customer" ? customers : vendors).map((entity) => (
                  <option key={entity.id} value={entity.id}>{entity.name}</option>
                ))}
              </select>
            )}
          </>
        )}

        <Button type="submit" className="w-full">Update Person</Button>
      </form>
    </div>
  );
};

export default PersonDetailsPage;
