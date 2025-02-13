"use client";

import { useSignup } from '@/contexts/SignupContext';
import Link from 'next/link';
import Image from 'next/image';

const Signup = () => {
  const { formData, error, handleChange, handleSignup } = useSignup();

  return (
    <div className="flex min-h-screen bg-white">
      {/* Left section with images and branding */}
      <div className="hidden lg:flex w-1/2 bg-gray-50 flex-col items-center justify-center p-12">
        <div className="max-w-xl w-full space-y-8">
          <div className="flex justify-center space-x-6">
            <Image
              src="/svg/dashboard-4-svgrepo-com.svg"
              alt="Dashboard"
              width={64}
              height={64}
              className="opacity-75"
            />
            <Image
              src="/svg/people-svgrepo-com.svg"
              alt="People"
              width={64}
              height={64}
              className="opacity-75"
            />
            <Image
              src="/svg/tickets-ticket-svgrepo-com.svg"
              alt="Tickets"
              width={64}
              height={64}
              className="opacity-75"
            />
          </div>
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold text-gray-900">
              Join Intrend Today
            </h2>
            <p className="text-gray-600">
              Start managing your business better with our comprehensive tools
            </p>
          </div>
        </div>
      </div>

      {/* Right section with form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-8">
        <div className="w-full max-w-md">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Intrend</h1>
            <div className="text-2xl font-semibold text-black">
              Create Account
            </div>
            <div className="text-base text-gray-600 mt-1">
              Fill in your details to get started
            </div>
          </div>
          <form className="mt-8" onSubmit={handleSignup}>
            <div className="space-y-4">
              <div>
                <span className="px-1 text-sm text-gray-600">Email</span>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="text-md block px-3 py-2 rounded-lg w-full bg-white border-2 border-gray-300 placeholder-gray-600 shadow-md focus:placeholder-gray-500 focus:bg-white focus:border-gray-600 focus:outline-none"
                />
              </div>
              <div>
                <span className="px-1 text-sm text-gray-600">Password</span>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="text-md block px-3 py-2 rounded-lg w-full bg-white border-2 border-gray-300 placeholder-gray-600 shadow-md focus:placeholder-gray-500 focus:bg-white focus:border-gray-600 focus:outline-none"
                />
              </div>
              <div>
                <span className="px-1 text-sm text-gray-600">Full Name</span>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="text-md block px-3 py-2 rounded-lg w-full bg-white border-2 border-gray-300 placeholder-gray-600 shadow-md focus:placeholder-gray-500 focus:bg-white focus:border-gray-600 focus:outline-none"
                />
              </div>
              <div>
                <span className="px-1 text-sm text-gray-600">Username</span>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  className="text-md block px-3 py-2 rounded-lg w-full bg-white border-2 border-gray-300 placeholder-gray-600 shadow-md focus:placeholder-gray-500 focus:bg-white focus:border-gray-600 focus:outline-none"
                />
              </div>
              <div>
                <span className="px-1 text-sm text-gray-600">Phone</span>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="text-md block px-3 py-2 rounded-lg w-full bg-white border-2 border-gray-300 placeholder-gray-600 shadow-md focus:placeholder-gray-500 focus:bg-white focus:border-gray-600 focus:outline-none"
                />
              </div>
              {error && (
                <div className="text-red-500 text-sm text-center">
                  {error}
                </div>
              )}
              <button
                type="submit"
                className="mt-3 text-lg font-semibold bg-gray-800 w-full text-white rounded-lg px-6 py-3 block shadow-xl hover:text-white hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Account
              </button>
                <div className="text-sm font-semibold py-4 flex justify-center">
                <Link
                  href="/login"
                  className="text-black font-normal border-b-2 border-gray-200 hover:border-gray-500"
                >
                  Already have an account?{' '}
                  <span className="text-black font-semibold">
                  Sign in
                  </span>
                </Link>
                </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Signup;

