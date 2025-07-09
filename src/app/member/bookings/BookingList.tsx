"use client";

import React, { useEffect, useState } from "react";

// Tipe untuk booking
interface Booking {
  id: string;
  courtName: string;
  date: string;
  time: string;
  price: number;
  status: string;
  paymentMethod: string;
  createdAt?: string;
}

interface BookingsResponse {
  bookings: Booking[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

// Fungsi untuk mendapatkan label status yang sesuai
function getStatusBadge(status: string) {
  switch (status) {
    case "confirmed":
    case "PAID":
      return (
        <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
          Terkonfirmasi
        </span>
      );
    case "pending":
    case "UNPAID":
      return (
        <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
          Menunggu Pembayaran
        </span>
      );
    case "completed":
    case "CHECKED_IN":
      return (
        <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
          Selesai
        </span>
      );
    case "canceled":
    case "CANCELLED":
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

// Interface untuk court data
interface Court {
  _id: string;
  name: string;
  surface?: string;
  type?: string;
}

export default function BookingList() {
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelTarget, setCancelTarget] = useState<Booking | null>(null);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  function openCancelDialog(booking: Booking) {
    setCancelTarget(booking);
    setCancelDialogOpen(true);
    setCancelError(null);
  }

  async function handleCancelBooking() {
    if (!cancelTarget) return;
    setCancelLoading(true);
    setCancelError(null);
    try {
      const res = await fetch(`/api/reservations/${cancelTarget.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'CANCELLED' })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Gagal membatalkan booking');
      }
      setCancelDialogOpen(false);
      setCancelTarget(null);
      // Refresh bookings
      fetchBookings();
    } catch (err: any) {
      setCancelError(err.message || 'Gagal membatalkan booking');
    } finally {
      setCancelLoading(false);
    }
  }
  const [bookingsData, setBookingsData] = useState<BookingsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [courts, setCourts] = useState<Court[]>([]);
  const [courtsLoading, setCourtsLoading] = useState<boolean>(true);
  const [searchParams, setSearchParams] = useState({
    status: "all",
    courtId: "all",
    search: "",
    page: 1
  });

  // Effect untuk fetch data booking
  useEffect(() => {
    fetchBookings();
  }, [searchParams]);
  
  // Effect untuk fetch data courts
  useEffect(() => {
    fetchCourts();
  }, []);
  
  // Fungsi untuk fetch data courts
  const fetchCourts = async () => {
    try {
      setCourtsLoading(true);
      const response = await fetch('/api/courts');
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.success && data.data) {
        setCourts(data.data);
      } else {
        throw new Error(data.message || "Failed to fetch courts");
      }
    } catch (error: any) {
      console.error("Error fetching courts:", error.message);
    } finally {
      setCourtsLoading(false);
    }
  };

  // Handle perubahan filter
  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSearchParams(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
      page: 1 // Reset ke halaman pertama saat mengubah filter
    }));
  };

  // Handle perubahan pencarian
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchParams(prev => ({
      ...prev,
      search: e.target.value,
      page: 1
    }));
  };

  // Handle pindah halaman
  const handlePageChange = (newPage: number) => {
    setSearchParams(prev => ({
      ...prev,
      page: newPage
    }));
  };

  // Fungsi untuk fetch data booking
  const fetchBookings = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      
      if (searchParams.status !== "all") {
        queryParams.append("status", searchParams.status);
      }
      
      if (searchParams.courtId !== "all") {
        queryParams.append("courtId", searchParams.courtId);
      }
      
      if (searchParams.search) {
        queryParams.append("search", searchParams.search);
      }
      
      queryParams.append("page", searchParams.page.toString());
      
      // Gunakan API yang sama dengan yang digunakan di /member
      // Gunakan API dengan filter dan pagination
      const response = await fetch(`/api/reservations/latest?${queryParams.toString()}`);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || "Failed to fetch bookings");
      }
      
      console.log('API response:', data);
      
      // Transform data sesuai format yang dibutuhkan
      const transformedBookings = data.data ? data.data.map((item: any) => {
        // Format tanggal
        const date = new Date(item.date);
        const formattedDate = date.toLocaleDateString('id-ID', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        });
        
        const slots = item.timeSlots || item.slots || [];
        const startTime = slots[0];
        const endTime = slots[slots.length - 1] + 1;
        const formattedTime = `${String(startTime).padStart(2, '0')}:00-${String(endTime).padStart(2, '0')}:00`;
        
        return {
          id: item._id,
          courtName: item.courtId ? `${item.courtId.name} - ${item.courtId.type || item.courtId.surface || 'Standard'}` : 'Lapangan tidak tersedia',
          date: formattedDate,
          time: formattedTime,
          price: item.totalAmount || 0,
          status: item.status,
          paymentMethod: "Transfer Bank", // Default karena data ini mungkin tidak tersedia
          createdAt: item.createdAt
        };
      }) : [];
      
      // Gunakan data pagination dari API
      setBookingsData({
        bookings: transformedBookings,
        pagination: data.pagination || {
          total: data.data ? data.data.length : 0,
          page: searchParams.page,
          limit: 10,
          totalPages: Math.ceil((data.data ? data.data.length : 0) / 10),
          hasNextPage: false,
          hasPrevPage: searchParams.page > 1
        }
      });
      setError(null);
    } catch (err: any) {
      console.error('Error fetching bookings:', err);
      setError(err.message || "Failed to load booking data");
    } finally {
      setLoading(false);
    }
  };

  // Menampilkan state loading
  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-pulse flex justify-center">
          <div className="h-5 w-5 bg-gray-400 rounded-full mr-1"></div>
          <div className="h-5 w-5 bg-gray-400 rounded-full mr-1 animate-pulse delay-100"></div>
          <div className="h-5 w-5 bg-gray-400 rounded-full animate-pulse delay-200"></div>
        </div>
        <p className="mt-4 text-gray-500 dark:text-gray-400">Memuat data booking...</p>
      </div>
    );
  }

  // Menampilkan state error
  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-lg text-center">
        <p className="text-red-600 dark:text-red-400">{error}</p>
        <button 
          onClick={fetchBookings}
          className="mt-4 px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark transition-all"
        >
          Coba lagi
        </button>
      </div>
    );
  }

  const bookings = bookingsData?.bookings || [];
  const pagination = bookingsData?.pagination || {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false
  };
  
  // Toggle accordion item
  const toggleAccordion = (id: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  return (
    <>
      {/* Filter dan Pencarian */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <select 
              name="status"
              value={searchParams.status}
              onChange={handleFilterChange}
              className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="all">Semua Status</option>
              <option value="PAID">Terkonfirmasi</option>
              <option value="UNPAID">Menunggu Pembayaran</option>
              <option value="CHECKED_IN">Selesai</option>
              <option value="CANCELLED">Dibatalkan</option>
            </select>
            
            <select 
              name="courtId"
              value={searchParams.courtId}
              onChange={handleFilterChange}
              className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              disabled={courtsLoading}
            >
              <option value="all">Semua Lapangan</option>
              {courtsLoading ? (
                <option value="loading">Memuat data lapangan...</option>
              ) : (
                courts.map((court) => (
                  <option key={court._id} value={court._id}>
                    {court.name} - {court.surface || court.type || 'Standard'}
                  </option>
                ))
              )}
            </select>
          </div>
          
          <div className="relative">
            <input 
              type="text" 
              placeholder="Cari booking..." 
              value={searchParams.search}
              onChange={handleSearchChange}
              className="pl-10 pr-4 py-2 w-full sm:w-64 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>
      
      {/* Daftar Booking */}
      
      {/* Desktop View - Tabel */}
      <div className="hidden md:block bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          {bookings.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">Anda belum memiliki booking</p>
            </div>
          ) : (
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
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {bookings.map((booking: Booking) => (
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm dark:text-yellow-500">
                    <a href={`/member/booking/${booking.id}`} className="text-primary hover:underline">Detail</a>
                    {(booking.status === "pending" || booking.status === "UNPAID") && (
                      <span
                        className="ml-3 text-red-600 hover:underline cursor-pointer"
                        onClick={() => openCancelDialog(booking)}
                      >
                        Batalkan
                      </span>
                    )}
                  </td>
                </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
        
      {/* Mobile view - Accordion Style */}
      <div className="block md:hidden">
        <div className="space-y-3">
          {bookings.length === 0 ? (
            <div className="text-center py-8 bg-white dark:bg-gray-800 rounded-lg shadow">
              <p className="text-gray-500 dark:text-gray-400">Anda belum memiliki booking</p>
            </div>
          ) : (
            bookings.map((booking: Booking) => (
              <div key={booking.id} className="mb-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
                {/* Accordion Header - Always visible */}
                <div 
                  className="p-4 flex items-center justify-between cursor-pointer bg-white dark:bg-gray-800"
                  onClick={() => toggleAccordion(booking.id)}
                >
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 dark:text-white">{booking.courtName}</h3>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {booking.date}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div>{getStatusBadge(booking.status)}</div>
                    <div className="bg-gray-100 dark:bg-gray-700 rounded-full p-1">
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        className={`h-5 w-5 text-gray-500 dark:text-gray-400 transition-transform duration-300 ${expandedItems[booking.id] ? 'transform rotate-180' : ''}`} 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
                
                {/* Accordion Content - Animated */}
                <div 
                  className={`overflow-hidden transition-all duration-300 ${expandedItems[booking.id] ? 'max-h-72' : 'max-h-0'}`}
                >
                  <div className="p-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500 dark:text-gray-400">Waktu:</span>
                        <span className="text-gray-900 dark:text-white font-medium">{booking.time}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500 dark:text-gray-400">Harga:</span>
                        <span className="text-gray-900 dark:text-white font-medium">{formatCurrency(booking.price)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500 dark:text-gray-400">ID Booking:</span>
                        <span className="text-gray-900 dark:text-white text-xs font-mono overflow-hidden text-ellipsis">{booking.id}</span>
                      </div>
                      
                      <div className="pt-3 mt-1 border-t border-gray-200 dark:border-gray-600 flex justify-end space-x-4">
                        <a 
                          href={`/member/booking/${booking.id}`} 
                          className="text-sm bg-primary text-white px-3 py-1 rounded-md hover:bg-primary-dark"
                        >
                          Detail
                        </a>
                        {(booking.status === "pending" || booking.status === "UNPAID") && (
                          <button
                            className="text-sm bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700"
                            onClick={(e) => {
                              e.stopPropagation();
                              openCancelDialog(booking);
                            }}
                          >
                            Batalkan
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      
      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center my-6">
          <nav className="inline-flex rounded-md shadow">
            <button
              onClick={() => pagination.hasPrevPage && handlePageChange(pagination.page - 1)}
              disabled={!pagination.hasPrevPage}
              className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium ${pagination.hasPrevPage ? 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700' : 'text-gray-300 dark:text-gray-600 cursor-not-allowed'}`}
            >
              <span className="sr-only">Previous</span>
              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </button>
            
            {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => {
              const pageNum = i + 1;
              const isCurrentPage = pageNum === pagination.page;
              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 ${isCurrentPage ? 'bg-primary text-white' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'} text-sm font-medium`}
                >
                  {pageNum}
                </button>
              );
            })}
            
            <button
              onClick={() => pagination.hasNextPage && handlePageChange(pagination.page + 1)}
              disabled={!pagination.hasNextPage}
              className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium ${pagination.hasNextPage ? 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700' : 'text-gray-300 dark:text-gray-600 cursor-not-allowed'}`}
            >
              <span className="sr-only">Next</span>
              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </button>
          </nav>
        </div>
      )}
      {/* Dialog Konfirmasi Batalkan */}
      {cancelDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-sm text-center">
            <h2 className="text-lg font-bold mb-3 text-gray-900 dark:text-white">Batalkan Booking?</h2>
            <p className="mb-4 text-gray-700 dark:text-gray-200">Apakah Anda yakin ingin membatalkan booking ini?</p>
            {cancelError && <div className="text-red-600 mb-2 text-sm">{cancelError}</div>}
            <div className="flex justify-center gap-4">
              <button
                className="px-6 py-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-white font-medium shadow"
                onClick={() => { setCancelDialogOpen(false); setCancelTarget(null); setCancelError(null); }}
                disabled={cancelLoading}
              >
                Tidak
              </button>
              <button
                className={`px-6 py-2 rounded bg-red-600 text-white font-semibold shadow ${cancelLoading ? 'opacity-60' : ''}`}
                onClick={handleCancelBooking}
                disabled={cancelLoading}
              >
                {cancelLoading ? 'Membatalkan...' : 'Ya, Batalkan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
