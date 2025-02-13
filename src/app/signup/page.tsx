"use client";

import { useSignup } from '@/contexts/SignupContext';
import Link from 'next/link';

const Signup = () => {
  const { formData, error, handleChange, handleSignup } = useSignup();

  return (
    <div className="flex items-center justify-end min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded shadow-md">
        <h2 className="text-2xl font-bold text-center">Sign Up</h2>
        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="block text-gray-700">Email</label>
            <input
              type="email"
              name="email"
              className="w-full p-2 border text-black border-gray-300 rounded mt-1"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label className="block text-gray-700">Password</label>
            <input
              type="password"
              name="password"
              className="w-full p-2 border text-black border-gray-300 rounded mt-1"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label className="block text-gray-700">Full Name</label>
            <input
              type="text"
              name="name"
              className="w-full p-2 border text-black border-gray-300 rounded mt-1"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label className="block text-gray-700">Username</label>
            <input
              type="text"
              name="username"
              className="w-full p-2 border text-black border-gray-300 rounded mt-1"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label className="block text-gray-700">Phone</label>
            <input
              type="tel"
              name="phone"
              className="w-full p-2 border text-black border-gray-300 rounded mt-1"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </div>
          {error && <p className="text-red-500">{error}</p>}
          <button 
            type="submit" 
            className="w-full p-2 text-white bg-blue-500 rounded hover:bg-blue-600 transition-colors"
          >
            Sign Up
          </button>
          <p className="text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link href="/login" className="text-blue-500 hover:text-blue-600">
              Login here
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Signup;

