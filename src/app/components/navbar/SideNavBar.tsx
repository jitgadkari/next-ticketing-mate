'use client'
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import pb from '@/lib/pocketbase';
import Image from 'next/image';

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
                                    <Image
                                        src="/svg/dashboard-4-svgrepo-com.svg"
                                        alt="Dashboard"
                                        width={24}
                                        height={24}
                                        className="min-w-[1.5rem] brightness-0 invert"
                                    />
                                    <span className={`transition-opacity duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden'}`}>Dashboard</span>
                                </Link>
                            </li>
                            <li>
                                <Link href="/intrendapp/tickets" className={`flex items-center ${isExpanded ? 'justify-start space-x-2' : 'justify-center'} text-lg hover:bg-gray-700 p-2 rounded block`}>
                                    <Image
                                        src="/svg/tickets-ticket-svgrepo-com.svg"
                                        alt="Tickets"
                                        width={24}
                                        height={24}
                                        className="min-w-[1.5rem] brightness-0 invert"
                                    />
                                    <span className={`transition-opacity duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden'}`}>Tickets</span>
                                </Link>
                            </li>
                            <li>
                                <Link href="/intrendapp/customers" className={`flex items-center ${isExpanded ? 'justify-start space-x-2' : 'justify-center'} text-lg hover:bg-gray-700 p-2 rounded block`}>
                                    <Image
                                        src="/svg/icons8-customer-100.png"
                                        alt="Customers"
                                        width={28}
                                        height={28}
                                        className="min-w-[1.75rem] brightness-0 invert"
                                    />
                                    <span className={`transition-opacity duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden'}`}>Customers</span>
                                </Link>
                            </li>
                            <li>
                                <Link href="/intrendapp/vendors" className={`flex items-center ${isExpanded ? 'justify-start space-x-2' : 'justify-center'} text-lg hover:bg-gray-700 p-2 rounded block`}>
                                    <Image
                                        src="/svg/people-svgrepo-com.svg"
                                        alt="Vendors"
                                        width={20}
                                        height={20}
                                        className="min-w-[1.5rem] brightness-0 invert"
                                    />
                                    <span className={`transition-opacity duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden'}`}>Vendors</span>
                                </Link>
                            </li>
                            <li>
                                <Link href="/intrendapp/attributes" className={`flex items-center ${isExpanded ? 'justify-start space-x-2' : 'justify-center'} text-lg hover:bg-gray-700 p-2 rounded block`}>
                                    <Image
                                        src="/svg/edit-attributes-svgrepo-com.svg"
                                        alt="Attributes"
                                        width={24}
                                        height={24}
                                        className="min-w-[1.5rem] brightness-0 invert"
                                    />
                                    <span className={`transition-opacity duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden'}`}>Attributes</span>
                                </Link>
                            </li>
                            <li>
                                <Link href="/intrendapp/people" className={`flex items-center ${isExpanded ? 'justify-start space-x-2' : 'justify-center'} text-lg hover:bg-gray-700 p-2 rounded block`}>
                                    <Image
                                        src="/svg/users-svgrepo-com.svg"
                                        alt="People"
                                        width={28}
                                        height={28}
                                        className="min-w-[1.5rem] brightness-0 invert"
                                    />
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
