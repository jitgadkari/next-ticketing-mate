"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Input from '../../../components/Input';
import Button from '../../../components/Button';

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

const VendorDetailsPage = () => {
  const { id } = useParams();

  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    fiber: '',
    width: '',
    content: '',
    type: '',
    certifications: '',
    approvals: '',
    weave: '',
    weave_type: '',
    designs: '',
    payment_terms: '',
    delivery_destination: '',
    delivery_terms: '',
    factory_location: '',
    state: '',
    contact: '',
    email: '',
    gst_number: '',
    pan_number: '',
    group: '',
  });

  useEffect(() => {
    if (id) {
      const fetchVendor = async () => {
        try {
          const response = await fetch(`http://localhost:8000/vendor/${id}`);
          const data = await response.json();
          setVendor(data.vendor);
          setFormData({
            name: data.vendor.name,
            fiber: data.vendor.fiber.join(', '),
            width: data.vendor.width.join(', '),
            content: data.vendor.content.join(', '),
            type: data.vendor.type.join(', '),
            certifications: data.vendor.certifications.join(', '),
            approvals: data.vendor.approvals.join(', '),
            weave: data.vendor.weave.join(', '),
            weave_type: data.vendor.weave_type.join(', '),
            designs: data.vendor.designs.join(', '),
            payment_terms: data.vendor.payment_terms,
            delivery_destination: data.vendor.delivery_destination.join(', '),
            delivery_terms: data.vendor.delivery_terms.join(', '),
            factory_location: data.vendor.factory_location,
            state: data.vendor.state,
            contact: data.vendor.contact,
            email: data.vendor.email,
            gst_number: data.vendor.gst_number,
            pan_number: data.vendor.pan_number,
            group: data.vendor.group,
          });
        } catch (error) {
          console.error('Error fetching vendor:', error);
        }
      };
      fetchVendor();
    }
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleUpdate = async () => {
    try {
      const response = await fetch(`http://localhost:8000/vendor`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: vendor?._id,
          update_dict: {
            ...formData,
            fiber: formData.fiber.split(',').map(item => item.trim()),
            width: formData.width.split(',').map(item => item.trim()),
            content: formData.content.split(',').map(item => item.trim()),
            type: formData.type.split(',').map(item => item.trim()),
            certifications: formData.certifications.split(',').map(item => item.trim()),
            approvals: formData.approvals.split(',').map(item => item.trim()),
            weave: formData.weave.split(',').map(item => item.trim()),
            weave_type: formData.weave_type.split(',').map(item => item.trim()),
            designs: formData.designs.split(',').map(item => item.trim()),
            delivery_destination: formData.delivery_destination.split(',').map(item => item.trim()),
            delivery_terms: formData.delivery_terms.split(',').map(item => item.trim()),
          },
        }),
      });

      if (response.ok) {
        setEditMode(false);
        const updatedVendor = await response.json();
        setVendor(updatedVendor.vendor);
      } else {
        const errorData = await response.json();
        console.error('Failed to update vendor', errorData);
      }
    } catch (error) {
      console.error('Error updating vendor:', error);
    }
  };

  if (!vendor) return <div>Loading...</div>;

  return (
    <div className="p-8 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Vendor Details</h1>
      {editMode ? (
        <form className="space-y-4">
          <Input
            label="Name"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <Input
            label="Fiber"
            type="text"
            name="fiber"
            value={formData.fiber}
            onChange={handleChange}
            required
          />
          <Input
            label="Width"
            type="text"
            name="width"
            value={formData.width}
            onChange={handleChange}
            required
          />
          <Input
            label="Content"
            type="text"
            name="content"
            value={formData.content}
            onChange={handleChange}
            required
          />
          <Input
            label="Type"
            type="text"
            name="type"
            value={formData.type}
            onChange={handleChange}
            required
          />
          <Input
            label="Certifications"
            type="text"
            name="certifications"
            value={formData.certifications}
            onChange={handleChange}
            required
          />
          <Input
            label="Approvals"
            type="text"
            name="approvals"
            value={formData.approvals}
            onChange={handleChange}
            required
          />
          <Input
            label="Weave"
            type="text"
            name="weave"
            value={formData.weave}
            onChange={handleChange}
            required
          />
          <Input
            label="Weave Type"
            type="text"
            name="weave_type"
            value={formData.weave_type}
            onChange={handleChange}
            required
          />
          <Input
            label="Designs"
            type="text"
            name="designs"
            value={formData.designs}
            onChange={handleChange}
            required
          />
          <Input
            label="Payment Terms"
            type="text"
            name="payment_terms"
            value={formData.payment_terms}
            onChange={handleChange}
            required
          />
          <Input
            label="Delivery Destination"
            type="text"
            name="delivery_destination"
            value={formData.delivery_destination}
            onChange={handleChange}
            required
          />
          <Input
            label="Delivery Terms"
            type="text"
            name="delivery_terms"
            value={formData.delivery_terms}
            onChange={handleChange}
            required
          />
          <Input
            label="Factory Location"
            type="text"
            name="factory_location"
            value={formData.factory_location}
            onChange={handleChange}
            required
          />
          <Input
            label="State"
            type="text"
            name="state"
            value={formData.state}
            onChange={handleChange}
            required
          />
          <Input
            label="Contact"
            type="text"
            name="contact"
            value={formData.contact}
            onChange={handleChange}
            required
          />
          <Input
            label="Email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <Input
            label="GST Number"
            type="text"
            name="gst_number"
            value={formData.gst_number}
            onChange={handleChange}
            required
          />
          <Input
            label="PAN Number"
            type="text"
            name="pan_number"
            value={formData.pan_number}
            onChange={handleChange}
            required
          />
          <Input
            label="Group"
            type="text"
            name="group"
            value={formData.group}
            onChange={handleChange}
            required
          />
          <Button type="button" onClick={handleUpdate} className="w-full">
            Update Vendor
          </Button>
        </form>
      ) : (
        <div>
          <p><strong>Name:</strong> {vendor.name}</p>
          <p><strong>Fiber:</strong> {vendor.fiber.join(', ')}</p>
          <p><strong>Width:</strong> {vendor.width.join(', ')}</p>
          <p><strong>Content:</strong> {vendor.content.join(', ')}</p>
          <p><strong>Type:</strong> {vendor.type.join(', ')}</p>
          <p><strong>Certifications:</strong> {vendor.certifications.join(', ')}</p>
          <p><strong>Approvals:</strong> {vendor.approvals.join(', ')}</p>
          <p><strong>Weave:</strong> {vendor.weave.join(', ')}</p>
          <p><strong>Weave Type:</strong> {vendor.weave_type.join(', ')}</p>
          <p><strong>Designs:</strong> {vendor.designs.join(', ')}</p>
          <p><strong>Payment Terms:</strong> {vendor.payment_terms}</p>
          <p><strong>Delivery Destination:</strong> {vendor.delivery_destination.join(', ')}</p>
          <p><strong>Delivery Terms:</strong> {vendor.delivery_terms.join(', ')}</p>
          <p><strong>Factory Location:</strong> {vendor.factory_location}</p>
          <p><strong>State:</strong> {vendor.state}</p>
          <p><strong>Contact:</strong> {vendor.contact}</p>
          <p><strong>Email:</strong> {vendor.email}</p>
          <p><strong>GST Number:</strong> {vendor.gst_number}</p>
          <p><strong>PAN Number:</strong> {vendor.pan_number}</p>
          <p><strong>Group:</strong> {vendor.group}</p>
          <Button type="button" onClick={() => setEditMode(true)} className="mt-4">
            Edit Vendor
          </Button>
        </div>
      )}
    </div>
  );
};

export default VendorDetailsPage;
