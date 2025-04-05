"use client";
import React, { useState, useEffect } from "react";
import { pageFilter, pageInfo, Person } from "./page";
import Link from "next/link";
import { FaEye, FaTrash } from "react-icons/fa";
import { MdOutlineFolderDelete } from "react-icons/md";
import toast from "react-hot-toast";
import Pagination from "@/app/components/Pagination";
import { getUserData, isAuthenticated } from "@/utils/auth";

interface PeopleMobileListProps {
  people: Person[];
  setPeople: (people: Person[]) => void;
  pageFilter: pageFilter;
  pageInfo: pageInfo;
  onPrevious?: () => void;
  onNext?: () => void;
  onPageChange: (page: number) => void;
  onSearch?: (name: string) => void;
}

export default function PeopleMobileList({
  people,
  setPeople,
  pageFilter,
  pageInfo,
  onPrevious,
  onNext,
  onPageChange,
  onSearch,
}: PeopleMobileListProps) {
  const [deletePersonId, setDeletePersonId] = useState<string | null>(null);
  const [softDeletePersonId, setSoftDeletePersonId] = useState<string | null>(null);
  const [filterName, setFilterName] = useState<string>("");
  const [debouncedFilterName, setDebouncedFilterName] = useState<string>("");
  const [showFilter, setShowFilter] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<'admin' | 'superuser' | 'general_user'>('general_user');

  // Debounce the filter name updates
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedFilterName(filterName);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [filterName]);

  // Fetch data when filter changes
  useEffect(() => {
    if (debouncedFilterName !== filterName && onSearch) {
      onPageChange(1); // Reset to first page when filter changes
      onSearch(debouncedFilterName); // Call parent's search handler
    }
  }, [debouncedFilterName, onSearch, onPageChange]);

  useEffect(() => {
    const isAuth = isAuthenticated();
    if (isAuth) {
      const userData = getUserData();
      setUserRole(userData?.role || 'general_user');
    }
  }, []);

  const handleDelete = async (personId: string): Promise<void> => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/api/persons/${personId}`,
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

  const handleSoftDelete = async (personId: string): Promise<void> => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/api/persons/soft_delete/${personId}`,
        {
          method: "DELETE",
        }
      );
      if (response.ok) {
        setPeople(people.filter((person) => person._id !== personId));
        setSoftDeletePersonId(null);
        toast.success("Person soft deleted successfully");
      } else {
        console.error("Failed to soft delete person");
      }
    } catch (error) {
      console.error("Error soft deleting person:", error);
    }
  };

  const handleRegisterLogin = async (person: Person) => {
    try {
      if (person.type_employee === "Internal") {
        throw new Error("Cannot provide login for internal users");
      }

      const userPayload = {
        email: person.email,
        password: "Str0ngPass!",
        role: "general_user",
        status: "Active",
        person_id: person._id
      };

      const response = await fetch(`${process.env.NEXT_PUBLIC_ENDPOINT_URL}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userPayload),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Registration failed");
      }

      toast.success("User registered successfully!");
    } catch (error) {
      console.error("Error registering user:", error);
      toast.error(`Error: ${error instanceof Error ? error.message : "Registration failed"}`);
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

      {!isLoading && (!people || people.length === 0) && (
        <p className="text-center text-gray-500">No people found</p>
      )}


      {Array.isArray(people) && people.length > 0 ? (
        people.map((person) => (
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
                {userRole === 'admin' && (
                  <FaTrash
                    onClick={() => setDeletePersonId(person._id)}
                    className="text-red-500 cursor-pointer hover:text-red-700"
                  />
                )}
                <MdOutlineFolderDelete
                  onClick={() => setSoftDeletePersonId(person._id)}
                  className="text-yellow-500 cursor-pointer hover:text-yellow-700"
                  title="Soft Delete"
                />
                {person.type_employee !== "Internal" && (
                  <button
                    onClick={() => handleRegisterLogin(person)}
                    className="text-sm px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Provide Login
                  </button>
                )}
              </div>
            </div>
          </div>
        ))
      ) : (
        <p className="text-gray-500">No people found.</p>
      )}

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

      {softDeletePersonId && (
        <dialog open className="p-5 bg-white rounded shadow-lg fixed inset-0">
          <h2 className="text-xl font-bold mb-4">Confirm Soft Delete</h2>
          <p>Are you sure you want to soft delete this person?</p>
          <div className="flex justify-end mt-4">
            <button
              onClick={() => setSoftDeletePersonId(null)}
              className="mr-2 bg-gray-300 hover:bg-gray-400 text-black font-bold py-2 px-4 rounded"
            >
              Cancel
            </button>
            <button
              onClick={() => handleSoftDelete(softDeletePersonId)}
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
