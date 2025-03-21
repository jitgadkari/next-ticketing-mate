"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated } from '@/utils/auth';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated()) {
      router.push('/intrendapp/dashboard');
    } else {
      router.push('/login');
    }
  }, [router]);

  return null; // or a loading spinner if you prefer
}

