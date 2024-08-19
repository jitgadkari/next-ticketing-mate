'use client'
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import pb from '@/lib/pocketbase';

export default function SideNav({ children }: { children: React.ReactNode }) {
    const [isMounted, setIsMounted] = useState(false);
    const [authValid, setIsAuthValid] = useState(pb.authStore.isValid);

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
                <aside className="w-64 bg-gray-800 text-white hidden md:block sticky top-16 h-[calc(100vh-4rem)]">
                    <nav className="p-4">
                        <ul className="space-y-4">
                            <li>
                                <Link href="/intrendapp/dashboard" className="text-lg hover:bg-gray-700 p-2 rounded block">
                                    Dashboard
                                </Link>
                            </li>
                            <li>
                                <Link href="/intrendapp/tickets" className="text-lg hover:bg-gray-700 p-2 rounded block">
                                    Tickets
                                </Link>
                            </li>
                            <li>
                                <Link href="/intrendapp/customers" className="text-lg hover:bg-gray-700 p-2 rounded block">
                                    Customers
                                </Link>
                            </li>
                            <li>
                                <Link href="/intrendapp/vendors" className="text-lg hover:bg-gray-700 p-2 rounded block">
                                    Vendors
                                </Link>
                            </li>
                            <li>
                                <Link href="/intrendapp/attributes" className="text-lg hover:bg-gray-700 p-2 rounded block">
                                    Attributes
                                </Link>
                            </li>
                            <li>
                                <Link href="/intrendapp/people" className="text-lg hover:bg-gray-700 p-2 rounded block">
                                    People
                                </Link>
                            </li>
                        </ul>
                    </nav>
                </aside>
            )}
            <main className="flex-1 px-8 py-4 bg-gray-100 overflow-auto h-[calc(100vh-4rem)]">
                {children}
            </main>
        </div>
    );
}
