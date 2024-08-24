import './globals.css';
import TopNavBar from './components/navbar/TopNavBar';
import SideNav from './components/navbar/SideNavBar';
export default function RootLayout({ children }: { children: React.ReactNode }) {


  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen">
        <TopNavBar/>
            <SideNav>
            {children}
            </SideNav>
      </body>
    </html>
  );
}
