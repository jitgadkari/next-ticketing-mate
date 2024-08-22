"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { FaEye, FaTrash } from "react-icons/fa";
import Table from "../../components/Table";
import { Customer } from "./AddTicketForm";
import { IoMdArrowDropdown, IoMdArrowDropup } from "react-icons/io";

interface Ticket {
  _id: string;
  ticket_number: string;
  customer_name: string;
  current_step: string;
  created_date: string;
  updated_date: string;
  status: string;
  final_decision: string;
}

interface TicketListProps {
  refreshList: () => void;
}

interface FilterState {
  showDropDown: boolean;
  fetchAll: boolean;
  showCustomerDropDown: boolean;
  sortOrder: "asc" | "desc";
  sortBy: string;
  sortDays: string;
}

const TicketList: React.FC<TicketListProps> = ({ refreshList }) => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [allTickets, setAllTickets] = useState<Ticket[]>([]); // Store all tickets
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filterState, setFilterState] = useState<FilterState>({
    showDropDown: false,
    fetchAll: false,
    showCustomerDropDown: false,
    sortOrder: "asc",
    sortBy: "",
    sortDays: "",
  });

  const fetchTickets = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_ENDPOINT_URL}/tickets`);
      const data = await response.json();
      const parsedTickets = data.tickets.map((ticket: any) => ({
        _id: ticket._id,
        ticket_number: ticket.ticket_number,
        customer_name: ticket.customer_name,
        current_step: ticket.current_step,
        created_date: ticket.created_date,
        updated_date: ticket.updated_date,
        status: ticket.steps["Step 9: Final Status"]?.status || "open",
        final_decision: ticket.steps["Step 9: Final Status"]?.final_decision || "pending",
      }));

      setAllTickets(parsedTickets);
      setTickets(parsedTickets);
    } catch (error) {
      console.error("Error fetching tickets:", error);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [refreshList]);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_ENDPOINT_URL}/customers`);
        const data = await response.json();
        setCustomers(data.customers);
      } catch (error) {
        console.error("Error fetching customers:", error);
      }
    };

    fetchCustomers();
  }, []);

  const handleSort = (criteria: string) => {
    setFilterState((prevState) => ({
      ...prevState,
      sortBy: criteria,
      sortOrder: prevState.sortBy === criteria && prevState.sortOrder === "asc" ? "desc" : "asc",
    }));
  };

  const handleSortByLastNumberOfDays = (days: string) => {
    setFilterState((prevState) => ({
      ...prevState,
      sortDays: days,
    }));
  };

  const filteredTickets = useMemo(() => {
    let filtered = [...allTickets];
  
    if (filterState.sortDays) {
      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.getDate() - parseInt(filterState.sortDays));
      filtered = filtered.filter((ticket) => new Date(ticket.created_date) >= daysAgo);
    } else if (!filterState.fetchAll) {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      filtered = filtered.filter((ticket) => new Date(ticket.created_date) >= oneWeekAgo);
  
      if (filtered.length === 0) {
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
        filtered = allTickets.filter((ticket) => new Date(ticket.created_date) >= oneMonthAgo);
      }
  
      if (filtered.length === 0) {
        filtered = [...allTickets];
      }
    }
  
    if (filterState.sortBy === "created_date") {
      filtered.sort((a, b) =>
        filterState.sortOrder === "asc"
          ? new Date(a.created_date).getTime() - new Date(b.created_date).getTime()
          : new Date(b.created_date).getTime() - new Date(a.created_date).getTime()
      );
    }
  
    return filtered;
  }, [allTickets, filterState]);
  

  const columns = [
    "Ticket Number",
    "Customer Name",
    "Current Step",
    "Status",
    "Decision",
    "Created Date",
    "Updated Date",
    "Actions",
  ];

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      day: "numeric",
      month: "short",
      year: "2-digit",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    };
    return new Intl.DateTimeFormat("en-GB", options).format(date);
  };

  const handleDelete = async (ticketId: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_ENDPOINT_URL}/ticket/${ticketId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setTickets((prevTickets) => prevTickets.filter((ticket) => ticket._id !== ticketId));
        fetchTickets();
      } else {
        console.error("Failed to delete ticket");
      }
    } catch (error) {
      console.error("Error deleting ticket:", error);
    }
  };

  const renderRow = (ticket: Ticket) => (
    <>
      <td className="border p-2">{ticket.ticket_number}</td>
      <td className="border p-2">{ticket.customer_name}</td>
      <td className="border p-2 hidden md:table-cell">{ticket.current_step}</td>
      <td className="border p-2 hidden md:table-cell">
        <span
          className={`px-2 py-1 rounded ${
            ticket.status === "closed" ? "bg-red-200 text-red-800" : "bg-green-200 text-green-800"
          }`}
        >
          {ticket.status}
        </span>
      </td>
      <td className="border p-2 hidden md:table-cell">
        <span
          className={`px-2 py-1 rounded ${
            ticket.final_decision === "approved"
              ? "bg-green-200 text-green-800"
              : ticket.final_decision === "denied"
              ? "bg-red-200 text-red-800"
              : "bg-yellow-200 text-yellow-800"
          }`}
        >
          {ticket.final_decision}
        </span>
      </td>
      <td className="border p-2 hidden md:table-cell">{formatDateTime(ticket.created_date)}</td>
      <td className="border p-2 hidden md:table-cell">{formatDateTime(ticket.updated_date)}</td>
      <td className="border p-2">
        <ul className="h-full flex justify-center space-x-2">
          <Link href={`tickets/${ticket._id}`} passHref>
            <span className="text-blue-500 hover:text-blue-700">
              <FaEye />
            </span>
          </Link>
          <FaTrash
            onClick={() => handleDelete(ticket._id)}
            className="text-red-500 cursor-pointer hover:text-red-700"
          />
        </ul>
      </td>
    </>
  );

  return (
    <div className="p-8 bg-white rounded shadow text-black overflow-x-scroll">
      <div className="flex justify-between items-start mb-6">
        <h1 className="text-3xl font-bold mb-4 text-gray-800">Tickets List</h1>
        <div className="relative">
          <ul className="flex gap-2 items-center">
            {filterState.showDropDown && (
              <>
                <li className="relative group ">
                  <button
                    onClick={() =>
                      setFilterState((prevState) => ({
                        ...prevState,
                        showCustomerDropDown: !prevState.showCustomerDropDown,
                      }))
                    }
                    className="px-4 py-2 bg-gray-100 text-gray-800 font-semibold rounded-lg  border-gray-300 hover:bg-gray-200 focus:outline-none"
                  >
                    Customer
                  </button>
                  {filterState.showCustomerDropDown && (
                    <ul className="absolute left-0 w-48 mt-2 bg-white border border-gray-300 shadow-lg rounded-lg text-gray-700 text-sm group-hover:flex flex-col gap-2 p-2">
                      {customers.map((customer) => (
                        <li
                          key={customer._id}
                          onClick={() =>
                            setTickets(allTickets.filter((ticket) => ticket.customer_name === customer.name))
                          }
                          className="border-b py-2 px-4 hover:bg-gray-100 cursor-pointer"
                        >
                          {customer.name}
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
                <li
                  onClick={() => handleSort("created_date")}
                  className="flex items-center border-b  cursor-pointer px-4 py-2 bg-gray-100 text-gray-800 font-semibold rounded-lg  border-gray-300 hover:bg-gray-200 focus:outline-none"
                >
                  <h1> Created</h1>
                  {filterState.sortBy === "created_date" && (
                    <>
                      {filterState.sortOrder === "asc" ? <IoMdArrowDropdown /> : <IoMdArrowDropup />}
                    </>
                  )}
                </li>
                <li className="flex gap-2 border-b py-2 px-4  bg-gray-100 text-gray-800 font-semibold rounded-lg  border-gray-300 hover:bg-gray-200 focus:outline-none">
                  <h1>Enter Last Number of Days</h1>
                  <input
                    type="number"
                    className="w-10 border text-center rounded-md"
                    value={filterState.sortDays}
                    onChange={(e) => handleSortByLastNumberOfDays(e.target.value)}
                  />
                </li>
              </>
            )}
            <button
              className="ml-4 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              onClick={() =>
                setFilterState((prevState) => ({ ...prevState, showDropDown: !prevState.showDropDown }))
              }
            >
              Filter
            </button>
          </ul>
        </div>
      </div>
      {filteredTickets.length > 0 ? (
        <Table columns={columns} data={filteredTickets} renderRow={renderRow} />
      ) : (
        <div className="text-center">
          <h2 className="text-xl text-gray-600">No tickets found for this customer</h2>
          <p>Use the filter to change the customer</p>
        </div>
      )}
      {filteredTickets.length > 0 && (
        <div className="text-blue-500 text-end">
          <button
            onClick={() =>
              setFilterState((prevState) => ({
                ...prevState,
                fetchAll: !prevState.fetchAll,
                showDropDown: false,
                sortDays: "",
              }))
            }
          >
            Show {!filterState.fetchAll ? "more" : "recent"}
          </button>
        </div>
      )}
    </div>
  );
};

export default TicketList;
