"use client";

import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Input from '../../../components/Input';
import Button from '../../../components/Button';
import { MultiSelect, Option } from 'react-multi-select-component';

interface Vendor {
  _id: string;
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
  people: string[];
  payment_terms: string;
  delivery_destination: string;
  delivery_terms: string[];
  factory_location: string;
  state: string;
  phone: string;
  email: string;
  gst_number: string;
  pan_number: string;
  group: string;
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
  group: string[];
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
    people: [],
    group: []
  });
  const [isEditing, setIsEditing] = useState(false);

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
      setVendor(data.vendor);
      setSelectedAttributes({
        fabric_type: data.vendor.fabric_type,
        width: data.vendor.width,
        content: data.vendor.content,
        type: data.vendor.type,
        certifications: data.vendor.certifications,
        approvals: data.vendor.approvals,
        weave: data.vendor.weave,
        weave_type: data.vendor.weave_type,
        designs: data.vendor.designs,
        delivery_terms: data.vendor.delivery_terms,
        people: data.vendor.people,
        group: [data.vendor.group]
      });
    } catch (error) {
      console.error('Error fetching vendor:', error);
    }
  };

  const fetchDefaultAttributes = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_ENDPOINT_URL}/attributes`);
      const data = await response.json();
      setDefaultAttributes(data.attributes.DefaultAttributes);
    } catch (error) {
      console.error('Error fetching default attributes:', error);
    }
  };

  const fetchUnlinkedPeople = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_ENDPOINT_URL}/unlinked_people/?linked=No`);
      const data = await response.json();
      setUnlinkedPeople(data.people);
    } catch (error) {
      console.error('Error fetching unlinked people:', error);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (vendor) {
      setVendor({ ...vendor, [name]: value });
    }
  };

  const handleMultiSelectChange = (name: string, selected: Option[]) => {
    setSelectedAttributes(prevState => ({
      ...prevState,
      [name]: selected.map((option: Option) => option.value),
    }));
  };

  const handleRemoveBubble = (name: string, value: string) => {
    setSelectedAttributes(prevState => ({
      ...prevState,
      [name]: prevState[name].filter(item => item !== value),
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (vendor) {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_ENDPOINT_URL}/vendor`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: vendor.name,
            update_dict: {
              ...vendor,
              ...selectedAttributes,
              group: selectedAttributes.group[0],
              delivery_destination: vendor.delivery_destination
            }
          }),
        });

        if (response.ok) {
          setIsEditing(false);
          router.push('/intrendapp/vendors');
        } else {
          const errorData = await response.json();
          console.error('Failed to update vendor', errorData);
        }
      } catch (error) {
        console.error('Error updating vendor:', error);
      }
    }
  };

  if (!vendor || !defaultAttributes) return <div>Loading...</div>;

  const attributeOptions = (attribute: string) => {
    if (attribute === 'people') {
      return unlinkedPeople.map((person) => ({
        label: `${person.name} (${person.email})`,
        value: person.name,
      }));
    }
    return defaultAttributes[attribute as keyof Attributes]?.map((value) => ({
      label: value,
      value,
    })) || [];
  };

  return (
    <div className="p-4">
      {isEditing ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Name"
            type="text"
            name="name"
            value={vendor.name}
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
            label="Email"
            type="email"
            name="email"
            value={vendor.email}
            onChange={handleInputChange}
            required
          />
          <Input
            label="Factory Location"
            type="text"
            name="factory_location"
            value={vendor.factory_location}
            onChange={handleInputChange}
          />
          <Input
            label="State"
            type="text"
            name="state"
            value={vendor.state}
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
            value={vendor.pan_number}
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
            label="Group"
            type="text"
            name="group"
            value={vendor.group}
            onChange={handleInputChange}
          />
          {Object.entries(selectedAttributes).map(([key, values]) => (
            <div key={key}>
              <label className="block text-gray-700">{key.replace('_', ' ').charAt(0).toUpperCase() + key.slice(1)}</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {values.map(value => (
                  <div key={value} className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full flex items-center space-x-2">
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
              <MultiSelect
                options={attributeOptions(key)}
                value={values.map(value => ({ 
                  label: key === 'people' 
                    ? unlinkedPeople.find(p => p.name === value)?.name || value 
                    : value, 
                  value 
                }))}
                onChange={(selected: Option[]) => handleMultiSelectChange(key, selected)}
                labelledBy={`Select ${key.replace('_', ' ')}`}
              />
            </div>
          ))}
          <div className="flex justify-end space-x-4">
            <Button type="button" onClick={() => setIsEditing(false)} className="bg-gray-300 text-gray-800 hover:bg-gray-400">Cancel</Button>
            <Button type="submit" className="bg-blue-500 text-white hover:bg-blue-600">Save</Button>
          </div>
        </form>
      ) : (
        <div>
          <p><strong>Name:</strong> {vendor.name}</p>
          <p><strong>Phone:</strong> {vendor.phone}</p>
          <p><strong>Email:</strong> {vendor.email}</p>
          <p><strong>Factory Location:</strong> {vendor.factory_location}</p>
          <p><strong>State:</strong> {vendor.state}</p>
          <p><strong>GST Number:</strong> {vendor.gst_number}</p>
          <p><strong>PAN Number:</strong> {vendor.pan_number}</p>
          <p><strong>Delivery Destination:</strong> {vendor.delivery_destination}</p>
          <p><strong>Group:</strong> {vendor.group}</p>
          {Object.entries(selectedAttributes).map(([key, values]) => (
            <p key={key}>
              <strong>{key.replace('_', ' ').charAt(0).toUpperCase() + key.slice(1)}:</strong>
              {key === 'people'
                ? values.map(value => {
                    const person = unlinkedPeople.find(p => p.name === value);
                    return person ? `${person.name} (${person.email})` : value;
                  }).join(', ')
                : values.join(', ')}
            </p>
          ))}
          <div className="flex justify-end">
            <Button onClick={() => setIsEditing(true)} className="bg-blue-500 text-white hover:bg-blue-600">Edit</Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorDetailsPage;