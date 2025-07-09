import React from "react";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { nextAuthOptions } from "../../api/auth/[...nextauth]/options";
import MemberLayout from '@/components/member/MemberLayout';
import BookingList from "./BookingList";

// Semua logic digeser ke client component BookingList.tsx

export default async function BookingHistoryPage() {
  // Verifikasi sesi dan role
  const session = await getServerSession(nextAuthOptions);
  
  if (!session || !session.user) {
    redirect("/signin");
  }
  
  if (session.user.role !== "customer") {
    redirect("/");
  }

  return (
    <MemberLayout title="Riwayat Booking" showBackButton={true}>
      {/* BookingList sebagai Client Component */}
      <BookingList />
    </MemberLayout>
  );
}
