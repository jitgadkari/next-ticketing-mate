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
import toast from "react-hot-toast";

interface Person {
  id: string;
  name: string;
  email: string;
  phone: string;
  linked: boolean;
  type_employee: string;
  status: string;
  linked_to_id?: {
    id: string;
    name: string;
  };
}

interface DashboardData {
  person: Person;
  tickets: Ticket[];
  dashboardType: 'customer' | 'vendor';
  total_pages: number;
  current_page: number;
}

interface VendorMessage {
  name: string;
  response_message: string;
  response_received: boolean;
  message_received_time?: string | null;
}

interface VendorMessages {
  [key: string]: VendorMessage;
}

interface Ticket {
  id: string;
  ticket_number: string;
  ticket_type: string;
  customer_message: string;
  customer_name?: string;
  current_step: string;
  created_date: string;
  status: string;
  ticket_id?: string;
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
    },
    'Step 5 : Messages from Vendors'?: {
      latest: {
        vendors: VendorMessages
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
  const [replyTicket, setReplyTicket] = useState<string | null>(null);
  const [replyMessage, setReplyMessage] = useState("");

  const handleCustomerSelect = async (access_token: string, limit = 10, offset = 0) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_ENDPOINT_URL}/api/customers/dashboard?limit=${limit}&offset=${offset}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${access_token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error(`Failed to fetch dashboard data. Status: ${response.status}`);

      const data: DashboardData & {
        total_pages: number;
        current_page: number;
      } = await response.json();

      setDashboardData(data);
      setTickets(data.tickets || []);
    } catch (error) {
      console.error("Error fetching customer dashboard:", error);
      setError(error instanceof Error ? error.message : "An unknown error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const accessToken = localStorage.getItem("auth-token");
    if (!accessToken) {
      setError("Authentication token not available");
      setIsLoading(false);
      return;
    }
    handleCustomerSelect(accessToken, filterState.limit, filterState.offset);
  }, [refreshKey, filterState.offset]);


  const handleAdd = () => {
    setShowForm(false);
    setRefreshKey(prev => prev + 1);
  };

  const columns = dashboardData?.dashboardType === 'vendor' ? [
    "Ticket Number",
    "Type",
    "Status",
    // "Customer",
    "Customer Message",
    "Your Response",
  ] : [
    "Ticket Number",
    "Type",
    "Status",
    // "Decision",
    "Customer Message",
    "Intrend Reply",
  ];

  const renderRow = (ticket: Ticket) => {
    const isVendorView = dashboardData?.dashboardType === 'vendor';
    const vendorId = dashboardData?.person?.linked_to_id?.id ?? '';
    const vendorMessages = ticket.steps?.['Step 5 : Messages from Vendors']?.latest?.vendors || {};
    const vendorResponse = vendorMessages[vendorId];

    return (
      <>
        <td className="border p-2">{ticket.ticket_number}</td>
        <td className="border p-2">{ticket.ticket_type}</td>
        <td className="border p-2">
          <span
            className={`px-2 py-1 rounded ${ticket.steps?.['Step 9 : Final Status']?.latest?.status === "closed"
              ? "bg-red-200 text-red-800"
              : "bg-green-200 text-green-800"
              }`}
          >
            {ticket.steps?.['Step 9 : Final Status']?.latest?.status ?? "open"}
          </span>
        </td>
        {/* {isVendorView ? (
        <td className="border p-2">{ticket.customer_name}</td>
      ) : (
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
      )} */}
        <td className="border p-2">{ticket.steps?.['Step 1 : Customer Message Received']?.latest?.text ?? ticket.customer_message ?? "N/A"}</td>
        <td className="border p-2">
          <div className="w-full whitespace-pre-wrap text-sm max-h-40 overflow-y-auto">
            {isVendorView
              ? (
                !vendorResponse?.response_message && replyTicket === ticket.ticket_number ? (
                  <div className="space-y-2">
                    <textarea
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      className="w-full p-2 border rounded"
                      rows={3}
                      placeholder="Type your reply here..."
                    />
                    <div className="flex space-x-2">
                      <button
                        onClick={async () => {
                          try {
                            const response = await fetch(
                              `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/api/tickets/update_step/specific?userId=a8ccba22-4c4e-41d8-bc2c-bfb7e28720ea&userAgent=user-test`,
                              {
                                method: "PUT",
                                headers: {
                                  "Content-Type": "application/json",
                                },
                                body: JSON.stringify({
                                  ticket_id: ticket.id,
                                  step_number: "Step 5 : Messages from Vendors",
                                  step_info: {
                                    vendors: [
                                      {
                                        vendor_id: dashboardData?.person?.linked_to_id?.id ?? '',
                                        name: dashboardData?.person?.linked_to_id?.name ?? '',
                                        response_received: true,
                                        response_message: replyMessage
                                      }
                                    ]
                                  },
                                }),
                              }
                            );
                            if (response.ok) {
                              const accessToken = localStorage.getItem("auth-token");
                              if (accessToken) {
                                await handleCustomerSelect(accessToken);
                              }
                              setReplyTicket(null);
                              setReplyMessage("");
                              toast.success("Reply sent successfully");
                            } else {
                              console.error("Failed to send reply");
                              toast.error("Failed to send reply");
                            }
                          } catch (error) {
                            console.error("Error sending reply:", error);
                          }
                        }}
                        className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        Send
                      </button>
                      <button
                        onClick={() => {
                          setReplyTicket(null);
                          setReplyMessage("");
                        }}
                        className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    {!vendorResponse?.response_message ? (
                      <button
                        onClick={() => setReplyTicket(ticket.ticket_number)}
                        className="text-blue-600 hover:text-blue-800 underline"
                      >
                        Click to Reply
                      </button>
                    ) : (
                      vendorResponse.response_message
                    )}
                  </div>
                )
              )
              : (ticket.steps?.['Step 7 : Customer Message Template']?.latest?.text ?? "No reply yet")}
          </div>
        </td>
      </>
    );
  };


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
        dashboardData={dashboardData}
      />
      <div className="p-8 bg-grey-100 rounded shadow text-black hidden md:block">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">{dashboardData?.dashboardType === 'vendor' ? 'Vendor Dashboard' : 'Customer Dashboard'}</h1>
          <div>
            {dashboardData?.dashboardType === 'customer' && !showForm && (
              <Button onClick={() => setShowForm(true)}>Add Ticket</Button>
            )}
            {dashboardData?.dashboardType === 'customer' && showForm && (
              <Button onClick={() => setShowForm(false)}>Cancel</Button>
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
              <p className="font-semibold">{dashboardData.dashboardType === 'vendor' ? 'Vendor' : 'Customer'}: {dashboardData.person.name}</p>
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
        {dashboardData?.total_pages && dashboardData.total_pages > 1 && (
          <Pagination
            limit={filterState.limit}
            offset={filterState.offset}
            current_page={dashboardData.current_page}
            total_pages={dashboardData.total_pages}
            onPageChange={(page) => {
              const newOffset = (page - 1) * filterState.limit;
              setFilterState(prev => ({ ...prev, offset: newOffset }));
            }}
          />
        )}
      </div>

    </>
  );
}
