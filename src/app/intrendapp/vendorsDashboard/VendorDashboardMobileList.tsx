"use client";

import { useState, useEffect } from "react";

import Link from "next/link";
import { FaEye } from "react-icons/fa";
import toast from "react-hot-toast";
import SelectVendorDropdown from "./SelectVendorDropdown";
import Pagination from "@/app/components/Pagination";
import { BsCalendar2DateFill } from "react-icons/bs";

interface Ticket {
	_id: string;
	ticket_number: string;
	customer_message: string;
	vendor_replies: { [key: string]: string };
	steps: {
		"Step 1 : Customer Message Received"?: {
			text: string;
			timestamp: string;
		};
		"Step 5: Messages from Vendors"?: {
			[key: string]: string;
		};
		[key: string]: any;
	};
}

interface VendorDashboardMobileListProps {
	selectedVendor: string;
	onVendorSelect: (vendorName: string) => void;
}

export default function VendorDashboardMobileList({ selectedVendor, onVendorSelect }: VendorDashboardMobileListProps) {

	const [allTickets, setAllTickets] = useState<Ticket[]>([]);
	const [filteredTickets, setFilteredTickets] = useState<Ticket[]>([]);
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
		total_tickets: "0",
		current_page: 1,
		total_pages: 1,
		has_next: false,
	});
	const [replyTicket, setReplyTicket] = useState<string | null>(null);
	const [replyMessage, setReplyMessage] = useState("");

	useEffect(() => {
		const fetchTickets = async () => {
			if (!selectedVendor) return;
			try {
				const queryParams = new URLSearchParams({
					vendor_name: selectedVendor,
					limit: "0" // Get all tickets
				});

				const response = await fetch(
					`${process.env.NEXT_PUBLIC_ENDPOINT_URL}/vendor_tickets/?${queryParams.toString()}`
				);
				const data = await response.json();
				
				const parsedTickets = data.tickets.map((ticket: any) => ({
					_id: ticket._id,
					ticket_number: ticket.ticket_number,
					customer_message: ticket.steps?.["Step 1 : Customer Message Received"]?.text || "",
					vendor_replies: ticket.steps?.["Step 5: Messages from Vendors"] || {},
					steps: {
						"Step 1 : Customer Message Received": {
							text: ticket.steps?.["Step 1 : Customer Message Received"]?.text || "",
							timestamp: ticket.steps?.["Step 1 : Customer Message Received"]?.timestamp || ""
						},
						"Step 5: Messages from Vendors": ticket.steps?.["Step 5: Messages from Vendors"] || {},
						...ticket.steps
					}
				}));

				setAllTickets(parsedTickets);

			} catch (error) {
				console.error("Error fetching tickets:", error);
			}
		};
		fetchTickets();
	}, [selectedVendor]);

	useEffect(() => {
		let filtered = [...allTickets];

		// Apply filters
		if (filterState.ticket_num) {
			filtered = filtered.filter(ticket => 
				ticket.ticket_number.toLowerCase().includes(filterState.ticket_num.toLowerCase())
			);
		}

		if (filterState.start_date) {
			filtered = filtered.filter(ticket => {
				const ticketDate = new Date(ticket.steps?.["Step 1 : Customer Message Received"]?.timestamp || "");
				return ticketDate >= new Date(filterState.start_date);
			});
		}

		if (filterState.end_date) {
			filtered = filtered.filter(ticket => {
				const ticketDate = new Date(ticket.steps?.["Step 1 : Customer Message Received"]?.timestamp || "");
				return ticketDate <= new Date(filterState.end_date);
			});
		}

		// Apply sorting
		if (filterState.sort_order) {
			filtered.sort((a, b) => {
				const dateA = new Date(a.steps?.["Step 1 : Customer Message Received"]?.timestamp || "");
				const dateB = new Date(b.steps?.["Step 1 : Customer Message Received"]?.timestamp || "");
				return dateB.getTime() - dateA.getTime();
			});
		}

		setFilteredTickets(filtered);

		// Calculate pagination info
		const totalTickets = filtered.length;
		const totalPages = Math.ceil(totalTickets / filterState.limit);
		const currentPage = Math.floor(filterState.offset / filterState.limit) + 1;
		
		setPageInfo({
			total_tickets: totalTickets.toString(),
			current_page: currentPage,
			total_pages: totalPages,
			has_next: currentPage < totalPages
		});
	}, [allTickets, filterState.ticket_num, filterState.start_date, filterState.end_date, filterState.sort_order, filterState.offset, filterState.limit]);

	useEffect(() => {
		setFilterState(prev => ({
			...prev,
			offset: 0,
			showDropDown: false,
			ticket_num: "",
			start_date: "",
			end_date: "",
			sort_order: false
		}));
	}, [selectedVendor]);

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
						step_number: "Step 5: Messages from Vendors",
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
				const updatedTickets = allTickets.map(ticket => {
					if (ticket.ticket_number === ticketNumber) {
						return {
							...ticket,
							vendor_replies: {
								...ticket.vendor_replies,
								[selectedVendor]: replyMessage
							}
						};
					}
					return ticket;
				});
				setAllTickets(updatedTickets);
			} else {
				toast.error("Failed to send reply");
			}
		} catch (error) {
			console.error("Error sending reply:", error);
			toast.error("Error sending reply");
		}
	};

	const handlePrevious = () => {
		if (pageInfo.current_page && pageInfo.current_page > 1) {
			setFilterState(prev => ({
				...prev,
				offset: Math.max(0, prev.offset - prev.limit),
			}));
		}
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
		setFilterState((prev) => ({
			...prev,
			offset: (page - 1) * prev.limit,
		}));
	};

	const getDisplayedTickets = () => {
		const start = filterState.offset;
		const end = start + filterState.limit;
		return filteredTickets.slice(start, end);
	};


	return (
		<div className="grid grid-cols-1 gap-4 md:hidden">
			<div className="bg-white p-4 rounded-lg text-black shadow-lg">
				<h1 className="text-2xl font-bold mb-4">Vendor Dashboard</h1>
				<div className="mb-4">
					<SelectVendorDropdown onSelect={onVendorSelect} />
				</div>
			</div>

			{selectedVendor && (
				<>
					<div className="bg-white text-black p-4 rounded-lg shadow-lg">
						<p className="text-lg font-semibold mb-4">Selected Vendor: {selectedVendor}</p>
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
								<div className="flex items-center">
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
						</div>
					)}

					{filteredTickets.length > 0 ? (
						<>
							{getDisplayedTickets().map((ticket) => (
								<div key={ticket._id} className="bg-white text-black p-4 rounded-lg shadow-lg">
									<div className="flex flex-col space-y-4 text-sm w-full">
										<div className="flex justify-between items-center">
											<div className="flex">
												<span className="font-semibold mr-2">Ticket Number:</span>
												<span>{ticket.ticket_number}</span>
											</div>
										</div>

										<div className="flex flex-col w-full">
											<span className="font-semibold mb-1">Customer Message:</span>
											<span className="line-clamp-2">{ticket.customer_message || "No message available"}</span>
										</div>

										<div className="flex flex-col w-full">
											<span className="font-semibold mb-1">Your Reply:</span>
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
												<div>
													{ticket.vendor_replies[selectedVendor] ? (
														<span>{ticket.vendor_replies[selectedVendor]}</span>
													) : (
														<button
															onClick={() => setReplyTicket(ticket.ticket_number)}
															className="text-blue-600 hover:text-blue-800 underline"
														>
															Click to Reply
														</button>
													)}
												</div>
											)}
										</div>
									</div>
								</div>
							))}
							<div className="mt-4">
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
						</>
					) : (
						<div className="bg-white p-4 rounded-lg shadow-lg text-center text-gray-500">
							No tickets found for this vendor.
						</div>
					)}
				</>
			)}

			{!selectedVendor && (
				<div className="bg-white p-4 rounded-lg shadow-lg text-center text-gray-500">
					Please select a vendor to view tickets.
				</div>
			)}
		</div>
	);
}