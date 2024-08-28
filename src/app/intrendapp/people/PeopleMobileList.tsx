'use client'
import React, { useState } from "react";
import { Person } from "./page";
import Link from "next/link";
import { FaEye, FaTrash } from "react-icons/fa";
import toast from "react-hot-toast";
interface PeopleMobileListProps {
  people: Person[];
  setPeople: (people: Person[]) => void;
}

export default function PeopleMobileList({
  people,
  setPeople,
}: PeopleMobileListProps) {
  const [deletePersonId, setDeletePersonId] = useState<string | null>(null);

  const handleDelete = async (personId: string): Promise<void> => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/person/${personId}`,
        {
          method: "DELETE",
        }
      );
      if (response.ok) {
        setPeople(people.filter((person) => person._id !== personId));
        setDeletePersonId(null)
        toast.success("Person deleted successfully")
      } else {
        console.error("Failed to delete person");
      }
    } catch (error) {
      console.error("Error deleting person:", error);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-4 md:hidden">
      {people.map((person) => (
        <div key={person._id} className="bg-white text-black p-4 rounded-lg shadow-lg">
          <div className="flex flex-col space-y-4 text-sm w-full">
            
            <div className="flex justify-between items-center">
              <div className="flex">
                <span className="font-semibold mr-2">Name:</span>
                <span>{person.name}</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex">
                <span className="font-semibold mr-2">Email:</span>
                <span>{person.email}</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex">
                <span className="font-semibold mr-2">Employee Type:</span>
                <span>{person.type_employee}</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex">
                <span className="font-semibold mr-2">Phone:</span>
                <span>{person.phone}</span>
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <Link href={`people/${person._id}`} passHref>
                <span className="text-blue-500 hover:text-blue-700">
                  <FaEye />
                </span>
              </Link>
              <FaTrash
                onClick={() => handleDelete(person._id)}
                className="text-red-500 cursor-pointer hover:text-red-700"
              />
            </div>
          </div>
        </div>
      ))}
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
}
