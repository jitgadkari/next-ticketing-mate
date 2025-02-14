'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function TopNavBar() {

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
    const router = useRouter();

    useEffect(() => {
        setIsMounted(true);

        // Check initial auth state
        const checkAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setIsAuthenticated(!!session);
        };
        checkAuth();

        // Subscribe to auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setIsAuthenticated(!!session);
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        // The middleware will handle the redirect to login page
        router.push('/login');
    };


    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    return (
        <nav className="bg-gray-800 text-white sticky z-[90]">
            <div className="p-4 flex justify-between items-center sticky top-0 z-50 shadow-md">
                <div className="flex items-center">
                    <div className="md:hidden mr-4" onClick={toggleMobileMenu}>
                        <svg
                            className={`w-6 h-6 transform transition-transform duration-300 ${isMobileMenuOpen ? 'rotate-90' : ''}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M4 6h16M4 12h16M4 18h16"
                            ></path>
                        </svg>
                    </div>
                    <Link href="/" className="text-3xl font-bold hover:text-gray-300">
                        IntrendApp
                    </Link>
                </div>

                {isMounted && (
                    <div className="hidden md:flex items-center space-x-6">
                        {isAuthenticated ? (
                            <div className="flex items-center space-x-4">
                                <div className="relative">
                                    <button
                                        onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                                        className="w-10 h-10 rounded-full bg-gray-600/80 hover:bg-gray-500 flex items-center justify-center transition-all duration-300 transform hover:scale-105"
                                    >
                                        <svg
                                            className="w-6 h-6 text-white"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                            ></path>
                                        </svg>
                                    </button>

                                    {isProfileDropdownOpen && (
                                        <div className="absolute right-0 mt-2 w-48 bg-gray-800/95 backdrop-blur-sm rounded-md shadow-lg py-1 z-50 border border-gray-700">
                                            <button
                                                onClick={() => {
                                                    handleLogout();
                                                    setIsProfileDropdownOpen(false);
                                                }}
                                                className="block w-full text-left px-4 py-2 text-white hover:bg-red-500 transition-colors"
                                            >
                                                Logout
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <>
                                <Link href="/about" className="text-lg hover:text-gray-300 transition-colors">
                                    About
                                </Link>
                                <Link href="/contact" className="text-lg hover:text-gray-300 transition-colors">
                                    Contact
                                </Link>
                                <Link href="/login" className="text-lg hover:text-gray-300 transition-colors">
                                    Login
                                </Link>
                            </>
                        )}
                    </div>
                )}
            </div>

            {/* Mobile Menu */}
            {isMounted && (
                <div className={`md:hidden ${isMobileMenuOpen ? 'block fixed w-full z-[100]' : 'hidden'} bg-gray-700 text-white`}>
                    <ul className="flex flex-col p-4 space-y-2">
                        {isAuthenticated ? (
                            <>
                                <li>
                                    <Link href="/intrendapp/dashboard" className="text-lg hover:text-gray-300" onClick={toggleMobileMenu}>
                                        Dashboard
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/intrendapp/tickets" className="text-lg hover:text-gray-300">
                                        Tickets
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/intrendapp/customers" className="text-lg hover:text-gray-300">
                                        Customers
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/intrendapp/vendors" className="text-lg hover:text-gray-300">
                                        Vendors
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/intrendapp/attributes" className="text-lg hover:text-gray-300">
                                        Attributes
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/intrendapp/people" className="text-lg hover:text-gray-300">
                                        People
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/intrendapp/customersDashboard" className="text-lg hover:text-gray-300">
                                        Customer Dashboard
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/intrendapp/vendorsDashboard" className="text-lg hover:text-gray-300">
                                        Vendor Dashboard
                                    </Link>
                                </li>
                                <li>
                                    <button
                                        onClick={() => {
                                            handleLogout();
                                            toggleMobileMenu();
                                        }}
                                        className="text-lg text-white hover:text-red-500 transition-colors w-full text-left"
                                    >
                                        Logout
                                    </button>
                                </li>

                            </>
                        ) : (
                            <>
                                <li>
                                    <Link href="/about" className="text-lg hover:text-gray-300" onClick={toggleMobileMenu}>
                                        About
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/contact" className="text-lg hover:text-gray-300" onClick={toggleMobileMenu}>
                                        Contact
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/login" className="text-lg hover:text-gray-300" onClick={toggleMobileMenu}>
                                        Login
                                    </Link>
                                </li>
                            </>
                        )}
                    </ul>
                </div>
            )}
        </nav>
    );
}
