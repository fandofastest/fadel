"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { FaArrowLeft, FaFileInvoice } from "react-icons/fa";
import { formatCurrency, formatDate, formatDateTime, formatSlots } from "@/lib/utils";

interface PaymentDetail {
  _id: string;
  reservationId: {
    _id: string;
    userId: {
      _id: string;
      name: string;
      email: string;
      phone?: string;
    };
    courtId: {
      _id: string;
      name: string;
    };
    date: string;
    slots: number[];
    price: number;
    status: string;
  };
  amount: number;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
  method: {
    _id: string;
    name: string;
  };
  reference: string;
  notes?: string;
  tripay_reference?: {
    reference: string;
    merchant_ref: string;
    payment_method: string;
    payment_method_code: string;
    total_amount: number;
    fee_merchant: number;
    fee_customer: number;
    amount_received: number;
    status: string;
    paid_at: number;
  };
  createdAt: string;
  updatedAt: string;
}

export default function PaymentDetailPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { id } = useParams() as { id: string };
  const [payment, setPayment] = useState<PaymentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

    // Format functions sudah dipindahkan ke utils.ts

  const loadPaymentDetail = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/payments/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to load payment details");
      }

      const result = await response.json();
      setPayment(result.data);
    } catch (err: any) {
      setError(err.message);
      console.error("Failed to load payment details:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user && id) {
      loadPaymentDetail();
    }
  }, [session, id]);

  if (!session?.user) {
    return <div className="p-4 text-center">Unauthorized access</div>;
  }

  return (
    <div className="p-2 md:p-4">
      {/* Back button and title */}
      <div className="flex items-center mb-3">
        <button
          onClick={() => router.back()}
          className="mr-2 bg-gray-200 p-1 rounded-md hover:bg-gray-300"
        >
          <FaArrowLeft size={12} />
        </button>
        <h1 className="text-lg md:text-xl font-bold">Detail Transaksi</h1>
        {payment && (
          <Link
            href={`/admin/sales-report/${payment._id}/invoice`}
            className="ml-auto flex items-center gap-1 text-xs bg-purple-500 text-white px-2 py-1 rounded-md hover:bg-purple-600"
          >
            <FaFileInvoice size={12} /> Invoice
          </Link>
        )}
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-2 py-1 rounded-md mb-3 text-xs">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center p-4">Loading...</div>
      ) : payment ? (
        <div className="grid md:grid-cols-2 gap-3">
          {/* Payment Info Card */}
          <div className="bg-white shadow-sm rounded-md p-3">
            <h2 className="font-semibold text-sm mb-2 border-b pb-1">Informasi Pembayaran</h2>
            
            <div className="grid grid-cols-2 gap-y-1 text-xs">
              <div className="text-gray-600">ID Transaksi</div>
              <div>{payment._id}</div>
              
              <div className="text-gray-600">No. Referensi</div>
              <div>{payment.reference || '-'}</div>
              
              <div className="text-gray-600">Status</div>
              <div>
                <span className={`text-xs px-1 py-0.5 rounded-full ${
                  payment.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 
                  payment.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                  payment.status === 'FAILED' ? 'bg-red-100 text-red-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {payment.status}
                </span>
              </div>
              
              <div className="text-gray-600">Jumlah</div>
              <div className="font-semibold">{formatCurrency(payment.amount)}</div>
              
              <div className="text-gray-600">Metode</div>
              <div>{payment.method?.name || '-'}</div>
              
              <div className="text-gray-600">Tanggal</div>
              <div>{formatDateTime(payment.createdAt)}</div>
              
              {payment.notes && (
                <>
                  <div className="text-gray-600">Catatan</div>
                  <div>{payment.notes}</div>
                </>
              )}
            </div>
          </div>
          
          {/* Reservation Info Card */}
          <div className="bg-white shadow-sm rounded-md p-3">
            <h2 className="font-semibold text-sm mb-2 border-b pb-1">Informasi Reservasi</h2>
            
            <div className="grid grid-cols-2 gap-y-1 text-xs">
              <div className="text-gray-600">ID Reservasi</div>
              <div>{payment.reservationId?._id || '-'}</div>
              
              <div className="text-gray-600">Lapangan</div>
              <div>{payment.reservationId?.courtId?.name || '-'}</div>
              
              <div className="text-gray-600">Tanggal</div>
              <div>
                {payment.reservationId?.date 
                  ? formatDate(payment.reservationId.date)
                  : '-'}
              </div>
              
              <div className="text-gray-600">Jam</div>
              <div>{payment.reservationId?.slots ? formatSlots(payment.reservationId.slots) : '-'}</div>
              
              <div className="text-gray-600">Harga</div>
              <div>{payment.reservationId?.price ? formatCurrency(payment.reservationId.price) : '-'}</div>
              
              <div className="text-gray-600">Status</div>
              <div>{payment.reservationId?.status || '-'}</div>
            </div>
          </div>
          
          {/* Customer Info Card */}
          <div className="bg-white shadow-sm rounded-md p-3">
            <h2 className="font-semibold text-sm mb-2 border-b pb-1">Informasi Pelanggan</h2>
            
            <div className="grid grid-cols-2 gap-y-1 text-xs">
              <div className="text-gray-600">Nama</div>
              <div>{payment.reservationId?.userId?.name || '-'}</div>
              
              <div className="text-gray-600">Email</div>
              <div>{payment.reservationId?.userId?.email || '-'}</div>
              
              {payment.reservationId?.userId?.phone && (
                <>
                  <div className="text-gray-600">Telepon</div>
                  <div>{payment.reservationId.userId.phone}</div>
                </>
              )}
            </div>
          </div>
          
          {/* Tripay Info Card (if available) */}
          {payment.tripay_reference && (
            <div className="bg-white shadow-sm rounded-md p-3">
              <h2 className="font-semibold text-sm mb-2 border-b pb-1">Detail Payment Gateway</h2>
              
              <div className="grid grid-cols-2 gap-y-1 text-xs">
                <div className="text-gray-600">Reference ID</div>
                <div>{payment.tripay_reference.reference}</div>
                
                <div className="text-gray-600">Merchant Ref</div>
                <div>{payment.tripay_reference.merchant_ref}</div>
                
                <div className="text-gray-600">Payment Method</div>
                <div>{payment.tripay_reference.payment_method}</div>
                
                <div className="text-gray-600">Method Code</div>
                <div>{payment.tripay_reference.payment_method_code}</div>
                
                <div className="text-gray-600">Total Amount</div>
                <div>{formatCurrency(payment.tripay_reference.total_amount)}</div>
                
                {payment.tripay_reference.fee_merchant > 0 && (
                  <>
                    <div className="text-gray-600">Fee Merchant</div>
                    <div>{formatCurrency(payment.tripay_reference.fee_merchant)}</div>
                  </>
                )}
                
                {payment.tripay_reference.fee_customer > 0 && (
                  <>
                    <div className="text-gray-600">Fee Customer</div>
                    <div>{formatCurrency(payment.tripay_reference.fee_customer)}</div>
                  </>
                )}
                
                <div className="text-gray-600">Amount Received</div>
                <div>{formatCurrency(payment.tripay_reference.amount_received)}</div>
                
                <div className="text-gray-600">Payment Status</div>
                <div>{payment.tripay_reference.status}</div>
                
                {payment.tripay_reference.paid_at && (
                  <>
                    <div className="text-gray-600">Paid At</div>
                    <div>
                      {formatDateTime(payment.tripay_reference.paid_at)}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-2 py-1 rounded-md text-xs">
          Data pembayaran tidak ditemukan
        </div>
      )}
    </div>
  );
}
