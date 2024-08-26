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

const Dashboard = async () => {
  const fetchDashBoardData = async (): Promise<DashboardData | undefined> => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/dashboard_info_all`,{
          cache:'no-store'
        }
      );
      const data: DashboardData = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    }
  };

  const dashboardData = await fetchDashBoardData();

  if (!dashboardData) {
    return <div>Error loading dashboard data</div>;
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold text-black mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-700">Total Tickets</h2>
          <p className="text-3xl font-bold text-blue-500">
            {dashboardData.total_tickets}
          </p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-700">Open Tickets</h2>
          <p className="text-3xl font-bold text-blue-500">
            {dashboardData.open_tickets}
          </p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-700">
            Closed Tickets
          </h2>
          <p className="text-3xl font-bold text-blue-500">
            {dashboardData.closed_tickets}
          </p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-700">
            Accepted Tickets
          </h2>
          <p className="text-3xl font-bold text-blue-500">
            {dashboardData.accepted_tickets}
          </p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-700">
            Rejected Tickets
          </h2>
          <p className="text-3xl font-bold text-blue-500">
            {dashboardData.rejected_tickets}
          </p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-700">
            Pending Tickets
          </h2>
          <p className="text-3xl font-bold text-blue-500">
            {dashboardData.pending_tickets}
          </p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-700">Total Vendors</h2>
          <p className="text-3xl font-bold text-blue-500">
            {dashboardData.total_vendors}
          </p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-700">
            Total Customers
          </h2>
          <p className="text-3xl font-bold text-blue-500">
            {dashboardData.total_customers}
          </p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-700">Total People</h2>
          <p className="text-3xl font-bold text-blue-500">
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
            {dashboardData.response_time_for_closed_tickets.map(
              (ticket: any, index: any) => (
                <li key={index} className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="text-lg font-semibold text-gray-700">
                    {ticket.ticket_number}
                  </div>
                  <div className="text-sm text-gray-500">
                    {ticket.days} days, {ticket.hours} hours, {ticket.minutes}{" "}
                    minutes
                  </div>
                </li>
              )
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
