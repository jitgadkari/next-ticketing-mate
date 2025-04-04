"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated } from '@/utils/auth';
import Link from 'next/link';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated()) {
      router.push('/intrendapp/dashboard');
    }
  }, [router]);

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4 text-center">
      <h1 className="text-5xl font-bold text-gray-800 mb-4">Welcome to <span className="text-blue-600">Textura</span></h1>
      <p className="text-lg text-gray-600 max-w-xl">
        Textura is your all-in-one solution for managing textile industry workflows. From vendor and customer management to integrated communication and ticket resolution, we streamline operations so you can focus on quality and production.
      </p>

      <div className="mt-8 space-x-4">
        <Link href="/login" className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition">Login</Link>
        <Link href="/about" className="text-blue-600 hover:underline">Learn more</Link>
      </div>

      <div className="mt-12">
        <h2 className="text-2xl font-semibold text-gray-700 mb-2">Why Choose Textura?</h2>
        <ul className="text-gray-600 list-disc list-inside max-w-md mx-auto space-y-1">
          <li>Manage textile production requests and logistics in one place</li>
          <li>Real-time collaboration with vendors and customers</li>
          <li>Track communications via WhatsApp and Email integration</li>
          <li>Custom workflows tailored to textile businesses</li>
          <li>Role-based access for admins, vendors, and customers</li>
        </ul>
      </div>
    </main>
  );
}
