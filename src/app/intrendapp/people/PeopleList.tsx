"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { FaEye, FaTrash } from 'react-icons/fa';
import Table from '../../components/Table';
import { Person } from './page';


interface PeopleListProps{
  people: Person[],
  setPeople: (people:Person[])=>void
}

const PeopleList: React.FC<PeopleListProps> = ({people,setPeople}) => {
  const [deletePersonId, setDeletePersonId] = useState<string | null>(null);

  const handleDelete = async (personId: string): Promise<void> => {
    try {
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_ENDPOINT_URL}/person/${personId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setPeople(people.filter(person => person._id !== personId));
        setDeletePersonId(null)
      } else {
        console.error('Failed to delete person');
      }
    } catch (error) {
      console.error('Error deleting person:', error);
    }
  };

  const columns: string[] = ['Name', 'Phone', 'Email', 'Type Employee', 'Actions'];

  const renderRow = (person: Person): JSX.Element => (
    <>
      <td className="border p-2">{person.name}</td>
      <td className="border p-2 hidden md:table-cell">{person.phone}</td>
      <td className="border p-2">{person.email}</td>
      <td className="border p-2 hidden md:table-cell">{person.type_employee}</td>
      <td className="border p-2">
        <div className='h-full flex justify-center space-x-2'>
        <Link href={`people/${person._id}`} passHref>
          <span className="text-blue-500 hover:text-blue-700">
            <FaEye />
          </span>
        </Link>
        <FaTrash
          onClick={() => setDeletePersonId(person._id)}
          className="text-red-500 cursor-pointer hover:text-red-700"
          />
          </div>
      </td>
    </>
  );

  return (
    <div className="p-8 bg-white rounded shadow text-black overflow-x-scroll">
      <h1 className="text-2xl font-bold mb-4">People List</h1>
      <Table columns={columns} data={people} renderRow={renderRow} />
      {deletePersonId && (
        <dialog open className="p-5 bg-white rounded shadow-lg">
          <h2 className="text-xl font-bold mb-4">Confirm Delete</h2>
          <p>Are you sure you want to delete this person?</p>
          <div className="flex justify-end mt-4">
            <button
              onClick={() => setDeletePersonId(null)}
              className="mr-2 bg-gray-300 hover:bg-gray-400 text-black font-bold py-2 px-4 rounded"
            >
              Cancel
            </button>
            <button
              onClick={() => handleDelete(deletePersonId)}
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
            >
              Delete
            </button>
          </div>
        </dialog>
      )}
    </div>
  );
};

export default PeopleList;