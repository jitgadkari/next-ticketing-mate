"use client";

import { useState } from 'react';
import TicketList from './TicketList';
import AddTicketForm from './AddTicketForm';
import Button from '../../components/Button';

const TicketsPage = () => {
  const [showForm, setShowForm] = useState(false);

  const handleAdd = () => {
    setShowForm(false);
  };

  return (
    <div className="p-8 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Tickets</h1>
      <div className="flex justify-end mb-4">
        <Button onClick={() => setShowForm(true)}>
          Add Ticket
        </Button>
      </div>
      {showForm && (
        <div className="mb-4">
          <AddTicketForm onAdd={handleAdd} />
        </div>
      )}
      <TicketList />
    </div>
  );
};

export default TicketsPage;
