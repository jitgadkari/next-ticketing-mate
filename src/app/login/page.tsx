"use client";

import { useState, FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import pb from "../../lib/pocketbase";

const Login = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const router = useRouter();

  const [authValid, setIsAuthValid] = useState(pb.authStore.isValid);

  useEffect(() => {
    const unsubscribe = pb.authStore.onChange(() => {
      setIsAuthValid(pb.authStore.isValid);
    });

    // Cleanup the listener on component unmount
    return () => unsubscribe();
  }, []);
  if (authValid) {
    router.push("/intrendapp/tickets");
  }
  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await pb.collection("users").authWithPassword(email, password);
      router.push("/intrendapp/dashboard");
    } catch (err) {
      setError("Invalid email or password");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded shadow-md">
        <h2 className="text-2xl font-bold text-center">Login</h2>
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="block text-gray-700">Email</label>
            <input
              type="email"
              className="w-full p-2 border border-gray-300 rounded mt-1"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Password</label>
            <input
              type="password"
              className="w-full p-2 border border-gray-300 rounded mt-1"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="text-red-500">{error}</p>}
          <button
            type="submit"
            className="w-full p-2 text-white bg-blue-500 rounded"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
