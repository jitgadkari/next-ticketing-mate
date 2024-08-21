import React from "react";
import { Person } from "./page";
import Link from "next/link";
import { FaEye, FaTrash } from "react-icons/fa";
interface PeopleMobileListProps {
  people: Person[];
  setPeople: (people: Person[]) => void;
}

export default function PeopleMobileList({
  people,
  setPeople,
}: PeopleMobileListProps) {
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
    </div>
  
  );
}
