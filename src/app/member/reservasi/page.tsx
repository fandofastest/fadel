import React from "react";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { nextAuthOptions } from "../../api/auth/[...nextauth]/options";
import MemberLayout from '@/components/member/MemberLayout';

// Import the client wrapper instead of the component directly
import ReservationClientWrapper from "./reservation-client";

export default async function ReservasiPage() {
  // Verifikasi sesi dan role
  const session = await getServerSession(nextAuthOptions);
  
  if (!session || !session.user) {
    redirect("/signin");
  }
  
  if (session.user.role !== "customer") {
    redirect("/");
  }

  return (
    <MemberLayout title="Reservasi Baru" showBackButton={true}>
      {/* Komponen Reservasi dengan UI Pilihan Slot */}
      <ReservationClientWrapper />
    </MemberLayout>
  );
}
