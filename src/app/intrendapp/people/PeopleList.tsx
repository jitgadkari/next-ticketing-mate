"use client";

import Link from "next/link";
import { FaEye, FaTrash } from "react-icons/fa";
import Table from "../../components/Table";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { pageFilter, pageInfo } from "../people/page";
import Pagination from "@/app/components/Pagination";

interface PeopleListProps {
  people: any[];
  setPeople: (people: any[]) => void;
  pageFilter: pageFilter;
  pageInfo: pageInfo;
  onPrevious?: () => void;
  onNext?: () => void;
  onPageChange: (page: number) => void;
}

const PeopleList = ({
  people,
  setPeople,
  pageFilter,
  pageInfo,
  onPrevious,
  onNext,
  onPageChange,
}: PeopleListProps) => {
  const [deletePeopleId, setDeletePeopleId] = useState<string | null>(null);
  const [filterName, setFilterName] = useState<string>("");
  const [allPeople, setAllPeople] = useState<any[]>([]); // New state for all people
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

  const handleDelete = async (peopleId: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/people/${peopleId}`,
        { method: "DELETE" }
      );
      if (response.ok) {
        setPeople(people.filter((person) => person._id !== peopleId));
        setDeletePeopleId(null);
        toast.success("People entry deleted successfully");
      } else {
        toast.error("Failed to delete entry");
      }
    } catch {
      toast.error("Error deleting entry");
    }
  };

  const columns = ["Name", "Phone", "Email", "Type Employee", "Actions"];

  const renderRow = (person: any) => (
    <>
      <td className="border p-2">{person.name}</td>
      <td className="border p-2 hidden md:table-cell">{person.phone}</td>
      <td className="border p-2">{person.email}</td>
      <td className="border p-2 hidden md:table-cell">{person.type_employee}</td>
      <td className="border p-2">
        <div className="flex justify-center space-x-2">
          <Link href={`people/${person._id}`} passHref>
            <span className="text-blue-500 hover:text-blue-700">
              <FaEye />
            </span>
          </Link>
          <FaTrash
            onClick={() => setDeletePeopleId(person._id)}
            className="text-red-500 cursor-pointer hover:text-red-700"
          />
        </div>
      </td>
    </>
  );

  return (
    <div className="p-8 bg-white rounded shadow text-black">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">People List</h1>
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

      <Table columns={columns} data={people} renderRow={renderRow} />

      {deletePeopleId && (
        <dialog open className="p-5 bg-white rounded shadow-lg fixed inset-0">
          <h2 className="text-xl font-bold mb-4">Confirm Delete</h2>
          <p>Are you sure you want to delete this entry?</p>
          <div className="flex justify-end mt-4">
            <button
              onClick={() => setDeletePeopleId(null)}
              className="mr-2 bg-gray-300 hover:bg-gray-400 py-2 px-4 rounded"
            >
              Cancel
            </button>
            <button
              onClick={() => handleDelete(deletePeopleId)}
              className="bg-red-500 hover:bg-red-700 text-white py-2 px-4 rounded"
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
};

export default PeopleList;
