"use client";

import React, { useState } from 'react';
import PeopleList from './PeopleList';
import AddPersonForm from './AddPersonForm';
import Button from '../../components/Button';

const PeoplePage: React.FC = () => {
  const [showForm, setShowForm] = useState<boolean>(false);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  const handleAdd = (): void => {
    setShowForm(false);
    setRefreshTrigger(prev => prev + 1);
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
      <PeopleList key={refreshTrigger} />
    </div>
  );
};

export default PeoplePage;