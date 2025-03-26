/* eslint-disable react/jsx-no-undef */
"use client";

import { useState, useEffect } from "react";
import SelectVendorDropdown from "./SelectVendorDropdown";
import VendorDashboardMobileList from './VendorDashboardMobileList';
import Pagination from "@/app/components/Pagination";
import Link from "next/link";
import { FaEye, FaTrash } from "react-icons/fa";
import Table from '../../components/Table';
import toast from "react-hot-toast";

interface Ticket {
  _id: string;
  ticket_number: string;
  person_name: string;
  current_step: string;
  created_date: string;
  status: string;
  final_decision: string;
  customer_message: string;
  vendor_replies: { [key: string]: string };
  steps: any; 
}

interface ApiResponse {
  tickets: Ticket[];
  total_tickets: number;
  current_page: number;
  total_pages: number;
  has_next: boolean;
}

export default function VendorsDashboard() {
  const [selectedVendor, setSelectedVendor] = useState("");
  const [allTickets, setAllTickets] = useState<Ticket[]>([]);
  const [displayedTickets, setDisplayedTickets] = useState<Ticket[]>([]);
  const [deleteTicketId, setDeleteTicketId] = useState<string | null>(null);
  const [filterState, setFilterState] = useState({
    limit: 10,
    offset: 0,
    ticket_number: "",
    showDropDown: false,
    sort_order: false
  });
  const [pageInfo, setPageInfo] = useState<{
    total_tickets: number | null;
    current_page: number | null;
    total_pages: number | null;
    has_next: boolean;
  }>({ total_tickets: null, current_page: null, total_pages: null, has_next: true });
  const [currentPage, setCurrentPage] = useState(1);

  const handleVendorSelect = async (vendorName: string) => {
    setSelectedVendor(vendorName);
    setFilterState(prev => ({ ...prev, offset: 0 }));
    setCurrentPage(1);
  };

  const handleDelete = async (ticketId: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/ticket/${ticketId}`,
        {
          method: "DELETE",
        }
      );
      if (response.ok) {
        setAllTickets(allTickets.filter((ticket) => ticket._id !== ticketId));
        setDeleteTicketId(null);
        toast.success("Ticket deleted successfully");
      } else {
        console.error("Failed to delete ticket");
      }
    } catch (error) {
      console.error("Error deleting ticket:", error);
    }
  };


  const fetchTickets = async () => {
    if (!selectedVendor) return;
    try {
        const response = await fetch(
        `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/vendor_tickets/?vendor_name=${encodeURIComponent(selectedVendor)}&limit=0`
        );
      const data: ApiResponse = await response.json();
      console.log("Fetched Data:", data);

      const parsedTickets = data.tickets.map(ticket => {
        // Get all vendor messages from Step 5
        const vendorMessages = ticket.steps?.["Step 5 : Messages from Vendors"] || {};

        return {
          _id: ticket._id,
          ticket_number: ticket.ticket_number,
          person_name: ticket.person_name,
          current_step: ticket.current_step,
          created_date: ticket.created_date,
          customer_message: ticket.steps?.["Step 1 : Customer Message Received"]?.text || "N/A",
          vendor_replies: vendorMessages,
          status: ticket.steps?.["Step 9: Final Status"]?.status || "open",
          final_decision: ticket.steps?.["Step 9: Final Status"]?.final_decision || "pending",
          steps: ticket.steps
        };
      });

      setAllTickets(parsedTickets);
      updateDisplayedTickets(parsedTickets, filterState);
    } catch (error) {
      console.error("Error fetching tickets:", error);
    }
  };

  const updateDisplayedTickets = (tickets: Ticket[], currentFilter: typeof filterState) => {
    let filtered = [...tickets];
    
    // Apply ticket number filter if exists
    if (currentFilter.ticket_number) {
      filtered = filtered.filter(ticket => 
        ticket.ticket_number.toLowerCase().includes(currentFilter.ticket_number.toLowerCase())
      );
    }

    // Calculate pagination info for display (10 items per page)
    const itemsPerPage = 10;
    const totalTickets = filtered.length;
    const totalPages = Math.ceil(totalTickets / itemsPerPage);
    const hasNext = currentPage * itemsPerPage < totalTickets;

    // Update page info
    setPageInfo({
      total_tickets: totalTickets,
      current_page: currentPage,
      total_pages: totalPages,
      has_next: hasNext,
    });

    // Apply pagination for display (10 items per page)
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    setDisplayedTickets(filtered.slice(start, end));
  };

  useEffect(() => {
    fetchTickets();
  }, [selectedVendor]);

  useEffect(() => {
    if (allTickets.length > 0) {
      updateDisplayedTickets(allTickets, filterState);
    }
  }, [filterState]);

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
    if (currentPage > 1) {
      const newPage = currentPage - 1;
      setCurrentPage(newPage);
      setFilterState(prev => ({
        ...prev,
        offset: (newPage - 1) * 10,
      }));
    }
  };

  const handleNext = () => {
    if (pageInfo.has_next) {
      const newPage = currentPage + 1;
      setCurrentPage(newPage);
      setFilterState(prev => ({
        ...prev,
        offset: (newPage - 1) * 10,
      }));
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setFilterState(prev => ({
      ...prev,
      offset: (page - 1) * 10,
    }));
  };

  const handleChangeSortOrder = () => {
    setFilterState(prev => ({
      ...prev,
      sort_order: !prev.sort_order,
    }));
  };

  const columns = [
    "Ticket Number",
    "Customer Message",
    "Vendor's Reply",
  ];

  const [replyTicket, setReplyTicket] = useState<string | null>(null);
  const [replyMessage, setReplyMessage] = useState("");

  const handleReply = async (ticketNumber: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/ticket/update_specific_step/`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ticket_number: ticketNumber,
            step_number: "Step 5 : Messages from Vendors",
            step_info: {
              [selectedVendor]: replyMessage
            },
          }),
        }
      );

      if (response.ok) {
        toast.success("Reply sent successfully");
        setReplyTicket(null);
        setReplyMessage("");
        fetchTickets(); // Refresh the tickets
      } else {
        toast.error("Failed to send reply");
      }
    } catch (error) {
      console.error("Error sending reply:", error);
      toast.error("Error sending reply");
    }
  };

  const renderRow = (ticket: Ticket) => {
    const vendorReply = ticket.vendor_replies[selectedVendor] || "";
    return (
      <>
        <td className="border p-2">{ticket.ticket_number}</td>
        <td className="border p-2">{ticket.customer_message}</td>
        <td className="border p-2">
          {replyTicket === ticket.ticket_number ? (
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
                  onClick={() => handleReply(ticket.ticket_number)}
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
            <div className={vendorReply.trim() === "" ? "text-yellow-600 font-medium" : ""}>
              {vendorReply.trim() === "" ? (
                <button
                  onClick={() => setReplyTicket(ticket.ticket_number)}
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  Click to Reply
                </button>
              ) : (
                vendorReply
              )}
            </div>
          )}
        </td>
      </>
    );
  };

  return (
    <>
        <VendorDashboardMobileList 
          selectedVendor={selectedVendor}
          onVendorSelect={handleVendorSelect}
        />

      <div className="p-8 bg-grey-100 rounded shadow text-black hidden md:block">
      <div className="flex justify-between items-start mb-6">
        <h1 className="text-2xl font-bold mb-4">Vendor Dashboard</h1>
      </div>

      <div className="mb-4 flex justify-between items-center">
        <SelectVendorDropdown onSelect={handleVendorSelect} />

        {selectedVendor && (
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

      {selectedVendor && (
        <p className="mt-4 text-lg font-semibold">Selected Vendor: {selectedVendor}</p>
      )}

      {displayedTickets.length > 0 ? (
        <>
          <Table columns={columns} data={displayedTickets} renderRow={renderRow} />
          <div className="flex justify-between items-center mt-4">
            <Pagination
              limit={10}
              offset={filterState.offset}
              total_items={String(pageInfo.total_tickets)}
              total_pages={Number(pageInfo.total_pages)}
              has_next={pageInfo.has_next}
              onPrevious={handlePrevious}
              onNext={handleNext}
              onPageChange={handlePageChange}
              current_page={currentPage}
            />
          </div>
        </>
      ) : (
        <p className="text-center py-20 text-gray-500">
          {selectedVendor ? "No tickets found for this vendor." : "Please select a vendor to view tickets."}
        </p>
      )}
      </div>
    </>
    );
}