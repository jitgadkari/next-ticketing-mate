"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Input from '../../../components/Input';
import Button from '../../../components/Button';

interface Person {
  _id: string;
  name: string;
  email: string;
  phone: string;
  type_employee: string;
  linked: string;
  linked_to: string;
  linked_to_id: string;
}

const PersonDetailsPage = () => {
  const { id } = useParams();

  const [person, setPerson] = useState<Person | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    type_employee: '',
    linked: '',
    linked_to: '',
    linked_to_id: '',
  });

  useEffect(() => {
    if (id) {
      const fetchPerson = async () => {
        try {
          const response = await fetch(`http://localhost:8000/people/${id}`);
          const data = await response.json();
          setPerson(data.person);
          setFormData({
            name: data.person.name,
            email: data.person.email,
            phone: data.person.phone,
            type_employee: data.person.type_employee,
            linked: data.person.linked,
            linked_to: data.person.linked_to,
            linked_to_id: data.person.linked_to_id,
          });
        } catch (error) {
          console.error('Error fetching person:', error);
        }
      };
      fetchPerson();
    }
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleUpdate = async () => {
    try {
      const response = await fetch(`http://localhost:8000/person`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: person?._id,
          update_dict: formData,
        }),
      });

      if (response.ok) {
        setEditMode(false);
        const updatedPerson = await response.json();
        setPerson(updatedPerson.person);
      } else {
        const errorData = await response.json();
        console.error('Failed to update person', errorData);
      }
    } catch (error) {
      console.error('Error updating person:', error);
    }
  };

  if (!person) return <div>Loading...</div>;

  return (
    <div className="p-8 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Person Details</h1>
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
            label="Email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <Input
            label="Phone"
            type="text"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
          />
          <Input
            label="Type Employee"
            type="text"
            name="type_employee"
            value={formData.type_employee}
            onChange={handleChange}
            required
          />
          <Input
            label="Linked"
            type="text"
            name="linked"
            value={formData.linked}
            onChange={handleChange}
            required
          />
          <Input
            label="Linked To"
            type="text"
            name="linked_to"
            value={formData.linked_to}
            onChange={handleChange}
            required
          />
          <Input
            label="Linked To ID"
            type="text"
            name="linked_to_id"
            value={formData.linked_to_id}
            onChange={handleChange}
            required
          />
          <Button type="button" onClick={handleUpdate} className="w-full">
            Update Person
          </Button>
        </form>
      ) : (
        <div>
          <p><strong>Name:</strong> {person.name}</p>
          <p><strong>Email:</strong> {person.email}</p>
          <p><strong>Phone:</strong> {person.phone}</p>
          <p><strong>Type Employee:</strong> {person.type_employee}</p>
          <p><strong>Linked:</strong> {person.linked}</p>
          <p><strong>Linked To:</strong> {person.linked_to}</p>
          <p><strong>Linked To ID:</strong> {person.linked_to_id}</p>
          <Button type="button" onClick={() => setEditMode(true)} className="mt-4">
            Edit Person
          </Button>
        </div>
      )}
    </div>
  );
};

export default PersonDetailsPage;
