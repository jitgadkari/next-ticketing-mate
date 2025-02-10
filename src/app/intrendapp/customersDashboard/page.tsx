/* eslint-disable react/jsx-no-undef */
"use client";

import { useState, useEffect } from "react";
import SelectCustomerDropdown from "./SelectCustomerDropdown";
import Pagination from "@/app/components/Pagination";
import Link from "next/link";
import { FaEye, FaTrash } from "react-icons/fa";
import Table from '../../components/Table';
import Button from '../../components/Button';
import AddTicketForm from '../tickets/AddTicketForm';

interface Ticket {
  _id: string;
  ticket_number: string;
  person_name: string;
  current_step: string;
  created_date: string;
  status: string;
  final_decision: string;
  customer_message: string;
  steps: any; 
}

interface ApiResponse {
  tickets: Ticket[];
  total_tickets: number;
  current_page: number;
  total_pages: number;
  has_next: boolean;
}

export default function CustomerDashboard() {
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [filterState, setFilterState] = useState({
    limit: 10,
    offset: 0,
    sort_order: false,
    ticket_number: "",
    showDropDown: false
  });
  const [pageInfo, setPageInfo] = useState<{
    total_tickets: number | null;
    current_page: number | null;
    total_pages: number | null;
    has_next: boolean;
  }>({ total_tickets: null, current_page: null, total_pages: null, has_next: true });
  const [templates, setTemplates] = useState<{ [key: string]: string }>({});
  const [showForm, setShowForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleCustomerSelect = async (customerName: string) => {
    setSelectedCustomer(customerName);
    setFilterState(prev => ({ ...prev, offset: 0 }));
  };

  const fetchTickets = async () => {
    if (!selectedCustomer) return;
    try {
      const queryParams = new URLSearchParams({
        customer_name: selectedCustomer,
        limit: filterState.limit.toString(),
        offset: filterState.offset.toString(),
        sort_order: filterState.sort_order ? "asc" : "desc"
      });

      if (filterState.ticket_number) {
        queryParams.append('ticket_num', filterState.ticket_number);
      }

      const response = await fetch(
        `http://139.59.53.5:8000/tickets/?${queryParams.toString()}`
      );
      const data: ApiResponse = await response.json();
      console.log("Fetched Data:", data);

      const parsedTickets = data.tickets.map(ticket => {
        console.log("Step 7 template:", ticket.steps?.["Step 7 : Customer Message Template"]);
        return {
          _id: ticket._id,
          ticket_number: ticket.ticket_number,
          person_name: ticket.person_name,
          current_step: ticket.current_step,
          created_date: ticket.created_date,
          customer_message: ticket.steps?.["Step 1 : Customer Message Received"]?.text || "N/A",
          status: ticket.steps?.["Step 9: Final Status"]?.status || "open",
          final_decision: ticket.steps?.["Step 9: Final Status"]?.final_decision || "pending",
          steps: ticket.steps
        };
      });

      setTickets(parsedTickets);
      setPageInfo({
        total_tickets: data.total_tickets,
        current_page: data.current_page,
        total_pages: data.total_pages,
        has_next: data.has_next,
      });
    } catch (error) {
      console.error("Error fetching tickets:", error);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [selectedCustomer, filterState]);

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

  const handlePrevious = () => {
    setFilterState(prev => ({
      ...prev,
      offset: Math.max(prev.offset - prev.limit, 0),
    }));
  };

  const handleNext = () => {
    if (pageInfo.has_next) {
      setFilterState(prev => ({
        ...prev,
        offset: prev.offset + prev.limit,
      }));
    }
  };

  const handlePageChange = (page: number) => {
    setFilterState(prev => ({
      ...prev,
      offset: (page - 1) * prev.limit,
    }));
  };

  const handleChangeSortOrder = () => {
    setFilterState(prev => ({
      ...prev,
      sort_order: !prev.sort_order,
    }));
  };

  const handleTemplateChange = async (ticketId: string, value: string) => {
    setTemplates(prev => ({
      ...prev,
      [ticketId]: value
    }));

    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/ticket/update_specific_step/`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ticket_number: tickets.find(t => t._id === ticketId)?.ticket_number,
            step_info: { text: value },
            step_number: "Step 7: Customer Message Template",
          }),
        }
      );
      console.log("Template updated:", value);
    } catch (error) {
      console.error("Error updating template:", error);
    }
  };

  const handleAdd = () => {
    setShowForm(false);
    fetchTickets(); // Refresh the tickets list after adding
  };

  const columns = [
    "Ticket Number",
    "Person Name",
    "Status",
    "Decision",
    "Customer Message",
    "Intrend Reply",
  ];

  const renderRow = (ticket: Ticket) => (
    <>
      <td className="border p-2">{ticket.ticket_number}</td>
      <td className="border p-2">{ticket.person_name}</td>
      <td className="border p-2">
        <span
          className={`px-2 py-1 rounded ${
            ticket.status === "closed"
              ? "bg-red-200 text-red-800"
              : "bg-green-200 text-green-800"
          }`}
        >
          {ticket.status}
        </span>
      </td>
      <td className="border p-2">
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
      <td className="border p-2">{ticket.customer_message}</td>
      <td className="border p-2">
        <div className="w-full whitespace-pre-wrap text-sm max-h-40 overflow-y-auto">
          {ticket.steps?.["Step 7 : Customer Message Template"]?.text || "No reply yet"}
        </div>
      </td>
    </>
  );

  return (
    <div className="p-8 bg-grey-100 rounded shadow text-black">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Customer Dashboard</h1>
        {selectedCustomer && (
          <div>
            {!showForm ? (
              <Button onClick={() => setShowForm(true)}>
                Add Ticket
              </Button>
            ) : (
              <Button onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            )}
          </div>
        )}
      </div>

      {showForm && selectedCustomer && (
        <div className="mb-4">
          <AddTicketForm 
            key={selectedCustomer} 
            onAdd={handleAdd} 
            initialCustomer={selectedCustomer} 
            disableCustomerSelect={true} 
          />
        </div>
      )}

      <div className="mb-4 flex justify-between items-center">
        <SelectCustomerDropdown onSelect={handleCustomerSelect} />

        {selectedCustomer && (
          <div className="relative flex items-center gap-2">
            {filterState.showDropDown && (
              <input
                type="text"
                value={filterState.ticket_number}
                onChange={(e) =>
                  setFilterState((prevState) => ({
                    ...prevState,
                    ticket_number: e.target.value,
                    offset: 0,
                  }))
                }
                placeholder="Search Ticket Number"
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:border-blue-300"
              />
            )}

            <button
              className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              onClick={() =>
                setFilterState((prevState) => ({
                  ...prevState,
                  showDropDown: !prevState.showDropDown,
                  ticket_number: "",
                  offset: 0,
                }))
              }
            >
              Filter
            </button>
          </div>
        )}
      </div>

      {selectedCustomer && (
        <p className="mt-4 text-lg font-semibold">Selected Customer: {selectedCustomer}</p>
      )}

      {tickets.length > 0 ? (
        <>
          <Table columns={columns} data={tickets} renderRow={renderRow} />
          {selectedCustomer && (
            <div className="flex justify-between items-center mt-4">
              <Pagination
                limit={filterState.limit}
                offset={filterState.offset}
                total_items={String(pageInfo.total_tickets)}
                current_page={Number(pageInfo.current_page)}
                total_pages={Number(pageInfo.total_pages)}
                has_next={pageInfo.has_next}
                onPrevious={handlePrevious}
                onNext={handleNext}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </>
      ) : (
        <p className="text-center py-20 text-gray-500">No tickets found for this customer.</p>
      )}
    </div>
  );
}
