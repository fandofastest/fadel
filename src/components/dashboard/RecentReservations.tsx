"use client";
import { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";
import Link from "next/link";

interface Reservation {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
  };
  courtId: {
    _id: string;
    name: string;
  };
  date: string;
  slots: number[];
  status: 'UNPAID' | 'PAID' | 'EXPIRED' | 'CHECKED_IN' | 'CANCELLED';
  totalAmount: number;
  createdAt: string;
}

export default function RecentReservations() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/dashboard/recent-reservations');
        if (!response.ok) {
          throw new Error('Failed to fetch reservations');
        }
        const result = await response.json();
        setReservations(result.data);
      } catch (error) {
        console.error('Error fetching reservations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Format currency to IDR
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  // Format relative time
  const formatRelativeTime = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true, locale: id });
    } catch (error) {
      return 'Invalid date';
    }
  };

  // Format slots to readable time
  const formatSlots = (slots: number[]): string => {
    if (!slots || slots.length === 0) return '-';
    const sortedSlots = [...slots].sort((a, b) => a - b);
    return `${sortedSlots[0]}:00 - ${sortedSlots[sortedSlots.length - 1] + 1}:00`;
  };

  // Get status badge color
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'UNPAID':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'EXPIRED':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
      case 'CHECKED_IN':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  // Get status text
  const getStatusText = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'Dibayar';
      case 'UNPAID':
        return 'Belum Bayar';
      case 'EXPIRED':
        return 'Kadaluarsa';
      case 'CHECKED_IN':
        return 'Check In';
      case 'CANCELLED':
        return 'Dibatalkan';
      default:
        return status;
    }
  };

  // Format date to Indonesian format
  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      }).format(date);
    } catch (error) {
      return 'Invalid date';
    }
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <h3 className="text-base font-semibold text-gray-800 dark:text-white/90">
          Reservasi Terbaru
        </h3>
      </div>

      {loading ? (
        <div className="p-3">
          <div className="animate-pulse space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-2 p-2">
                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                <div className="flex-1">
                  <div className="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="h-2 w-16 mt-1 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
                <div className="h-3 w-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      ) : reservations.length === 0 ? (
        <div className="p-3 text-center text-xs text-gray-500 dark:text-gray-400">
          Tidak ada reservasi terbaru
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-gray-50 dark:bg-gray-800/50 text-left">
              <tr>
                <th className="p-2 whitespace-nowrap font-medium text-gray-500 dark:text-gray-400">Pelanggan</th>
                <th className="p-2 whitespace-nowrap font-medium text-gray-500 dark:text-gray-400">Lapangan</th>
                <th className="p-2 whitespace-nowrap font-medium text-gray-500 dark:text-gray-400">Tanggal</th>
                <th className="p-2 whitespace-nowrap font-medium text-gray-500 dark:text-gray-400">Jam</th>
                <th className="p-2 whitespace-nowrap font-medium text-gray-500 dark:text-gray-400">Total</th>
                <th className="p-2 whitespace-nowrap font-medium text-gray-500 dark:text-gray-400">Status</th>
                <th className="p-2 whitespace-nowrap font-medium text-gray-500 dark:text-gray-400">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {reservations.map((reservation) => (
                <tr key={reservation._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                  <td className="p-2 whitespace-nowrap">
                    <div className="font-medium text-gray-900 dark:text-white">{reservation.userId?.name || 'Unknown'}</div>
                    <div className="text-gray-500 dark:text-gray-400">{reservation.userId?.email || ''}</div>
                  </td>
                  <td className="p-2 whitespace-nowrap text-gray-700 dark:text-gray-300">
                    {reservation.courtId?.name || 'Unknown'}
                  </td>
                  <td className="p-2 whitespace-nowrap text-gray-700 dark:text-gray-300">
                    {formatDate(reservation.date)}
                  </td>
                  <td className="p-2 whitespace-nowrap text-gray-700 dark:text-gray-300">
                    {formatSlots(reservation.slots)}
                  </td>
                  <td className="p-2 whitespace-nowrap font-medium text-gray-900 dark:text-white">
                    {formatCurrency(reservation.totalAmount)}
                  </td>
                  <td className="p-2 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-medium ${getStatusBadge(reservation.status)}`}>
                      {getStatusText(reservation.status)}
                    </span>
                  </td>
                  <td className="p-2 whitespace-nowrap">
                    <Link 
                      href={`/admin/reservation/${reservation._id}`}
                      className="text-xs font-medium text-brand-600 hover:text-brand-500 dark:text-brand-400 dark:hover:text-brand-300"
                    >
                      Detail
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      <div className="p-3 border-t border-gray-200 dark:border-gray-800 text-center">
        <Link 
          href="/admin/reservation" 
          className="text-xs font-medium text-brand-600 hover:text-brand-500 dark:text-brand-400 dark:hover:text-brand-300"
        >
          Lihat Semua Reservasi
        </Link>
      </div>
    </div>
  );
}
