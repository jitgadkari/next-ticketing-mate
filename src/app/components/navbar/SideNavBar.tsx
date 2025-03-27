"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { isAuthenticated } from '@/utils/auth';



export default function SideNav({ children }: { children: React.ReactNode }) {
  const [isMounted, setIsMounted] = useState(false);
  const [authValid, setIsAuthValid] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    setIsAuthValid(isAuthenticated());

    // Listen for storage events to detect auth changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'access_token') {
        setIsAuthValid(isAuthenticated());
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  if (!isMounted) return null;

  const handleLinkClick = (link: string) => {
    console.log("Link clicked:", link);
    switch (link) {
      case "ticket":
        localStorage.removeItem("peopleListOffset");
        localStorage.removeItem("vendorListOffset");
        localStorage.removeItem("customerListOffset");
        break;
      case "customer":
        localStorage.removeItem("ticketListOffset");
        localStorage.removeItem("peopleListOffset");
        localStorage.removeItem("vendorListOffset");
        break;
      case "vendor":
        localStorage.removeItem("ticketListOffset");
        localStorage.removeItem("peopleListOffset");
        localStorage.removeItem("customerListOffset");
        break;
      case "people":
        localStorage.removeItem("ticketListOffset");
        localStorage.removeItem("vendorListOffset");
        localStorage.removeItem("customerListOffset");
        break;
      case "dashboard":
        localStorage.removeItem("ticketListOffset");
        localStorage.removeItem("peopleListOffset");
        localStorage.removeItem("vendorListOffset");
        localStorage.removeItem("customerListOffset");
        break;
      default:
        break;
    }
  };
  return (
    <div className="flex h-full">
      {authValid && (
        <aside
          onMouseEnter={() => setIsExpanded(true)}
          onMouseLeave={() => setIsExpanded(false)}
            className={`bg-gray-800 text-white hidden md:block sticky top-16 h-[calc(100vh-4rem)] transition-all duration-500
                    ${isExpanded ? "w-64" : "w-16"}`}
        >
          <nav className="p-4">
            <ul className="space-y-4">
              <li onClick={() => handleLinkClick("dashboard")}>
                <Link
                  href="/intrendapp/dashboard"
                  className={`flex items-center ${isExpanded ? "justify-start space-x-2" : "justify-center"
                    } text-lg hover:bg-gray-700 p-2 rounded block`}
                >
                  <Image
                    src="/svg/dashboard-4-svgrepo-com.svg"
                    alt="Dashboard"
                    width={24}
                    height={24}
                    className="min-w-[1.5rem] brightness-0 invert"
                  />
                  <span
                    className={`transition-opacity duration-500 ${isExpanded
                      ? "opacity-100"
                      : "opacity-0 w-0 overflow-hidden"
                      }`}
                  >
                    Dashboard
                  </span>
                </Link>
              </li>
              <li
                onClick={() => {
                  handleLinkClick("ticket");
                }}
              >
                <Link
                  href="/intrendapp/tickets"
                  className={`flex items-center ${isExpanded ? "justify-start space-x-2" : "justify-center"
                    } text-lg hover:bg-gray-700 p-2 rounded block`}
                >
                  <Image
                    src="/svg/tickets-ticket-svgrepo-com.svg"
                    alt="Tickets"
                    width={24}
                    height={24}
                    className="min-w-[1.5rem] brightness-0 invert"
                  />
                  <span
                    className={`transition-opacity duration-500 ${isExpanded
                      ? "opacity-100"
                      : "opacity-0 w-0 overflow-hidden"
                      }`}
                  >
                    Tickets
                  </span>
                </Link>
              </li>
              <li onClick={() => handleLinkClick("customer")}>
                <Link
                  href="/intrendapp/customers"
                  className={`flex items-center ${isExpanded ? "justify-start space-x-2" : "justify-center"
                    } text-lg hover:bg-gray-700 p-2 rounded block`}
                >
                  <Image
                    src="/svg/icons8-customer-100.png"
                    alt="Customers"
                    width={28}
                    height={28}
                    className="min-w-[1.75rem] brightness-0 invert"
                  />
                  <span
                    className={`transition-opacity duration-500 ${isExpanded
                      ? "opacity-100"
                      : "opacity-0 w-0 overflow-hidden"
                      }`}
                  >
                    Customers
                  </span>
                </Link>
              </li>
              <li
                onClick={() => {
                  handleLinkClick("vendor");
                }}
              >
                <Link
                  href="/intrendapp/vendors"
                  className={`flex items-center ${isExpanded ? "justify-start space-x-2" : "justify-center"
                    } text-lg hover:bg-gray-700 p-2 rounded block`}
                >
                  <Image
                    src="/svg/people-svgrepo-com.svg"
                    alt="Vendors"
                    width={20}
                    height={20}
                    className="min-w-[1.5rem] brightness-0 invert"
                  />
                  <span
                    className={`transition-opacity duration-500 ${isExpanded
                      ? "opacity-100"
                      : "opacity-0 w-0 overflow-hidden"
                      }`}
                  >
                    Vendors
                  </span>
                </Link>
              </li>
              <li>
                <Link
                  href="/intrendapp/attributes"
                  className={`flex items-center ${isExpanded ? "justify-start space-x-2" : "justify-center"
                    } text-lg hover:bg-gray-700 p-2 rounded block`}
                >
                  <Image
                    src="/svg/edit-attributes-svgrepo-com.svg"
                    alt="Attributes"
                    width={24}
                    height={24}
                    className="min-w-[1.5rem] brightness-0 invert"
                  />
                  <span
                    className={`transition-opacity duration-500 ${isExpanded
                      ? "opacity-100"
                      : "opacity-0 w-0 overflow-hidden"
                      }`}
                  >
                    Attributes
                  </span>
                </Link>
              </li>
              <li
                onClick={() => {
                  handleLinkClick("people");
                }}
              >
                <Link
                  href="/intrendapp/people"
                  className={`flex items-center ${isExpanded ? "justify-start space-x-2" : "justify-center"
                    } text-lg hover:bg-gray-700 p-2 rounded block`}
                >
                  <Image
                    src="/svg/users-svgrepo-com.svg"
                    alt="People"
                    width={28}
                    height={28}
                    className="min-w-[1.5rem] brightness-0 invert"
                  />
                  <span
                    className={`transition-opacity duration-500 ${isExpanded
                      ? "opacity-100"
                      : "opacity-0 w-0 overflow-hidden"
                      }`}
                  >
                    People
                  </span>
                </Link>
              </li>
              <li>
                <Link
                  href="/intrendapp/integrations"
                  className={`flex items-center ${isExpanded ? "justify-start space-x-2" : "justify-center"
                    } text-lg hover:bg-gray-700 p-2 rounded block`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 50 50" className="min-w-[1.5rem] brightness-0 invert">
                    <path d="M25,2C12.318,2,2,12.318,2,25c0,3.96,1.023,7.854,2.963,11.29L2.037,46.73c-0.096,0.343-0.003,0.711,0.245,0.966 C2.473,47.893,2.733,48,3,48c0.08,0,0.161-0.01,0.24-0.029l10.896-2.699C17.463,47.058,21.21,48,25,48c12.682,0,23-10.318,23-23 S37.682,2,25,2z M36.57,33.116c-0.492,1.362-2.852,2.605-3.986,2.772c-1.018,0.149-2.306,0.213-3.72-0.231 c-0.857-0.27-1.957-0.628-3.366-1.229c-5.923-2.526-9.791-8.415-10.087-8.804C15.116,25.235,13,22.463,13,19.594 s1.525-4.28,2.067-4.864c0.542-0.584,1.181-0.73,1.575-0.73s0.787,0.005,1.132,0.021c0.363,0.018,0.85-0.137,1.329,1.001 c0.492,1.168,1.673,4.037,1.819,4.33c0.148,0.292,0.246,0.633,0.05,1.022c-0.196,0.389-0.294,0.632-0.59,0.973 s-0.62,0.76-0.886,1.022c-0.296,0.291-0.603,0.606-0.259,1.19c0.344,0.584,1.529,2.493,3.285,4.039 c2.255,1.986,4.158,2.602,4.748,2.894c0.59,0.292,0.935,0.243,1.279-0.146c0.344-0.39,1.476-1.703,1.869-2.286 s0.787-0.487,1.329-0.292c0.542,0.194,3.445,1.604,4.035,1.896c0.59,0.292,0.984,0.438,1.132,0.681 C37.062,30.587,37.062,31.755,36.57,33.116z"></path>
                  </svg>
                  <span
                    className={`transition-opacity duration-500 ${isExpanded
                      ? "opacity-100"
                      : "opacity-0 w-0 overflow-hidden"
                      }`}
                  >
                    Integrations
                  </span>
                </Link>
              </li>
              <li>
                <Link
                  href="/intrendapp/whatsapp"
                  className={`flex items-center ${isExpanded ? "justify-start space-x-2" : "justify-center"
                    } text-lg hover:bg-gray-700 p-2 rounded block`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 50 50" className="min-w-[1.5rem] brightness-0 invert">
                    <path d="M25,2C12.318,2,2,12.318,2,25c0,3.96,1.023,7.854,2.963,11.29L2.037,46.73c-0.096,0.343-0.003,0.711,0.245,0.966 C2.473,47.893,2.733,48,3,48c0.08,0,0.161-0.01,0.24-0.029l10.896-2.699C17.463,47.058,21.21,48,25,48c12.682,0,23-10.318,23-23 S37.682,2,25,2z M36.57,33.116c-0.492,1.362-2.852,2.605-3.986,2.772c-1.018,0.149-2.306,0.213-3.72-0.231 c-0.857-0.27-1.957-0.628-3.366-1.229c-5.923-2.526-9.791-8.415-10.087-8.804C15.116,25.235,13,22.463,13,19.594 s1.525-4.28,2.067-4.864c0.542-0.584,1.181-0.73,1.575-0.73s0.787,0.005,1.132,0.021c0.363,0.018,0.85-0.137,1.329,1.001 c0.492,1.168,1.673,4.037,1.819,4.33c0.148,0.292,0.246,0.633,0.05,1.022c-0.196,0.389-0.294,0.632-0.59,0.973 s-0.62,0.76-0.886,1.022c-0.296,0.291-0.603,0.606-0.259,1.19c0.344,0.584,1.529,2.493,3.285,4.039 c2.255,1.986,4.158,2.602,4.748,2.894c0.59,0.292,0.935,0.243,1.279-0.146c0.344-0.39,1.476-1.703,1.869-2.286 s0.787-0.487,1.329-0.292c0.542,0.194,3.445,1.604,4.035,1.896c0.59,0.292,0.984,0.438,1.132,0.681 C37.062,30.587,37.062,31.755,36.57,33.116z"></path>
                  </svg>
                  <span
                    className={`transition-opacity duration-500 ${isExpanded
                      ? "opacity-100"
                      : "opacity-0 w-0 overflow-hidden"
                      }`}
                  >
                    Whatsapp
                  </span>
                </Link>
              </li>
              <li
                onClick={() => {
                  handleLinkClick("customer-dashboard");
                }}
              >
                <Link
                  href="/intrendapp/customersDashboard"
                  className={`flex items-center ${isExpanded ? "justify-start space-x-2" : "justify-center"
                    } text-lg hover:bg-gray-700 p-2 rounded block`}
                >
                  <Image
                    src="/svg/dashboard-4-svgrepo-com.svg"
                    alt="Dashboard"
                    width={24}
                    height={24}
                    className="min-w-[1.5rem] brightness-0 invert"
                  />
                  <span
                    className={`duration-500 ${isExpanded ? "opacity-100 w-auto" : "opacity-0 w-0"} overflow-hidden`}
                  >
                    Customer
                  </span>
                  <span
                    className={`duration-500 ${isExpanded ? "opacity-100 w-auto" : "opacity-0 w-0"} overflow-hidden`}
                  >
                    Dashboard
                  </span>
                </Link>
              </li>
              <li
                onClick={() => {
                  handleLinkClick("vendor-dashboard");
                }}
              >
                <Link
                  href="/intrendapp/vendorsDashboard"
                  className={`flex items-center ${isExpanded ? "justify-start space-x-2" : "justify-center"
                    } text-lg hover:bg-gray-700 p-2 rounded block`}
                >
                  <Image
                    src="/svg/dashboard-4-svgrepo-com.svg"
                    alt="Dashboard"
                    width={24}
                    height={24}
                    className="min-w-[1.5rem] brightness-0 invert"
                  />
                  <span
                    className={`  duration-500 ${isExpanded ? "opacity-100 w-auto" : "opacity-0 w-0"} overflow-hidden`}
                  >
                    Vendors
                  </span>
                  <span
                    className={`  duration-500 ${isExpanded ? "opacity-100 w-auto" : "opacity-0 w-0"} overflow-hidden`}
                  >
                    Dashboard
                  </span>
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
