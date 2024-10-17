"use client";

import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import Input from "../../../components/Input";
import Button from "../../../components/Button";
import { MultiSelect, Option } from "react-multi-select-component";
import { FaEdit } from "react-icons/fa";
import toast from "react-hot-toast";

interface Customer {
  _id: string;
  name: string;
  email: string;
  phone: string;
  fabric_type: string[];
  certifications: string[];
  approvals: string[];
  people: string[];
  state: string;
  country: string;
  gst_number: string;
  delivery_destination: string;
  delivery_terms: string[];
  pan_number: string;
  group: Record<string, string>;
  address: string;
  remarks: string;
  additional_info: string;
  code:string;
  mark_up:string;
}

export interface Attributes {
  fabric_type: string[];
  certifications: string[];
  approvals: string[];
  delivery_terms: string[];
  group: Record<string, string>;
}

interface Person {
  _id: string;
  name: string;
  phone: string;
  email: string;
  type_employee: string;
  linked: string;
  linked_to: string | null;
  linked_to_id: string | null;
}

const CustomerDetailsPage: React.FC = () => {
  const router = useRouter();
  const { id } = useParams();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [defaultAttributes, setDefaultAttributes] = useState<Attributes | null>(
    null
  );
  const [unlinkedPeople, setUnlinkedPeople] = useState<Person[]>([]);
  const [selectedAttributes, setSelectedAttributes] = useState<
    Record<string, string[] | Record<string, string>>
  >({
    fabric_type: [],
    certifications: [],
    approvals: [],
    delivery_terms: [],
    people: [],
    group: {},
  });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (id) {
      fetchCustomer(id as string);
      fetchDefaultAttributes();
      fetchUnlinkedPeople();
    }
  }, [id]);

  const fetchCustomer = async (customerId: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/customer/${customerId}`
      );
      const data = await response.json();
      setCustomer(data.customer);
      setSelectedAttributes({
        fabric_type: data.customer.fabric_type,
        certifications: data.customer.certifications,
        approvals: data.customer.approvals,
        delivery_terms: data.customer.delivery_terms,
        people: data.customer.people,
        group: data.customer.group,
      });
    } catch (error) {
      console.error("Error fetching customer:", error);
    }
  };

  const fetchDefaultAttributes = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/attributes`
      );
      const data = await response.json();
      setDefaultAttributes(data.attributes.DefaultAttributes);
    } catch (error) {
      console.error("Error fetching default attributes:", error);
    }
  };

  const fetchUnlinkedPeople = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/unlinked_people/?linked=No`
      );
      const data = await response.json();
      setUnlinkedPeople(data.people);
    } catch (error) {
      console.error("Error fetching unlinked people:", error);
    }
  };

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    if (customer) {
      setCustomer({ ...customer, [name]: value });
    }
  };

  const handleMultiSelectChange = (name: string, selected: Option[]) => {
    setSelectedAttributes((prevState) => ({
      ...prevState,
      [name]: selected.map((option: Option) => option.value),
    }));
  };

  const handleGroupChange = (key: string, value: string) => {
    setSelectedAttributes((prevState) => ({
      ...prevState,
      group: { ...(prevState.group as Record<string, string>), [key]: value },
    }));
  };

  const handleRemoveBubble = (name: string, value: string) => {
    if (name === "group") {
      setSelectedAttributes((prevState) => {
        const newGroup = { ...(prevState.group as Record<string, string>) };
        delete newGroup[value];
        return { ...prevState, group: newGroup };
      });
    } else {
      setSelectedAttributes((prevState) => ({
        ...prevState,
        [name]: (prevState[name] as string[]).filter((item) => item !== value),
      }));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (customer) {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/customer`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name: customer.name,
              update_dict: {
                ...customer,
                ...selectedAttributes,
              },
            }),
          }
        );

        if (response.ok) {
          setIsEditing(false);
          router.push("/intrendapp/customers");
          toast.success("Customer updated successfully")
        } else {
          const errorData = await response.json();
          console.error("Failed to update customer", errorData);
        }
      } catch (error) {
        console.error("Error updating customer:", error);
      }
    }
  };

  if (!customer || !defaultAttributes) return <div>Loading...</div>;

  const attributeOptions = (attribute: string): Option[] => {
    if (attribute === "people") {
      return unlinkedPeople.map((person) => ({
        label: `${person.name} (${person.email})`,
        value: person.name,
      }));
    }
    if (attribute === "group") {
      return Object.entries(defaultAttributes.group).map(([key, value]) => ({
        label: `${key}: ${value}`,
        value: key,
      }));
    }
    return (
      (defaultAttributes[attribute as keyof Attributes] as string[]) || []
    ).map((value) => ({
      label: value,
      value,
    }));
  };

  const renderForm = () => (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* <Input label="Name" type="text" name="name" value={customer.name} onChange={handleInputChange} required /> */}
      <div className="flex justify-start items-center gap-2">
        <label className="text-gray-700 ">Name</label>
        <h1 className="font-bold text-lg">{customer.name}</h1>
      </div>
      <Input
        label="Email"
        type="email"
        name="email"
        value={customer.email}
        onChange={handleInputChange}
        required
      />
      <Input
        label="Phone"
        type="tel"
        name="phone"
        value={customer.phone}
        onChange={handleInputChange}
        required
      />
      <Input
        label="State"
        type="text"
        name="state"
        value={customer.state}
        onChange={handleInputChange}
      />
      <Input
        label="Country"
        type="text"
        name="country"
        value={customer.country}
        onChange={handleInputChange}
      />
      <Input
        label="GST Number"
        type="text"
        name="gst_number"
        value={customer.gst_number}
        onChange={handleInputChange}
      />
      <Input
        label="PAN Number"
        type="text"
        name="pan_number"
        value={customer.pan_number}
        onChange={handleInputChange}
      />
      <Input
        label="Mark Up"
        type="text"
        name="mark_up"
        value={customer.mark_up}
        onChange={handleInputChange}
      />
      <Input
        label="Delivery Destination"
        type="text"
        name="delivery_destination"
        value={customer.delivery_destination}
        onChange={handleInputChange}
      />
      <Input
        label="Address"
        type="text"
        name="address"
        value={customer.address}
        onChange={handleInputChange}
      />
      <Input
        label="Remarks"
        type="text"
        name="remarks"
        value={customer.remarks}
        onChange={handleInputChange}
      />
      <Input
        label="Additional Info"
        type="text"
        name="additional_info"
        value={customer.additional_info}
        onChange={handleInputChange}
      />
      <Input
        label="Code"
        type="text"
        name="code"
        value={customer.code}
        onChange={handleInputChange}
      />
      {Object.entries(selectedAttributes).map(([key, values]) => (
        <div key={key}>
          <label className="block text-gray-700">
            {key.replace("_", " ").charAt(0).toUpperCase() + key.slice(1)}
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {key === "group"
              ? Object.entries(values as Record<string, string>).map(
                  ([groupKey, groupValue]) => (
                    <div
                      key={groupKey}
                      className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full flex items-center space-x-2"
                    >
                      <span>
                        {groupKey}: {groupValue}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveBubble(key, groupKey)}
                        className="text-red-500 hover:text-red-700"
                      >
                        &times;
                      </button>
                    </div>
                  )
                )
              : (values as string[]).map((value: string) => (
                  <div
                    key={value}
                    className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full flex items-center space-x-2"
                  >
                    <span>{value}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveBubble(key, value)}
                      className="text-red-500 hover:text-red-700"
                    >
                      &times;
                    </button>
                  </div>
                ))}
          </div>
          {key === "group" ? (
            <div>
              <select
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                  const [selectedKey, selectedValue] =
                    e.target.value.split(":");
                  handleGroupChange(selectedKey.trim(), selectedValue.trim());
                }}
                className="w-full p-2 border border-gray-300 rounded mt-1"
              >
                <option value="">Select a group</option>
                {Object.entries(defaultAttributes.group).map(
                  ([groupKey, groupValue]) => (
                    <option key={groupKey} value={`${groupKey}:${groupValue}`}>
                      {groupKey}: {groupValue}
                    </option>
                  )
                )}
              </select>
            </div>
          ) : (
            <MultiSelect
              options={attributeOptions(key)}
              value={(values as string[]).map((value: string) => ({
                label:
                  key === "people"
                    ? unlinkedPeople.find((p) => p.name === value)?.name ||
                      value
                    : value,
                value,
              }))}
              onChange={(selected: Option[]) =>
                handleMultiSelectChange(key, selected)
              }
              labelledBy={`Select ${key.replace("_", " ")}`}
            />
          )}
        </div>
      ))}
      <div className="flex justify-end space-x-4">
        <Button
          type="button"
          onClick={() => setIsEditing(false)}
          className="bg-gray-300 text-gray-800 hover:bg-gray-400"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="bg-blue-500 text-white hover:bg-blue-600"
        >
          Save
        </Button>
      </div>
    </form>
  );

  const renderDetails = () => (
    <div className="space-y-4 text-black">
      <div className="grid grid-cols-2 gap-4">
        <p>
          <strong>Name:</strong> {customer.name}
        </p>
        <p>
          <strong>Email:</strong> {customer.email}
        </p>
        <p>
          <strong>Phone:</strong> {customer.phone}
        </p>
        <p>
          <strong>State:</strong> {customer.state}
        </p>
        <p>
          <strong>Country:</strong> {customer.country}
        </p>
        <p>
          <strong>MarkUP:</strong> {customer.mark_up}
        </p>
        <p>
          <strong>GST Number:</strong> {customer.gst_number}
        </p>
        <p>
          <strong>PAN Number:</strong> {customer.pan_number}
        </p>
        <p>
          <strong>Delivery Destination:</strong> {customer.delivery_destination}
        </p>
        <p>
          <strong>Address:</strong> {customer.address}
        </p>
        <p>
          <strong>Remarks:</strong> {customer.remarks}
        </p>
        <p>
          <strong>Additional Info:</strong> {customer.additional_info}
        </p>
        <p>
          <strong>Code:</strong> {customer.code}
        </p>
        {Object.entries(selectedAttributes).map(([key, values]) => (
          <p key={key}>
            <strong>
              {key.replace("_", " ").charAt(0).toUpperCase() + key.slice(1)}:
            </strong>{" "}
            {key === "group"
              ? Object.entries(values as Record<string, string>)
                  .map(([groupKey, groupValue]) => `${groupKey}`)
                  .join(", ")
              : key === "people"
              ? (values as string[])
                  .map((value) => {
                    const person = unlinkedPeople.find((p) => p.name === value);
                    return person ? `${person.name} (${person.email})` : value;
                  })
                  .join(", ")
              : (values as string[]).join(", ")}
          </p>
        ))}
      </div>
    </div>
  );

  return (
    <div className="p-3 md:p-8 bg-white rounded shadow text-black text-xs md:text-base">
      <h1 className="text-2xl font-bold mb-4">Customer Details</h1>
      {!isEditing && (
        <div
          className="flex justify-end items-center"
          onClick={() => setIsEditing(true)}
        >
          {" "}
          <FaEdit className="text-blue-500 text-2xl" />
        </div>
      )}
      {isEditing ? renderForm() : renderDetails()}
    </div>
  );
};

export default CustomerDetailsPage;
