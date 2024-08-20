"use client";

import React, { useEffect, useState } from "react";
import PeopleList from "./PeopleList";
import AddPersonForm from "./AddPersonForm";
import Button from "../../components/Button";
export interface Person {
  _id: string;
  name: string;
  phone: string;
  email: string;
  type_employee: string;
}
const PeoplePage: React.FC = () => {
  const [showForm, setShowForm] = useState<boolean>(false);
  const [people, setPeople] = useState<Person[]>([]);

  const fetchPeople = async (): Promise<void> => {
    try {
      const api = process.env.NEXT_PUBLIC_ENDPOINT_URL;
      console.log("api", api);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/people`
      );
      const data = await response.json();
      setPeople(data.people);
    } catch (error) {
      console.error("Error fetching people:", error);
    }
  };
  useEffect(() => {
    fetchPeople();
  }, []);

  const handleAdd = (): void => {
    setShowForm(false);
    fetchPeople();
  };

  return (
    <div className="p-8 bg-white rounded shadow text-black">
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
      <PeopleList people={people} setPeople={setPeople} />
    </div>
  );
};

export default PeoplePage;
