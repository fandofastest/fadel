import React from "react";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { nextAuthOptions } from "../../api/auth/[...nextauth]/options";

export default async function MemberProfilePage() {
  // Verifikasi sesi dan role
  const session = await getServerSession(nextAuthOptions);
  
  if (!session || !session.user) {
    redirect("/signin");
  }
  
  if (session.user.role !== "customer") {
    redirect("/");
  }

  // Data profil dari session
  const user = {
    id: session.user.id,
    name: session.user.name || "Member",
    email: session.user.email,
    // Tambahkan data dummy untuk tampilan
    phone: "0812-3456-7890",
    address: "Jl. Futsal Indah No. 123, Jakarta",
    createdAt: "01 Januari 2025"
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-16 md:pb-0">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Profil Saya</h1>
          <a href="/member" className="text-primary hover:underline">Kembali ke Dashboard</a>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          {/* Informasi profil dasar */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center text-white text-3xl font-bold">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">{user.name}</h2>
                <p className="text-gray-500 dark:text-gray-400 mb-2">{user.email}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Member sejak: {user.createdAt}</p>
              </div>
              <div className="mt-4 md:mt-0">
                <button 
                  type="button"
                  className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark transition-all"
                >
                  Ubah Foto Profil
                </button>
              </div>
            </div>
          </div>
          
          {/* Form edit profil */}
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Edit Informasi Profil</h3>
            <form>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nama Lengkap
                  </label>
                  <input 
                    type="text" 
                    id="name"
                    defaultValue={user.name}
                    className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email
                  </label>
                  <input 
                    type="email" 
                    id="email"
                    defaultValue={user.email}
                    className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                    readOnly
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Email tidak dapat diubah</p>
                </div>
                
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nomor Telepon
                  </label>
                  <input 
                    type="tel" 
                    id="phone"
                    defaultValue={user.phone}
                    className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                
                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Alamat
                  </label>
                  <input 
                    type="text" 
                    id="address"
                    defaultValue={user.address}
                    className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
              
              {/* Ubah Password */}
              <div className="mt-8 mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Ubah Password</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Password Saat Ini
                    </label>
                    <input 
                      type="password" 
                      id="currentPassword"
                      className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  
                  <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Password Baru
                      </label>
                      <input 
                        type="password" 
                        id="newPassword"
                        className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Konfirmasi Password Baru
                      </label>
                      <input 
                        type="password" 
                        id="confirmPassword"
                        className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Tombol Simpan */}
              <div className="flex justify-end mt-8">
                <button
                  type="button" 
                  className="px-6 py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary-dark transition-colors shadow-md"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
          
          {/* Danger Zone */}
          <div className="p-6 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-red-600 dark:text-red-500 mb-4">Danger Zone</h3>
            <div className="flex items-center justify-between p-4 border border-red-200 dark:border-red-900 rounded-lg bg-red-50 dark:bg-gray-900">
              <div>
                <h4 className="font-medium text-red-800 dark:text-red-500">Hapus Akun</h4>
                <p className="text-sm text-red-600 dark:text-red-400">Tindakan ini tidak dapat dibatalkan. Semua data Anda akan dihapus secara permanen.</p>
              </div>
              <button
                type="button"
                className="px-4 py-2 bg-white dark:bg-gray-800 text-red-600 border border-red-600 rounded hover:bg-red-600 hover:text-white dark:hover:bg-red-900 transition-colors"
              >
                Hapus Akun
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
              <span className="text-xs mt-1 text-gray-500 dark:text-gray-400">Reservasi</span>
            </a>
            <a href="/member/bookings" className="flex flex-col items-center p-2">
              <span className="text-xs mt-1 text-gray-500 dark:text-gray-400">Booking</span>
            </a>
            <a href="/member/profile" className="flex flex-col items-center p-2">
              <span className="text-xs mt-1 text-primary font-medium">Profil</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
