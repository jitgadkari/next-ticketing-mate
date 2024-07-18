"use client";
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import pb from '../lib/pocketbase';
import './globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();

  const handleLogout = () => {
    pb.authStore.clear();
    router.push('/login');
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen">
        <nav className="p-4 bg-gray-800 text-white flex justify-between items-center sticky top-0 z-50">
          <div className="flex items-center">
            <button className="md:hidden mr-4" onClick={toggleMobileMenu}>
              <svg
                className="w-6 h-6"
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
            </button>
            <Link href="/" className="text-xl font-bold">
              IntrendApp
            </Link>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            {pb.authStore.isValid ? (
              <>
                
                <button onClick={handleLogout} className="bg-red-500 px-4 py-2 rounded">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/about" className="text-lg">
                  About
                </Link>
                <Link href="/contact" className="text-lg">
                  Contact
                </Link>
                <Link href="/login" className="text-lg">
                  Login
                </Link>
                <Link href="/signup" className="text-lg">
                  Signup
                </Link>
              </>
            )}
          </div>
        </nav>
        <div className={`md:hidden ${isMobileMenuOpen ? 'block' : 'hidden'} bg-gray-800 text-white`}>
          <ul className="p-4">
            {pb.authStore.isValid ? (
              <>
                <li className="mb-4">
                  <Link href="/intrendapp/dashboard" className="text-lg" onClick={toggleMobileMenu}>
                    Dashboard
                  </Link>
                </li>
                <li className="mb-4">
                  <button onClick={() => { handleLogout(); toggleMobileMenu(); }} className="bg-red-500 px-4 py-2 rounded">
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li className="mb-4">
                  <Link href="/about" className="text-lg" onClick={toggleMobileMenu}>
                    About
                  </Link>
                </li>
                <li className="mb-4">
                  <Link href="/contact" className="text-lg" onClick={toggleMobileMenu}>
                    Contact
                  </Link>
                </li>
                <li className="mb-4">
                  <Link href="/login" className="text-lg" onClick={toggleMobileMenu}>
                    Login
                  </Link>
                </li>
                <li className="mb-4">
                  <Link href="/signup" className="text-lg" onClick={toggleMobileMenu}>
                    Signup
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
        <div className="flex flex-1">
          {pb.authStore.isValid && (
            <aside className="w-64 bg-gray-800 text-white hidden md:block">
              <div className="p-4">
                <h2 className="text-2xl font-bold">IntrendApp</h2>
              </div>
              <nav className="p-4">
                <ul>
                  <li className="mb-4">
                    <Link href="/intrendapp/dashboard" className="text-lg">
                      Dashboard
                    </Link>
                  </li>
                  <li className="mb-4">
                    <Link href="/intrendapp/tickets" className="text-lg">
                      Tickets
                    </Link>
                  </li>
                  <li className="mb-4">
                    <Link href="/intrendapp/customers" className="text-lg">
                      Customers
                    </Link>
                  </li>
                  <li className="mb-4">
                    <Link href="/intrendapp/vendors" className="text-lg">
                      Vendors
                    </Link>
                  </li>
                  <li className="mb-4">
                    <Link href="/intrendapp/attributes" className="text-lg">
                      Attributes
                    </Link>
                  </li>
                  <li className="mb-4">
                    <Link href="/intrendapp/people" className="text-lg">
                      People
                    </Link>
                  </li>
                </ul>
              </nav>
            </aside>
          )}
          <main className="flex-1 p-8 bg-gray-100">{children}</main>
        </div>
      </body>
    </html>
  );
}
