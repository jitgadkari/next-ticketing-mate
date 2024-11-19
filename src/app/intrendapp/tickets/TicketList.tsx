"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { FaEye, FaTrash } from "react-icons/fa";
import Table from "../../components/Table";
import { Customer } from "./AddTicketForm";
import { IoMdArrowDropdown, IoMdArrowDropup } from "react-icons/io";
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
  limit: number;
  offset: number;
  start_date?: string;
  end_date?: string;
  sort_order?:boolean;
}

const TicketList: React.FC<TicketListProps> = ({ refreshList }) => {
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
    "Current Step",
    "Status",
    "Decision",
    "Created Date",
    "Updated Date",
    "Actions",
  ];
  const handlePrevious = () => {
    setFilterState((prev) => ({
      ...prev,
      offset: Math.max(prev.offset - prev.limit, 0),
    }));
    console.log(filterState);
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
  const  handleChangeSortOrder= () => {
    setFilterState((prev) => ({
      ...prev,
      sort_order:!prev.sort_order,
    }));
  };

  const renderRow = (ticket: Ticket) => (
    <>
      <td className="border p-2">{ticket.ticket_number}</td>
      <td className="border p-2">{ticket.customer_name}</td>
      <td className="border p-2">{ticket.current_step}</td>
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
      <td className="border p-2">{formatDateTime(ticket.created_date)}</td>
      <td className="border p-2">{formatDateTime(ticket.updated_date)}</td>
      <td className="border p-2 ">
        <ul className="h-full flex justify-center space-x-2">
          <Link href={`tickets/${ticket._id}`} passHref>
            <span className="text-blue-500 hover:text-blue-700">
              <FaEye />
            </span>
          </Link>
          <FaTrash
            onClick={() => setDeleteTicketId(ticket._id)}
            className="text-red-500 cursor-pointer hover:text-red-700"
          />
        </ul>
      </td>
    </>
  );

  return (
    <div className="p-8  bg-white rounded shadow text-black overflow-x-scroll">
      <div className="flex justify-between items-start mb-6">
        <h1 className="text-3xl font-bold mb-4 text-gray-800">Tickets List</h1>
        <div className="relative">
          <ul className="flex gap-2 items-center flex-wrap">
            {filterState.showDropDown && (
              <>
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
                      <ul className="absolute left-0 w-48 max-h-48 overflow-y-auto mt-2 bg-white border border-gray-300 shadow-lg rounded-lg text-gray-700 text-sm group-hover:flex flex-col gap-2 p-2">
                        {customers.map((customer) => (
                          <li
                            key={customer._id}
                            onClick={() =>
                              setFilterState((prev) => ({
                                ...prev,
                                customer_name: customer.name,
                                showCustomerDropDown: false,
                              }))
                            }
                            className="border-b py-2 px-4 hover:bg-gray-100 cursor-pointer"
                          >
                            {customer.name}
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                  <li className="relative group ">
                    <button
                      onClick={() =>
                        setFilterState((prevState) => ({
                          ...prevState,
                          showStatusDropDown: !prevState.showStatusDropDown,
                        }))
                      }
                      className="px-4 py-2 bg-gray-100 text-gray-800 font-semibold rounded-lg  border-gray-300 hover:bg-gray-200 focus:outline-none"
                    >
                      Status
                    </button>
                    {filterState.showStatusDropDown && (
                      <ul className="absolute left-0 w-48 mt-2 bg-white border border-gray-300 shadow-lg rounded-lg text-gray-700 text-sm group-hover:flex flex-col gap-2 p-2">
                        <li
                          onClick={() =>
                            setFilterState((prev) => ({
                              ...prev,
                              status: "open",
                              showStatusDropDown: false,
                            }))
                          }
                          className="border-b py-2 px-4 hover:bg-gray-100 cursor-pointer"
                        >
                          open
                        </li>
                        <li
                          onClick={() =>
                            setFilterState((prev) => ({
                              ...prev,
                              status: "closed",
                              showStatusDropDown: false,
                            }))
                          }
                          className="border-b py-2 px-4 hover:bg-gray-100 cursor-pointer"
                        >
                          closed
                        </li>
                      </ul>
                    )}
                  </li>
                  <li className="relative group ">
                    <button
                      onClick={() =>
                        setFilterState((prevState) => ({
                          ...prevState,
                          showDecisionDropDown: !prevState.showDecisionDropDown,
                        }))
                      }
                      className="px-4 py-2 bg-gray-100 text-gray-800 font-semibold rounded-lg  border-gray-300 hover:bg-gray-200 focus:outline-none"
                    >
                      Decision
                    </button>
                    {filterState.showDecisionDropDown && (
                      <ul className="absolute left-0 w-48 mt-2 bg-white border border-gray-300 shadow-lg rounded-lg text-gray-700 text-sm group-hover:flex flex-col gap-2 p-2">
                        <li
                          onClick={() =>
                            setFilterState((prev) => ({
                              ...prev,
                              final_decision: "pending",
                              showDecisionDropDown: false,
                            }))
                          }
                          className="border-b py-2 px-4 hover:bg-gray-100 cursor-pointer"
                        >
                          pending
                        </li>
                        <li
                          onClick={() =>
                            setFilterState((prev) => ({
                              ...prev,
                              final_decision: "approved",
                              showDecisionDropDown: false,
                            }))
                          }
                          className="border-b py-2 px-4 hover:bg-gray-100 cursor-pointer"
                        >
                          approved
                        </li>
                      </ul>
                    )}
                  </li>
                  <li className="relative group ">
                    <button
                      onClick={() =>
                        setFilterState((prevState) => ({
                          ...prevState,
                          showStepDropDown: !prevState.showStepDropDown,
                        }))
                      }
                      className="px-4 py-2 bg-gray-100 text-gray-800 font-semibold rounded-lg  border-gray-300 hover:bg-gray-200 focus:outline-none"
                    >
                      Step
                    </button>
                    {filterState.showStepDropDown && (
                      <ul className="absolute left-0 w-48 mt-2 bg-white border border-gray-300 shadow-lg rounded-lg text-gray-700 text-sm group-hover:flex flex-col gap-2 p-2">
                        {stepsOrder.map((step, index) => {
                          return (
                            <li key={index}
                              onClick={() =>
                                setFilterState((prev) => ({
                                  ...prev,
                                  current_step: step,
                                  showStepDropDown: false,
                                }))
                              }
                              className="border-b py-2 px-4 hover:bg-gray-100 cursor-pointer"
                            >
                              Step {index + 1}
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </li>
                  <ul className="flex gap-2 items-center flex-wrap    px-4 py-2 bg-gray-100 text-gray-800 font-semibold rounded-lg  border-gray-300 hover:bg-gray-200 focus:outline-none">
                    <h1>Start</h1>
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
                    <h1>End </h1>
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
                </>

                {/* <li
              onClick={() => handleSort("created_date")}
              className="flex items-center border-b  cursor-pointer px-4 py-2 bg-gray-100 text-gray-800 font-semibold rounded-lg  border-gray-300 hover:bg-gray-200 focus:outline-none"
            >
              <h1> Created</h1>
              {filterState.sortBy === "created_date" && (
                <>
                  {filterState.sortOrder === "asc" ? (
                    <IoMdArrowDropdown />
                  ) : (
                    <IoMdArrowDropup />
                  )}
                </>
              )}
            </li> */}
                {/* <li className="flex gap-2 border-b py-2 px-4  bg-gray-100 text-gray-800 font-semibold rounded-lg  border-gray-300 hover:bg-gray-200 focus:outline-none">
              <h1>Enter Last Number of Days</h1>
              <input
                type="number"
                className="w-10 border text-center rounded-md"
                value={filterState.sortDays}
                onChange={(e) => handleSortByLastNumberOfDays(e.target.value)}
                min="0"
              />
            </li> */}
                <li>
                  <input
                    type="text"
                    value={filterState.ticket_num}
                    onChange={(e) =>
                      setFilterState((prevState) => ({
                        ...prevState,
                        ticket_num: e.target.value,
                      }))
                    }
                    placeholder="Search Ticket Number"
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:border-blue-300"
                  />
                </li>
              </>
            )}
            <button
              className="ml-4 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              onClick={() =>
                setFilterState((prevState) => ({
                  ...prevState,
                  showDropDown: !prevState.showDropDown,
                  showCustomerDropDown: false,
                  showDecisionDropDown: false,
                  showStatusDropDown: false,
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
                }))
              }
            >
              Filter
            </button>
          </ul>
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
        <Table columns={columns} data={allTickets} renderRow={renderRow} handleChangeSortOrder={handleChangeSortOrder}/>
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
