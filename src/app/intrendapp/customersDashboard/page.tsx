/* eslint-disable react/jsx-no-undef */
"use client";

import { useState, useEffect } from "react";
import CustomerDashboardMobileList from './CustomerDashboardMobileList';
import Pagination from "@/app/components/Pagination";
import Link from "next/link";
import { FaEye, FaTrash } from "react-icons/fa";
import Table from '../../components/Table';
import Button from '../../components/Button';
import AddTicketForm from '../tickets/AddTicketForm';

interface Person {
  id: string;
  name: string;
  email: string;
  phone: string;
  linked: boolean;
  type_employee: string;
  status: string;
}

interface DashboardData {
  person: Person;
  tickets: Ticket[];
}

interface Ticket {
  id: string;
  ticket_number: string;
  ticket_type: string;
  customer_message: string;
  current_step: string;
  created_date: string;
  status: string;
  steps: {
    'Step 9 : Final Status'?: {
      latest: {
        status: string;
        final_decision: string;
      }
    },
    'Step 1 : Customer Message Received'?: {
      latest: {
        text: string;
      }
    },
    'Step 7 : Customer Message Template'?: {
      latest: {
        text: string;
      }
    }
  };
}

export default function CustomerDashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterState, setFilterState] = useState({
    limit: 10,
    offset: 0,
    sort_order: false,
    ticket_number: "",
    showDropDown: false
  });
  const [showForm, setShowForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  
  const handleCustomerSelect = async (access_token: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_ENDPOINT_URL}/api/customers/dashboard`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${access_token}`,
          "Content-Type": "application/json",
        },
      });
  
      if (!response.ok) {
        throw new Error(`Failed to fetch dashboard data. Status: ${response.status}`);
      }
  
      const data: DashboardData = await response.json();
      console.log("Customer Dashboard Data:", data);
      
      if (data && data.person) {
        setDashboardData(data);
        setTickets(data.tickets || []);
      } else {
        throw new Error("Invalid data received from server");
      }
    } catch (error) {
      console.error("Error fetching customer dashboard:", error);
      setError(error instanceof Error ? error.message : "An unknown error occurred");
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    const accessToken = localStorage.getItem("access_token");
    if(!accessToken){
      setError("Authentication token not available");
      setIsLoading(false);
      return;
    }
    handleCustomerSelect(accessToken);
  }, [refreshKey]);

  const handleAdd = () => {
    setShowForm(false);
    setRefreshKey(prev => prev + 1);
  };

  const columns = [
    "Ticket Number",
    "Type",
    "Status",
    "Decision",
    "Customer Message",
    "Intrend Reply",
  ];

  const renderRow = (ticket: Ticket) => (
    <>
      <td className="border p-2">{ticket.ticket_number}</td>
      <td className="border p-2">{ticket.ticket_type}</td>
      <td className="border p-2">
        <span
          className={`px-2 py-1 rounded ${
            ticket.steps?.['Step 9 : Final Status']?.latest?.status === "closed"
              ? "bg-red-200 text-red-800"
              : "bg-green-200 text-green-800"
          }`}
        >
          {ticket.steps?.['Step 9 : Final Status']?.latest?.status ?? "open"}
        </span>
      </td>
      <td className="border p-2">
        <span
          className={`px-2 py-1 rounded ${
            ticket.steps?.['Step 9 : Final Status']?.latest?.final_decision === "approved"
              ? "bg-green-200 text-green-800"
              : ticket.steps?.['Step 9 : Final Status']?.latest?.final_decision === "denied"
              ? "bg-red-200 text-red-800"
              : "bg-yellow-200 text-yellow-800"
          }`}
        >
          {ticket.steps?.['Step 9 : Final Status']?.latest?.final_decision ?? "pending"}
        </span>
      </td>
      <td className="border p-2">{ticket.steps?.['Step 1 : Customer Message Received']?.latest?.text ?? ticket.customer_message ?? "N/A"}</td>
      <td className="border p-2">
        <div className="w-full whitespace-pre-wrap text-sm max-h-40 overflow-y-auto">
          {ticket.steps?.['Step 7 : Customer Message Template']?.latest?.text ?? "No reply yet"}
        </div>
      </td>
    </>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-2xl">
          <p className="text-red-800">{error}</p>
          <button 
            onClick={() => setRefreshKey(prev => prev + 1)}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <CustomerDashboardMobileList 
        selectedCustomer={dashboardData?.person?.name ?? ""}
        onCustomerSelect={handleCustomerSelect}
      />
      <div className="p-8 bg-grey-100 rounded shadow text-black hidden md:block">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Customer Dashboard</h1>
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
        </div>

        {showForm && dashboardData?.person && (
          <div className="mb-4">
            <AddTicketForm 
              key={dashboardData.person.id} 
              onAdd={handleAdd} 
              initialCustomer={dashboardData.person.name} 
              disableCustomerSelect={true} 
            />
          </div>
        )}

        <div className="mb-4 flex justify-between items-center">
          {dashboardData?.person && (
            <div className="flex items-center gap-4">
              <p className="font-semibold">Customer: {dashboardData.person.name}</p>
              <p>Email: {dashboardData.person.email}</p>
              <p>Phone: {dashboardData.person.phone}</p>
            </div>
          )}

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
        </div>

        {tickets.length > 0 ? (
          <Table columns={columns} data={tickets} renderRow={renderRow} />
        ) : (
          <p className="text-center py-20 text-gray-500">No tickets found for this customer.</p>
        )}
      </div>
    </>
  );
}
