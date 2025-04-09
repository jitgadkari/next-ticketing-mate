"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { FaEye, FaTrash } from "react-icons/fa";
import { MdOutlineFolderDelete } from "react-icons/md";
import Table from "../../components/Table";
import { Customer } from "./AddTicketForm";
import toast from "react-hot-toast";
import Pagination from "@/app/components/Pagination";
import { BsCalendar2DateFill } from "react-icons/bs";
import { getUserData, isAuthenticated } from "@/utils/auth";

interface Ticket {
  id: string;
  ticket_number: string;
  customer_name: string;
  current_step: string;
  created_date: string;
  status: string;
  final_decision: string;
  customer_message: string;
  vendor_responses: { name: string; response: string }[];
  message_sent: { email: boolean; whatsapp: boolean };
}

interface TicketListProps {
  refreshList: () => void;
  getOffset: () => number;
}

export interface FilterState {
  showDropDown: boolean;
  showCustomerDropDown: boolean;
  showStatusDropDown: boolean;
  showDecisionDropDown: boolean;
  showStepDropDown: boolean;
  ticket_num: string;
  customer_name: string;
  current_step: string;
  status: string;
  final_decision: string;
  step_status: string;
  decision_status: string;
  limit: number;
  offset: number;
  start_date?: string;
  end_date?: string;
  sort_order: boolean;
}

const TicketList: React.FC<TicketListProps> = ({ refreshList, getOffset }) => {
  const [allTickets, setAllTickets] = useState<Ticket[]>([]);
  const [filterState, setFilterState] = useState<FilterState>({
    showDropDown: false,
    showCustomerDropDown: false,
    showStatusDropDown: false,
    showDecisionDropDown: false,
    showStepDropDown: false,
    ticket_num: "",
    customer_name: "",
    current_step: "",
    step_status: "",
    decision_status: "",
    status: "",
    final_decision: "",
    limit: 10,
    offset: getOffset(),
    start_date: "",
    end_date: "",
    sort_order: true, // true = descending order, newest first
  });
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [deleteTicketId, setDeleteTicketId] = useState<string | null>(null);
  const [softDeleteTicketId, setSoftDeleteTicketId] = useState<string | null>(
    null
  );
  const [userRole, setUserRole] = useState<
    "admin" | "superuser" | "general_user"
  >("general_user");
  const [pageInfo, setPageInfo] = useState({
    total_tickets: 0,
    current_page: 1,
    total_pages: 1,
    has_next: true,
  });

  const stepsOrder = [
    "Step 1 : Customer Message Received",
    "Step 2 : Message Decoded",
    "Step 3 : Message Template for vendors",
    "Step 4 : Vendor Selection",
    "Step 5 : Messages from Vendors",
    "Step 6 : Vendor Message Decoded",
    "Step 7 : Customer Message Template",
    "Step 8 : Customer Response",
    "Step 9: Final Status",
  ];

  useEffect(() => {
    const isAuth = isAuthenticated();
    if (isAuth) {
      const userData = getUserData();
      console.log(userData);
      setUserRole(userData?.role || "general_user");
    }
  }, []);

  useEffect(() => {
    const fetchTickets = async () => {
      // Build filter parameters to match backend implementation
      const filterParams: {
        limit: string;
        offset: string;
        customer_name?: string;
        ticket_number?: string;
        current_step?: string;
        step_status?: string;
        start_date?: string;
        end_date?: string;
      } = {
        limit: filterState.limit.toString(),
        offset: filterState.offset.toString(),
      };

      // Match backend filter conditions
      if (filterState.customer_name?.trim()) {
        filterParams.customer_name = filterState.customer_name.trim();
      }
      if (filterState.ticket_num?.trim()) {
        filterParams.ticket_number = filterState.ticket_num.trim(); // Match backend parameter name
      }
      if (filterState.current_step?.trim()) {
        filterParams.current_step = filterState.current_step.trim();
      }
      if (filterState.step_status?.trim()) {
        filterParams.step_status = filterState.step_status.trim(); // Match backend status filter
      }
      if (filterState.start_date)
        filterParams.start_date = filterState.start_date;
      if (filterState.end_date) filterParams.end_date = filterState.end_date;

      console.log("Applying filters:", filterParams);

      const queryParams = new URLSearchParams(filterParams);
      try {
        const response = await fetch(
          `${
            process.env.NEXT_PUBLIC_ENDPOINT_URL
          }/api/tickets?${queryParams.toString()}`
        );
        const data = await response.json();
        console.log(data);

        const parsedTickets = data.tickets.map((ticket: any) => {
          // Check if ticket has reached Step 5
          const hasReachedStep5 =
            ticket.current_step === "Step 5 : Messages from Vendors" ||
            ticket.current_step === "Step 6 : Vendor Message Decoded" ||
            ticket.current_step === "Step 7 : Customer Message Template" ||
            ticket.current_step === "Step 8 : Customer Response" ||
            ticket.current_step === "Step 9 : Final Status";

          const vendorResponses =
            hasReachedStep5 &&
            ticket.steps["Step 5 : Messages from Vendors"]?.latest?.vendors
              ? Object.entries(
                  ticket.steps["Step 5 : Messages from Vendors"].latest.vendors
                ).map(([_, vendor]: [string, any]) => ({
                  name: vendor.name,
                  response: vendor.response_message?.trim() || "Yet to reply",
                }))
              : [];

          return {
            id: ticket.id,
            message_sent: ticket.steps["Step 7 : Customer Message Template"]
            ?.latest?.message_sent || { email: false, whatsapp: false },
            ticket_number: ticket.ticket_number,
            customer_name: ticket.customer_name,
            current_step: ticket.current_step,
            created_date: ticket.created_date,
            customer_message:
              ticket.steps["Step 1 : Customer Message Received"]?.latest.text ||
              "",
            vendor_responses: vendorResponses, // Changed from vendor_reply to vendor_responses
            status:
              ticket.steps["Step 9 : Final Status"]?.latest?.status || "open",
            final_decision:
              ticket.steps["Step 9 : Final Status"]?.latest?.final_decision ||
              "pending",
          };
        });
        
        setAllTickets(parsedTickets);
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
    fetchTickets();
  }, [refreshList, filterState]);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/api/customers`
        );
        const data = await response.json();
        setCustomers(data.customers);
      } catch (error) {
        console.error("Error fetching customers:", error);
      }
    };
    fetchCustomers();
  }, []);

  const handleDelete = async (ticketId: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/api/tickets/delete`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ticketId: ticketId,
            userId: "a8ccba22-4c4e-41d8-bc2c-bfb7e28720ea",
            userAgent: "user-test",
          }),
        }
      );

      if (response.ok) {
        setAllTickets(allTickets.filter((ticket) => ticket.id !== ticketId));
        setDeleteTicketId(null);
        toast.success("Ticket deleted successfully");
      } else {
        const errorData = await response.json();
        console.error("Failed to delete ticket:", errorData);
        toast.error("Failed to delete ticket");
      }
    } catch (error) {
      console.error("Error deleting ticket:", error);
      toast.error("Error deleting ticket");
    }
  };

  const handleSoftDelete = async (ticketId: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/api/tickets/soft_delete`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ticketId: ticketId,
            changed_status: "Closed",
            userId: "a8ccba22-4c4e-41d8-bc2c-bfb7e28720ea",
            userAgent: "user-test",
          }),
        }
      );

      const data = await response.json();
      console.log("Soft delete response:", data);

      if (response.ok) {
        setAllTickets(allTickets.filter((ticket) => ticket.id !== ticketId));
        setDeleteTicketId(null);
        toast.success("Ticket soft deleted successfully");
      } else {
        console.error("Failed to soft delete ticket:", data);
        toast.error("Failed to soft delete ticket");
      }
    } catch (error) {
      console.error("Error soft deleting ticket:", error);
      toast.error("Error soft deleting ticket");
    }
  };

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

  const columns = [
    "Ticket Number",
    "Customer Name",
    // "Current Step",
    "Created Date",
    "Customer Message",
    // "Vendor Reply",
    "Current Step / Vendor Reply / Customer Quote",
    "Status & Decision",
    "Actions",
  ];
  const handlePrevious = () => {
    const newOffset = Math.max(filterState.offset - filterState.limit, 0);
    console.log(`Moving to previous page, new offset: ${newOffset}`);
    setFilterState((prev) => ({
      ...prev,
      offset: newOffset,
    }));
  };

  const handleNext = () => {
    if (pageInfo.has_next) {
      const newOffset = filterState.offset + filterState.limit;
      console.log(`Moving to next page, new offset: ${newOffset}`);
      setFilterState((prev) => ({
        ...prev,
        offset: newOffset,
      }));
    }
  };

  useEffect(() => {
    localStorage.setItem("ticketListOffset", String(filterState.offset));
    console.log(`Updated offset in localStorage: ${filterState.offset}`);
  }, [filterState.offset]);
  const handlePageChange = (page: number) => {
    const newOffset = (page - 1) * filterState.limit;
    console.log(`Changing to page ${page}, new offset: ${newOffset}`);
    setFilterState((prev) => ({
      ...prev,
      offset: newOffset,
    }));
  };
  const handleChangeSortOrder = () => {
    setFilterState((prev) => ({
      ...prev,
      sort_order: !prev.sort_order,
      offset: 0, // Reset to first page when changing sort order
    }));
  };

  const renderRow = (ticket: Ticket) => {
    const stepIndex = stepsOrder.findIndex(
      (step) => step === ticket.current_step
    );
    const stepShades = [
      "bg-red-900 text-white", // Step 1 (most urgent)
      "bg-red-800 text-white",
      "bg-red-700 text-white",
      "bg-red-600 text-white",
      "bg-red-500 text-black",
      "bg-red-400 text-black",
      "bg-red-300 text-black",
      "bg-red-200 text-black",
      "bg-red-100 text-white", // Step 9 (least urgent)
    ];

    const stepColor = stepShades[stepIndex] || "bg-gray-200 text-gray-700";

    return (
      <>
        <td className="border rounded-lg p-2">{ticket.ticket_number}</td>
        <td className="border rounded-lg p-2">{ticket.customer_name}</td>
        <td className="border rounded-lg p-2">
          {formatDateTime(ticket.created_date)}
        </td>
        <td
          className="border rounded-lg p-2 max-w-[120px] truncate text-sm"
          title={ticket.customer_message}
        >
          {ticket.customer_message}
        </td>

        <td className="border rounded-lg p-2 space-y-2 text-sm">
          {/* Step Info */}
          <div>
            <span className="font-semibold text-gray-700">Current Step:</span>{" "}
            <span
              className={`text-xs font-semibold px-2 py-1 rounded ${stepColor}`}
            >
              {ticket.current_step}
            </span>
          </div>

          {/* Vendor Reply */}
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-2 w-fit max-w-[200px]">
            <span className="font-semibold text-blue-700 block mb-1">
              Vendors:
            </span>
            {ticket.vendor_responses.length > 0 ? (
              <div className="space-y-1">
                {ticket.vendor_responses.map((vendor, index) => (
                  <div
                    key={index}
                    className="truncate"
                    title={`${vendor.name}: ${vendor.response}`}
                  >
                    <span className="font-medium text-blue-800">
                      {vendor.name}:
                    </span>{" "}
                    <span className="text-gray-700">{vendor.response}</span>
                  </div>
                ))}
              </div>
            ) : (
              <span className="text-gray-400 italic">No reply</span>
            )}
          </div>

          {/* Customer Quote */}
          <div className="bg-green-50 border border-green-100 rounded-lg p-2 w-fit max-w-[200px]">
            <span className="font-semibold text-green-700 block mb-1">
              Customer:
            </span>
            {ticket.customer_message ? (
              <>
                <span className="font-semibold text-green-700">Status:</span>
                <span
                  className={`ml-2 text-xs px-2 py-1 rounded ${
                    ticket.message_sent?.whatsapp
                      ? "bg-green-200 text-green-800"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {ticket.message_sent?.whatsapp
                    ? "✓ WhatsApp Sent"
                    : "✗ WhatsApp Not Sent"}
                </span>
              </>
            ) : (
              <>
                <span className="text-gray-400 italic">No message</span>
                <span className="block mt-1 text-xs px-2 py-1 rounded bg-gray-200 text-gray-600">
                  WhatsApp Not Sent
                </span>
              </>
            )}
          </div>
        </td>

        <td className="border rounded-lg p-2 space-y-1">
          <div className="flex justify-center">
            <span
              className={`px-2 py-1 rounded-lg ${
                ticket.status === "closed"
                  ? "bg-red-200 text-red-800"
                  : "bg-green-200 text-green-800"
              }`}
            >
              {ticket.status}
            </span>
          </div>
          <div className="flex justify-center">
            <span
              className={`px-2 py-1 rounded-lg ${
                ticket.final_decision === "approved"
                  ? "bg-green-200 text-green-800"
                  : ticket.final_decision === "denied"
                  ? "bg-red-200 text-red-800"
                  : "bg-yellow-200 text-yellow-800"
              }`}
            >
              {ticket.final_decision}
            </span>
          </div>
        </td>
        <td className="border rounded-lg p-2">
          <ul className="h-full flex justify-center space-x-2">
            <Link href={`tickets/${ticket.id}`} passHref>
              <span className="text-blue-500 hover:text-blue-700">
                <FaEye />
              </span>
            </Link>
            {userRole === "admin" && (
              <FaTrash
                onClick={() => setDeleteTicketId(ticket.id)}
                className="text-red-500 cursor-pointer hover:text-red-700"
              />
            )}
            <MdOutlineFolderDelete
              onClick={() => setSoftDeleteTicketId(ticket.id)}
              className="text-yellow-500 cursor-pointer hover:text-yellow-700 ml-2"
              title="Soft Delete"
            />
          </ul>
        </td>
      </>
    );
  };

  return (
    <div className="p-8 rounded-2xl bg-white shadow text-black overflow-x-auto relative z-10">
      <div className="flex justify-between items-start mb-6">
        <h1 className="text-3xl font-bold mb-4 text-gray-800">Tickets List</h1>
        <div className="flex items-center gap-4">
          <button
            className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700"
            onClick={() =>
              setFilterState((prev) => ({
                ...prev,
                showDropDown: !prev.showDropDown,
              }))
            }
          >
            {filterState.showDropDown ? "Hide Filters" : "Show Filters"}
          </button>

          {filterState.showDropDown && (
            <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
              {/* Filter Tags */}
              {filterState.ticket_num && (
                <span className="bg-gray-200 text-gray-800 px-2 py-1 rounded-full flex items-center gap-1">
                  Ticket: {filterState.ticket_num}
                  <button
                    onClick={() =>
                      setFilterState((prev) => ({
                        ...prev,
                        ticket_num: "",
                        offset: 0,
                      }))
                    }
                  >
                    ✕
                  </button>
                </span>
              )}
              {filterState.customer_name && (
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full flex items-center gap-1">
                  Customer: {filterState.customer_name}
                  <button
                    onClick={() =>
                      setFilterState((prev) => ({
                        ...prev,
                        customer_name: "",
                        offset: 0,
                      }))
                    }
                  >
                    ✕
                  </button>
                </span>
              )}
              {filterState.step_status && (
                <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full flex items-center gap-1">
                  Status: {filterState.step_status}
                  <button
                    onClick={() =>
                      setFilterState((prev) => ({
                        ...prev,
                        step_status: "",
                        offset: 0,
                      }))
                    }
                  >
                    ✕
                  </button>
                </span>
              )}
              {filterState.final_decision && (
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full flex items-center gap-1">
                  Decision: {filterState.final_decision}
                  <button
                    onClick={() =>
                      setFilterState((prev) => ({
                        ...prev,
                        final_decision: "",
                        offset: 0,
                      }))
                    }
                  >
                    ✕
                  </button>
                </span>
              )}
              {filterState.current_step && (
                <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full flex items-center gap-1">
                  Step: {filterState.current_step}
                  <button
                    onClick={() =>
                      setFilterState((prev) => ({
                        ...prev,
                        current_step: "",
                        offset: 0,
                      }))
                    }
                  >
                    ✕
                  </button>
                </span>
              )}
              {filterState.start_date && (
                <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full flex items-center gap-1">
                  From: {filterState.start_date}
                  <button
                    onClick={() =>
                      setFilterState((prev) => ({ ...prev, start_date: "" }))
                    }
                  >
                    ✕
                  </button>
                </span>
              )}
              {filterState.end_date && (
                <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full flex items-center gap-1">
                  To: {filterState.end_date}
                  <button
                    onClick={() =>
                      setFilterState((prev) => ({ ...prev, end_date: "" }))
                    }
                  >
                    ✕
                  </button>
                </span>
              )}

              {/* Filter Inputs */}
              <input
                type="text"
                placeholder="Ticket #"
                value={filterState.ticket_num}
                onChange={(e) =>
                  setFilterState((prev) => ({
                    ...prev,
                    ticket_num: e.target.value,
                    offset: 0,
                  }))
                }
                className="px-2 py-1 border rounded text-sm w-28"
              />

              <select
                value={filterState.customer_name}
                onChange={(e) =>
                  setFilterState((prev) => ({
                    ...prev,
                    customer_name: e.target.value,
                    offset: 0,
                  }))
                }
                className="px-2 py-1 border rounded text-sm"
              >
                <option value="">Customer</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>

              <select
                value={filterState.step_status}
                onChange={(e) =>
                  setFilterState((prev) => ({
                    ...prev,
                    step_status: e.target.value,
                    offset: 0,
                  }))
                }
                className="px-2 py-1 border rounded text-sm"
              >
                <option value="">Status</option>
                <option value="open">Open</option>
                <option value="closed">Closed</option>
              </select>

              <select
                value={filterState.final_decision}
                onChange={(e) =>
                  setFilterState((prev) => ({
                    ...prev,
                    final_decision: e.target.value,
                    offset: 0,
                  }))
                }
                className="px-2 py-1 border rounded text-sm"
              >
                <option value="">Decision</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
              </select>

              <select
                value={filterState.current_step}
                onChange={(e) =>
                  setFilterState((prev) => ({
                    ...prev,
                    current_step: e.target.value,
                    offset: 0,
                  }))
                }
                className="px-2 py-1 border rounded text-sm"
              >
                <option value="">Step</option>
                {stepsOrder.map((step, i) => (
                  <option key={i} value={step}>
                    Step {i + 1}
                  </option>
                ))}
              </select>

              <input
                type="date"
                value={filterState.start_date}
                onChange={(e) =>
                  setFilterState((prev) => ({
                    ...prev,
                    start_date: e.target.value,
                  }))
                }
                className="px-2 py-1 border rounded text-sm"
              />
              <input
                type="date"
                value={filterState.end_date}
                onChange={(e) =>
                  setFilterState((prev) => ({
                    ...prev,
                    end_date: e.target.value,
                  }))
                }
                className="px-2 py-1 border rounded text-sm"
              />

              {/* Reset */}
              <button
                className="px-3 py-1 text-sm bg-gray-400 text-white rounded hover:bg-gray-500"
                onClick={() =>
                  setFilterState((prev) => ({
                    ...prev,
                    showCustomerDropDown: false,
                    showDecisionDropDown: false,
                    showStatusDropDown: false,
                    showStepDropDown: false,
                    ticket_num: "",
                    customer_name: "",
                    current_step: "",
                    step_status: "",
                    final_decision: "",
                    start_date: "",
                    end_date: "",
                    offset: 0,
                  }))
                }
              >
                Reset
              </button>
            </div>
          )}
        </div>
      </div>

      {/* {filteredTickets.length > 0 && (
        <div className={`text-blue-500 flex ${ filterState.fetchAll? "justify-end":"justify-between"} items-center`}>
          { !filterState.fetchAll &&<h1> currently last 3 months tickets are shown</h1>}
          
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
           {filterState.fetchAll?"Last 3 Month": "All"}
          </button>
        </div>
      )} */}
      {allTickets.length > 0 ? (
        <div className="relative overflow-x-auto">
          <Table
            columns={columns}
            data={allTickets}
            renderRow={renderRow}
            handleChangeSortOrder={handleChangeSortOrder}
          />
        </div>
      ) : (
        <div className="text-center py-20">
          <h2 className="text-xl text-gray-600">
            No tickets found for this customer:
            {filterState.customer_name}
          </h2>
          <p>Use the filter to change the customer</p>
        </div>
      )}
      {deleteTicketId && (
        <dialog open className="p-5 bg-white rounded shadow-lg fixed inset-0">
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
      {softDeleteTicketId && (
        <dialog open className="p-5 bg-white rounded shadow-lg fixed inset-0">
          <h2 className="text-xl font-bold mb-4">Confirm Delete</h2>
          <p>Are you sure you want to Soft delete this ticket?</p>
          <div className="flex justify-end mt-4">
            <button
              onClick={() => setSoftDeleteTicketId(null)}
              className="mr-2 bg-gray-300 hover:bg-gray-400 text-black font-bold py-2 px-4 rounded"
            >
              Cancel
            </button>
            <button
              onClick={() => handleSoftDelete(softDeleteTicketId)}
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
            >
              Delete
            </button>
          </div>
        </dialog>
      )}
      <Pagination
        limit={filterState.limit}
        offset={filterState.offset}
        total_items={pageInfo.total_tickets}
        current_page={pageInfo.current_page}
        total_pages={pageInfo.total_pages}
        has_next={pageInfo.has_next}
        onPrevious={handlePrevious}
        onNext={handleNext}
        onPageChange={handlePageChange}
      />
    </div>
  );
};

export default TicketList;
