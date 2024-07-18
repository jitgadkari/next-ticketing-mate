"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import AddPersonForm from './AddPersonForm';
import { FaEye, FaTrash } from 'react-icons/fa';
import Button from '../../components/Button';
import Table from '../../components/Table';

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

  const columns = ['Name', 'ID', 'Phone', 'Email', 'Type', 'Linked', 'Linked To', 'Actions'];

  const renderRow = (person: Person) => (
    <>
      <td className="border p-2">{person.Name}</td>
      <td className="border p-2">{person._id}</td>
      <td className="border p-2">{person.Phone}</td>
      <td className="border p-2">{person.Email}</td>
      <td className="border p-2">{person.TypeEmployee}</td>
      <td className="border p-2">{person.linked}</td>
      <td className="border p-2">{person.linked_to_id}</td>
      <td className="border p-2 flex space-x-2">
        <Link href={`people/${person._id}`} passHref>
          <span className="text-blue-500 hover:text-blue-700">
            <FaEye />
          </span>
        </Link>
        <FaTrash
          onClick={() => handleDelete(person._id)}
          className="text-red-500 cursor-pointer hover:text-red-700"
        />
      </td>
    </>
  );

  return (
    <div className="p-8 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4">People List</h1>
      <div className="flex justify-end mb-4">
        <Button onClick={() => setShowForm(true)}>
          Add Person
        </Button>
      </div>
      {showForm && (
        <div className="mb-4">
          <AddPersonForm onAdd={handleAdd} />
        </div>
      )}
      <Table columns={columns} data={people} renderRow={renderRow} />
    </div>
  );
};

export default PeoplePage;