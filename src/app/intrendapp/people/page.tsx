"use client";

import { useState } from 'react';
import PeopleList from './PeopleList';
import AddPersonForm from './AddPersonForm';
import Button from '../../components/Button';

const PeoplePage = () => {
  const [showForm, setShowForm] = useState(false);

  const handleAdd = () => {
    setShowForm(false);
  };

  return (
    <div className="p-8 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4">People</h1>
      <div className="flex justify-end mb-4">
        <Button onClick={() => setShowForm(true)}>
          Add Person
        </Button>
      </div>
      {showForm && (
        <div className="mb-4">
          <AddPersonForm onAdd={handleAdd} />
        </div>
      )}
      <PeopleList />
    </div>
  );
};

export default PeoplePage;
