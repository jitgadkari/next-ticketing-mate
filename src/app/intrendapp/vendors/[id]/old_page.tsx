"use client";

import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Input from '../../../components/Input';
import Button from '../../../components/Button';
import { MultiSelect, Option } from 'react-multi-select-component';

interface Vendor {
  _id: string;
  name: string;
  fiber: string[];
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
  delivery_destination: string[];
  delivery_terms: string[];
  factory_location: string;
  state: string;
  contact: string;
  email: string;
  gst_number: string;
  pan_number: string;
  group: string;
}

interface Attributes {
  fiber: string[];
  width: string[];
  content: string[];
  type: string[];
  certifications: string[];
  approvals: string[];
  weave: string[];
  weave_type: string[];
  designs: string[];
  payment_terms: string[];
  delivery_destination: string[];
  delivery_terms: string[];
  group: string[];
}

interface Person {
  name: string;
  phone: string;
  email: string;
  type_employee: string;
  linked: string;
  linked_to: string | null;
  linked_to_id: string | null;
}

const VendorDetailsPage = () => {
  const router = useRouter();
  const { id } = useParams();
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [defaultAttributes, setDefaultAttributes] = useState<Attributes | null>(null);
  const [unlinkedPeople, setUnlinkedPeople] = useState<Person[]>([]);
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string[]>>({
    fiber: [],
    width: [],
    content: [],
    type: [],
    certifications: [],
    approvals: [],
    weave: [],
    weave_type: [],
    designs: [],
    delivery_destination: [],
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
        fiber: data.vendor.fiber,
        width: data.vendor.width,
        content: data.vendor.content,
        type: data.vendor.type,
        certifications: data.vendor.certifications,
        approvals: data.vendor.approvals,
        weave: data.vendor.weave,
        weave_type: data.vendor.weave_type,
        designs: data.vendor.designs,
        delivery_destination: data.vendor.delivery_destination,
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_ENDPOINT_URL}/unlinked_people`);
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
          body: JSON.stringify({ name: vendor.name, update_dict: { ...vendor, ...selectedAttributes, group: selectedAttributes.group[0] } }),
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

  const attributeOptions = (attribute: string) =>
    defaultAttributes[attribute as keyof Attributes]?.map((value) => ({
      label: value,
      value,
    })) || [];

  const peopleOptions = unlinkedPeople.map(person => ({
    label: person.name,
    value: person.name,
  }));

  return (
    <div className="p-8 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Vendor Details</h1>
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
            type="text"
            name="contact"
            value={vendor.contact}
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
            required
          />
          <Input
            label="State"
            type="text"
            name="state"
            value={vendor.state}
            onChange={handleInputChange}
            required
          />
          <Input
            label="GST Number"
            type="text"
            name="gst_number"
            value={vendor.gst_number}
            onChange={handleInputChange}
            required
          />
          <Input
            label="PAN Number"
            type="text"
            name="pan_number"
            value={vendor.pan_number}
            onChange={handleInputChange}
            required
          />
          <div>
            <label className="block text-gray-700">Group</label>
            <MultiSelect
              options={attributeOptions('group')}
              value={selectedAttributes.group.map(value => ({ label: value, value }))}
              onChange={(selected: Option[]) => handleMultiSelectChange('group', selected)}
              labelledBy="Select Group"
              hasSelectAll={false}
            />
          </div>
          <div>
            <label className="block text-gray-700">Fiber</label>
            <div className="flex flex-wrap gap-2">
              {selectedAttributes.fiber.map(value => (
                <div key={value} className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full flex items-center space-x-2">
                  <span>{value}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveBubble('fiber', value)}
                    className="text-red-500 hover:text-red-700"
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
            <MultiSelect
              options={attributeOptions('fiber')}
              value={selectedAttributes.fiber.map(value => ({ label: value, value }))}
              onChange={(selected: Option[]) => handleMultiSelectChange('fiber', selected)}
              labelledBy="Select Fiber"
            />
          </div>
          <div>
            <label className="block text-gray-700">Width</label>
            <div className="flex flex-wrap gap-2">
              {selectedAttributes.width.map(value => (
                <div key={value} className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full flex items-center space-x-2">
                  <span>{value}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveBubble('width', value)}
                    className="text-red-500 hover:text-red-700"
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
            <MultiSelect
              options={attributeOptions('width')}
              value={selectedAttributes.width.map(value => ({ label: value, value }))}
              onChange={(selected: Option[]) => handleMultiSelectChange('width', selected)}
              labelledBy="Select Width"
            />
          </div>
          <div>
            <label className="block text-gray-700">Content</label>
            <div className="flex flex-wrap gap-2">
              {selectedAttributes.content.map(value => (
                <div key={value} className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full flex items-center space-x-2">
                  <span>{value}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveBubble('content', value)}
                    className="text-red-500 hover:text-red-700"
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
            <MultiSelect
              options={attributeOptions('content')}
              value={selectedAttributes.content.map(value => ({ label: value, value }))}
              onChange={(selected: Option[]) => handleMultiSelectChange('content', selected)}
              labelledBy="Select Content"
            />
          </div>
          <div>
            <label className="block text-gray-700">Type</label>
            <div className="flex flex-wrap gap-2">
              {selectedAttributes.type.map(value => (
                <div key={value} className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full flex items-center space-x-2">
                  <span>{value}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveBubble('type', value)}
                    className="text-red-500 hover:text-red-700"
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
            <MultiSelect
              options={attributeOptions('type')}
              value={selectedAttributes.type.map(value => ({ label: value, value }))}
              onChange={(selected: Option[]) => handleMultiSelectChange('type', selected)}
              labelledBy="Select Type"
            />
          </div>
          <div>
            <label className="block text-gray-700">Certifications</label>
            <div className="flex flex-wrap gap-2">
              {selectedAttributes.certifications.map(value => (
                <div key={value} className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full flex items-center space-x-2">
                  <span>{value}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveBubble('certifications', value)}
                    className="text-red-500 hover:text-red-700"
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
            <MultiSelect
              options={attributeOptions('certifications')}
              value={selectedAttributes.certifications.map(value => ({ label: value, value }))}
              onChange={(selected: Option[]) => handleMultiSelectChange('certifications', selected)}
              labelledBy="Select Certifications"
            />
          </div>
          <div>
            <label className="block text-gray-700">Approvals</label>
            <div className="flex flex-wrap gap-2">
              {selectedAttributes.approvals.map(value => (
                <div key={value} className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full flex items-center space-x-2">
                  <span>{value}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveBubble('approvals', value)}
                    className="text-red-500 hover:text-red-700"
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
            <MultiSelect
              options={attributeOptions('approvals')}
              value={selectedAttributes.approvals.map(value => ({ label: value, value }))}
              onChange={(selected: Option[]) => handleMultiSelectChange('approvals', selected)}
              labelledBy="Select Approvals"
            />
          </div>
          <div>
            <label className="block text-gray-700">Weave</label>
            <div className="flex flex-wrap gap-2">
              {selectedAttributes.weave.map(value => (
                <div key={value} className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full flex items-center space-x-2">
                  <span>{value}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveBubble('weave', value)}
                    className="text-red-500 hover:text-red-700"
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
            <MultiSelect
              options={attributeOptions('weave')}
              value={selectedAttributes.weave.map(value => ({ label: value, value }))}
              onChange={(selected: Option[]) => handleMultiSelectChange('weave', selected)}
              labelledBy="Select Weave"
            />
          </div>
          <div>
            <label className="block text-gray-700">Weave Type</label>
            <div className="flex flex-wrap gap-2">
              {selectedAttributes.weave_type.map(value => (
                <div key={value} className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full flex items-center space-x-2">
                  <span>{value}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveBubble('weave_type', value)}
                    className="text-red-500 hover:text-red-700"
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
            <MultiSelect
              options={attributeOptions('weave_type')}
              value={selectedAttributes.weave_type.map(value => ({ label: value, value }))}
              onChange={(selected: Option[]) => handleMultiSelectChange('weave_type', selected)}
              labelledBy="Select Weave Type"
            />
          </div>
          <div>
            <label className="block text-gray-700">Designs</label>
            <div className="flex flex-wrap gap-2">
              {selectedAttributes.designs.map(value => (
                <div key={value} className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full flex items-center space-x-2">
                  <span>{value}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveBubble('designs', value)}
                    className="text-red-500 hover:text-red-700"
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
            <MultiSelect
              options={attributeOptions('designs')}
              value={selectedAttributes.designs.map(value => ({ label: value, value }))}
              onChange={(selected: Option[]) => handleMultiSelectChange('designs', selected)}
              labelledBy="Select Designs"
            />
          </div>
          <div>
            <label className="block text-gray-700">Delivery Destination</label>
            <div className="flex flex-wrap gap-2">
              {selectedAttributes.delivery_destination.map(value => (
                <div key={value} className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full flex items-center space-x-2">
                  <span>{value}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveBubble('delivery_destination', value)}
                    className="text-red-500 hover:text-red-700"
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
            <MultiSelect
              options={attributeOptions('delivery_destination')}
              value={selectedAttributes.delivery_destination.map(value => ({ label: value, value }))}
              onChange={(selected: Option[]) => handleMultiSelectChange('delivery_destination', selected)}
              labelledBy="Select Delivery Destination"
            />
          </div>
          <div>
            <label className="block text-gray-700">Delivery Terms</label>
            <div className="flex flex-wrap gap-2">
              {selectedAttributes.delivery_terms.map(value => (
                <div key={value} className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full flex items-center space-x-2">
                  <span>{value}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveBubble('delivery_terms', value)}
                    className="text-red-500 hover:text-red-700"
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
            <MultiSelect
              options={attributeOptions('delivery_terms')}
              value={selectedAttributes.delivery_terms.map(value => ({ label: value, value }))}
              onChange={(selected: Option[]) => handleMultiSelectChange('delivery_terms', selected)}
              labelledBy="Select Delivery Terms"
            />
          </div>
          <div>
            <label className="block text-gray-700">People</label>
            <div className="flex flex-wrap gap-2">
              {selectedAttributes.people.map(value => (
                <div key={value} className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full flex items-center space-x-2">
                  <span>{value}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveBubble('people', value)}
                    className="text-red-500 hover:text-red-700"
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
            <MultiSelect
              options={peopleOptions}
              value={selectedAttributes.people.map(value => ({ label: value, value }))}
              onChange={(selected: Option[]) => handleMultiSelectChange('people', selected)}
              labelledBy="Select People"
            />
          </div>
          <Button type="submit" className="w-full">
            Update Vendor
          </Button>
        </form>
      ) : (
        <div className="space-y-4">
          <div>
            <strong>Name:</strong> {vendor.name}
          </div>
          <div>
            <strong>Phone:</strong> {vendor.contact}
          </div>
          <div>
            <strong>Email:</strong> {vendor.email}
          </div>
          <div>
            <strong>Factory Location:</strong> {vendor.factory_location}
          </div>
          <div>
            <strong>State:</strong> {vendor.state}
          </div>
          <div>
            <strong>GST Number:</strong> {vendor.gst_number}
          </div>
          <div>
            <strong>PAN Number:</strong> {vendor.pan_number}
          </div>
          <div>
            <strong>Group:</strong> {vendor.group}
          </div>
          <div>
            <strong>Fiber:</strong> {vendor.fiber.join(', ')}
          </div>
          <div>
            <strong>Width:</strong> {vendor.width.join(', ')}
          </div>
          <div>
            <strong>Content:</strong> {vendor.content.join(', ')}
          </div>
          <div>
            <strong>Type:</strong> {vendor.type.join(', ')}
          </div>
          <div>
            <strong>Certifications:</strong> {vendor.certifications.join(', ')}
          </div>
          <div>
            <strong>Approvals:</strong> {vendor.approvals.join(', ')}
          </div>
          <div>
            <strong>Weave:</strong> {vendor.weave.join(', ')}
          </div>
          <div>
            <strong>Weave Type:</strong> {vendor.weave_type.join(', ')}
          </div>
          <div>
            <strong>Designs:</strong> {vendor.designs.join(', ')}
          </div>
          <div>
            <strong>Delivery Destination:</strong> {vendor.delivery_destination.join(', ')}
          </div>
          <div>
            <strong>Delivery Terms:</strong> {vendor.delivery_terms.join(', ')}
          </div>
          <div>
            <strong>People:</strong> {vendor.people.join(', ')}
          </div>
          <Button onClick={() => setIsEditing(true)} className="w-full">
            Edit Vendor
          </Button>
        </div>
      )}
    </div>
  );
};

export default VendorDetailsPage;
