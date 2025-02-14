"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { FaEye } from "react-icons/fa";
import toast from "react-hot-toast";
import SelectCustomerDropdown from "./SelectCustomerDropdown";
import Pagination from "@/app/components/Pagination";
import { BsCalendar2DateFill } from "react-icons/bs";
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

interface CustomerDashboardMobileListProps {
	selectedCustomer: string;
	onCustomerSelect: (customerName: string) => void;
}

export default function CustomerDashboardMobileList({ selectedCustomer, onCustomerSelect }: CustomerDashboardMobileListProps) {
	const [tickets, setTickets] = useState<Ticket[]>([]);
	const [filterState, setFilterState] = useState({
		showDropDown: false,
		ticket_num: "",
		limit: 10,
		offset: 0,
		sort_order: false,
		start_date: "",
		end_date: "",
	});
	const [pageInfo, setPageInfo] = useState({
		total_tickets: null,
		current_page: null,
		total_pages: null,
		has_next: true,
	});
	const [showForm, setShowForm] = useState(false);

	useEffect(() => {
		const fetchTickets = async () => {
			if (!selectedCustomer) return;
			try {
				const queryParams = new URLSearchParams({
					customer_name: selectedCustomer,
					limit: filterState.limit.toString(),
					offset: filterState.offset.toString(),
					ticket_num: filterState.ticket_num || "",
					start_date: filterState.start_date || "",
					end_date: filterState.end_date || "",
					sort_order: filterState.sort_order ? "asc" : "desc"
				});

				const response = await fetch(
					`${process.env.NEXT_PUBLIC_ENDPOINT_URL}/tickets/?${queryParams.toString()}`
				);
				const data = await response.json();
				
				const parsedTickets = data.tickets.map((ticket: any) => ({
					_id: ticket._id,
					ticket_number: ticket.ticket_number,
					person_name: ticket.person_name,
					current_step: ticket.current_step,
					created_date: ticket.created_date,
					customer_message: ticket.steps?.["Step 1 : Customer Message Received"]?.text || "",
					status: ticket.steps?.["Step 9: Final Status"]?.status || "open",
					final_decision: ticket.steps?.["Step 9: Final Status"]?.final_decision || "pending",
					steps: ticket.steps
				}));

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
		fetchTickets();
	}, [selectedCustomer, filterState]);

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
	};

	const handlePageChange = (page: number) => {
		setFilterState((prev) => ({
			...prev,
			offset: (page - 1) * prev.limit,
		}));
	};

	const handleAdd = () => {
		setShowForm(false);
	};

	return (
		<div className="grid grid-cols-1 gap-4 md:hidden px-4">
			<div className="bg-white p-4 rounded-lg text-black shadow-lg">
				<h1 className="text-2xl font-bold mb-4">Customer Dashboard</h1>
				<div className="mb-4">
					<SelectCustomerDropdown onSelect={onCustomerSelect} />
				</div>
			</div>

			{selectedCustomer && (
				<>
					<div className="bg-white p-4 rounded-lg shadow-lg">
						<p className="text-lg  text-black font-semibold mb-4">Selected Customer: {selectedCustomer}</p>
						<div className="flex justify-between items-center">
							{!showForm ? (
								<Button onClick={() => setShowForm(true)}>Add Ticket</Button>
							) : (
								<Button onClick={() => setShowForm(false)}>Cancel</Button>
							)}
							<button
								className="bg-blue-600 text-white px-4 py-2 rounded-md"
								onClick={() =>
									setFilterState((prev) => ({
										...prev,
										showDropDown: !prev.showDropDown,
										ticket_num: "",
										start_date: "",
										end_date: "",
										sort_order: false,
									}))
								}
							>
								Filter
							</button>
						</div>
					</div>

					{showForm && (
						<div className="mb-4 bg-white p-4 rounded-lg shadow-lg">
							<AddTicketForm 
								key={selectedCustomer} 
								onAdd={handleAdd} 
								initialCustomer={selectedCustomer} 
								disableCustomerSelect={true} 
							/>
						</div>
					)}

					{filterState.showDropDown && (
						<div className="bg-white p-4 rounded-lg shadow-lg">
							<div className="mb-4">
								<label className="block text-sm font-semibold mb-2">Filter by Ticket Number</label>
								<input
									type="text"
									value={filterState.ticket_num}
									onChange={(e) =>
										setFilterState((prev) => ({
											...prev,
											ticket_num: e.target.value,
										}))
									}
									placeholder="Enter Ticket Number"
									className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:border-blue-300"
								/>
							</div>
							
							<ul className="flex gap-2 items-center flex-wrap py-2 bg-white text-gray-800 font-semibold rounded-lg border-gray-100">
								<h1>Start Date</h1>
								<div className="relative">
									<input
										type="date"
										value={filterState.start_date}
										onChange={(e) =>
											setFilterState((prev) => ({
												...prev,
												start_date: e.target.value,
											}))
										}
										className="w-10 h-10 opacity-0 absolute inset-0"
									/>
									<div className="flex justify-center items-center w-8 h-8 bg-gray-100 text-gray-800 font-semibold rounded-lg border border-gray-300 hover:bg-gray-200 focus:outline-none">
										<BsCalendar2DateFill className="text-black" />
									</div>
								</div>
								<h1>End Date</h1>
								<div className="relative">
									<input
										type="date"
										value={filterState.end_date}
										onChange={(e) =>
											setFilterState((prev) => ({
												...prev,
												end_date: e.target.value,
											}))
										}
										className="w-10 h-10 opacity-0 absolute inset-0"
									/>
									<div className="flex justify-center items-center cursor-pointer w-8 h-8 bg-gray-100 text-gray-800 font-semibold rounded-lg border border-gray-300 hover:bg-gray-200 focus:outline-none">
										<BsCalendar2DateFill className="text-black" />
									</div>
								</div>
							</ul>

							<div className="mb-4">
								<button
									onClick={() =>
										setFilterState((prev) => ({
											...prev,
											sort_order: !prev.sort_order,
										}))
									}
									className="block text-sm font-semibold mb-2 bg-gray-200 rounded-md px-3 py-2"
								>
									Sort By Date
								</button>
							</div>
						</div>
					)}

					{!selectedCustomer && (
						<div className="bg-white p-4 rounded-lg shadow-lg text-center text-gray-500">
							Please select a customer to view tickets.
						</div>
					)}

					{tickets.length === 0 && selectedCustomer && (
						<div className="bg-white p-4 rounded-lg shadow-lg text-center text-gray-500">
							No tickets found for this customer.
						</div>
					)}

					{tickets.map((ticket) => (
						<div key={ticket._id} className="bg-white text-black p-4 rounded-lg shadow-lg">
							<div className="flex flex-col space-y-4 text-sm w-full">
								<div className="flex justify-between items-center flex-wrap">
									<div className="flex">
										<span className="font-semibold mr-2">Person Name:</span>
										<span>{ticket.person_name}</span>
									</div>
									<div className="flex">
										<span className="font-semibold mr-2">Status:</span>
										<span className={`px-2 py-1 rounded ${
											ticket.status === "closed" ? "bg-red-200 text-red-800" : "bg-green-200 text-green-800"
										}`}>{ticket.status}</span>
									</div>
								</div>

								<div className="flex justify-between items-center">
									<div className="flex">
										<span className="font-semibold mr-2">Ticket Number:</span>
										<span>{ticket.ticket_number}</span>
									</div>
									<div className="flex">
										<span className="font-semibold mr-2">Decision:</span>
										<span className={`px-2 py-1 rounded ${
											ticket.final_decision === "approved"
												? "bg-green-200 text-green-800"
												: ticket.final_decision === "denied"
												? "bg-red-200 text-red-800"
												: "bg-yellow-200 text-yellow-800"
										}`}>{ticket.final_decision}</span>
									</div>
								</div>

								<div className="flex justify-between items-center">
									<div className="flex">
										<span className="font-semibold mr-2">Current Step:</span>
										<span>{ticket.current_step}</span>
									</div>
								</div>

								<div className="flex flex-col w-full">
									<span className="font-semibold mb-1">Customer Message:</span>
									<span className="line-clamp-2">{ticket.customer_message || "No message available"}</span>
								</div>

								<div className="flex flex-col w-full">
									<span className="font-semibold mb-1">Intrend Reply:</span>
									<span className="line-clamp-2">
										{ticket.steps?.["Step 7 : Customer Message Template"]?.text || "No reply yet"}
									</span>
								</div>
							</div>
						</div>
					))}

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
				</>
			)}
		</div>
	);
}
