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
    showCustomerDropDown: false,
    sortOrder: "asc",
    sortBy: "",
    sortDays: "",
    filterByCustomer: "",
    fetchAll: false,
  });
  const [customers, setCustomers] = useState<Customer[]>([]);

  useEffect(() => {
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
        const response = await fetch(`${process.env.NEXT_PUBLIC_ENDPOINT_URL}/customers`);
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

    if (filterState.filterByCustomer && filterState.filterByCustomer !== "all") {
      filtered = filtered.filter(ticket => ticket.customer_name === filterState.filterByCustomer);
    }

    if (filterState.sortBy === "created_date") {
      filtered.sort((a, b) =>
        filterState.sortOrder === "asc"
          ? new Date(a.created_date).getTime() - new Date(b.created_date).getTime()
          : new Date(b.created_date).getTime() - new Date(a.created_date).getTime()
      );
    }

    if (filterState.sortDays && filterState.sortDays !== "0") {
      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.getDate() - parseInt(filterState.sortDays));
      filtered = filtered.filter(ticket => new Date(ticket.created_date) >= daysAgo);
    }

    return filtered;
  }, [tickets, allTickets, filterState]);

  const handleDelete = async (ticketId: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_ENDPOINT_URL}/ticket/${ticketId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setTickets(tickets.filter(ticket => ticket._id !== ticketId));
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
            setFilterState(prevState => ({
              ...prevState,
              showCustomerDropDown: !prevState.showCustomerDropDown,
            }))
          }
        >
          Filter
        </button>
      </div>

      {filterState.showCustomerDropDown && (
        <div className="bg-white p-4 rounded-lg shadow-lg">
          <div className="mb-4">
            <label className="block text-sm font-semibold mb-2">Customer</label>
            <select
              value={filterState.filterByCustomer}
              onChange={e =>
                setFilterState(prevState => ({
                  ...prevState,
                  filterByCustomer: e.target.value,
                }))
              }
              className="w-full border px-3 py-2 rounded-lg"
            >
              <option value="all">All</option>
              {customers.map(customer => (
                <option key={customer._id} value={customer.name}>
                  {customer.name}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-semibold mb-2">Filter by Last Number of Days</label>
            <input
              type="number"
              className="w-full border px-3 py-2 rounded-lg"
              value={filterState.sortDays}
              onChange={e =>
                setFilterState(prevState => ({
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
                setFilterState(prevState => ({
                  ...prevState,
                  sortBy: "created_date",
                  sortOrder: prevState.sortOrder === "asc" ? "desc" : "asc",
                }))
              }
            >
              Sort by Created Date
              {filterState.sortBy === "created_date" && (filterState.sortOrder === "asc" ? " ▲" : " ▼")}
            </button>
          </div>
          {filteredTickets.length > 0 && (
            <div className="text-blue-500 flex justify-between items-center">
              <h1>{filterState.fetchAll ? "Shown: All" : "Shown: Last 3 Months"}</h1>
              <button
                onClick={() =>
                  setFilterState(prevState => ({
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
    {filteredTickets.length <=0 &&
    <div className="bg-white text-black p-4 rounded-lg shadow-lg">
        <h1>No  Tickets Found For this criteria</h1>
        <p>use filter to change criteria</p>
     </div>
        }
      {filteredTickets.map(ticket => (
        <div key={ticket._id} className="bg-white text-black p-4 rounded-lg shadow-lg">
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
                <span className="text-right">{formatDateTime(ticket.created_date)}</span>
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <Link href={`tickets/${ticket._id}`} passHref>
                <span className="text-blue-500 hover:text-blue-700">
                  <FaEye />
                </span>
              </Link>
              <FaTrash
                onClick={() => handleDelete(ticket._id)}
                className="text-red-500 cursor-pointer hover:text-red-700"
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
