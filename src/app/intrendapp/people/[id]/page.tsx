'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Person {
  _id: string;
  Name: string;
  Phone: string;
  Email: string;
  TypeEmployee: string;
  linked: string;
  linked_to: string;
  linked_to_id: string;
  created_date?: string;
  updated_date?: string;
}

interface PageProps {
  params: { id: string }
}

export default function PersonDetailPage({ params }: PageProps) {
  const [person, setPerson] = useState<Person | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPerson = async () => {
      try {
        console.log('Fetching person with ID:', params.id);
        const response = await fetch(`http://localhost:8000/people/${params.id}`);
        console.log(response);
        if (!response.ok) {
          throw new Error('Failed to fetch person data');
        }
        const data = await response.json();
        console.log('Received data:', data);
        setPerson(data.person || data);
      } catch (err) {
        setError('An error occurred while fetching the person data.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPerson();
  }, [params.id]);

  if (loading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8 text-red-500">Error: {error}</div>;
  if (!person) return <div className="p-8">No person found</div>;

  return (
    <div className="p-8 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Person Details</h1>
      <div className="space-y-4">
        <p><strong>ID:</strong> {person._id}</p>
        <p><strong>Name:</strong> {person.Name}</p>
        <p><strong>Phone:</strong> {person.Phone}</p>
        <p><strong>Email:</strong> {person.Email}</p>
        <p><strong>Type:</strong> {person.TypeEmployee}</p>
        <p><strong>Linked:</strong> {person.linked}</p>
        <p><strong>Linked To:</strong> {person.linked_to}</p>
        <p><strong>Linked To ID:</strong> {person.linked_to_id}</p>
        {person.created_date && <p><strong>Created Date:</strong> {new Date(person.created_date).toLocaleString()}</p>}
        {person.updated_date && <p><strong>Updated Date:</strong> {new Date(person.updated_date).toLocaleString()}</p>}
      </div>
      <div className="mt-6">
        <Link href="/intrendapp/people" className="p-2 bg-blue-500 text-white rounded hover:bg-blue-700">
          Back to People List
        </Link>
      </div>
    </div>
  );
}