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
  email: string;
  phone: string;
  code: string;
  attributes: {
    latest: {
      attributes: {
        width?: string[];
        fabric_type?: string[];
        content?: string[];
        type?: string[];
        certifications?: string[];
        approvals?: string[];
        weave?: string[];
        weave_type?: string[];
        designs?: string[];
        delivery_terms?: string[];
      };
    };
  };
  vendor_people_list: { id: string; name: string }[];

  state: string;
  country: string;
  delivery_destination: string;
  address: string;
  remarks: string;
  additional_info: Record<string, any>;
  versions: any[];
  created_date: string;
  updated_date: string;
  status: string;
  factory_location: string;
  gst_number: string;
  pan_number: string;
  mark_up: string;
  whatsapp_groups?: { id: string; name: string }[];
}

interface AttributesResponse {
  timestamp: string;
  attributes: {
    latest: {
      attributes: {
        type: string[];
        weave: string[];
        width: string[];
        content: string[];
        designs: string[];
        certifications: string[];
        delivery_terms: string[];
        fabric_type: string[];
        weave_type: string[];
        approvals: string[];
      };
    };
  };
  version_note: string;
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

const VendorDetailsPage: React.FC = () => {
  const router = useRouter();
  const { id } = useParams();
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [defaultAttributes, setDefaultAttributes] = useState<Record<
    string,
    string[]
  > | null>(null);
  const [unlinkedPeople, setUnlinkedPeople] = useState<Person[]>([]);
  // For vendor people, we store an array of JSON-stringified objects in "vendor_people_list".
  const [selectedAttributes, setSelectedAttributes] = useState<
    Record<string, string[]>
  >({
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
    vendor_people_list: [],
  });
  const [isEditing, setIsEditing] = useState(false);
  const [whatsappGroups, setWhatsappGroups] = useState<
    { id: string; name: string }[]
  >([]);
  const routerHook = useRouter();

  useEffect(() => {
    if (id) {
      fetchVendor(id as string);
      fetchDefaultAttributes();
      fetchUnlinkedPeople();
      fetchWhatsappGroups();
    }
  }, [id]);

  const fetchVendor = async (vendorId: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/api/vendors/${vendorId}`
      );
      const data = await response.json();
      console.log("fetchVendor", data);
      const fetchedVendor: Vendor = data.vendor;
      setVendor(fetchedVendor);
      // Initialize selectedAttributes from vendor.attributes
      const latestAttributes =
        fetchedVendor.attributes?.latest?.attributes || {};
      console.log(
        "[VendorDetails] Vendor latest attributes:",
        latestAttributes
      );

      setSelectedAttributes({
        fabric_type: latestAttributes.fabric_type || [],
        width: latestAttributes.width || [],
        content: latestAttributes.content || [],
        type: latestAttributes.type || [],
        certifications: latestAttributes.certifications || [],
        approvals: latestAttributes.approvals || [],
        weave: latestAttributes.weave || [],
        weave_type: latestAttributes.weave_type || [],
        designs: latestAttributes.designs || [],
        delivery_terms: latestAttributes.delivery_terms || [],
        vendor_people_list: fetchedVendor.vendor_people_list
          ? fetchedVendor.vendor_people_list.map((person) =>
              JSON.stringify({ id: person.id, name: person.name })
            )
          : [],
      });
    } catch (error) {
      console.error("Error fetching vendor:", error);
    }
  };

  const fetchDefaultAttributes = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/api/attributes`
      );
      const data = await response.json();
      console.log("[VendorDetails] Full attributes response:", data);
      const latestAttributes = data.attributes.latest.attributes;
      console.log("[VendorDetails] Latest attributes:", latestAttributes);
      setDefaultAttributes(latestAttributes);
    } catch (error) {
      console.error("Error fetching default attributes:", error);
    }
  };

  const fetchUnlinkedPeople = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/api/persons/unlinked`
      );
      const data = await response.json();
      console.log("[VendorDetails] Fetching unlinked people", data);
      setUnlinkedPeople(data.unlinked_people);
    } catch (error) {
      console.error("Error fetching unlinked people:", error);
    }
  };

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
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

  const handleWhatsappGroupsChange = (selected: Option[]) => {
    if (vendor) {
      const selectedGroups = selected.map((option) => JSON.parse(option.value));
      setVendor({
        ...vendor,
        whatsapp_groups: selectedGroups,
      });
    }
  };

  const fetchWhatsappGroups = async () => {
    try {
      const response = await fetch(
        "http://localhost:5001/api/integrations/latest"
      );
      if (response.ok) {
        const data: IntegrationResponse = await response.json();
        const groups = data.latest?.integrations?.whatsapp?.groups || [];
        const formattedGroups = groups.map((group) => ({
          id: group.id || group.group_id || "",
          name: group.name || group.group_name || "Unnamed Group",
        }));
        setWhatsappGroups(formattedGroups);
      }
    } catch (error) {
      console.error("Error fetching WhatsApp groups:", error);
    }
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
        const vendorPeople =
          selectedAttributes.vendor_people_list.length > 0
            ? selectedAttributes.vendor_people_list.map((personStr) =>
                JSON.parse(personStr)
              )
            : vendor.vendor_people_list.map((person) => ({
                id: person.id,
                name: person.name,
              }));

        // Remove any people keys from attributes.
        // const { vendor_people_list: _ignored, ...otherAttributes } = vendor.attributes;
        const update_dict = {
          ...vendor,
          attributes: {
            latest: {
              attributes: {
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
            },
          },
          vendor_people_list: vendorPeople, // Top-level vendor_people_list
        };
        console.log("Final update_dict:", update_dict);
        console.log(
          "Payload:",
          JSON.stringify({
            ...update_dict,
            delivery_destination: vendor.delivery_destination,
          })
        );
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/api/vendors/${id}?userId=1&userAgent=user-test`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              ...update_dict,
              delivery_destination: vendor.delivery_destination,
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
        value: JSON.stringify({
          id: person._id || person._id,
          name: person.name,
        }),
      }));
    }

    // Get the default options from the attributes response
    const defaultOpts = defaultAttributes?.[attribute] || [];
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
        <p>
          <strong>Name:</strong> {vendor.name}
        </p>
        <p>
          <strong>Email:</strong> {vendor.email}
        </p>
        <p>
          <strong>Phone:</strong> {vendor.phone}
        </p>
        <p>
          <strong>Code:</strong> {vendor.code}
        </p>
        <p>
          <strong>Status:</strong> {vendor.status}
        </p>
        <p>
          <strong>State:</strong> {vendor.state || "N/A"}
        </p>
        <p>
          <strong>Country:</strong> {vendor.country || "N/A"}
        </p>
        <p>
          <strong>Factory Location:</strong> {vendor.factory_location || "N/A"}
        </p>
        <p>
          <strong>Delivery Destination:</strong>{" "}
          {vendor.delivery_destination || "N/A"}
        </p>
        <p>
          <strong>Address:</strong> {vendor.address || "N/A"}
        </p>
        <p>
          <strong>Remarks:</strong> {vendor.remarks || "N/A"}
        </p>
        <p>
          <strong>Attributes:</strong>{" "}
          {vendor.attributes?.latest?.attributes &&
          Object.keys(vendor.attributes?.latest?.attributes).length > 0 ? (
            <ul className="list-disc pl-4">
              {Object.entries(vendor.attributes?.latest?.attributes).map(
                ([key, value]) => (
                  <li key={key}>
                    <strong>{key}:</strong>{" "}
                    {Array.isArray(value) ? value.join(", ") : String(value)}
                  </li>
                )
              )}
            </ul>
          ) : (
            "None"
          )}
        </p>
        <p>
          <strong>Vendor People:</strong>{" "}
          {vendor.vendor_people_list && vendor.vendor_people_list.length > 0 ? (
            <ul className="list-disc pl-4">
              {vendor.vendor_people_list.map((person, index) => (
                <li key={index}>
                  <strong>Name:</strong> {person.name}
                </li>
              ))}
            </ul>
          ) : (
            "None"
          )}
        </p>
        <p>
          <strong>Created Date:</strong>{" "}
          {new Date(vendor.created_date).toLocaleString()}
        </p>
        <p>
          <strong>Updated Date:</strong>{" "}
          {new Date(vendor.updated_date).toLocaleString()}
        </p>
        <p>
          <strong>WhatsApp Groups:</strong>{" "}
          {vendor.whatsapp_groups && vendor.whatsapp_groups.length > 0 ? (
            <ul className="list-disc pl-4">
              {vendor.whatsapp_groups.map((group, index) => (
                <li key={index}>{group.name}</li>
              ))}
            </ul>
          ) : (
            "None"
          )}
        </p>
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
        label="PAN Number"
        type="text"
        name="pan_number"
        value={vendor.pan_number || ""}
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
        label="Factory Location"
        type="text"
        name="factory_location"
        value={vendor.factory_location || ""}
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
              <label className="block text-gray-700 capitalize mb-1">
                {key.replaceAll("_", " ")}
              </label>

              {/* Selected Value Chips */}
              {(values as string[]).length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {(values as string[]).map((val, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-sm text-blue-800"
                    >
                      {val}
                      <button
                        type="button"
                        onClick={() => {
                          const updatedList = (values as string[]).filter(
                            (item) => item !== val
                          );
                          setSelectedAttributes((prev) => ({
                            ...prev,
                            [key]: updatedList,
                          }));
                        }}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        ❌
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* MultiSelect Dropdown */}
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
          );
        }
        return null;
      })}

      {/*
        Render dedicated MultiSelect for Vendor People
      */}
      <div>
        <label className="block text-gray-700">Select Vendor People</label>
        {/* Selected Vendor People Display */}
        {selectedAttributes.vendor_people_list.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {selectedAttributes.vendor_people_list.map((personStr, idx) => {
              const person = JSON.parse(personStr);
              return (
                <div
                  key={idx}
                  className="flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-sm text-blue-800"
                >
                  {person.name}
                  <button
                    type="button"
                    onClick={() => {
                      const updatedList =
                        selectedAttributes.vendor_people_list.filter(
                          (p) => p !== personStr
                        );
                      setSelectedAttributes((prev) => ({
                        ...prev,
                        vendor_people_list: updatedList,
                      }));
                    }}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    ❌
                  </button>
                </div>
              );
            })}
          </div>
        )}

        <MultiSelect
          options={
            unlinkedPeople?.map((person) => ({
              label: `${person.name} (${person.email})`,
              value: JSON.stringify({
                id: person._id || person._id,
                name: person.name,
              }),
            })) || []
          }
          value={(selectedAttributes.vendor_people_list as string[]).map(
            (personStr) => {
              const personObj = JSON.parse(personStr);
              return {
                label: personObj.name,
                value: personStr,
              };
            }
          )}
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
      <div>
        <label className="block text-gray-700">WhatsApp Groups</label>
        {/* Selected WhatsApp Groups Display */}
        {vendor.whatsapp_groups && vendor.whatsapp_groups.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {vendor.whatsapp_groups.map((group, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 text-sm text-green-800"
              >
                {group.name}
                <button
                  type="button"
                  onClick={() => {
                    const updatedGroups = vendor.whatsapp_groups!.filter(
                      (g) => g.id !== group.id
                    );
                    setVendor((prev) =>
                      prev ? { ...prev, whatsapp_groups: updatedGroups } : null
                    );
                  }}
                  className="text-green-600 hover:text-green-800"
                >
                  ❌
                </button>
              </div>
            ))}
          </div>
        )}

        <MultiSelect
          options={whatsappGroups.map((group) => ({
            label: group.name,
            value: JSON.stringify(group),
          }))}
          value={(vendor.whatsapp_groups || []).map((group) => ({
            label: group.name,
            value: JSON.stringify(group),
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
