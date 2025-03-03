"use client";

import { useState, useCallback } from 'react';
import TicketList from './TicketList';
import AddTicketForm from './AddTicketForm';
import Button from '../../components/Button';
import TicketsMobileList from './TicketsMobileList';

const TicketsPage = () => {
  const [showForm, setShowForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleAdd = () => {
    setShowForm(false);
    setRefreshKey(prevKey => prevKey + 1);
  };

  const refreshList = useCallback(() => {
    setRefreshKey(prevKey => prevKey + 1);
  }, []);
  const getOffset = () => {
    const offset = localStorage.getItem("ticketListOffset");
    return offset ? parseInt(offset, 10) : 0;
  };
  return (
    <div className="p-2 rounded text-black">
      <div className="flex justify-end mb-4">
        {!showForm?<Button onClick={() => setShowForm(true)}>
        Add Ticket
        </Button>:<Button onClick={() => setShowForm(false)}>
          Cancel
        </Button>}
      </div>
      {showForm && (
        <div className="mb-4">
          <AddTicketForm onAdd={handleAdd} />
        </div>
      )}
      <div className='hidden md:block'>
      <TicketList key={refreshKey} refreshList={refreshList} getOffset={getOffset}/>
      </div>
      <div>
        <TicketsMobileList key={refreshKey} refreshList={refreshList} getOffset={getOffset}/>
      </div>
    </div>
  );
};

export default TicketsPage;