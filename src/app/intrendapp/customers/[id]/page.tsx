"use client";

import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import Input from "../../../components/Input";
import Button from "../../../components/Button";
import { MultiSelect, Option } from "react-multi-select-component";
import { FaEdit } from "react-icons/fa";
import toast from "react-hot-toast";

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  attributes: {}; // Contains approvals, fabric_type, payment_terms, certifications, delivery_terms, etc.
  fabric_type: string[]; // These might be redundant if stored in attributes
  certifications: string[];
  approvals: string[];
  customer_people_list: {}[];
  state: string;
  country: string;
  gst_number: string;
  delivery_destination: string;
  delivery_terms: string[];
  payment_terms: string[];
  pan_number: string;
  group: string | Record<string, string>;
  address: string;
  remarks: string;
  additional_info: string;
  code: string;
  mark_up: string;
  whatsapp_groups?: { id: string; name: string }[];
  status?: string;
  created_date?: string;
  updated_date?: string;
}

export interface Attributes {
  fabric_type: string[];
  certifications: string[];
  approvals: string[];
  delivery_terms: string[];
  paymnent_terms: string[]; // Note the typo in the API response
  // group: Record<string, string>;
}

interface Person {
  id: string;
  name: string;
  phone: string;
  email: string;
  type_employee: string;
  linked: string;
  linked_to: string | null;
  linked_to_id: string | null;
}

interface IntegrationResponse {
  latest?: {
    integrations?: {
      whatsapp?: {
        groups?: Array<{
          id: string;
          group_id?: string;
          name: string;
          group_name?: string;
        }>;
      };
    };
  };
}

const CustomerDetailsPage: React.FC = () => {
  const router = useRouter();
  const { id } = useParams();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [defaultAttributes, setDefaultAttributes] = useState<Attributes | null>(
    null
  );
  const [unlinkedPeople, setUnlinkedPeople] = useState<Person[]>([]);
  const [selectedAttributes, setSelectedAttributes] = useState<{
    fabric_type: string[];
    certifications: string[];
    approvals: string[];
    delivery_terms: string[];
    payment_terms: string[];
    customer_people_list: { id: string; name: string }[];
  }>({
    fabric_type: [],
    certifications: [],
    approvals: [],
    delivery_terms: [],
    payment_terms: [],
    customer_people_list: [],
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [whatsappGroups, setWhatsappGroups] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    if (id) {
      fetchCustomer(id as string);
      fetchDefaultAttributes();
      fetchUnlinkedPeople();
      fetchWhatsappGroups();
    }
  }, [id]);

  const fetchCustomer = async (customerId: string) => {
    console.log("[CustomerDetails] Fetching customer data:", customerId);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/api/customers/${customerId}`
      );
      const data = await response.json();
      console.log("[CustomerDetails] Customer data received:", data.customer);
      setCustomer(data.customer);
      // Here we read the attribute values from customer.attributes
      setSelectedAttributes({
        fabric_type: data.customer.attributes?.fabric_type || [],
        certifications: data.customer.attributes?.certifications || [],
        approvals: data.customer.attributes?.approvals || [],
        delivery_terms: data.customer.attributes?.delivery_terms || [],
        payment_terms: data.customer.attributes?.payment_terms || [],
        customer_people_list: data.customer.customer_people_list || [],
      });
    } catch (error) {
      setError("Error fetching customer");
      console.error("[CustomerDetails] Error fetching customer:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDefaultAttributes = async () => {
    console.log("[CustomerDetails] Fetching default attributes");
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/api/attributes?userId=50d2ce0a-263f-40d6-a354-922101b00320&userAgent=user-test`
      );
      const data = await response.json();
      console.log("[CustomerDetails] Default attributes received:", data);
      
      // Extract attributes from the nested structure
      const attrs = data?.attributes?.attributes || {};
      
      const defaultAttrs = {
        fabric_type: attrs.type || [],
        weave: attrs.weave || [],
        width: attrs.width || [],
        content: attrs.content || [],
        designs: attrs.designs || [],
        certifications: attrs.certifications || [],
        delivery_terms: attrs.delivery_terms || [],
      };
      
      setDefaultAttributes(defaultAttrs);
      console.log("[CustomerDetails] Default attributes set:", defaultAttrs);
    } catch (error) {
      setError("Error fetching default attributes");
      console.error(
        "[CustomerDetails] Error fetching default attributes:",
        error
      );
      setDefaultAttributes({
        fabric_type: [],
        weave: [],
        width: [],
        content: [],
        designs: [],
        certifications: [],
        delivery_terms: [],
      });
    }
  };

  const fetchUnlinkedPeople = async () => {
    console.log("[CustomerDetails] Fetching unlinked people");
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/api/persons/unlinked`
      );
      const data = await response.json();
      console.log("[CustomerDetails] Unlinked people received:", data);
      setUnlinkedPeople(data.unlinked_people);
    } catch (error) {
      setError("Error fetching unlinked people");
      console.error("[CustomerDetails] Error fetching unlinked people:", error);
      setUnlinkedPeople([]);
    }
  };

  const fetchWhatsappGroups = async () => {
    try {
      const response = await fetch("http://localhost:5001/api/integrations/latest");
      if (response.ok) {
        const data: IntegrationResponse = await response.json();
        const groups = data.latest?.integrations?.whatsapp?.groups || [];
        const formattedGroups = groups.map(group => ({
          id: group.id || group.group_id || '',
          name: group.name || group.group_name || 'Unnamed Group'
        }));
        setWhatsappGroups(formattedGroups);
      }
    } catch (error) {
      console.error("Error fetching WhatsApp groups:", error);
    }
  };

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    console.log("[CustomerDetails] Input change:", { name, value });
    if (customer) {
      setCustomer({ ...customer, [name]: value });
    }
  };

  const handleMultiSelectChange = (name: string, selected: Option[]) => {
    console.log("[CustomerDetails] Multi-select change:", { name, selected });
    setSelectedAttributes((prevState) => ({
      ...prevState,
      [name]: selected.map((option: Option) => option.value),
    }));
  };

  const handleWhatsappGroupsChange = (selected: Option[]) => {
    if (customer) {
      const selectedGroups = selected.map(option => JSON.parse(option.value));
      setCustomer({
        ...customer,
        whatsapp_groups: selectedGroups
      });
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    console.log("[CustomerDetails] Form submission started");
    if (customer) {
      try {
        const { id, ...customerData } = customer;
        console.log("id", id);
        console.log("[CustomerDetails] Customer data:", customerData);
        console.log(
          "[CustomerDetails] Selected attributes:",
          selectedAttributes
        );
        const update_dict = {
          ...customerData,
          customer_people_list: selectedAttributes.customer_people_list,
          attributes: {
            ...customerData.attributes,
            fabric_type: selectedAttributes.fabric_type,
            certifications: selectedAttributes.certifications,
            approvals: selectedAttributes.approvals,
            delivery_terms: selectedAttributes.delivery_terms,
            payment_terms: selectedAttributes.payment_terms,
          },
        };
        console.log("[CustomerDetails] Submitting update:", update_dict);
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/api/customers/${id}?userId=1&userAgent=user-test`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(update_dict),
          }
        );
        const responseData = await response.json();
        console.log("Response", responseData);
        if (response.ok) {
          console.log("[CustomerDetails] Update successful");
          setIsEditing(false);
          router.push("/intrendapp/customers");
          toast.success("Customer updated successfully");
        } else {
          console.error(
            "[CustomerDetails] Failed to update customer:",
            responseData
          );
        }
      } catch (error) {
        console.error("[CustomerDetails] Error updating customer:", error);
      }
    }
  };

  console.log("[CustomerDetails] States:", {
    customer,
    defaultAttributes,
    unlinkedPeople,
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!customer || !defaultAttributes || !unlinkedPeople)
    return <div className="p-4">Loading...</div>;

  // Build options for attributes. Merging default options with any currently selected values.
  const attributeOptions = (attribute: string): Option[] => {
    const attributeKey =
      attribute === "payment_terms" ? "paymnent_terms" : attribute;
    const defaultOpts =
      (defaultAttributes?.[attributeKey as keyof Attributes] as string[]) || [];
    const customerValues = selectedAttributes[attribute] as string[];
    const allOptions = Array.from(new Set([...defaultOpts, ...customerValues]));
    return allOptions.map((value) => ({
      label: value,
      value,
    }));
  };

  const renderForm = () => (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex justify-start items-center gap-2">
        <label className="text-gray-700">Name</label>
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
        label="Code"
        type="text"
        name="code"
        value={customer.code}
        onChange={handleInputChange}
      />
      <div className="flex justify-start items-center gap-2">
        <label className="text-gray-700">Status</label>
        <h1 className="font-bold text-lg">{customer.status}</h1>
      </div>
      {/*
        Render MultiSelect for attributes (excluding customer_people_list)
      */}
      {Object.entries(selectedAttributes).map(([key, values]) => {
        if (key !== "customer_people_list") {
          return (
            <div key={key}>
              <label className="block text-gray-700">
                {key.replace("_", " ").charAt(0).toUpperCase() + key.slice(1)}
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                <MultiSelect
                  options={attributeOptions(key)}
                  value={(values as string[]).map((value: string) => ({
                    label: value,
                    value,
                  }))}
                  onChange={(selected: Option[]) =>
                    handleMultiSelectChange(key, selected)
                  }
                  labelledBy={`Select ${key.replace("_", " ")}`}
                />
              </div>
            </div>
          );
        }
        return null;
      })}
      {/*
        Render a dedicated MultiSelect for Customer People
      */}
      <div>
        <label className="block text-gray-700">Select Customer People</label>
        <MultiSelect
          options={unlinkedPeople.map((person) => ({
            label: `${person.name} (${person.email})`,
            value: JSON.stringify({ id: person.id, name: person.name }),
          }))}
          value={selectedAttributes.customer_people_list.map((person) => ({
            label: person.name,
            value: JSON.stringify(person),
          }))}
          onChange={(selected: Option[]) => {
            const people = selected.map((option) => JSON.parse(option.value));
            setSelectedAttributes((prev) => ({
              ...prev,
              customer_people_list: people,
            }));
          }}
          labelledBy="Select Customer People"
        />
      </div>
      <div>
        <label className="block text-gray-700">WhatsApp Groups</label>
        <MultiSelect
          options={whatsappGroups.map(group => ({
            label: group.name,
            value: JSON.stringify(group)
          }))}
          value={(customer.whatsapp_groups || []).map(group => ({
            label: group.name,
            value: JSON.stringify(group)
          }))}
          onChange={handleWhatsappGroupsChange}
          labelledBy="Select WhatsApp Groups"
        />
      </div>
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
          <strong>Mark Up:</strong> {customer.mark_up}
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
          <strong>Additional Info:</strong>{" "}
          {typeof customer.additional_info === "object" &&
          Object.keys(customer.additional_info).length > 0
            ? JSON.stringify(customer.additional_info)
            : "None"}
        </p>
        <p>
          <strong>Attributes:</strong>{" "}
          {customer.attributes &&
          Object.keys(customer.attributes).length > 0 ? (
            <ul>
              {Object.entries(customer.attributes).map(([key, value]) => (
                <li key={key}>
                  <strong>{key}:</strong>{" "}
                  {Array.isArray(value) ? value.join(", ") : String(value)}
                </li>
              ))}
            </ul>
          ) : (
            "None"
          )}
        </p>
        <p>
          <strong>Customer People:</strong>{" "}
          {customer.customer_people_list &&
          customer.customer_people_list.length > 0 ? (
            <ul>
              {customer.customer_people_list.map(
                (person: any, index: number) => (
                  <li key={index}>
                    <strong>Name:</strong> {person.name}
                  </li>
                )
              )}
            </ul>
          ) : (
            "None"
          )}
        </p>
        <p>
          <strong>WhatsApp Groups:</strong>{" "}
          {customer.whatsapp_groups && customer.whatsapp_groups.length > 0 ? (
            <ul>
              {customer.whatsapp_groups.map((group, index) => (
                <li key={index}>{group.name}</li>
              ))}
            </ul>
          ) : (
            "None"
          )}
        </p>
        <p>
          <strong>Code:</strong> {customer.code}
        </p>
        <p>
          <strong>Status:</strong> {customer.status}
        </p>
        <p>
          <strong>Created Date:</strong> {customer.created_date}
        </p>
        <p>
          <strong>Updated Date:</strong> {customer.updated_date}
        </p>
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
          <FaEdit className="text-blue-500 text-2xl" />
        </div>
      )}
      {isEditing ? renderForm() : renderDetails()}
    </div>
  );
};

export default CustomerDetailsPage;
