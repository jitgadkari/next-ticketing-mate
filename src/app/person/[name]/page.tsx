'use client';

import React, { useState, useEffect } from 'react';
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
}

interface PageProps {
  params: { name: string }
}

class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, error: Error | null}> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 bg-white rounded shadow">
          <h1 className="text-2xl font-bold mb-4">Something went wrong:</h1>
          <pre className="text-red-500">{this.state.error?.message}</pre>
          <div className="mt-6">
            <Link href="/people" className="p-2 bg-blue-500 text-white rounded hover:bg-blue-700">
              Back to People List
            </Link>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function PersonDetail({ params }: PageProps) {
  const [person, setPerson] = useState<Person | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPerson = async () => {
      try {
        console.log(`Fetching person with name: ${params.name}`);
        const response = await fetch(`http://localhost:8000/people/${encodeURIComponent(params.name)}`);
        console.log('Response status:', response.status);
        if (!response.ok) {
          throw new Error(`Failed to fetch person data: ${response.status}`);
        }
        const data = await response.json();
        console.log('Fetched data:', data);
        setPerson(data);
      } catch (err) {
        console.error('Error details:', err);
        setError('An error occurred while fetching the person data.');
      } finally {
        setLoading(false);
      }
    };

    fetchPerson();
  }, [params.name]);

  if (loading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8 text-red-500">Error: {error}</div>;
  if (!person) return <div className="p-8">No person found</div>;

  return (
    <div className="p-8 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Person Details</h1>
      <div className="space-y-4">
        <p><strong>Name:</strong> {person.Name}</p>
        <p><strong>Phone:</strong> {person.Phone}</p>
        <p><strong>Email:</strong> {person.Email}</p>
        <p><strong>Type:</strong> {person.TypeEmployee}</p>
        <p><strong>Linked:</strong> {person.linked}</p>
        <p><strong>Linked To:</strong> {person.linked_to}</p>
        <p><strong>Linked To ID:</strong> {person.linked_to_id}</p>
      </div>
      <div className="mt-6">
        <Link href="/people" className="p-2 bg-blue-500 text-white rounded hover:bg-blue-700">
          Back to People List
        </Link>
      </div>
    </div>
  );
}

export default function PersonDetailPage(props: PageProps) {
  return (
    <ErrorBoundary>
      <PersonDetail {...props} />
    </ErrorBoundary>
  );
}