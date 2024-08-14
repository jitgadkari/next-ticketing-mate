"use client";

import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Input from '../../../components/Input';
import Button from '../../../components/Button';
import { MultiSelect, Option } from 'react-multi-select-component';

interface Customer {
  _id: string;
  name: string;
  fiber: string[];
  certifications: string[];
  approvals: string[];
  people: string[];
  state: string;
  country: string;
  contact: string;
  email: string;
  gst_number: string;
  delivery_destination: string[];
  delivery_terms: string[];
  pan_number: string;
  group: string;
}

interface Attributes {
  fiber: string[];
  certifications: string[];
  approvals: string[];
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

const CustomerDetailsPage = () => {
  const router = useRouter();
  const { id } = useParams();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [defaultAttributes, setDefaultAttributes] = useState<Attributes | null>(null);
  const [unlinkedPeople, setUnlinkedPeople] = useState<Person[]>([]);
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string[]>>({
    fiber: [],
    certifications: [],
    approvals: [],
    delivery_destination: [],
    delivery_terms: [],
    people: [],
    group: []
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_ENDPOINT_URL}/customer/${customerId}`);
      const data = await response.json();
      setCustomer(data.customer);
      setSelectedAttributes({
        fiber: data.customer.fiber,
        certifications: data.customer.certifications,
        approvals: data.customer.approvals,
        delivery_destination: data.customer.delivery_destination,
        delivery_terms: data.customer.delivery_terms,
        people: data.customer.people,
        group: [data.customer.group]
      });
    } catch (error) {
      console.error('Error fetching customer:', error);
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
    if (customer) {
      setCustomer({ ...customer, [name]: value });
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
    if (customer) {
      // logging the form data
      
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_ENDPOINT_URL}/customer`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name: customer.name, update_dict: { ...customer, ...selectedAttributes, group: selectedAttributes.group[0] } }),
        });

        if (response.ok) {
          setIsEditing(false);
          router.push('/intrendapp/customers');
        } else {
          const errorData = await response.json();
          console.error('Failed to update customer', errorData);
        }
      } catch (error) {
        console.error('Error updating customer:', error);
      }
    }
  };

  if (!customer || !defaultAttributes) return <div>Loading...</div>;

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
      <h1 className="text-2xl font-bold mb-4">Customer Details</h1>
      {isEditing ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Name"
            type="text"
            name="name"
            value={customer.name}
            onChange={handleInputChange}
            required
          />
          <Input
            label="Phone"
            type="text"
            name="contact"
            value={customer.contact}
            onChange={handleInputChange}
            required
          />
          <Input
            label="Email"
            type="email"
            name="email"
            value={customer.email}
            onChange={handleInputChange}
            required
          />
          <Input
            label="State"
            type="text"
            name="state"
            value={customer.state}
            onChange={handleInputChange}
            required
          />
          <Input
            label="Country"
            type="text"
            name="country"
            value={customer.country}
            onChange={handleInputChange}
            required
          />
          <Input
            label="GST Number"
            type="text"
            name="gst_number"
            value={customer.gst_number}
            onChange={handleInputChange}
            required
          />
          <Input
            label="PAN Number"
            type="text"
            name="pan_number"
            value={customer.pan_number}
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
            Update Customer
          </Button>
        </form>
      ) : (
        <div className="space-y-4">
          <div>
            <strong>Name:</strong> {customer.name}
          </div>
          <div>
            <strong>Phone:</strong> {customer.contact}
          </div>
          <div>
            <strong>Email:</strong> {customer.email}
          </div>
          <div>
            <strong>State:</strong> {customer.state}
          </div>
          <div>
            <strong>Country:</strong> {customer.country}
          </div>
          <div>
            <strong>GST Number:</strong> {customer.gst_number}
          </div>
          <div>
            <strong>PAN Number:</strong> {customer.pan_number}
          </div>
          <div>
            <strong>Group:</strong> {customer.group}
          </div>
          <div>
            <strong>Fiber:</strong> {customer.fiber.join(', ')}
          </div>
          <div>
            <strong>Certifications:</strong> {customer.certifications.join(', ')}
          </div>
          <div>
            <strong>Approvals:</strong> {customer.approvals.join(', ')}
          </div>
          <div>
            <strong>Delivery Destination:</strong> {customer.delivery_destination.join(', ')}
          </div>
          <div>
            <strong>Delivery Terms:</strong> {customer.delivery_terms.join(', ')}
          </div>
          <div>
            <strong>People:</strong> {customer.people.join(', ')}
          </div>
          <Button onClick={() => setIsEditing(true)} className="w-full">
            Edit Customer
          </Button>
        </div>
      )}
    </div>
  );
};

export default CustomerDetailsPage;
