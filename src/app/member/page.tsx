import React from "react";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { nextAuthOptions } from "../api/auth/[...nextauth]/options";
import LatestReservations from '@/components/member/LatestReservations';
import MemberLayout from '@/components/member/MemberLayout';

// Fungsi untuk mendapatkan data sesi dan autentikasi dari server
async function getSessionData() {
  const session = await getServerSession(nextAuthOptions);
  
  // Debug log
  console.log("Session in member page:", JSON.stringify(session, null, 2));
  
  if (!session || !session.user) {
    console.log("No session found, redirecting to signin");
    return { authenticated: false, user: null };
  }
  
  const user = session.user;
  console.log("User role:", user.role);
  
  if (user.role !== "customer") {
    console.log("User not customer, redirecting to home");
    return { authenticated: false, user: null };
  }
  
  console.log("User authenticated as customer");
  return { authenticated: true, user };
}

export default async function MemberHome() {
  // Ambil data sesi dari server
  const { authenticated, user } = await getSessionData();
  
  // Redirect jika tidak terautentikasi
  if (!authenticated) {
    redirect("/signin");
  }
  
  // Pastikan user tidak null untuk TypeScript
  if (!user) {
    redirect("/signin");
  }

  // Data member dari session
  const memberData = {
    user: {
      name: user.name || "Member",
      email: user.email,
      id: user.id,
    },
  };
  
  return (
    <MemberLayout title="Member Dashboard">
      {/* Informasi dashboard member */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Selamat Datang, {memberData.user.name.split(' ')[0]}!</h2>
          <p className="text-gray-600 dark:text-gray-400">Email: {memberData.user.email}</p>
        </div>
        
        {/* Dashboard menu utama */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <a href="/member/reservasi" className="bg-green-600 text-white p-6 rounded-lg shadow-md hover:bg-green-700 transition-all font-bold border-2 border-green-700">
            <h3 className="text-lg font-bold mb-2">Reservasi Baru</h3>
            <p className="text-sm opacity-90">Buat reservasi lapangan futsal</p>
          </a>
          
          <a href="/member/bookings" className="bg-indigo-600 text-white p-6 rounded-lg shadow-md hover:bg-indigo-700 transition-all">
            <h3 className="text-lg font-semibold mb-2">Riwayat Booking</h3>
            <p className="text-sm opacity-90">Lihat riwayat reservasi Anda</p>
          </a>
          
          <a href="/member/profile" className="bg-emerald-600 text-white p-6 rounded-lg shadow-md hover:bg-emerald-700 transition-all">
            <h3 className="text-lg font-semibold mb-2">Profil Saya</h3>
            <p className="text-sm opacity-90">Edit informasi pribadi Anda</p>
          </a>
        </div>
        
        {/* Komponen client untuk Reservasi terbaru bulan ini */}
        <LatestReservations />
      </div>
    </MemberLayout>
  );
}
