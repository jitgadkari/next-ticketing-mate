"use client";
import React, { useState, useEffect } from "react";
import { pageFilter, pageInfo, Person } from "./page";
import Link from "next/link";
import { FaEye, FaTrash } from "react-icons/fa";
import toast from "react-hot-toast";
import Pagination from "@/app/components/Pagination";

interface PeopleMobileListProps {
  people: Person[];
  setPeople: (people: Person[]) => void;
  pageFilter: pageFilter;
  pageInfo: pageInfo;
  onPrevious?: () => void;
  onNext?: () => void;
  onPageChange: (page: number) => void;
}

export default function PeopleMobileList({
  people,
  setPeople,
  pageFilter,
  pageInfo,
  onPrevious,
  onNext,
  onPageChange,
}: PeopleMobileListProps) {
  const [deletePersonId, setDeletePersonId] = useState<string | null>(null);
  const [filterName, setFilterName] = useState<string>("");
  const [allPeople, setAllPeople] = useState<Person[]>([]); // To store all people data
  const [showFilter, setShowFilter] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchAllPeople = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_ENDPOINT_URL}/people_all`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.people && Array.isArray(data.people)) {
            setAllPeople(data.people); // Store all people in state
            setPeople(data.people.slice(0, pageFilter.limit)); // Display first page
          } else {
            setPeople([]);
            toast.error("No people found");
          }
        } else {
          const errorText = await response.text();
          toast.error(`Failed to fetch people: ${errorText}`);
        }
      } catch (error) {
        toast.error("Error fetching people");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllPeople();
  }, [pageFilter.limit]);

  useEffect(() => {
    const filteredPeople = allPeople.filter((person) =>
      person.name.toLowerCase().includes(filterName.toLowerCase())
    );
    setPeople(filteredPeople.slice(0, pageFilter.limit)); // Adjust based on limit
  }, [filterName, allPeople, pageFilter.limit]);

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
        setDeletePersonId(null);
        toast.success("Person deleted successfully");
      } else {
        console.error("Failed to delete person");
      }
    } catch (error) {
      console.error("Error deleting person:", error);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-4 md:hidden">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">People List</h1>
        <button
          onClick={() => setShowFilter(!showFilter)}
          className="bg-blue-600 text-white font-bold py-2 px-4 rounded hover:bg-blue-700"
        >
          {showFilter ? "Hide Filter" : "Show Filter"}
        </button>
      </div>

      {showFilter && (
        <div className="mb-6">
          <input
            type="text"
            value={filterName}
            onChange={(e) => setFilterName(e.target.value)}
            placeholder="Search by Name"
            className="p-2 w-full border border-gray-300 rounded focus:outline-none focus:ring focus:ring-blue-400"
          />
        </div>
      )}

      {isLoading && <p className="text-center">Loading people...</p>}

      {!isLoading && people.length === 0 && (
        <p className="text-center text-gray-500">No people found</p>
      )}

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
                onClick={() => setDeletePersonId(person._id)}
                className="text-red-500 cursor-pointer hover:text-red-700"
              />
            </div>
          </div>
        </div>
      ))}

      {deletePersonId && (
        <dialog open className="p-5 bg-white rounded shadow-lg fixed inset-0">
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

      <Pagination
        limit={pageFilter.limit}
        offset={pageFilter.offset}
        total_items={pageInfo.total_items}
        current_page={pageInfo.current_page}
        total_pages={pageInfo.total_pages}
        has_next={pageInfo.has_next}
        onPrevious={onPrevious}
        onNext={onNext}
        onPageChange={onPageChange}
      />
    </div>
  );
}
