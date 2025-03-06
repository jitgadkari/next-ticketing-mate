"use client";

import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import Input from "../../../components/Input";
import Button from "../../../components/Button";
import { MultiSelect, Option } from "react-multi-select-component";
import { FaEdit } from "react-icons/fa";
import toast from "react-hot-toast";

interface Vendor {
  id: string;
  name: string;
  fabric_type: string[];
  width: string[];
  content: string[];
  type: string[];
  certifications: string[];
  approvals: string[];
  weave: string[];
  weave_type: string[];
  designs: string[];
  payment_terms: string;
  delivery_destination: string;
  delivery_terms: string[];
  factory_location: string;
  state: string;
  phone: string;
  email: string;
  gst_number: string;
  pan_number: string;
  code: string;
  address: string;
  remarks: string;
  vendor_people_list: { id: string; name: string }[]; // Linked vendor people
}

interface Attributes {
  fabric_type: string[];
  width: string[];
  content: string[];
  type: string[];
  certifications: string[];
  approvals: string[];
  weave: string[];
  weave_type: string[];
  designs: string[];
  payment_terms: string[];
  delivery_terms: string[];
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

const VendorDetailsPage: React.FC = () => {
  const router = useRouter();
  const { id } = useParams();
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [defaultAttributes, setDefaultAttributes] = useState<Attributes | null>(null);
  const [unlinkedPeople, setUnlinkedPeople] = useState<Person[]>([]);
  // For vendor people, we store an array of JSON-stringified objects in "vendor_people_list".
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string[]>>({
    fabric_type: [],
    width: [],
    content: [],
    type: [],
    certifications: [],
    approvals: [],
    weave: [],
    weave_type: [],
    designs: [],
    delivery_terms: [],
    vendor_people_list: []
  });
  const [isEditing, setIsEditing] = useState(false);
  const routerHook = useRouter();

  useEffect(() => {
    if (id) {
      fetchVendor(id as string);
      fetchDefaultAttributes();
      fetchUnlinkedPeople();
    }
  }, [id]);

  const fetchVendor = async (vendorId: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_ENDPOINT_URL}/vendor/${vendorId}`);
      const data = await response.json();
      // Assuming API returns vendor as an array.
      const fetchedVendor: Vendor = data.vendor[0];
      setVendor(fetchedVendor);
      // Initialize selectedAttributes from vendor.attributes and vendor_people_list.
      setSelectedAttributes({
        fabric_type: fetchedVendor.attributes.fabric_type || [],
        width: fetchedVendor.attributes.width || [],
        content: fetchedVendor.attributes.content || [],
        type: fetchedVendor.attributes.type || [],
        certifications: fetchedVendor.attributes.certifications || [],
        approvals: fetchedVendor.attributes.approvals || [],
        weave: fetchedVendor.attributes.weave || [],
        weave_type: fetchedVendor.attributes.weave_type || [],
        designs: fetchedVendor.attributes.designs || [],
        delivery_terms: fetchedVendor.attributes.delivery_terms || [],
        vendor_people_list: fetchedVendor.vendor_people_list
          ? fetchedVendor.vendor_people_list.map((person) =>
              JSON.stringify({ id: person.id, name: person.name })
            )
          : []
      });
    } catch (error) {
      console.error("Error fetching vendor:", error);
    }
  };

  const fetchDefaultAttributes = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_ENDPOINT_URL}/attributes`);
      const data = await response.json();
      setDefaultAttributes(data.attributes);
    } catch (error) {
      console.error("Error fetching default attributes:", error);
    }
  };

  const fetchUnlinkedPeople = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_ENDPOINT_URL}/people/unlinked`);
      const data = await response.json();
      setUnlinkedPeople(data.data);
    } catch (error) {
      console.error("Error fetching unlinked people:", error);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (vendor) {
      setVendor({ ...vendor, [name]: value });
    }
  };

  const handleMultiSelectChange = (name: string, selected: Option[]) => {
    setSelectedAttributes((prevState) => ({
      ...prevState,
      [name]: selected.map((option: Option) => option.value),
    }));
  };

  const handleRemoveBubble = (name: string, value: string) => {
    setSelectedAttributes((prevState) => ({
      ...prevState,
      [name]: (prevState[name] as string[]).filter((item) => item !== value),
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (vendor) {
      try {
        // If no vendor people selected, fallback to original vendor_people_list.
        const vendorPeople = selectedAttributes.vendor_people_list.length > 0
        ? selectedAttributes.vendor_people_list.map((personStr) => JSON.parse(personStr))
        : vendor.vendor_people_list.map((person) => ({ id: person.id, name: person.name }));
      
        // Remove any people keys from attributes.
        const { people, vendor_people_list: _ignored, ...otherAttributes } = vendor.attributes;
        const update_dict = {
          ...vendor,
          attributes: {
            ...otherAttributes,
            fabric_type: selectedAttributes.fabric_type,
            width: selectedAttributes.width,
            content: selectedAttributes.content,
            type: selectedAttributes.type,
            certifications: selectedAttributes.certifications,
            approvals: selectedAttributes.approvals,
            weave: selectedAttributes.weave,
            weave_type: selectedAttributes.weave_type,
            designs: selectedAttributes.designs,
            delivery_terms: selectedAttributes.delivery_terms,
          },
          vendor_people_list: vendorPeople, // Top-level vendor_people_list
        };
        console.log("Final update_dict:", update_dict);
        console.log(
          "Payload:",
          JSON.stringify({
            update_dict: { ...update_dict, delivery_destination: vendor.delivery_destination },
          })
        );
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/vendor/?vendor_id=${id}&user_id=1&user_agent=user-test`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              update_dict: { ...update_dict, delivery_destination: vendor.delivery_destination },
            }),
          }
        );
        if (response.ok) {
          setIsEditing(false);
          routerHook.push("/intrendapp/vendors");
          toast.success("Vendor updated successfully");
        } else {
          const errorData = await response.json();
          console.error("Failed to update vendor", errorData);
        }
      } catch (error) {
        console.error("Error updating vendor:", error);
      }
    }
  };

  if (!vendor || !defaultAttributes) return <div>Loading...</div>;

  // Build options for each attribute field by merging default and selected values.
  const attributeOptions = (attribute: string): Option[] => {
    if (attribute === "vendor_people_list") {
      return unlinkedPeople.map((person) => ({
        label: `${person.name} (${person.email})`,
        // Use _id if available, otherwise fallback to person.id.
        value: JSON.stringify({ id: person._id || person.id, name: person.name }),
      }));
    }
    const attributeKey = attribute === "payment_terms" ? "paymnent_terms" : attribute;
    const defaultOpts = (defaultAttributes[attributeKey as keyof Attributes] as string[] || []);
    const selectedOpts = Array.isArray(selectedAttributes[attribute])
      ? (selectedAttributes[attribute] as string[])
      : [];
    const allOptions = Array.from(new Set([...defaultOpts, ...selectedOpts]));
    return allOptions.map((value) => ({
      label: value,
      value,
    }));
  };

  // Render details in a human-readable format.
  const renderDetails = () => (
    <div className="space-y-4 text-black">
      <div className="grid grid-cols-2 gap-4">
        <p><strong>Name:</strong> {vendor.name}</p>
        <p><strong>Email:</strong> {vendor.email}</p>
        <p><strong>Phone:</strong> {vendor.phone}</p>
        <p><strong>State:</strong> {vendor.state}</p>
        <p><strong>Country:</strong> {vendor.country}</p>
        <p><strong>Mark Up:</strong> {vendor.mark_up}</p>
        <p><strong>GST Number:</strong> {vendor.gst_number}</p>
        <p><strong>PAN Number:</strong> {vendor.pan_number}</p>
        <p><strong>Delivery Destination:</strong> {vendor.delivery_destination}</p>
        <p><strong>Address:</strong> {vendor.address}</p>
        <p><strong>Remarks:</strong> {vendor.remarks}</p>
        <p>
          <strong>Attributes:</strong>{" "}
          {vendor.attributes && Object.keys(vendor.attributes).length > 0 ? (
            <ul>
              {Object.entries(vendor.attributes).map(([key, value]) => (
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
          <strong>Vendor People:</strong>{" "}
          {vendor.vendor_people_list && vendor.vendor_people_list.length > 0 ? (
            <ul>
              {vendor.vendor_people_list.map((person, index) => (
                <li key={index}>
                  <strong>ID:</strong> {person.id}, <strong>Name:</strong> {person.name}
                </li>
              ))}
            </ul>
          ) : (
            "None"
          )}
        </p>
        <p><strong>Created Date:</strong> {vendor["created_date"]}</p>
        <p><strong>Updated Date:</strong> {vendor["updated_date"]}</p>
      </div>
    </div>
  );

  // Render form for editing vendor.
  const renderForm = () => (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex justify-start items-center gap-2">
        <label className="text-gray-700">Name</label>
        <h1 className="font-bold text-lg">{vendor.name}</h1>
      </div>
      <Input
        label="Email"
        type="email"
        name="email"
        value={vendor.email}
        onChange={handleInputChange}
        required
      />
      <Input
        label="Phone"
        type="tel"
        name="phone"
        value={vendor.phone}
        onChange={handleInputChange}
        required
      />
      <Input
        label="State"
        type="text"
        name="state"
        value={vendor.state}
        onChange={handleInputChange}
      />
      <Input
        label="Country"
        type="text"
        name="country"
        value={vendor.country}
        onChange={handleInputChange}
      />
      <Input
        label="GST Number"
        type="text"
        name="gst_number"
        value={vendor.gst_number}
        onChange={handleInputChange}
      />
      <Input
        label="Mark Up"
        type="text"
        name="mark_up"
        value={vendor.mark_up}
        onChange={handleInputChange}
      />
      <Input
        label="Delivery Destination"
        type="text"
        name="delivery_destination"
        value={vendor.delivery_destination}
        onChange={handleInputChange}
      />
      <Input
        label="Address"
        type="text"
        name="address"
        value={vendor.address}
        onChange={handleInputChange}
      />
      <Input
        label="Remarks"
        type="text"
        name="remarks"
        value={vendor.remarks}
        onChange={handleInputChange}
      />
      <Input
        label="Code"
        type="text"
        name="code"
        value={vendor.code}
        onChange={handleInputChange}
      />
      <div className="flex justify-start items-center gap-2">
        <label className="text-gray-700">Status</label>
        <h1 className="font-bold text-lg">{vendor.status}</h1>
      </div>
      {/*
        Render MultiSelect for attributes (excluding vendor_people_list)
      */}
      {Object.entries(selectedAttributes).map(([key, values]) => {
        if (key !== "vendor_people_list") {
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
        Render dedicated MultiSelect for Vendor People
      */}
      <div>
        <label className="block text-gray-700">Select Vendor People</label>
        <MultiSelect
          options={unlinkedPeople.map((person) => ({
            label: `${person.name} (${person.email})`,
            value: JSON.stringify({ id: person._id || person.id, name: person.name }),
          }))}
          value={(selectedAttributes.vendor_people_list as string[]).map((personStr) => {
            const personObj = JSON.parse(personStr);
            return {
              label: personObj.name,
              value: personStr,
            };
          })}
          onChange={(selected: Option[]) => {
            const people = selected.map((option) => option.value);
            setSelectedAttributes((prev) => ({
              ...prev,
              vendor_people_list: people,
            }));
          }}
          labelledBy="Select Vendor People"
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

  return (
    <div className="p-3 md:p-8 bg-white rounded shadow text-black text-xs md:text-base">
      <h1 className="text-2xl font-bold mb-4">Vendor Details</h1>
      {!isEditing ? (
        <>
          <div
            className="flex justify-end items-center"
            onClick={() => setIsEditing(true)}
          >
            <FaEdit className="text-blue-500 text-2xl" />
          </div>
          {renderDetails()}
        </>
      ) : (
        renderForm()
      )}
    </div>
  );
};

export default VendorDetailsPage;
