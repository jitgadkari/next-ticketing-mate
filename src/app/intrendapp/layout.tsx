"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import pb from '../../lib/pocketbase';

const IntrendAppLayout = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();

  useEffect(() => {
    if (!pb.authStore.isValid) {
      router.push('/login');
    }
  }, [router]);

  return <>{children}</>;
};

export default IntrendAppLayout;
