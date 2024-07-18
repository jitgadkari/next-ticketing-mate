"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import pb from '../../lib/pocketbase';

const IntrendApp = () => {
  const router = useRouter();

  useEffect(() => {
    if (!pb.authStore.isValid) {
      router.push('/login');
    }
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-4xl font-bold">Welcome to IntrendApp</h1>
    </div>
  );
};

export default IntrendApp;
