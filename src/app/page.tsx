'use client';
import React from 'react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated } from '@/utils/auth';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sparkles, Factory, MessageCircleHeart, Users, Workflow } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated()) {
      router.push('/intrendapp/dashboard');
    }
  }, [router]);

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 px-4 text-center">
      <motion.div 
        initial={{ opacity: 0, y: -30 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.7 }}
      >
        <h1 className="text-5xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Sparkles className="text-blue-600 animate-bounce-slow" size={40} />
          Welcome to <span className="text-blue-600">IntSync</span>
        </h1>
        <p className="text-lg text-gray-600 max-w-xl mx-auto">
          IntSync is your all-in-one solution for managing textile industry workflows. From vendor and customer management to integrated communication and ticket resolution, we streamline operations so you can focus on quality and production.
        </p>
      </motion.div>

      <div className="mt-8 flex flex-wrap gap-4 justify-center">
        <Link href="/login">
          <Button size="lg">Login</Button>
        </Link>
        <Link href="/about">
          <Button variant="outline" size="lg">Learn more</Button>
        </Link>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ delay: 0.5, duration: 0.8 }}
        className="mt-16 max-w-3xl w-full"
      >
        <h2 className="text-2xl font-semibold text-gray-700 mb-6">Why Choose IntSync?</h2>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-gray-700 text-left">
          <li className="flex items-start gap-3">
            <Factory className="text-blue-500" />
            Manage textile production requests and logistics in one place
          </li>
          <li className="flex items-start gap-3">
            <Users className="text-purple-500" />
            Real-time collaboration with vendors and customers
          </li>
          <li className="flex items-start gap-3">
            <MessageCircleHeart className="text-green-500" />
            Track communications via WhatsApp and Email integration
          </li>
          <li className="flex items-start gap-3">
            <Workflow className="text-orange-500" />
            Custom workflows tailored to textile businesses
          </li>
          <li className="flex items-start gap-3 col-span-full sm:col-span-1">
            <Sparkles className="text-pink-500 animate-pulse" />
            Role-based access for admins, vendors, and customers
          </li>
        </ul>
      </motion.div>
    </main>
  );
}
