"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

interface PaymentMethod {
  _id: string;
  name: string;
  code?: string;
  keterangan?: string;
}

export default function CheckoutPage() {
  const [summary, setSummary] = useState<any>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<string>("");
  const [showPaymentMethods, setShowPaymentMethods] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState<boolean>(false);
  const [transferInfo, setTransferInfo] = useState<{ norekening: string; jumlah: number } | null>(null);
  const router = useRouter();

  useEffect(() => {
    const data = localStorage.getItem("reservation_summary");
    if (!data) {
      router.replace("/member/reservasi");
      return;
    }
    setSummary(JSON.parse(data));
    
    // Ambil data metode pembayaran
    fetchPaymentMethods();
  }, [router]);
  
  const fetchPaymentMethods = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/payment_methods');
      const data = await response.json();
      
      if (data.success && data.data) {
        console.log('Metode pembayaran:', data.data);
        setPaymentMethods(data.data);
      } else {
        toast.error('Gagal mengambil metode pembayaran');
      }
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      toast.error('Terjadi kesalahan saat mengambil metode pembayaran');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handlePayment = async () => {
  if (!selectedMethod) {
    toast.error('Silakan pilih metode pembayaran terlebih dahulu');
    return;
  }
  if (isLoading) {
    return;
  }
  if (!summary) {
    toast.error('Data reservasi tidak ditemukan');
    return;
  }
  const selectedPaymentMethod = paymentMethods.find(m => m._id === selectedMethod);
  if (!selectedPaymentMethod) {
    toast.error('Metode pembayaran tidak valid');
    return;
  }
  try {
    setIsLoading(true);
    toast.loading('Membuat reservasi...');
    // 1. Buat reservasi baru
    const res = await fetch('/api/reservations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        courtId: summary.courtId || summary.court?._id || summary.court,
        date: summary.date,
        slots: summary.slots, // array jam
        paymentMethodId: selectedMethod // Menambahkan payment method ID ke request
      })
    });
    let reservationResult;
    try {
      reservationResult = await res.json();
    } catch (e) {
      toast.dismiss();
      toast.error('Gagal parsing respons server (reservasi).');
      setIsLoading(false);
      return;
    }
    if (!res.ok || !reservationResult.success) {
      toast.dismiss();
      toast.error(reservationResult?.message || 'Gagal membuat reservasi');
      setIsLoading(false);
      return;
    }

    // Debug log
    console.log('Payment method:', selectedPaymentMethod);
    // Cek transferbank lebih fleksibel
    const isTransferBank = (selectedPaymentMethod.name?.toLowerCase().replace(/\s/g, '') === 'transferbank') ||
      (selectedPaymentMethod.code?.toLowerCase().replace(/\s/g, '') === 'transferbank');
    if (isTransferBank) {
      toast.dismiss();
      localStorage.removeItem('reservation_summary');
      // Ambil norekening dari selectedPaymentMethod
      const norekening = selectedPaymentMethod.keterangan || '-';
      // Ambil jumlah transfer dari hasil reservasi
      const jumlah = reservationResult.data?.totalAmount || summary.totalPrice || 0;
      setTransferInfo({ norekening, jumlah });
      setShowSuccessDialog(true);
      setIsLoading(false);
      return;
    }

    // Jika metode pembayaran AUTO, redirect ke halaman auto payment
    const isAuto = (selectedPaymentMethod.name?.toLowerCase().replace(/\s/g, '') === 'auto') ||
      (selectedPaymentMethod.code?.toLowerCase().replace(/\s/g, '') === 'auto');
    if (isAuto) {
      toast.dismiss();
      localStorage.removeItem('reservation_summary');
      // Ambil merchant_ref dan amount dari payment.reference dan payment.amount jika ada
      let merchantRef = reservationResult.data?.paymentData?.reference;
      let amount = reservationResult.data?.paymentData?.amount;
      // Fallback ke kodeInvoice/_id dan totalAmount jika tidak ada
      if (!merchantRef) merchantRef = reservationResult.data?.kodeInvoice || reservationResult.data?._id;
      if (!amount) amount = reservationResult.data?.totalAmount || summary.totalPrice || 0;
      router.push(`/payment/auto/${merchantRef}?amount=${amount}`);
      setIsLoading(false);
      return;
    }

    // Jika bukan transferbank/auto, lanjutkan proses pembayaran seperti biasa
    const reservationId = reservationResult.data._id;
    const res2 = await fetch(`/api/reservations/${reservationId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'PAID', paymentMethodId: selectedMethod })
    });
    let updateResult;
    try {
      updateResult = await res2.json();
    } catch (e) {
      toast.dismiss();
      toast.error('Gagal parsing respons server (update status pembayaran).');
      setIsLoading(false);
      return;
    }
    toast.dismiss();
    if (!res2.ok || !updateResult.success) {
      toast.error(updateResult?.message || 'Gagal update status pembayaran');
      setIsLoading(false);
      return;
    }
    toast.success('Pembayaran berhasil! Reservasi Anda telah dikonfirmasi.');
    localStorage.removeItem('reservation_summary');
    setTimeout(() => {
      router.push('/member/dashboard');
    }, 1500);
  } catch (error) {
    toast.dismiss();
    console.error('Error processing payment:', error);
    toast.error('Terjadi kesalahan saat memproses pembayaran');
    setIsLoading(false);
  }
};

  if (!summary) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-700 dark:text-white">
        Memuat data reservasi...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-lg w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Konfirmasi & Pembayaran</h1>
        <div className="mb-6 space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-300">Nama Pemesan:</span>
            <span className="font-medium text-gray-900 dark:text-white">{summary.userName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-300">Lapangan:</span>
            <span className="font-medium text-gray-900 dark:text-white">{summary.court}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-300">Tanggal:</span>
            <span className="font-medium text-gray-900 dark:text-white">{new Date(summary.date).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-300">Waktu:</span>
            <span className="font-medium text-gray-900 dark:text-white">{summary.slots && summary.slots.map((h: number) => `${h.toString().padStart(2, '0')}:00`).join(', ')}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-300">Durasi:</span>
            <span className="font-medium text-gray-900 dark:text-white">{summary.slots?.length} jam</span>
          </div>
        </div>
        <div className="border-t border-gray-200 dark:border-gray-600 my-4 pt-4 flex justify-between items-center">
          <span className="font-semibold text-gray-900 dark:text-white">Total:</span>
          <span className="font-semibold text-gray-900 dark:text-white">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(summary.totalPrice)}</span>
        </div>
        <div className="mt-6">
          {!showPaymentMethods ? (
            <button 
              onClick={() => setShowPaymentMethods(true)} 
              className="w-full px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-lg shadow transition-all"
            >
              Pilih Metode Pembayaran
            </button>
          ) : (
            <div className="border rounded-lg p-4">
              <h3 className="font-medium text-lg mb-3 text-gray-800 dark:text-white">Pilih Metode Pembayaran:</h3>
              {isLoading ? (
                <div className="text-center py-4">Memuat metode pembayaran...</div>
              ) : paymentMethods.length > 0 ? (
                <div className="space-y-2">
                  {paymentMethods.map((method) => (
                    <div 
                      key={method._id}
                      onClick={() => setSelectedMethod(method._id)}
                      className={`p-3 border rounded-md cursor-pointer transition-all ${selectedMethod === method._id ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50'}`}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium text-gray-800 dark:text-white">{method.name}</p>
                          {method.keterangan && (
                            <p className="text-sm text-gray-500 dark:text-gray-400">{method.keterangan}</p>
                          )}
                        </div>
                        {selectedMethod === method._id && (
                          <div className="text-blue-600 dark:text-blue-400">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M20 6L9 17l-5-5"></path>
                            </svg>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  <button 
                    onClick={() => handlePayment()}
                    disabled={!selectedMethod || isLoading}
                    className={`w-full mt-4 px-6 py-3 rounded-lg ${selectedMethod && !isLoading ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-400 cursor-not-allowed'} text-white font-semibold text-lg shadow transition-all`}
                  >
                    {isLoading ? 'Memproses Pembayaran...' : 'Bayar Sekarang'}
                  </button>
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                  Tidak ada metode pembayaran tersedia
                </div>
              )}
              
              <button 
                onClick={() => setShowPaymentMethods(false)}
                className="w-full mt-3 px-6 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-white font-medium shadow transition-all"
              >
                Tutup
              </button>
            </div>
          )}
        </div>
        {!showPaymentMethods && (
          <button 
            onClick={() => router.back()} 
            className="w-full mt-3 px-6 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-white font-medium shadow transition-all"
          >
            Kembali
          </button>
        )}
      </div>
    {/* Dialog sukses untuk transferbank */}
    {showSuccessDialog && transferInfo && (
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-40">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-sm text-center">
          <h2 className="text-lg font-bold mb-3 text-gray-900 dark:text-white">Order berhasil dibuat</h2>
          <p className="mb-2 text-gray-700 dark:text-gray-200">Silakan lakukan pembayaran transfer ke:</p>
          <div className="mb-2">
            <span className="block font-semibold text-gray-800 dark:text-white">No. Rekening:</span>
            <span className="block text-lg font-mono text-blue-600 dark:text-blue-300">{transferInfo.norekening}</span>
          </div>
          <div className="mb-6">
            <span className="block font-semibold text-gray-800 dark:text-white">Jumlah Transfer:</span>
            <span className="block text-lg font-mono text-green-600 dark:text-green-300">{transferInfo.jumlah.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 })}</span>
          </div>
          <button
            className="px-6 py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
            onClick={() => {
              setShowSuccessDialog(false);
              setTransferInfo(null);
              router.push('/member');
            }}
          >
            OK
          </button>
        </div>
      </div>
    )}
    </div>
  );
}
