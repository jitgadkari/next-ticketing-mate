"use client";

import React, { useEffect, useState } from "react";
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
const PeoplePage: React.FC = () => {
  const [showForm, setShowForm] = useState<boolean>(false);
  const [people, setPeople] = useState<Person[]>([]);
  const [pageFilter,setPageFilter]=useState<pageFilter>({
    offset:0,
    limit:10,
  })
  const [pageInfo,setPageInfo]=useState<pageInfo>({
    current_page:null,
    has_next:null,
    total_pages:null,
    total_items:null
  })

  const fetchPeople = async (): Promise<void> => {
    try {
      const queryParams = new URLSearchParams({
        offset: pageFilter.offset.toString(),
        limit: pageFilter.limit.toString(),
      });
      
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/people?${queryParams.toString()}`
      );
      const data = await response.json();
      setPageInfo((prev) => ({
        ...prev,
       total_pages:data.total_pages,
       current_page:data.current_page,
       has_next:data.has_next,
       total_items:data.total_people
      }));
      setPeople(data.people);
    } catch (error) {
      console.error("Error fetching people:", error);
    }
  };
  useEffect(() => {
    fetchPeople();
  }, [pageFilter]);

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

  return (
    <div className="p-8 bg-gray-100  text-black">
      <h1 className="text-2xl font-bold mb-4">People</h1>
      <div className="flex justify-end mb-4">
        {!showForm ? (
          <Button onClick={() => setShowForm(true)}>Add Person</Button>
        ) : (
          <Button onClick={() => setShowForm(false)}>Cancel</Button>
        )}
      </div>
      {showForm && (
        <div className="mb-4">
          <AddPersonForm onAdd={handleAdd} />
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
