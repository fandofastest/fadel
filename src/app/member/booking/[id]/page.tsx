"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import LogoutButtonClient from '@/app/member/LogoutButtonClient';
import QRCode from 'react-qr-code';
import InvoiceButton from '../components/InvoiceButton';

// Interface untuk data reservasi
interface CourtInfo {
  _id: string;
  name: string;
  type?: string;
  surface?: string;
  price: number;
}

interface UserInfo {
  _id: string;
  name: string;
  email: string;
}

interface PaymentInfo {
  _id: string;
  amount: number;
  status: string;
  method?: string | { _id: string; name: string };
  reference?: string;
  createdAt: string;
}

interface ReservationData {
  _id: string;
  userId: UserInfo;
  courtId: CourtInfo;
  date: string;
  slots: number[];
  status: 'UNPAID' | 'PAID' | 'CHECKED_IN' | 'CANCELLED' | 'EXPIRED';
  totalAmount: number;
  paymentId?: string;
  paymentData?: PaymentInfo;
  createdAt: string;
  updatedAt: string;
}

interface ReservationResponse {
  success: boolean;
  data: ReservationData | null;
  message?: string;
}

export default function BookingDetailPage() {
  // Gunakan useParams() hook untuk mendapatkan parameter dari URL
  const params = useParams();
  const bookingId = params.id as string;
  const router = useRouter();
  const [reservation, setReservation] = useState<ReservationData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // State untuk modal QR code
  const [showQRModal, setShowQRModal] = useState<boolean>(false);

  // Handler untuk tombol Bayar Sekarang
  const handlePayNow = () => {
    console.log(reservation?.paymentData?.reference);
    if (reservation?.paymentData?.reference && reservation?.totalAmount) {
      const merchantRef = reservation.paymentData.reference;
      const amount = reservation.totalAmount;
      // Gunakan URL relatif dengan parameter amount
      const paymentUrl = `/payment/auto/${merchantRef}?amount=${amount}`;
      console.log('Redirecting to:', paymentUrl);
      window.location.href = paymentUrl;
    } else {
      console.error('Missing payment reference or amount for redirect');
    }
  };

  useEffect(() => {
    const fetchReservationDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/reservations/${bookingId}`);
        
        if (response.ok) {
          const data = await response.json() as ReservationResponse;
          if (data.success && data.data) {
            setReservation(data.data);
          } else {
            setError(data.message || "Gagal memuat data reservasi");
          }
        } else if (response.status === 401) {
          // Redirect to login if unauthorized
          router.push('/signin');
        } else if (response.status === 403) {
          setError("Anda tidak memiliki akses ke reservasi ini");
        } else if (response.status === 404) {
          setError("Reservasi tidak ditemukan");
        } else {
          setError(`Error ${response.status}: Gagal memuat detail reservasi`);
        }
      } catch (error) {
        setError("Gagal memuat detail reservasi");
        console.error("Error fetching reservation details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReservationDetails();
  }, [bookingId, router]);

  // Format tanggal Indonesia
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      weekday: 'long', 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric'
    });
  };

  // Format waktu slots - menampilkan rentang waktu 1 jam untuk setiap slot
  const formatSlots = (slots: number[]) => {
    if (!slots || slots.length === 0) return "-";
    const sortedSlots = [...slots].sort((a, b) => a - b);
    return sortedSlots.map(slot => {
      const startHour = slot.toString().padStart(2, '0');
      const endHour = (slot + 1).toString().padStart(2, '0');
      return `${startHour}:00-${endHour}:00`;
    }).join(', ');
  };

  // Format harga
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(amount);
  };

  // Tampilan loading
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
        <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow p-8">
          <div className="animate-pulse flex flex-col space-y-4">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded my-4"></div>
            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          </div>
        </div>
      </div>
    );
  }

  // Tampilan error
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
        <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow p-8">
          <h1 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">Error</h1>
          <p className="text-gray-700 dark:text-gray-300 mb-4">{error}</p>
          <div className="flex gap-4">
            <button 
              onClick={() => router.back()}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
            >
              Kembali
            </button>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-all"
            >
              Coba Lagi
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!reservation) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
        <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow p-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Reservasi Tidak Ditemukan</h1>
          <p className="text-gray-700 dark:text-gray-300 mb-4">Detail reservasi tidak dapat ditemukan.</p>
          <button 
            onClick={() => router.push('/member')}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-all"
          >
            Kembali ke Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-16 md:pb-0">
      <div className="max-w-3xl mx-auto p-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <button 
            onClick={() => router.back()} 
            className="flex items-center text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary-light"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Kembali
          </button>
          
          <LogoutButtonClient />
        </div>

        {/* Main Content */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
          {/* Header dengan status */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Detail Reservasi</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">ID: {reservation._id}</p>
            </div>
            
            <span className={`px-3 py-1 text-sm rounded-full 
              ${reservation.status === 'PAID' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 
                reservation.status === 'UNPAID' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' : 
                reservation.status === 'CANCELLED' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' : 
                reservation.status === 'CHECKED_IN' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'}`}
            >
              {reservation.status === 'PAID' ? 'Terkonfirmasi' : 
               reservation.status === 'UNPAID' ? 'Menunggu Pembayaran' : 
               reservation.status === 'CANCELLED' ? 'Dibatalkan' : 
               reservation.status === 'CHECKED_IN' ? 'Sudah Check-in' :
               reservation.status === 'EXPIRED' ? 'Kedaluwarsa' :
               reservation.status}
            </span>
          </div>
          
          {/* Detail Lapangan */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Informasi Lapangan</h2>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <p className="font-medium text-xl mb-2 text-gray-900 dark:text-white">
                {reservation.courtId.name}
              </p>
              <p className="text-gray-600 dark:text-gray-300">
                {reservation.courtId.surface || reservation.courtId.type || 'Standard'}
              </p>
            </div>
          </div>
          
          {/* Detail Waktu */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Waktu Reservasi</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">Tanggal</p>
                <p className="font-medium text-gray-900 dark:text-white">{formatDate(reservation.date)}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">Jam</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {formatSlots(reservation.slots)}
                </p>
              </div>
            </div>
          </div>

          {/* Detail Pembayaran */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Pembayaran</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Pembayaran</p>
                <p className="font-bold text-xl text-primary dark:text-yellow-400">{formatCurrency(reservation.totalAmount)}</p>
              </div>
              {reservation.paymentData && (
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Metode Pembayaran</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {reservation.paymentData.method ? 'Transfer Bank' : 'Transfer Bank'}
                  </p>
                  {reservation.paymentData.reference && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Ref: {reservation.paymentData.reference}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {/* Tindakan */}
          <div className="p-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Dibuat pada: {new Date(reservation.createdAt).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
              
              <div className="flex gap-2 flex-wrap">
                {reservation.status === 'UNPAID' && (
                  <button 
                    onClick={handlePayNow}
                    className="px-3 py-1.5 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-all"
                  >
                    Bayar Sekarang
                  </button>
                )}
                
                {/* Tombol Tampilkan QR Code untuk status PAID dan CHECKED_IN */}
                {(reservation.status === 'PAID' || reservation.status === 'CHECKED_IN') && (
                  <button 
                    className="px-3 py-1.5 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-all flex items-center gap-1"
                    onClick={() => setShowQRModal(true)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2m0 0V8m0 0h2m-2 0h6m-6 0v3m6-3H6m12 0v3" />
                    </svg>
                    <span>QR Code</span>
                  </button>
                )}
                
                {/* Tombol Invoice - tersedia untuk semua status */}
                <InvoiceButton 
                  reservationId={reservation._id} 
                  className="py-1.5"
                />
                
                {/* Tombol Batalkan untuk status UNPAID saja (bukan PAID, CHECKED_IN atau CANCELLED) */}
                {(reservation.status === 'UNPAID') && (
                  <button className="px-3 py-1.5 text-sm bg-red-500 text-white rounded-md hover:bg-red-600 transition-all">
                    Batalkan
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Link kembali ke dashboard */}
        <div className="mt-6 flex justify-center">
          <button 
            onClick={() => router.push('/member')}
            className="text-primary hover:underline"
          >
            Kembali ke Dashboard
          </button>
        </div>
      </div>
      
      {/* Modal QR Code */}
      {showQRModal && reservation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">QR Code Check-In</h3>
              <button 
                onClick={() => setShowQRModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex flex-col items-center justify-center mb-4">
              <div className="bg-white p-4 rounded-lg">
                <QRCode value={reservation._id} size={200} />
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">Tunjukkan QR Code ini saat check-in di lapangan</p>
            </div>
            <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <p className="mb-2"><span className="font-semibold">ID Booking:</span> {reservation._id}</p>
                <p className="mb-2"><span className="font-semibold">Lapangan:</span> {reservation.courtId.name}</p>
                <p className="mb-2"><span className="font-semibold">Tanggal:</span> {formatDate(reservation.date)}</p>
                <p className="mb-2"><span className="font-semibold">Jam:</span> {formatSlots(reservation.slots)}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
