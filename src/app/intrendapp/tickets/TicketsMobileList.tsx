"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { FaEye, FaTrash } from "react-icons/fa";
import { Customer } from "./AddTicketForm";

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
  showCustomerDropDown: boolean;
  showDropDown: boolean;
  sortOrder: "asc" | "desc";
  sortBy: string;
  sortDays: string;
  filterByCustomer: string;
  fetchAll: boolean;
}

export default function TicketsMobileList({ refreshList }: TicketListProps) {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [allTickets, setAllTickets] = useState<Ticket[]>([]);
  const [filterState, setFilterState] = useState<FilterState>({
    showDropDown: false,
    sortOrder: "asc",
    sortBy: "",
    sortDays: "",
    filterByCustomer: "",
    fetchAll: false,
    showCustomerDropDown: false,
  });
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [deleteTicketId, setDeleteTicketId] = useState<string | null>(null);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/tickets`
        );
        const data = await response.json();

        const parsedTickets = data.tickets.map((ticket: any) => ({
          _id: ticket._id,
          ticket_number: ticket.ticket_number,
          customer_name: ticket.customer_name,
          current_step: ticket.current_step,
          created_date: ticket.created_date,
          updated_date: ticket.updated_date,
          status: ticket.steps["Step 9: Final Status"]?.status || "open",
          final_decision:
            ticket.steps["Step 9: Final Status"]?.final_decision || "pending",
        }));

        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

        const lastThreeMonthsTickets = parsedTickets.filter(
          (ticket: Ticket) => new Date(ticket.created_date) >= threeMonthsAgo
        );

        setTickets(lastThreeMonthsTickets);
        setAllTickets(parsedTickets);
      } catch (error) {
        console.error("Error fetching tickets:", error);
      }
    };
    fetchTickets();
  }, [refreshList]);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/customers`
        );
        const data = await response.json();
        setCustomers(data.customers);
      } catch (error) {
        console.error("Error fetching customers:", error);
      }
    };
    fetchCustomers();
  }, []);

  const filteredTickets = useMemo(() => {
    let filtered = filterState.fetchAll ? allTickets : tickets;

    if (
      filterState.filterByCustomer &&
      filterState.filterByCustomer !== "all"
    ) {
      filtered = filtered.filter(
        (ticket) => ticket.customer_name === filterState.filterByCustomer
      );
    }

    if (filterState.sortBy === "created_date") {
      filtered.sort((a, b) =>
        filterState.sortOrder === "asc"
          ? new Date(a.created_date).getTime() -
            new Date(b.created_date).getTime()
          : new Date(b.created_date).getTime() -
            new Date(a.created_date).getTime()
      );
    }

    if (filterState.sortDays && filterState.sortDays !== "0") {
      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.getDate() - parseInt(filterState.sortDays));
      filtered = filtered.filter(
        (ticket) => new Date(ticket.created_date) >= daysAgo
      );
    }

    return filtered;
  }, [tickets, allTickets, filterState]);

  const handleDelete = async (ticketId: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/ticket/${ticketId}`,
        {
          method: "DELETE",
        }
      );
      if (response.ok) {
        setTickets(tickets.filter((ticket) => ticket._id !== ticketId));
        setDeleteTicketId(null)
      } else {
        console.error("Failed to delete ticket");
      }
    } catch (error) {
      console.error("Error deleting ticket:", error);
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-GB", {
      day: "numeric",
      month: "short",
      year: "2-digit",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    }).format(date);
  };

  return (
    <div className="grid grid-cols-1 gap-4 md:hidden">
      <div className="flex justify-end items-center mb-4">
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded-md"
          onClick={() =>
            setFilterState((prevState) => ({
              ...prevState,
              showDropDown: !prevState.showDropDown,
              showCustomerDropDown: false,
            }))
          }
        >
          Filter
        </button>
      </div>

      {filterState.showDropDown && (
        <div className="bg-white p-4 rounded-lg shadow-lg">
          <div className="mb-4">
            <div className="flex items-center">
            <button className="block text-sm font-semibold mb-2" onClick={()=>setFilterState((prev)=>({...prev,showCustomerDropDown:!prev.showCustomerDropDown}))}>
              Sort By Customer
            </button>
              <svg
              className="w-2.5 h-2.5 ms-3"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 10 6"
              >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="m1 1 4 4 4-4"
                />
            </svg>
            </div>
            {/* <select
              value={filterState.filterByCustomer}
              onChange={(e) =>
                setFilterState((prevState) => ({
                  ...prevState,
                  filterByCustomer: e.target.value,
                }))
              }
              className="w-full border px-3 py-2 rounded-lg"
            >
              <option value="all">All</option>
              {customers.map((customer) => (
                <option key={customer._id} value={customer.name}>
                  {customer.name}
                </option>
              ))}
            </select> */}
            <div
              className={`z-10 ${
                !filterState.showCustomerDropDown && "hidden"
              } bg-white divide-y divide-gray-100 rounded-lg shadow w-44 dark:bg-gray-700`}
            >
              <ul className="py-2 text-sm text-gray-700 dark:text-gray-200">
                {customers.map((customer) => (
                  <li
                    key={customer._id}
                    className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white cursor-pointer"
                    onClick={() => {
                      setFilterState((prev) => ({
                        ...prev,
                        filterByCustomer: customer.name,
                        showCustomerDropDown: false,
                      }));
                    }}
                  >
                    {customer.name}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-semibold mb-2">
              Filter by Last Number of Days
            </label>
            <input
              type="number"
              className="w-full border px-3 py-2 rounded-lg"
              value={filterState.sortDays}
              onChange={(e) =>
                setFilterState((prevState) => ({
                  ...prevState,
                  sortDays: e.target.value,
                }))
              }
              min="0"
            />
          </div>
          <div className="mb-4">
            <button
              className="w-full bg-gray-100 px-3 py-2 rounded-lg"
              onClick={() =>
                setFilterState((prevState) => ({
                  ...prevState,
                  sortBy: "created_date",
                  sortOrder: prevState.sortOrder === "asc" ? "desc" : "asc",
                }))
              }
            >
              Sort by Created Date
              {filterState.sortBy === "created_date" &&
                (filterState.sortOrder === "asc" ? " ▲" : " ▼")}
            </button>
          </div>
          {filteredTickets.length > 0 && (
            <div className="text-blue-500 flex justify-between items-center">
              <h1>
                {filterState.fetchAll ? "Shown: All" : "Shown: Last 3 Months"}
              </h1>
              <button
                onClick={() =>
                  setFilterState((prevState) => ({
                    ...prevState,
                    fetchAll: !prevState.fetchAll,
                    showCustomerDropDown: false,
                    sortDays: "",
                  }))
                }
              >
                {filterState.fetchAll ? "Last 3 Months" : "All"}
              </button>
            </div>
          )}
        </div>
      )}
      {filteredTickets.length <= 0 && (
        <div className="bg-white text-black p-4 rounded-lg shadow-lg">
          <h1>No Tickets Found For this criteria</h1>
          <p>use filter to change criteria</p>
        </div>
      )}
      {filteredTickets.map((ticket) => (
        <div
          key={ticket._id}
          className="bg-white text-black p-4 rounded-lg shadow-lg"
        >
          <div className="flex flex-col space-y-4 text-sm w-full">
            <div className="flex justify-between items-center">
              <div className="flex">
                <span className="font-semibold mr-2">Customer Name:</span>
                <span>{ticket.customer_name}</span>
              </div>
              <div className="flex">
                <span className="font-semibold mr-2">Final Decision:</span>
                <span className="text-right">{ticket.final_decision}</span>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <div className="flex">
                <span className="font-semibold mr-2">Ticket Number:</span>
                <span>{ticket.ticket_number}</span>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <div className="flex">
                <span className="font-semibold mr-2">Current Step:</span>
                <span>{ticket.current_step}</span>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <div className="flex">
                <span className="font-semibold mr-2">Updated Date:</span>
                <span>{formatDateTime(ticket.updated_date)}</span>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <div className="flex">
                <span className="font-semibold mr-2">Created Date:</span>
                <span className="text-right">
                  {formatDateTime(ticket.created_date)}
                </span>
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <Link href={`tickets/${ticket._id}`} passHref>
                <span className="text-blue-500 hover:text-blue-700">
                  <FaEye />
                </span>
              </Link>
              <FaTrash
               onClick={() => setDeleteTicketId(ticket._id)}
                className="text-red-500 cursor-pointer hover:text-red-700"
              />
            </div>
          </div>
        </div>
      ))}
      {deleteTicketId && (
        <dialog open className="p-5 bg-white rounded shadow-lg">
          <h2 className="text-xl font-bold mb-4">Confirm Delete</h2>
          <p>Are you sure you want to delete this ticket?</p>
          <div className="flex justify-end mt-4">
            <button
              onClick={() => setDeleteTicketId(null)}
              className="mr-2 bg-gray-300 hover:bg-gray-400 text-black font-bold py-2 px-4 rounded"
            >
              Cancel
            </button>
            <button
            onClick={() => handleDelete(deleteTicketId)}
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
            >
              Delete
            </button>
          </div>
        </dialog>
      )}
    </div>
  );
}
