"use client";
import { useEffect, useState } from "react";
import DashboardDetailInput from "./DashboardDetailInput";

interface ResponseTime {
  ticket_number: string;
  days: number;
  hours: number;
  minutes: number;
}

interface DashboardData {
  total_tickets: number;
  open_tickets: number;
  closed_tickets: number;
  accepted_tickets: number;
  rejected_tickets: number;
  pending_tickets: number;
  total_vendors: number;
  total_customers: number;
  total_people: number;
  response_time_for_closed_tickets: ResponseTime[];
}

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | undefined>(
    undefined
  );
  const fetchDashBoardData = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/dashboard_info_all`,
        {
          cache: "no-cache",
        }
      );
      if (response.status != 200) {
        console.log("failed to fetch dashboard data");
      }
      const data: DashboardData = await response.json();
      setDashboardData(data);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    }
  };

  useEffect(() => {
    fetchDashBoardData();
  }, []);

  if (!dashboardData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-gray-900 mx-auto"></div>
          <h2 className="text-xl font-semibold text-gray-700 mt-4">Loading dashboard data...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen relative overflow-hidden">
      {/* Background SVG Pattern */}
      <div className="absolute inset-0 z-0 opacity-5 animate-pulse">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
          <defs>
            <pattern id="dashboard-pattern" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 0 10 L 10 0 L 20 10 L 10 20 Z" fill="none" stroke="currentColor" strokeWidth="0.5" />
              <circle cx="10" cy="10" r="2" fill="currentColor" opacity="0.5" />
              <path d="M 0 0 L 5 5 M 15 15 L 20 20" stroke="currentColor" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dashboard-pattern)" />
        </svg>
      </div>

      {/* Main content */}
      <div className="relative z-10">
        <h1 className="text-2xl font-bold text-black mb-6">Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 hover:bg-gray-50">
            <h2 className="text-xl font-semibold text-gray-700">Total Tickets</h2>
            <p className="text-3xl font-bold text-blue-500 transition-colors duration-300">
              {dashboardData.total_tickets}
            </p>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 hover:bg-gray-50">
            <h2 className="text-xl font-semibold text-gray-700">Open Tickets</h2>
            <p className="text-3xl font-bold text-blue-500 transition-colors duration-300">
              {dashboardData.open_tickets}
            </p>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 hover:bg-gray-50">
            <h2 className="text-xl font-semibold text-gray-700">
              Closed Tickets
            </h2>
            <p className="text-3xl font-bold text-blue-500 transition-colors duration-300">
              {dashboardData.closed_tickets}
            </p>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 hover:bg-gray-50">
            <h2 className="text-xl font-semibold text-gray-700">
              Accepted Tickets
            </h2>
            <p className="text-3xl font-bold text-blue-500 transition-colors duration-300">
              {dashboardData.accepted_tickets}
            </p>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 hover:bg-gray-50">
            <h2 className="text-xl font-semibold text-gray-700">
              Rejected Tickets
            </h2>
            <p className="text-3xl font-bold text-blue-500 transition-colors duration-300">
              {dashboardData.rejected_tickets}
            </p>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 hover:bg-gray-50">
            <h2 className="text-xl font-semibold text-gray-700">
              Pending Tickets
            </h2>
            <p className="text-3xl font-bold text-blue-500 transition-colors duration-300">
              {dashboardData.pending_tickets}
            </p>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 hover:bg-gray-50">
            <h2 className="text-xl font-semibold text-gray-700">Total Vendors</h2>
            <p className="text-3xl font-bold text-blue-500 transition-colors duration-300">
              {dashboardData.total_vendors}
            </p>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 hover:bg-gray-50">
            <h2 className="text-xl font-semibold text-gray-700">
              Total Customers
            </h2>
            <p className="text-3xl font-bold text-blue-500 transition-colors duration-300">
              {dashboardData.total_customers}
            </p>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 hover:bg-gray-50">
            <h2 className="text-xl font-semibold text-gray-700">Total People</h2>
            <p className="text-3xl font-bold text-blue-500 transition-colors duration-300">
              {dashboardData.total_people}
            </p>
          </div>
        </div>
        <DashboardDetailInput />
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-black mb-4">
            Response Time for Closed Tickets
          </h2>
          <div className=" p-4 rounded-lg shadow-md">
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {dashboardData?.response_time_for_closed_tickets?.length > 0 ? (
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {dashboardData.response_time_for_closed_tickets.map((ticket: any, index: any) => (
                    <li key={index} className="bg-white p-4 rounded-lg shadow-sm">
                      <div className="text-lg font-semibold text-gray-700">
                        {ticket.ticket_number}
                      </div>
                      <div className="text-sm text-gray-500">
                        {ticket.days} days, {ticket.hours} hours, {ticket.minutes} minutes
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">No closed ticket response time available.</p>
              )}

            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
