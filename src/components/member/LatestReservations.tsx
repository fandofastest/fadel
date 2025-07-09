"use client";

import React, { useEffect, useState } from "react";

// Interface untuk data reservasi
interface CourtInfo {
  _id: string;
  name: string;
  type?: string;
  surface?: string;
}

interface ReservationData {
  _id: string;
  userId: string;
  courtId: CourtInfo;
  date: string;
  slots: number[];
  status: 'UNPAID' | 'PAID' | 'CHECKED_IN' | 'CANCELLED' | 'EXPIRED';
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
}

interface ReservationResponse {
  success: boolean;
  data: ReservationData[] | null;
  message?: string;
}

export default function LatestReservations() {
  const [latestReservationData, setLatestReservationData] = useState<ReservationResponse>({ 
    success: false, 
    data: null 
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLatestReservations();
  }, []);

  const fetchLatestReservations = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/reservations/latest");
      
      if (response.ok) {
        const data = await response.json();
        setLatestReservationData(data);
      } else {
        console.error('Failed to fetch latest reservation, status:', response.status);
        setError(`Failed to fetch data: ${response.status}`);
      }
    } catch (error) {
      console.error('Error fetching latest reservation:', error);
      setError("Error fetching latest reservations");
    } finally {
      setLoading(false);
    }
  };

  // Menampilkan state loading
  if (loading) {
    return (
      <div className="p-4 text-center">
        <div className="animate-pulse flex justify-center">
          <div className="h-4 w-4 bg-gray-400 rounded-full mr-1"></div>
          <div className="h-4 w-4 bg-gray-400 rounded-full mr-1 animate-pulse delay-100"></div>
          <div className="h-4 w-4 bg-gray-400 rounded-full animate-pulse delay-200"></div>
        </div>
        <span className="text-sm mt-2 text-gray-500 dark:text-gray-400">Memuat reservasi terbaru...</span>
      </div>
    );
  }

  // Menampilkan state error
  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg text-center">
        <p className="text-red-600 dark:text-red-400">{error}</p>
        <button 
          onClick={fetchLatestReservations}
          className="mt-2 text-sm text-primary hover:underline"
        >
          Coba lagi
        </button>
      </div>
    );
  }

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-2">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Reservasi Terbaru Bulan Ini</h3>
        <a href="/member/bookings" className="text-primary hover:underline dark:text-yellow-500">Lihat Semua</a>
      </div>
      
      {latestReservationData.success && latestReservationData.data && latestReservationData.data.length > 0 ? (
        <div className="space-y-3">
          {latestReservationData.data.map((reservation: ReservationData) => (
            <div key={reservation._id} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <div className="flex justify-between mb-2">
                <span className="font-medium text-gray-900 dark:text-white">
                  {reservation.courtId?.name} - {reservation.courtId?.surface || reservation.courtId?.type || 'Standard'}
                </span>
                <span className={`px-2 py-1 text-xs rounded-full 
                  ${reservation.status === 'PAID' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 
                    reservation.status === 'UNPAID' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' : 
                    reservation.status === 'CANCELLED' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' : 
                    'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'}`}
                >
                  {reservation.status === 'PAID' ? 'Terkonfirmasi' : 
                   reservation.status === 'UNPAID' ? 'Menunggu Pembayaran' : 
                   reservation.status === 'CANCELLED' ? 'Dibatalkan' : 
                   reservation.status}
                </span>
              </div>
              <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                <span>
                  {new Date(reservation.date).toLocaleDateString('id-ID', {
                    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
                  })} • Jam {reservation.slots.sort().join(', ')}
                </span>
                <span className="font-medium">
                  {new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: 'IDR'
                  }).format(reservation.totalAmount)}
                </span>
              </div>
              <div className="flex justify-between items-center mt-2 text-xs text-gray-500 dark:text-gray-400">
                <span>
                  Dibuat pada {new Date(reservation.createdAt).toLocaleDateString('id-ID')}
                </span>
                <a href={`/member/booking/${reservation._id}`} className="text-sm text-primary hover:underline">Detail</a>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg text-center text-gray-500 dark:text-gray-400">
          Belum ada reservasi bulan ini
        </div>
      )}
    </div>
  );
}
