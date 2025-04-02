"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { isAuthenticated, getUserData } from '@/utils/auth';

export default function SideNav({ children }: { children: React.ReactNode }) {
  const [isMounted, setIsMounted] = useState(false);
  const [authValid, setIsAuthValid] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [userRole, setUserRole] = useState<'admin' | 'superuser' | 'general_user'>('general_user');

  useEffect(() => {
    setIsMounted(true);
    const isAuth = isAuthenticated();
    setIsAuthValid(isAuth);

    if (isAuth) {
      const userData = getUserData();
      setUserRole(userData?.role || 'general_user');
    }

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'access_token') {
        const isAuth = isAuthenticated();
        setIsAuthValid(isAuth);
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

  if (!isMounted) return null;

  const handleLinkClick = (link: string) => {
    switch (link) {
      case "ticket":
        localStorage.removeItem("peopleListOffset");
        localStorage.removeItem("vendorListOffset");
        localStorage.removeItem("customerListOffset");
        break;
      case "customer":
      case "vendor":
      case "people":
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

  const renderInlineSvg = (name: string) => {
    if (name === 'Whatsapp') {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 50 50" className="min-w-[1.5rem] brightness-0 invert">
          <path d="M25,2C12.318,2,2,12.318,2,25c0,3.96,1.023,7.854,2.963,11.29L2.037,46.73c-0.096,0.343-0.003,0.711,0.245,0.966 C2.473,47.893,2.733,48,3,48c0.08,0,0.161-0.01,0.24-0.029l10.896-2.699C17.463,47.058,21.21,48,25,48c12.682,0,23-10.318,23-23 S37.682,2,25,2z M36.57,33.116c-0.492,1.362-2.852,2.605-3.986,2.772c-1.018,0.149-2.306,0.213-3.72-0.231 c-0.857-0.27-1.957-0.628-3.366-1.229c-5.923-2.526-9.791-8.415-10.087-8.804C15.116,25.235,13,22.463,13,19.594 s1.525-4.28,2.067-4.864c0.542-0.584,1.181-0.73,1.575-0.73s0.787,0.005,1.132,0.021c0.363,0.018,0.85-0.137,1.329,1.001 c0.492,1.168,1.673,4.037,1.819,4.33c0.148,0.292,0.246,0.633,0.05,1.022c-0.196,0.389-0.294,0.632-0.59,0.973 s-0.62,0.76-0.886,1.022c-0.296,0.291-0.603,0.606-0.259,1.19c0.344,0.584,1.529,2.493,3.285,4.039 c2.255,1.986,4.158,2.602,4.748,2.894c0.59,0.292,0.935,0.243,1.279-0.146c0.344-0.39,1.476-1.703,1.869-2.286 s0.787-0.487,1.329-0.292c0.542,0.194,3.445,1.604,4.035,1.896c0.59,0.292,0.984,0.438,1.132,0.681 C37.062,30.587,37.062,31.755,36.57,33.116z"></path>
        </svg>
      );
    } else if (name === 'Integrations') {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 122.88 91.86" className="min-w-[1.5rem] brightness-0 invert">
          <path className="fill-current" fillRule="evenodd" clipRule="evenodd" d="M111.89,75.94l-6.59,6.59c-1.73,1.73-4.58,1.73-6.31,0l-5.31-5.31c-2.74,1.46-5.68,2.58-8.78,3.3v6.88 c0,2.45-2.01,4.46-4.46,4.46h-9.32c-2.45,0-4.46-2.01-4.46-4.46v-7.51c-3.04-0.92-5.91-2.23-8.54-3.89l-4.87,4.87 c-1.73,1.73-4.58,1.73-6.31,0l-2.98-2.97l0.08-0.09l13.07-14.96c4.78,5.6,11.9,9.16,19.84,9.16c14.4,0,26.08-11.68,26.08-26.07l0,0 l0,0c0-14.4-11.68-26.08-26.08-26.08c-7.21,0-13.74,2.93-18.46,7.66l-4.81-0.18L41.51,16.5c0.15-0.21,0.31-0.4,0.49-0.59l6.59-6.59 c1.73-1.73,4.58-1.73,6.31,0l5.31,5.31c2.74-1.47,5.68-2.59,8.78-3.3V4.45C69.01,2.01,71.02,0,73.47,0h9.31 c2.45,0,4.46,2.01,4.46,4.46l0,7.51c3.04,0.92,5.91,2.24,8.54,3.89l4.87-4.87c1.73-1.73,4.58-1.73,6.31,0l6.59,6.59 c1.73,1.73,1.73,4.58,0,6.31l-5.31,5.31c1.47,2.74,2.59,5.68,3.3,8.78h6.88c2.44,0,4.46,2.01,4.46,4.46v9.32 c0,2.45-2.01,4.46-4.46,4.46h-7.5c-0.92,3.04-2.23,5.91-3.89,8.54l4.87,4.87C113.63,71.36,113.63,74.2,111.89,75.94L111.89,75.94 L111.89,75.94L111.89,75.94L111.89,75.94z M77.03,37.46c4.68,0,8.47,3.79,8.47,8.47c0,4.68-3.79,8.47-8.47,8.47 c-4.68,0-8.47-3.79-8.47-8.47C68.56,41.25,72.36,37.46,77.03,37.46L77.03,37.46z M60.14,45.41L37.13,71.76L36.36,59.4 C20.63,57.15,8.58,61.47,0,73.87c0.1-24.4,15.96-37.16,34.82-39.12l-0.79-12.61L60.14,45.41L60.14,45.41L60.14,45.41L60.14,45.41 L60.14,45.41L60.14,45.41z" />
        </svg>
      );
    }
    return null;
  };

  const roleMap = {
    admin: [
      { name: 'Dashboard', href: '/intrendapp/dashboard', icon: '/svg/dashboard-4-svgrepo-com.svg', key: 'dashboard' },
      { name: 'Tickets', href: '/intrendapp/tickets', icon: '/svg/tickets-ticket-svgrepo-com.svg', key: 'ticket' },
      { name: 'Customers', href: '/intrendapp/customers', icon: '/svg/icons8-customer-100.png', key: 'customer' },
      { name: 'Vendors', href: '/intrendapp/vendors', icon: '/svg/people-svgrepo-com.svg', key: 'vendor' },
      { name: 'Attributes', href: '/intrendapp/attributes', icon: '/svg/edit-attributes-svgrepo-com.svg' },
      { name: 'People', href: '/intrendapp/people', icon: '/svg/users-svgrepo-com.svg', key: 'people' },
      { name: 'Whatsapp', href: '/intrendapp/whatsapp', icon: 'inline', key: 'whatsapp' },
      { name: 'Integrations', href: '/intrendapp/integrations', icon: 'inline', key: 'integrations' },
    ],
    superuser: [
      { name: 'Dashboard', href: '/intrendapp/dashboard', icon: '/svg/dashboard-4-svgrepo-com.svg', key: 'dashboard' },
      { name: 'Tickets', href: '/intrendapp/tickets', icon: '/svg/tickets-ticket-svgrepo-com.svg', key: 'ticket' },
      { name: 'Customers', href: '/intrendapp/customers', icon: '/svg/icons8-customer-100.png', key: 'customer' },
      { name: 'Vendors', href: '/intrendapp/vendors', icon: '/svg/people-svgrepo-com.svg', key: 'vendor' },
      { name: 'People', href: '/intrendapp/people', icon: '/svg/users-svgrepo-com.svg', key: 'people' },
      { name: 'Attributes', href: '/intrendapp/attributes', icon: '/svg/edit-attributes-svgrepo-com.svg' },
      { name: 'Whatsapp', href: '/intrendapp/whatsapp', icon: 'inline', key: 'whatsapp' },
      { name: 'Integrations', href: '/intrendapp/integrations', icon: 'inline', key: 'integrations' },
    ],
    general_user: [
      { name: 'Dashboard', href: '/intrendapp/customersDashboard', icon: '/svg/dashboard-4-svgrepo-com.svg', key: 'customer-dashboard' },
    ],
  };

  return (
    <div className="flex h-full">
      {authValid && (
        <aside
          onMouseEnter={() => setIsExpanded(true)}
          onMouseLeave={() => setIsExpanded(false)}
          className={`bg-gray-800 text-white hidden md:block sticky top-16 h-[calc(100vh-4rem)] transition-all duration-500 ${isExpanded ? "w-64" : "w-16"}`}
        >
          <nav className="p-4">
            <ul className="space-y-4">
              {roleMap[userRole]?.map(({ name, href, icon, key }) => (
                <li key={name} onClick={() => key && handleLinkClick(key)}>
                  <Link
                    href={href}
                    className={`flex items-center ${isExpanded ? "justify-start space-x-2" : "justify-center"} text-lg hover:bg-gray-700 p-2 rounded block`}
                  >
                    {icon === 'inline'
                      ? renderInlineSvg(name)
                      : (
                        <Image
                          src={icon}
                          alt={name}
                          width={name === 'Customers' || name === 'People' ? 28 : 24}
                          height={name === 'Customers' || name === 'People' ? 28 : 24}
                          className={`${name === 'Customers' ? 'min-w-[1.75rem]' : 'min-w-[1.5rem]'} brightness-0 invert`}
                        />
                      )}
                    <span
                      className={`transition-opacity duration-500 ${isExpanded ? "opacity-100" : "opacity-0 w-0 overflow-hidden"}`}
                    >
                      {name.includes('Dashboard') && name.split(' ').length > 1
                        ? name.split(' ').map((w, i) => <span key={i} className="mr-1">{w}</span>)
                        : name}
                    </span>
                  </Link>
                </li>
              ))}
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
