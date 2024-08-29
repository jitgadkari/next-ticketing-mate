import './globals.css';
import TopNavBar from './components/navbar/TopNavBar';
import SideNav from './components/navbar/SideNavBar';
import { Toaster } from 'react-hot-toast';
export default function RootLayout({ children }: { children: React.ReactNode }) {


  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen">
        <TopNavBar/>
            <SideNav>
            <Toaster position="bottom-center" />
            {children}
            </SideNav>
      </body>
    </html>
  );
}
