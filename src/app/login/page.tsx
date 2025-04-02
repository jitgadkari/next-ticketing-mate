"use client";

import { useState, FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from 'next/link';
import Image from 'next/image';
import { isAuthenticated, setAuthData } from '@/utils/auth';

const Login = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated()) {
      router.push("/intrendapp/tickets");
    }
  }, [router]);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_ENDPOINT_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();
      console.log('Login response:', data);

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Authentication failed');
      }

      if (data.access_token) {
        setAuthData(data.access_token, data.user_metadata);
        router.push('/intrendapp/dashboard');
      } else {
        throw new Error('No access token received');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

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
            Manage Your Business Better
          </h2>
          <p className="text-gray-600">
            Track customers, manage tickets, and analyze trends all in one place
          </p>
          </div>
        </div>
        </div>

        {/* Right section with form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8 sm:mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Intrend</h1>
          <div className="text-xl sm:text-2xl font-semibold text-black">
            Welcome Back
          </div>
          <div className="text-sm sm:text-base text-gray-600 mt-1">
            Sign in to continue to your account
          </div>
          </div>
          <form className="mt-6 sm:mt-8 space-y-4 sm:space-y-6" onSubmit={handleLogin}>
            <div className="space-y-4">
              <div>
                <span className="px-1 text-sm text-gray-600">Email</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  required
                  className="text-md block px-3 py-2 rounded-lg w-full text-black bg-white border-2 border-gray-300 placeholder-gray-600 shadow-md focus:placeholder-gray-500 focus:bg-white focus:border-gray-600 focus:outline-none"
                />
              </div>
              <div>
                <span className="px-1 text-sm text-gray-600">Password</span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  required
                  className="text-md block px-3 py-2 rounded-lg w-full text-black bg-white border-2 border-gray-300 placeholder-gray-600 shadow-md focus:placeholder-gray-500 focus:bg-white focus:border-gray-600 focus:outline-none"
                />
              </div>
              {error && (
                <div className="text-red-500 text-sm text-center">
                  {error}
                </div>
              )}
              <button
                type="submit"
                disabled={isLoading}
                className="mt-3 text-lg font-semibold bg-gray-800 w-full text-white rounded-lg px-6 py-3 block shadow-xl hover:text-white hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </button>
              <div className="text-sm font-semibold py-4 flex justify-center">
                <Link
                  href="/signup"
                  className="text-black font-normal border-b-2 border-gray-200 hover:border-gray-500"
                >
                  New to Intrend?{' '}
                  <span className="text-black font-semibold">
                    Create an account
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

export default Login;
