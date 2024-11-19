"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { FaEye, FaTrash } from "react-icons/fa";
import { Customer } from "./AddTicketForm";
import toast from "react-hot-toast";
import Pagination from "@/app/components/Pagination";
import { BsCalendar2DateFill } from "react-icons/bs";

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
  showCustomerDropDown: boolean;
  showStatusDropDown: boolean;
  showDecisionDropDown: boolean;
  showStepDropDown: boolean;
  ticket_num: string;
  customer_name: string;
  current_step: string;
  status: string;
  final_decision: string;
  limit: number;
  offset: number;
  start_date?: string;
  end_date?: string;
  sort_order?:boolean;
}

export default function TicketsMobileList({ refreshList }: TicketListProps) {
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
    status: "",
    final_decision: "",
    limit: 10,
    offset: 0,
    start_date: "",
    end_date: "",
    sort_order:false
  });
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [deleteTicketId, setDeleteTicketId] = useState<string | null>(null);
  const [pageInfo, setPageInfo] = useState({
    total_tickets: null,
    current_page: null,
    total_pages: null,
    has_next: true,
  });

  const stepsOrder = [
    "Step 1 : Customer Message Received",
    "Step 2 : Message Decoded",
    "Step 3 : Message Template for vendors",
    "Step 4 : Vendor Selection",
    "Step 5: Messages from Vendors",
    "Step 6 : Vendor Message Decoded",
    "Step 7 : Customer Message Template",
    "Step 8 : Customer Response",
    "Step 9: Final Status",
  ];
  useEffect(() => {
    const fetchTickets = async () => {
      const queryParams = new URLSearchParams({
        limit: filterState.limit.toString(),
        offset: filterState.offset.toString(),
        customer_name: filterState.customer_name || "",
        current_step: filterState.current_step || "",
        status: filterState.status || "",
        final_decision: filterState.final_decision || "",
        ticket_num: filterState.ticket_num || "",
        start_date:filterState.start_date || "",
        end_date:filterState.end_date || "",
        sort_order: filterState.sort_order?'asc':'desc'
      });

      try {
        const response = await fetch(
          `${
            process.env.NEXT_PUBLIC_ENDPOINT_URL
          }/tickets?${queryParams.toString()}`
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
          `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/customers_all`
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
  const handlePrevious = () => {
    setFilterState((prev) => ({
      ...prev,
      offset: Math.max(prev.offset - prev.limit, 0),
    }));
  
  };

  const handleNext = () => {
    setFilterState((prev) => ({
      ...prev,
      offset: prev.offset + prev.limit,
    }));
    console.log(filterState);
  };
  const handlePageChange = (page: number) => {
    setFilterState((prev) => ({
      ...prev,
      offset: (page - 1) * prev.limit,
    }));

    console.log(`Page: ${page}, Offset: ${(page - 1) * filterState.limit}`);
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
              showCustomerDropDown:false,
              showDecisionDropDown:false,
              showStatusDropDown:false,
              showStepDropDown:false,
              ticket_num: "",
              customer_name: "",
              current_step: "",
              status: "",
              final_decision: "",
              limit: 10,
              offset: 0,
              start_date: "",
              end_date: "",
              sort_order:false
            }))
          }
        >
          Filter
        </button>
      </div>

      {filterState.showDropDown && (
        <div className="bg-white p-4 rounded-lg shadow-lg">
          <div className="mb-4">
            <label className="block text-sm font-semibold mb-2">
              Filter by Ticket Number
            </label>
            <input
              type="text"
              value={filterState.ticket_num}
              onChange={(e) =>
                setFilterState((prevState) => ({
                  ...prevState,
                  ticket_num: e.target.value,
                }))
              }
              placeholder="Enter Ticket Number"
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:border-blue-300"
            />
          </div>
          <ul className="flex gap-2 items-center flex-wrap  py-2 bg-white text-gray-800 font-semibold rounded-lg  border-gray-100 hover:bg-gray-100 focus:outline-none">
                    <h1>Start Date</h1>
                    <div className="relative">
                      <input
                        type="date"
                        value={filterState.start_date}
                        onChange={(e) =>
                          setFilterState((prevState) => ({
                            ...prevState,
                            start_date: e.target.value,
                          }))
                        }
                        className="w-10 h-10 opacity-0  absolute inset-0" 
                      />

                      <div className="flex justify-center items-center w-8 h-8 bg-gray-100 text-gray-800 font-semibold rounded-lg border border-gray-300 hover:bg-gray-200 focus:outline-none">    
                      <BsCalendar2DateFill className="text-black"/>
                      </div>
                    </div>
                    <h1>End Date</h1>
                    <div className="relative">
                      <input
                        type="date"
                        value={filterState.end_date}
                        onChange={(e) =>
                          setFilterState((prevState) => ({
                            ...prevState,
                            end_date: e.target.value,
                          }))
                        }
                        className="w-10 h-10 opacity-0  absolute inset-0" 
                      />
                      <div className="flex justify-center items-center cursor-pointer w-8 h-8 bg-gray-100 text-gray-800 font-semibold rounded-lg border border-gray-300 hover:bg-gray-200 focus:outline-none">
                      <BsCalendar2DateFill className="text-black"/>
                      </div>
                    </div>
                  </ul>
          <div className="mb-4">
            <div
              className="flex items-center"
              onClick={() =>
                setFilterState((prev) => ({
                  ...prev,
                  showCustomerDropDown: !prev.showCustomerDropDown,
                }))
              }
            >
              <button
                className="block text-sm font-semibold mb-2"
                onClick={() =>
                  setFilterState((prev) => ({
                    ...prev,
                    showCustomerDropDown: !prev.showCustomerDropDown,
                  }))
                }
              >
                Customer
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
              } bg-white divide-y divide-gray-100 rounded-lg shadow w-44 max-h-48 overflow-y-auto dark:bg-gray-700`}
            >
              <ul className="py-2 text-sm text-gray-700 dark:text-gray-200">
                {customers.map((customer) => (
                  <li
                    key={customer._id}
                    className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white cursor-pointer"
                    onClick={() => {
                      setFilterState((prev) => ({
                        ...prev,
                        customer_name: customer.name,
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
            <div
              className="flex items-center"
              onClick={() =>
                setFilterState((prev) => ({
                  ...prev,
                  showStatusDropDown: !prev.showStatusDropDown,
                }))
              }
            >
              <button className="block text-sm font-semibold mb-2">
                Status
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

            <div
              className={`z-10 ${
                !filterState.showStatusDropDown && "hidden"
              } bg-white divide-y divide-gray-100 rounded-lg shadow w-44 dark:bg-gray-700`}
            >
              <ul className="py-2 text-sm text-gray-700 dark:text-gray-200">
                <li
                  className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white cursor-pointer"
                  onClick={() =>
                    setFilterState((prev) => ({
                      ...prev,
                      status: "open",
                      showStatusDropDown: false,
                    }))
                  }
                >
                  open
                </li>
                <li
                  className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white cursor-pointer"
                  onClick={() =>
                    setFilterState((prev) => ({
                      ...prev,
                      status: "closed",
                      showStatusDropDown: false,
                    }))
                  }
                >
                  closed
                </li>
              </ul>
            </div>
          </div>
        
          <div className="mb-4">
            <div
              className="flex items-center"
              onClick={() =>
                setFilterState((prev) => ({
                  ...prev,
                  showDecisionDropDown: !prev.showDecisionDropDown,
                }))
              }
            >
              <button className="block text-sm font-semibold mb-2">
                Decision
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

            <div
              className={`z-10 ${
                !filterState.showDecisionDropDown && "hidden"
              } bg-white divide-y divide-gray-100 rounded-lg shadow w-44 dark:bg-gray-700`}
            >
              <ul className="py-2 text-sm text-gray-700 dark:text-gray-200">
                <li
                  className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white cursor-pointer"
                  onClick={() =>
                    setFilterState((prev) => ({
                      ...prev,
                      final_decision: "pending",
                      showDecisionDropDown: false,
                    }))
                  }
                >
                  pending
                </li>
                <li
                  className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white cursor-pointer"
                  onClick={() =>
                    setFilterState((prev) => ({
                      ...prev,
                      final_decision: "approved",
                      showDecisionDropDown: false,
                    }))
                  }
                >
                  approved
                </li>
              </ul>
            </div>
          </div>
          <div className="mb-4">
            <div
              className="flex items-center"
              onClick={() =>
                setFilterState((prev) => ({
                  ...prev,
                  showStepDropDown: !prev.showStepDropDown,
                }))
              }
            >
              <button className="block text-sm font-semibold mb-2">Step</button>
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

            <div
              className={`z-10 ${
                !filterState.showStepDropDown && "hidden"
              } bg-white divide-y divide-gray-100 rounded-lg shadow w-44 dark:bg-gray-700`}
            >
              <ul className="py-2 text-sm text-gray-700 dark:text-gray-200">
                {stepsOrder.map((step, index) => {
                  return (
                    <li key={index}
                      className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white cursor-pointer"
                      onClick={() =>
                        setFilterState((prev) => ({
                          ...prev,
                          current_step: step,
                          showStepDropDown: false,
                        }))
                      }
                    >
                      Step {index + 1}
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
          <div className="mb-4">
            <div
              className="flex items-center " 
            >
              <button  onClick={() =>
                setFilterState((prev) => ({
                  ...prev,
                  sort_order: !prev.sort_order,
                }))
              } className="block text-sm font-semibold mb-2 bg-gray-200 rounded-md px-3 py-2">
               Sort By Date
              </button>
            
            </div>
          </div>

          {/* <div className="mb-4">
            <label className="block text-sm font-semibold mb-2">
              Filter by Last Number of Days
            </label>
            <input
              type="number"
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:border-blue-300"
              value={filterState.sortDays}
                  placeholder="Enter Number of Days"
              onChange={(e) =>
                setFilterState((prevState) => ({
                  ...prevState,
                  sortDays: e.target.value,
                }))
              }
              min="0"
            />
          </div> */}
          {/* <div className="mb-4">
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
          </div> */}
          {/* {filteredTickets.length > 0 && (
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
          )} */}
        </div>
      )}
      {/* {filteredTickets.length <= 0 && (
        <div className="bg-white text-black p-4 rounded-lg shadow-lg">
          <h1>No Tickets Found For this criteria</h1>
          <p>use filter to change criteria</p>
        </div>
      )} */}
      {allTickets.map((ticket) => (
        <div
          key={ticket._id}
          className="bg-white text-black p-4 rounded-lg shadow-lg"
        >
          <div className="flex flex-col space-y-4 text-sm w-full">
            <div className="flex justify-between items-center flex-wrap">
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
}
