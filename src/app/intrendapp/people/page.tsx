"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import AddPersonForm from './AddPersonForm';
import { FaEye, FaTrash } from 'react-icons/fa';

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

const PeoplePage = () => {
  const [people, setPeople] = useState<Person[]>([]);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const fetchPeople = async () => {
      try {
        const response = await fetch('http://localhost:8000/people');
        const data = await response.json();
        setPeople(data.people);
      } catch (error) {
        console.error('Error fetching people:', error);
      }
    };
    fetchPeople();
  }, []);

  const handleDelete = async (person_id: string) => {
    try {
      const response = await fetch(`http://localhost:8000/person/?person_id=${person_id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setPeople(people.filter(person => person._id !== person_id));
      } else {
        console.error('Failed to delete person');
      }
    } catch (error) {
      console.error('Error deleting person:', error);
    }
  };

  const handleAdd = () => {
    setShowForm(false);
    const fetchPeople = async () => {
      const response = await fetch('http://localhost:8000/people');
      const data = await response.json();
      setPeople(data.people);
    };
    fetchPeople();
  };

  return (
    <div className="p-8 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4">People List</h1>
      <div className="flex justify-end mb-4">
        <button
          onClick={() => setShowForm(true)}
          className="p-2 bg-blue-500 text-white rounded hover:bg-blue-700"
        >
          Add Person
        </button>
      </div>
      {showForm && (
        <div className="mb-4">
          <AddPersonForm onAdd={handleAdd} />
        </div>
      )}
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="border p-2">Name</th>
            <th className="border p-2">ID</th>
            <th className="border p-2">Phone</th>
            <th className="border p-2">Email</th>
            <th className="border p-2">Type</th>
            <th className="border p-2">Linked</th>
            <th className="border p-2">Linked To</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {people.map(person => (
            <tr key={person._id}>
              <td className="border p-2">{person.Name}</td>
              <td className="border p-2">{person._id}</td>
              <td className="border p-2">{person.Phone}</td>
              <td className="border p-2">{person.Email}</td>
              <td className="border p-2">{person.TypeEmployee}</td>
              <td className="border p-2">{person.linked}</td>
              <td className="border p-2">{person.linked_to_id}</td>
              <td className="border p-2 flex space-x-2">
                <Link href={`/person/${person._id}`} passHref>
                  <span className="text-blue-500 hover:text-blue-700">
                    <FaEye />
                  </span>
                </Link>
                <FaTrash
                  onClick={() => handleDelete(person._id)}
                  className="text-red-500 cursor-pointer hover:text-red-700"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PeoplePage;
