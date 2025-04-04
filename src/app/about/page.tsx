'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { isAuthenticated as checkAuth } from '@/utils/auth';
import { Rocket, Info, ShieldCheck, Users, Workflow } from 'lucide-react';
import { motion } from 'framer-motion';

export default function About() {
  const [authenticated, setAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const auth = checkAuth();
    setAuthenticated(auth);

    if (auth) {
      router.push('/intrendapp/tickets');
    }

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'access_token') {
        const updatedAuth = checkAuth();
        setAuthenticated(updatedAuth);
        if (updatedAuth) router.push('/intrendapp/tickets');
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [router]);

  if (authenticated) return null;

  return (
    <main className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-slate-100 py-16 px-4 text-center">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="max-w-3xl mx-auto"
      >
        <h1 className="text-5xl font-bold text-gray-800 mb-6 flex justify-center items-center gap-3">
          <Info className="text-blue-600" size={36} />
          About <span className="text-blue-600">IntSync</span>
        </h1>
        <p className="text-lg text-gray-600 mb-12">
          IntSync is a next-gen platform revolutionizing how the textile industry communicates, collaborates, and tracks operations across vendors and customers.
        </p>
      </motion.div>

      <section className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
        <FeatureCard
          icon={<Rocket className="text-purple-600" size={28} />}
          title="Modern Tech Stack"
          description="Built with Next.js, ShadCN UI, and powerful integrations for optimal performance."
        />
        <FeatureCard
          icon={<Users className="text-green-600" size={28} />}
          title="Multi-role Access"
          description="Seamless workflows for admins, vendors, and customers with role-based permissions."
        />
        <FeatureCard
          icon={<Workflow className="text-orange-500" size={28} />}
          title="Smart Ticketing"
          description="Centralized ticket management with WhatsApp and email communication support."
        />
        <FeatureCard
          icon={<ShieldCheck className="text-blue-500" size={28} />}
          title="Secure & Scalable"
          description="Robust authentication and scalable infrastructure ready for growing businesses."
        />
      </section>
        {/* CTA Section */}
        <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-16 text-center pb-1"
      >
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Ready to transform the way your textile business operates?
        </h2>
        <p className="text-gray-600 mb-6">
          Jump in and explore how <span className="text-blue-600 font-semibold">IntSync</span> can simplify your workflows.
        </p>

        <div className="flex justify-center gap-4 mb-16">
          <a
            href="/login"
            className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition font-medium"
          >
            Get Started Now
          </a>
          <a
            href="/"
            className="border border-blue-600 text-blue-600 px-6 py-3 rounded-md hover:bg-blue-50 transition font-medium"
          >
            Back to Home
          </a>
        </div>
      </motion.div>
    </main>
  );
}

const FeatureCard = ({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) => (
  <motion.div
    whileHover={{ scale: 1.03 }}
    className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition"
  >
    <div className="flex items-center gap-3 mb-3">{icon}<h3 className="text-xl font-semibold text-gray-800">{title}</h3></div>
    <p className="text-gray-600">{description}</p>
  </motion.div>
);
