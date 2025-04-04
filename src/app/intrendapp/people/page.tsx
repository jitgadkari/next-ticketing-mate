"use client";

import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import PeopleList from "./PeopleList";
import AddPersonForm from "./AddPersonForm";
import Button from "../../components/Button";
import PeopleMobileList from "./PeopleMobileList";
export interface Person {
  _id: string;
  name: string;
  phone: string;
  email: string;
  type_employee: string;
  state?: string;
}
export interface pageFilter{
  offset:number,
  limit:number,
  total_items?: string | null;
  current_page?: number | null;
  total_pages?: number | null;
  has_next?: boolean | null;
}
export interface pageInfo{
  total_items?: string | null;
  current_page?: number | null;
  total_pages?: number | null;
  has_next?: boolean | null;
}

const getOffset = () => {
  const offset = localStorage.getItem("peopleListOffset");
  return offset ? parseInt(offset, 10) : 0;
};

const PeoplePage: React.FC = () => {
  const [showForm, setShowForm] = useState<boolean>(false);
  const [showSearch, setShowSearch] = useState<boolean>(false);
  const [people, setPeople] = useState<Person[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const toggleSearch = () => {
    const newShowSearch = !showSearch;
    setShowSearch(newShowSearch);
    if (!newShowSearch) { // If we're hiding the search
      setFilterName(''); // Clear the search input
      setDebouncedFilterName(''); // Clear debounced value immediately
      setPageFilter(prev => ({ // Reset to first page
        ...prev,
        offset: 0
      }));
      fetchPeople(''); // Reset to unfiltered results
    }
  };
  const [pageFilter,setPageFilter]=useState<pageFilter>({
    offset:getOffset(),
    limit:10,
  })
  const [pageInfo,setPageInfo]=useState<pageInfo>({
    current_page:null,
    has_next:null,
    total_pages:null,
    total_items:null
  })

  const [filterName, setFilterName] = useState<string>("");
const [debouncedFilterName, setDebouncedFilterName] = useState<string>("");

const fetchPeople = async (name = ""): Promise<void> => {
    setIsLoading(true);
    try {
      const queryParams = new URLSearchParams({
        offset: pageFilter.offset.toString(),
        limit: pageFilter.limit.toString(),
      });
      
      if (name) {
        queryParams.append("name", name);
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/api/persons?${queryParams.toString()}&status=Active`
      );
      const data = await response.json();
      setPageInfo((prev) => ({
        ...prev,
        total_pages: data.total_pages,
        current_page: data.current_page,
        has_next: data.has_next,
        total_items: data.total_people
      }));
      setPeople(data.people);
    } catch (error) {
      console.error("Error fetching people:", error);
      toast.error("Failed to fetch people");
    } finally {
      setIsLoading(false);
    }
  };

  // Debounce the filter name updates and reset pagination
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      // Reset to first page when filter changes
      if (filterName !== debouncedFilterName) {
        setPageFilter(prev => ({
          ...prev,
          offset: 0
        }));
      }
      setDebouncedFilterName(filterName);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [filterName]);

  // Combined effect for both page filter and name filter
  useEffect(() => {
    fetchPeople(debouncedFilterName);
  }, [debouncedFilterName, pageFilter]);

  const handleAdd = (): void => {
    setShowForm(false);
    fetchPeople();
  };

  const handlePrevious = () => {
    setPageFilter((prev) => ({
      ...prev,
      offset: Math.max(prev.offset - prev.limit, 0),
    }));
  };

  const handleNext = () => {
    setPageFilter((prev) => ({
      ...prev,
      offset: prev.offset + prev.limit,
    }));
  };

  const handlePageChange = (page: number) => {
    setPageFilter((prev) => ({
      ...prev,
      offset: (page - 1) * prev.limit,
    }));
  };

  useEffect(() => {
    localStorage.setItem("peopleListOffset", pageFilter.offset.toString());
  }, [pageFilter.offset]);

  return (
    <div className="p-2 bg-gray-100  text-black">
      <div className="flex justify-end items-center gap-2 mb-4">
        {!showForm ? (
          <Button onClick={() => setShowForm(true)}>Add Person</Button>
        ) : (
          <Button onClick={() => setShowForm(false)}>Cancel</Button>
        )}
        <Button onClick={toggleSearch}>
          {showSearch ? 'Hide Filter' : 'Show Filter'}
        </Button>
      </div>
      {showForm && (
        <div className="mb-4">
          <AddPersonForm onAdd={handleAdd} />
        </div>
      )}
      {showSearch && (
        <div className="mb-4 relative">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by name..."
              value={filterName}
              onChange={(e) => setFilterName(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${isLoading ? 'bg-gray-50' : 'bg-white'}`}
              aria-label="Search people by name"
              disabled={isLoading}
            />
            {isLoading ? (
              <svg
                className="animate-spin absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-blue-500"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            ) : (
              <svg
                className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            )}
          </div>
        </div>
      )}
      <div className="hidden md:block">
        <PeopleList people={people} setPeople={setPeople} pageFilter={pageFilter} pageInfo={pageInfo} onPageChange={handlePageChange} onNext={handleNext} onPrevious={handlePrevious}/>
      </div>
      <div className="block md:hidden">
        <PeopleMobileList people={people} setPeople={setPeople} pageFilter={pageFilter} pageInfo={pageInfo} onPageChange={handlePageChange} onNext={handleNext} onPrevious={handlePrevious}/>
      </div>
    </div>
  );
};

export default PeoplePage;
