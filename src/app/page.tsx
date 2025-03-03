"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.push('/intrendapp');
      } else {
        router.push('/login');
      }
    };

    checkAuth();
  }, [router]);

  return null; // or a loading spinner if you prefer
}

