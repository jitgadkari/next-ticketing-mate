"use client";

import { useState, FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { isAuthenticated, setAuthData } from "@/utils/auth";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
const Login = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isAuthenticated()) {
      router.push("/intrendapp/tickets");
    }
  }, [router]);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/api/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || "Authentication failed");
      }

      if (data.access_token) {
        setAuthData(data.access_token, data.user_metadata);
        router.push("/intrendapp/dashboard");
      } else {
        throw new Error("No access token received");
      }
    } catch (err: any) {
      setError(err.message || "Invalid email or password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-white">
      {/* Left Branding Section */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="hidden lg:flex w-1/2 bg-gray-50 flex-col items-center justify-center p-12"
      >
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
              Track customers, manage tickets, and analyze trends all in one
              place
            </p>
          </div>
        </div>
      </motion.div>

      {/* Right Login Form Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8"
      >
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <Link href="/">
              <h1 className="text-4xl font-bold text-gray-900 mb-2 hover:text-blue-600 transition-colors cursor-pointer">
                IntSync
              </h1>
            </Link>
            <div className="text-2xl font-semibold text-black">
              Welcome Back
            </div>
            <div className="text-base text-gray-600 mt-1">
              Sign in to continue to your account
            </div>
          </div>

          <form className="space-y-6" onSubmit={handleLogin}>
            <div className="space-y-4">
              <div>
                <span className="px-1 text-sm text-gray-600">Email</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  required
                  className="text-md block px-3 py-2 rounded-lg w-full text-black bg-white border-2 border-gray-300 placeholder-gray-600 shadow-md focus:border-gray-600 focus:outline-none"
                />
              </div>
              <div className="relative">
                <span className="px-1 text-sm text-gray-600">Password</span>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  required
                  className="text-md block px-3 py-2 pr-10 rounded-lg w-full text-black bg-white border-2 border-gray-300 placeholder-gray-600 shadow-md focus:border-gray-600 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 bottom-2 text-gray-600 hover:text-gray-800"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-red-500 text-sm text-center"
                >
                  {error}
                </motion.div>
              )}

              <motion.button
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isLoading}
                className="mt-3 text-lg font-semibold bg-gray-800 w-full text-white rounded-lg px-6 py-3 shadow-xl hover:bg-black transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </motion.button>

              <div className="text-sm font-semibold py-4 text-center">
                <Link
                  href="/signup"
                  className="text-black border-b-2 border-gray-200 hover:border-gray-500"
                >
                  New to Intrend?{" "}
                  <span className="font-semibold">Create an account</span>
                </Link>
              </div>

              <div className="text-sm font-semibold text-center space-x-4">
                <Link
                  href="/"
                  className="text-black border-b-2 border-gray-200 hover:border-gray-500"
                >
                  Home
                </Link>
                <Link
                  href="/about"
                  className="text-black border-b-2 border-gray-200 hover:border-gray-500"
                >
                  About
                </Link>
              </div>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
