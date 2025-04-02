"use client";

import { isAuthenticated } from "@/utils/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const About = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsAuthenticated(isAuthenticated);

    // Listen for storage events to detect auth changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'access_token') {
        setIsAuthenticated(isAuthenticated);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  if (isAuthenticated) {
    router.push('/intrendapp/tickets');
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-4xl font-bold">About Page</h1>
    </div>
  );
};

export default About;
