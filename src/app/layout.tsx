'use client';

import './globals.css';
import TopNavBar from './components/navbar/TopNavBar';
import SideNav from './components/navbar/SideNavBar';
import { Toaster } from 'react-hot-toast';
import { SignupProvider } from '@/contexts/SignupContext';
import { usePathname } from 'next/navigation';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname === '/login' || pathname === '/signup';
  const hideNavbar = isAuthPage || pathname === '/' || pathname === '/about';

  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen">
        <SignupProvider>
          {!hideNavbar && <TopNavBar />}
          {!hideNavbar ? (
            <SideNav>
              <Toaster position="bottom-center" />
              {children}
            </SideNav>
          ) : (
            <>
              <Toaster position="bottom-center" />
              {children}
            </>
          )}
        </SignupProvider>
      </body>
    </html>
  );
}
