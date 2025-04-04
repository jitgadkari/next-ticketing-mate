'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { isAuthenticated, clearAuthData, getUserData } from '@/utils/auth';

export default function TopNavBar() {

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const [authStatus, setAuthStatus] = useState(false);
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
    const [userRole, setUserRole] = useState<'admin' | 'superuser' | 'general_user'>('general_user');
    const router = useRouter();

    useEffect(() => {
        setIsMounted(true);
        const isAuth = isAuthenticated();
        setAuthStatus(isAuth);

        if (isAuth) {
            const userData = getUserData();
            setUserRole(userData?.role || 'general_user');
        }

        // Listen for storage events to detect auth changes
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'access_token') {
                const isAuth = isAuthenticated();
                setAuthStatus(isAuth);
                if (isAuth) {
                    const userData = getUserData();
                    setUserRole(userData?.role || 'general_user');
                }
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    const roleMap = {
        admin: [
            { name: 'Dashboard', href: '/intrendapp/dashboard', key: 'dashboard' },
            { name: 'Tickets', href: '/intrendapp/tickets', key: 'ticket' },
            { name: 'Customers', href: '/intrendapp/customers', key: 'customer' },
            { name: 'Vendors', href: '/intrendapp/vendors', key: 'vendor' },
            { name: 'Attributes', href: '/intrendapp/attributes' },
            { name: 'People', href: '/intrendapp/people', key: 'people' },
        ],
        superuser: [
            { name: 'Dashboard', href: '/intrendapp/dashboard', key: 'dashboard' },
            { name: 'Tickets', href: '/intrendapp/tickets', key: 'ticket' },
            { name: 'Customers', href: '/intrendapp/customers', key: 'customer' },
            { name: 'Vendors', href: '/intrendapp/vendors', key: 'vendor' },
            { name: 'People', href: '/intrendapp/people', key: 'people' },
            { name: 'Attributes', href: '/intrendapp/attributes' },
        ],
        general_user: [
            { name: 'People Dashboard', href: '/intrendapp/customersDashboard', key: 'customer-dashboard' },
        ],
    };

    const handleLogout = () => {
        clearAuthData();
        // The middleware will handle the redirect to login page
        router.push('/login');
    };


    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    return (
        <nav className="bg-gray-800/95 backdrop-blur-sm text-white sticky z-[90] shadow-lg border-b border-gray-700">
            <div className="px-6 py-4 flex justify-between items-center sticky top-0 z-50">
                <div className="flex items-center">
                    <div className="md:hidden mr-4 p-2 hover:bg-gray-700/50 rounded-lg transition-colors" onClick={toggleMobileMenu}>
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
                    <Link href="/" className="text-3xl font-bold hover:text-gray-300 transition-colors flex items-center space-x-2">
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-teal-400">Intrend</span>
                    </Link>
                </div>

                {isMounted && (
                    <div className="hidden md:flex items-center space-x-6">
                        {authStatus ? (
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
                        {authStatus ? (
                            <>
                                {roleMap[userRole]?.map(({ name, href, key }) => (
                                    <li key={name}>
                                        <Link 
                                            href={href} 
                                            className="text-lg hover:text-gray-300"
                                            onClick={toggleMobileMenu}
                                        >
                                            {name}
                                        </Link>
                                    </li>
                                ))}
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
