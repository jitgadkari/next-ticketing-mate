"use client";
import { useState, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";

const DashboardDetailInput = () => {
  const [input, setInput] = useState<string>("");
  const router = useRouter();

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setInput(event.target.value);
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    router.push(`/intrendapp/dashboard/${input}`);
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-md text-black mt-4">
      <h2 className="text-xl font-semibold text-gray-700 mb-4"> Get Dashboard Details </h2>
      <form onSubmit={handleSubmit}>
        <h1>For Last N Number of Days</h1>
        <input
          type="text"
          value={input}
          onChange={handleInputChange}
          className="border border-gray-300 p-2 rounded-lg w-full mb-4"
          placeholder="Enter Number of Days"
        />
        <button
          type="submit"
          className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600"
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default DashboardDetailInput;
