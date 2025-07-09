"use client";
import { useSession } from "next-auth/react";

export default function useUserName() {
  const { data: session, status } = useSession();
  console.log('useUserName session:', session);
  console.log('useUserName status:', status);
  return session?.user?.name || "-";
}
