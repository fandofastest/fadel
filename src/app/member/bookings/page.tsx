import React from "react";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { nextAuthOptions } from "../../api/auth/[...nextauth]/options";

// Contoh data booking untuk demo UI
const dummyBookings = [
  {
    id: "book-1",
    courtName: "Lapangan 1 - Rumput Sintetis",
    date: "01/07/2025",
    time: "19:00-20:00",
    price: 150000,
    status: "confirmed",
    paymentMethod: "Transfer Bank",
  },
  {
    id: "book-2",
    courtName: "Lapangan 2 - Vinyl",
    date: "05/07/2025",
    time: "18:00-19:00",
    price: 130000,
    status: "pending",
    paymentMethod: "QRIS",
  },
  {
    id: "book-3",
    courtName: "Lapangan 1 - Rumput Sintetis",
    date: "10/06/2025",
    time: "16:00-18:00",
    price: 300000,
    status: "completed",
    paymentMethod: "Transfer Bank",
  },
  {
    id: "book-4",
    courtName: "Lapangan 3 - Interlock",
    date: "15/05/2025",
    time: "20:00-21:00",
    price: 120000,
    status: "canceled",
    paymentMethod: "E-wallet",
  },
];

// Fungsi untuk mendapatkan label status yang sesuai
function getStatusBadge(status: string) {
  switch (status) {
    case "confirmed":
      return (
        <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
          Terkonfirmasi
        </span>
      );
    case "pending":
      return (
        <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
          Menunggu Pembayaran
        </span>
      );
    case "completed":
      return (
        <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
          Selesai
        </span>
      );
    case "canceled":
      return (
        <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
          Dibatalkan
        </span>
      );
    default:
      return (
        <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
          {status}
        </span>
      );
  }
}

// Fungsi untuk format currency
function formatCurrency(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-16 md:pb-0">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Riwayat Booking</h1>
          <a href="/member" className="text-primary hover:underline">Kembali ke Dashboard</a>
        </div>
        
        {/* Filter dan Pencarian */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <select className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                <option value="all">Semua Status</option>
                <option value="confirmed">Terkonfirmasi</option>
                <option value="pending">Menunggu Pembayaran</option>
                <option value="completed">Selesai</option>
                <option value="canceled">Dibatalkan</option>
              </select>
              
              <select className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                <option value="all">Semua Lapangan</option>
                <option value="1">Lapangan 1</option>
                <option value="2">Lapangan 2</option>
                <option value="3">Lapangan 3</option>
              </select>
            </div>
            
            <div className="relative">
              <input 
                type="text" 
                placeholder="Cari booking..." 
                className="pl-10 pr-4 py-2 w-full sm:w-64 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>
        
        {/* Daftar Booking */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    ID Booking
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Lapangan
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Tanggal & Jam
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Harga
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Pembayaran
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {dummyBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {booking.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {booking.courtName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      <div>{booking.date}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{booking.time}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {formatCurrency(booking.price)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(booking.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {booking.paymentMethod}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <a href={`/member/bookings/${booking.id}`} className="text-primary hover:underline">Detail</a>
                      {booking.status === "pending" && (
                        <span className="ml-3 text-red-600 hover:underline cursor-pointer">Batalkan</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Mobile view for smaller screens */}
          <div className="sm:hidden">
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {dummyBookings.map((booking) => (
                <div key={booking.id} className="p-4">
                  <div className="flex justify-between mb-2">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{booking.courtName}</h3>
                    {getStatusBadge(booking.status)}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                    {booking.date} - {booking.time}
                  </div>
                  <div className="text-sm text-gray-900 dark:text-white mb-3">
                    {formatCurrency(booking.price)} - {booking.paymentMethod}
                  </div>
                  <div className="flex space-x-4">
                    <a href={`/member/bookings/${booking.id}`} className="text-sm text-primary hover:underline">Detail</a>
                    {booking.status === "pending" && (
                      <span className="text-sm text-red-600 hover:underline cursor-pointer">Batalkan</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Pagination */}
        <div className="flex justify-center my-6">
          <nav className="inline-flex rounded-md shadow">
            <a
              href="#"
              className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <span className="sr-only">Previous</span>
              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </a>
            <a
              href="#"
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              1
            </a>
            <a
              href="#"
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 bg-primary text-sm font-medium text-white"
            >
              2
            </a>
            <a
              href="#"
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              3
            </a>
            <a
              href="#"
              className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <span className="sr-only">Next</span>
              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </a>
          </nav>
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
              <span className="text-xs mt-1 text-primary font-medium">Booking</span>
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
