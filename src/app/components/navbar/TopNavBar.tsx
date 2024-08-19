'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import pb from '@/lib/pocketbase'; 

export default function TopNavBar() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const router = useRouter();

    useEffect(() => {
        // Set the mounted state to true after the component has mounted
        setIsMounted(true);
    }, []);

    const handleLogout = () => {
        pb.authStore.clear();
        router.push('/');
    };

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    return (
        <nav className="bg-gray-800 text-white sticky">
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
                    <Link href="/" className="text-xl font-bold hover:text-gray-300">
                        IntrendApp
                    </Link>
                </div>

                {isMounted && (
                    <div className="hidden md:flex items-center space-x-6">
                        {pb.authStore.isValid ? (
                            <button
                                onClick={handleLogout}
                                className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded transition-colors"
                            >
                                Logout
                            </button>
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
                                <Link href="/signup" className="text-lg hover:text-gray-300 transition-colors">
                                    Signup
                                </Link>
                            </>
                        )}
                    </div>
                )}
            </div>

            {/* Mobile Menu */}
            {isMounted && (
                <div className={`md:hidden ${isMobileMenuOpen ? 'block fixed w-full' : 'hidden'} bg-gray-700 text-white`}>
                    <ul className="flex flex-col p-4 space-y-2">
                        {pb.authStore.isValid ? (
                            <>
                                <li>
                                    <Link href="/" className="text-lg hover:text-gray-300" onClick={toggleMobileMenu}>
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
                                    <button
                                        onClick={() => {
                                            handleLogout();
                                            toggleMobileMenu();
                                        }}
                                        className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded transition-colors w-full text-left"
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
                                <li>
                                    <Link href="/signup" className="text-lg hover:text-gray-300" onClick={toggleMobileMenu}>
                                        Signup
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
