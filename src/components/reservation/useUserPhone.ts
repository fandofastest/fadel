"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

export default function useUserPhone() {
  const { data: session, status } = useSession();
  const [phone, setPhone] = useState<string>("-");
  
  useEffect(() => {
    // Metode 1: Coba dapatkan dari sesi
    if (session?.user?.phone) {
      console.log('Phone dari sesi:', session.user.phone);
      setPhone(session.user.phone);
      return;
    }
    
    // Metode 2: Coba dapatkan dari API jika sesi tidak memilikinya
    const fetchPhoneFromAPI = async () => {
      if (!session?.user?.id) return;
      
      try {
        const res = await fetch(`/api/users/${session.user.id}`);
        const data = await res.json();
        console.log('Data user dari API:', data);
        
        if (data.success && data.data && data.data.phone) {
          console.log('Phone dari API:', data.data.phone);
          setPhone(data.data.phone);
        }
      } catch (error) {
        console.error('Error mengambil data phone:', error);
      }
    };
    
    if (status === "authenticated" && !session?.user?.phone) {
      fetchPhoneFromAPI();
    }
  }, [session, status]);
  
  return phone;
}
