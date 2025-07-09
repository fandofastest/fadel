"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { 
  FaFileInvoice, 
  FaEye, 
  FaSearch, 
  FaFilter, 
  FaSyncAlt 
} from "react-icons/fa";

interface Payment {
  _id: string;
  reservationId: {
    _id: string;
    userId: {
      name: string;
      email: string;
    };
    courtId: {
      name: string;
    };
    date: string;
    slots: number[];
  };
  amount: number;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
  method: {
    name: string;
  };
  reference: string;
  createdAt: string;
  updatedAt: string;
}

export default function SalesReportPage() {
  const { data: session } = useSession();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 15;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const loadPayments = async () => {
    setLoading(true);
    setError("");
    try {
      // Build query parameters
      const queryParams = new URLSearchParams();
      queryParams.append("page", page.toString());
      queryParams.append("limit", limit.toString());
      
      if (searchQuery) {
        queryParams.append("search", searchQuery);
      }
      
      if (filterStatus) {
        queryParams.append("status", filterStatus);
      }
      
      const response = await fetch(`/api/payments?${queryParams.toString()}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to load payment data");
      }

      const result = await response.json();
      setPayments(result.data.payments);
      setTotalPages(Math.ceil(result.data.total / limit));
    } catch (err: any) {
      setError(err.message);
      console.error("Failed to load payments:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user) {
      loadPayments();
    }
  }, [session, page, filterStatus]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1); // Reset to first page on new search
    loadPayments();
  };

  const handleReset = () => {
    setSearchQuery("");
    setFilterStatus("");
    setPage(1);
    loadPayments();
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterStatus(e.target.value);
    setPage(1); // Reset to first page on filter change
  };

  return (
    <div className="p-2 md:p-4">
      <h1 className="text-lg md:text-xl font-bold mb-3">Laporan Penjualan</h1>
      
      {/* Filter Controls */}
      <div className="mb-3 bg-white p-2 shadow-sm rounded-md">
        <form onSubmit={handleSearch} className="flex flex-wrap gap-1 items-center">
          <div className="flex flex-grow items-center border rounded-md overflow-hidden">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari berdasarkan referensi atau nama..."
              className="flex-grow p-1 text-xs focus:outline-none"
            />
            <button type="submit" className="bg-blue-500 text-white px-2 py-1">
              <FaSearch size={14} />
            </button>
          </div>
          
          <select
            value={filterStatus}
            onChange={handleStatusChange}
            className="border rounded-md p-1 text-xs"
          >
            <option value="">Semua Status</option>
            <option value="PENDING">Pending</option>
            <option value="COMPLETED">Completed</option>
            <option value="FAILED">Failed</option>
            <option value="REFUNDED">Refunded</option>
          </select>
          
          <button 
            type="button" 
            onClick={handleReset}
            className="flex items-center gap-1 text-xs bg-gray-200 px-2 py-1 rounded-md"
          >
            <FaSyncAlt size={12} /> Reset
          </button>
        </form>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-2 py-1 rounded-md mb-3 text-xs">
          {error}
        </div>
      )}
      
      {/* Payment Data Table */}
      <div className="bg-white shadow-sm rounded-md overflow-x-auto">
        {loading ? (
          <div className="text-center p-4">Loading...</div>
        ) : payments.length === 0 ? (
          <div className="text-center p-4 text-xs">Tidak ada data pembayaran</div>
        ) : (
          <table className="min-w-full text-xs">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 text-left">Tanggal</th>
                <th className="p-2 text-left">Referensi</th>
                <th className="p-2 text-left">Customer</th>
                <th className="p-2 text-left">Metode</th>
                <th className="p-2 text-right">Jumlah</th>
                <th className="p-2 text-center">Status</th>
                <th className="p-2 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment._id} className="border-t hover:bg-gray-50">
                  <td className="p-2">
                    {format(new Date(payment.createdAt), 'dd/MM/yyyy HH:mm', {locale: id})}
                  </td>
                  <td className="p-2">{payment.reference || '-'}</td>
                  <td className="p-2">
                    {payment.reservationId?.userId?.name || 'Unknown'}
                  </td>
                  <td className="p-2">{payment.method?.name || '-'}</td>
                  <td className="p-2 text-right">{formatCurrency(payment.amount)}</td>
                  <td className="p-2 text-center">
                    <span className={`text-xs px-1 py-0.5 rounded-full ${
                      payment.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 
                      payment.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                      payment.status === 'FAILED' ? 'bg-red-100 text-red-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {payment.status}
                    </span>
                  </td>
                  <td className="p-2 text-center">
                    <div className="flex justify-center gap-1">
                      <Link
                        href={`/admin/sales-report/${payment._id}`}
                        className="bg-blue-500 text-white p-1 rounded-sm hover:bg-blue-600"
                        title="Lihat Detail"
                      >
                        <FaEye size={12} />
                      </Link>
                      <Link
                        href={`/admin/sales-report/${payment._id}/invoice`}
                        className="bg-purple-500 text-white p-1 rounded-sm hover:bg-purple-600"
                        title="Download Invoice"
                      >
                        <FaFileInvoice size={12} />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-3 gap-1">
          <button
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            disabled={page === 1}
            className={`px-2 py-1 text-xs rounded-md ${
              page === 1
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-gray-200 hover:bg-gray-300"
            }`}
          >
            Prev
          </button>
          <span className="px-2 py-1 text-xs">
            {page} dari {totalPages}
          </span>
          <button
            onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={page === totalPages}
            className={`px-2 py-1 text-xs rounded-md ${
              page === totalPages
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-gray-200 hover:bg-gray-300"
            }`}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
