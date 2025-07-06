import React from "react";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { nextAuthOptions } from "../../api/auth/[...nextauth]/options";

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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-16 md:pb-0">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reservasi Baru</h1>
          <a href="/member" className="text-primary hover:underline">Kembali ke Dashboard</a>
        </div>
        
        {/* Form Reservasi */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Pilih Lapangan dan Waktu</h2>
            
            {/* Tanggal dan Jam */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tanggal Bermain
                </label>
                <input 
                  type="date" 
                  id="date"
                  className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              
              <div>
                <label htmlFor="time" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Jam Mulai
                </label>
                <select 
                  id="time"
                  className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Pilih Jam</option>
                  <option value="08:00">08:00</option>
                  <option value="09:00">09:00</option>
                  <option value="10:00">10:00</option>
                  <option value="11:00">11:00</option>
                  <option value="12:00">12:00</option>
                  <option value="13:00">13:00</option>
                  <option value="14:00">14:00</option>
                  <option value="15:00">15:00</option>
                  <option value="16:00">16:00</option>
                  <option value="17:00">17:00</option>
                  <option value="18:00">18:00</option>
                  <option value="19:00">19:00</option>
                  <option value="20:00">20:00</option>
                  <option value="21:00">21:00</option>
                </select>
              </div>
            </div>
            
            {/* Durasi dan Lapangan */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label htmlFor="duration" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Durasi (jam)
                </label>
                <select 
                  id="duration"
                  className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="1">1 Jam</option>
                  <option value="2">2 Jam</option>
                  <option value="3">3 Jam</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="court" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Pilih Lapangan
                </label>
                <select 
                  id="court"
                  className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Pilih Lapangan</option>
                  <option value="1">Lapangan 1 - Rumput Sintetis</option>
                  <option value="2">Lapangan 2 - Vinyl</option>
                  <option value="3">Lapangan 3 - Interlock</option>
                </select>
              </div>
            </div>
            
            {/* Ketersediaan Jadwal */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Ketersediaan Jadwal</h3>
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <div className="grid grid-cols-4 gap-2">
                  {Array(12).fill(0).map((_, index) => {
                    const hour = 8 + index;
                    const isAvailable = Math.random() > 0.3; // Simulasi ketersediaan acak
                    
                    return (
                      <div 
                        key={index}
                        className={`p-2 text-center rounded ${
                          isAvailable 
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" 
                            : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                        }`}
                      >
                        {`${hour}:00`}
                      </div>
                    );
                  })}
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  Hijau: Tersedia | Merah: Sudah dibooking
                </p>
              </div>
            </div>
            
            {/* Informasi Harga */}
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Informasi Harga</h3>
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600 dark:text-gray-300">Harga per jam:</span>
                  <span className="font-medium text-gray-900 dark:text-white">Rp 150.000</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600 dark:text-gray-300">Durasi:</span>
                  <span className="font-medium text-gray-900 dark:text-white">2 jam</span>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-600 my-2 pt-2">
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-900 dark:text-white">Total:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">Rp 300.000</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Tombol Submit */}
            <div className="flex justify-end">
              <button 
                type="button"
                className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark shadow-md transition-all font-semibold"
              >
                Konfirmasi & Lanjut ke Pembayaran
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg p-2 md:hidden">
          <div className="flex justify-around">
            <a href="/member" className="flex flex-col items-center p-2">
              <span className="text-xs mt-1 text-gray-500 dark:text-gray-400">Dashboard</span>
            </a>
            <a href="/member/reservasi" className="flex flex-col items-center p-2">
              <span className="text-xs mt-1 text-primary font-medium">Reservasi</span>
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
