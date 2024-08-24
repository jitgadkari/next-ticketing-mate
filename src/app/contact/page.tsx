"use client";

import pb from "@/lib/pocketbase";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const Contact = () => {
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
  <div className="flex items-center justify-center min-h-screen bg-gray-100">
    <h1 className="text-4xl font-bold">Contact Page</h1>
  </div>
);}

export default Contact;
