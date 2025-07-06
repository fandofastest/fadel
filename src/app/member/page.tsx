import React from "react";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { nextAuthOptions } from "../api/auth/[...nextauth]/options";

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

  // Contoh data untuk dashboard
  const memberData = {
    stats: {
      totalBookings: 7,
      upcomingBookings: 2,
      lastBookingDate: "01/07/2025",
    },
    user: {
      name: user.name || "Member",
      email: user.email,
      id: user.id,
    },
  };
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-16 md:pb-0">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Member Dashboard</h1>
        
        {/* Informasi dashboard member */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Selamat Datang, {memberData.user.name.split(' ')[0]}!</h2>
            <p className="text-gray-600 dark:text-gray-400">Email: {memberData.user.email}</p>
          </div>
          
          {/* Dashboard menu utama */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <a href="/member/reservasi" className="bg-primary text-white p-6 rounded-lg shadow-md hover:bg-primary-dark transition-all">
              <h3 className="text-lg font-semibold mb-2">Reservasi Baru</h3>
              <p className="text-sm opacity-90">Buat reservasi lapangan futsal</p>
            </a>
            
            <a href="/member/bookings" className="bg-indigo-600 text-white p-6 rounded-lg shadow-md hover:bg-indigo-700 transition-all">
              <h3 className="text-lg font-semibold mb-2">Riwayat Booking</h3>
              <p className="text-sm opacity-90">{memberData.stats.totalBookings} total, {memberData.stats.upcomingBookings} mendatang</p>
            </a>
            
            <a href="/member/profile" className="bg-emerald-600 text-white p-6 rounded-lg shadow-md hover:bg-emerald-700 transition-all">
              <h3 className="text-lg font-semibold mb-2">Profil Saya</h3>
              <p className="text-sm opacity-90">Edit informasi pribadi Anda</p>
            </a>
          </div>
          
          {/* Booking terakhir */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-2">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Booking Terakhir</h3>
              <a href="/member/bookings" className="text-primary hover:underline">Lihat Semua</a>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <div className="flex justify-between mb-2">
                <span className="font-medium text-gray-900 dark:text-white">Lapangan 1 - Rumput Sintetis</span>
                <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Terkonfirmasi</span>
              </div>
              <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                <span>01/07/2025 - 19:00-20:00</span>
                <span>Rp 150.000</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Mobile navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg p-2 md:hidden">
          <div className="flex justify-around">
            <a href="/" className="flex flex-col items-center p-2">
              <span className="text-xs mt-1 text-gray-500 dark:text-gray-400">Home</span>
            </a>
            <a href="/member/reservasi" className="flex flex-col items-center p-2">
              <span className="text-xs mt-1 text-gray-500 dark:text-gray-400">Reservasi</span>
            </a>
            <a href="/member/bookings" className="flex flex-col items-center p-2">
              <span className="text-xs mt-1 text-gray-500 dark:text-gray-400">Booking</span>
            </a>
            <a href="/member/profile" className="flex flex-col items-center p-2">
              <span className="text-xs mt-1 text-gray-500 dark:text-gray-400">Profil</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
