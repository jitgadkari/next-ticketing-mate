"use client";
import { useState, ChangeEvent, FormEvent } from "react";

interface DashboardDetailInputProps {
  onDataFetch: (data: any) => void;
}

const DashboardDetailInput = ({ onDataFetch }: DashboardDetailInputProps) => {
  const [input, setInput] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    // Only allow numbers
    if (value === "" || /^\d+$/.test(value)) {
      setInput(value);
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!input) return;

    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_ENDPOINT_URL}/api/tickets/dashboard?days=${input}`);
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      const data = await response.json();
      onDataFetch(data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 mt-8">
      <h2 className="text-xl font-semibold text-gray-700 mb-4">Dashboard Time Range</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="days" className="block text-sm font-medium text-gray-600 mb-2">
            Show data for the last N days
          </label>
          <input
            id="days"
            type="text"
            value={input}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            placeholder="Enter number of days"
            disabled={loading}
          />
        </div>
        <button
          type="submit"
          disabled={!input || loading}
          className={`w-full px-4 py-2 rounded-lg text-white font-medium transition-all duration-200 ${
            loading || !input
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600 active:bg-blue-700'
          }`}
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Loading...
            </span>
          ) : (
            'Update Dashboard'
          )}
        </button>
      </form>
    </div>
  );
};

export default DashboardDetailInput;
