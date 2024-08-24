'use client'
import pb from "@/lib/pocketbase";
import { useRouter } from 'next/navigation';
import { useEffect, useState } from "react";

const Home = () => {
  const [authValid, setIsAuthValid] = useState(pb.authStore.isValid);
  const router= useRouter()
  useEffect(() => {
      const unsubscribe = pb.authStore.onChange(() => {
          setIsAuthValid(pb.authStore.isValid);
      });

      // Cleanup the listener on component unmount
      return () => unsubscribe();
  }, []);
if(authValid){
router.push('/intrendapp/tickets')
}
  return(
  <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
    <h1 className="text-6xl font-extrabold text-center text-gray-800 mb-4">
      Welcome
    </h1>
    <h2 className="text-2xl font-medium text-center text-gray-600">
      to the client portal
    </h2>
  </div>
);
}
export default Home;
