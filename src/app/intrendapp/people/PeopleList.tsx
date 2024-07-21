"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaEye, FaTrash } from 'react-icons/fa';
import Table from '../../components/Table';

interface Person {
  _id: string;
  name: string;
  phone: string;
  email: string;
  type_employee: string;
}

const PeopleList = () => {
  const [people, setPeople] = useState<Person[]>([]);

  useEffect(() => {
    const fetchPeople = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_ENDPOINT_URL}/people`);
        const data = await response.json();
        setPeople(data.people);
      } catch (error) {
        console.error('Error fetching people:', error);
      }
    };
    fetchPeople();
  }, []);

  const handleDelete = async (personId: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_ENDPOINT_URL}/person/${personId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setPeople(people.filter(person => person._id !== personId));
      } else {
        console.error('Failed to delete person');
      }
    } catch (error) {
      console.error('Error deleting person:', error);
    }
  };

  const columns = ['Name', 'Phone', 'Email', 'Type Employee', 'Actions'];

  const renderRow = (person: Person) => (
    <>
      <td className="border p-2">{person.name}</td>
      <td className="border p-2">{person.phone}</td>
      <td className="border p-2">{person.email}</td>
      <td className="border p-2">{person.type_employee}</td>
      <td className="border p-2 flex justify-center space-x-2">
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
      <Table columns={columns} data={people} renderRow={renderRow} />
    </div>
  );
};

export default PeopleList;
