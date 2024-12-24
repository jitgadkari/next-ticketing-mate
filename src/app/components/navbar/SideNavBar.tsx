'use client'
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import pb from '@/lib/pocketbase';

export default function SideNav({ children }: { children: React.ReactNode }) {
    const [isMounted, setIsMounted] = useState(false);
    const [authValid, setIsAuthValid] = useState(pb.authStore.isValid);
    const [isExpanded, setIsExpanded] = useState(false); 

    useEffect(() => {
        setIsMounted(true);
        const unsubscribe = pb.authStore.onChange(() => {
            setIsAuthValid(pb.authStore.isValid);
        });

        // Cleanup the listener on component unmount
        return () => unsubscribe();
    }, []);

    if (!isMounted) return null;

    return (
        <div className="flex h-full">
            {authValid && (
                <aside
                    onMouseEnter={() => setIsExpanded(true)}
                    onMouseLeave={() => setIsExpanded(false)}
                    className={`bg-gray-800 text-white hidden md:block sticky top-16 h-[calc(100vh-4rem)] transition-all duration-300
                    ${isExpanded ? 'w-64' : 'w-16'}`}
                >
                    <nav className="p-4">
                        <ul className="space-y-4">
                            <li>
                                <Link href="/intrendapp/dashboard" className={`flex items-center ${isExpanded ? 'justify-start space-x-2' : 'justify-center'} text-lg hover:bg-gray-700 p-2 rounded block`}>
                                    <svg
                                        className="w-6 h-6 min-w-[1.5rem]"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M4 4h16v16H4z"
                                        />
                                    </svg>
                                    <span className={`transition-opacity duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden'}`}>Dashboard</span>
                                </Link>
                            </li>
                            <li>
                                <Link href="/intrendapp/tickets" className={`flex items-center ${isExpanded ? 'justify-start space-x-2' : 'justify-center'} text-lg hover:bg-gray-700 p-2 rounded block`}>
                                    <svg
                                        className="w-6 h-6 min-w-[1.5rem]"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 12l2 2 4-4"
                                        />
                                    </svg>
                                    <span className={`transition-opacity duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden'}`}>Tickets</span>
                                </Link>
                            </li>
                            <li>
                                <Link href="/intrendapp/customers" className={`flex items-center ${isExpanded ? 'justify-start space-x-2' : 'justify-center'} text-lg hover:bg-gray-700 p-2 rounded block`}>
                                    <svg
                                        className="w-6 h-6 min-w-[1.5rem]"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M3 8a6 6 0 0112 0v6a6 6 0 01-12 0V8z"
                                        />
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M16 10v2a2 2 0 11-4 0v-2a2 2 0 014 0z"
                                        />
                                    </svg>
                                    <span className={`transition-opacity duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden'}`}>Customers</span>
                                </Link>
                            </li>
                            <li>
                                <Link href="/intrendapp/vendors" className={`flex items-center ${isExpanded ? 'justify-start space-x-2' : 'justify-center'} text-lg hover:bg-gray-700 p-2 rounded block`}>
                                    <svg
                                        className="w-6 h-6 min-w-[1.5rem]"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M6 6h12v12H6z"
                                        />
                                    </svg>
                                    <span className={`transition-opacity duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden'}`}>Vendors</span>
                                </Link>
                            </li>
                            <li>
                                <Link href="/intrendapp/attributes" className={`flex items-center ${isExpanded ? 'justify-start space-x-2' : 'justify-center'} text-lg hover:bg-gray-700 p-2 rounded block`}>
                                    <svg
                                        className="w-6 h-6 min-w-[1.5rem]"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M8 4v16m8-16v16m-4-12v8"
                                        />
                                    </svg>
                                    <span className={`transition-opacity duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden'}`}>Attributes</span>
                                </Link>
                            </li>
                            <li>
                                <Link href="/intrendapp/people" className={`flex items-center ${isExpanded ? 'justify-start space-x-2' : 'justify-center'} text-lg hover:bg-gray-700 p-2 rounded block`}>
                                    <svg
                                        className="w-6 h-6 min-w-[1.5rem]"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M10 4h4v4h-4V4zm2 8h4v8h-4v-8zm-6 0h4v8H6v-8z"
                                        />
                                    </svg>
                                    <span className={`transition-opacity duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden'}`}>People</span>
                                </Link>
                            </li>
                        </ul>
                    </nav>
                </aside>
            )}
            <main className="flex-1 md:px-8 md:py-4 bg-gray-100 overflow-auto h-[calc(100vh-4rem)]">
                {children}
            </main>
        </div>
    );
}
