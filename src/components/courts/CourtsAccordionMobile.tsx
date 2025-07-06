"use client";
import React, { useState } from "react";

interface Court {
  _id?: string;
  name: string;
  openTime: string;
  closeTime: string;
  createdAt?: string;
  updatedAt?: string;
}

interface CourtsAccordionMobileProps {
  courts: Court[];
  loading: boolean;
  error: string | null;
  onEdit: (court: Court) => void;
  onDelete: (court: Court) => void;
  deleteLoadingId?: string | null;
  modalLoading?: boolean;
  onAturHarga?: (courtId: string) => void;
}

export default function CourtsAccordionMobile({
  courts,
  loading,
  error,
  onEdit,
  onDelete,
  deleteLoadingId,
  modalLoading,
  onAturHarga,
}: CourtsAccordionMobileProps) {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  if (loading) {
    return <div className="p-4 text-center text-gray-500 dark:text-gray-300">Memuat data...</div>;
  }
  if (error) {
    return <div className="p-4 text-center text-red-500">Terjadi kesalahan: {error}</div>;
  }
  if (!courts.length) {
    return <div className="p-4 text-center text-gray-400 dark:text-gray-500">Tidak ada data lapangan.</div>;
  }

  return (
    <div className="flex flex-col gap-3">
      {courts.map((court, idx) => (
        <div
          key={court._id}
          className="rounded-xl border border-gray-200 dark:border-white/[0.07] bg-white dark:bg-white/[0.03] shadow-sm"
        >
          <button
            className="w-full flex justify-between items-center p-4 text-left focus:outline-none"
            onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
          >
            <span className="font-semibold text-gray-900 dark:text-white">{court.name}</span>
            <svg
              className={`ml-2 h-5 w-5 transition-transform ${openIdx === idx ? "rotate-180" : "rotate-0"}`}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {openIdx === idx && (
            <div className="px-4 pb-4 text-gray-700 dark:text-gray-200 text-sm">
              <div className="mb-2 flex flex-col gap-1">
                <div><span className="font-medium">Jam Buka:</span> {court.openTime}</div>
                <div><span className="font-medium">Jam Tutup:</span> {court.closeTime}</div>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                <button
                  className="py-1 px-4 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-xs"
                  onClick={() => onEdit(court)}
                  disabled={modalLoading || deleteLoadingId === court._id}
                >
                  Edit
                </button>
                {onAturHarga && (
                  <button
                    className="py-1 px-4 rounded bg-green-600 text-white font-semibold hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-xs"
                    onClick={() => onAturHarga(court._id || '')}
                    disabled={modalLoading || deleteLoadingId === court._id || !court._id}
                  >
                    Atur Harga
                  </button>
                )}
                <button
                  className="py-1 px-4 rounded bg-red-600 text-white font-semibold hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 text-xs"
                  onClick={() => onDelete(court)}
                  disabled={modalLoading || deleteLoadingId === court._id}
                >
                  {deleteLoadingId === court._id ? "Menghapus..." : "Hapus"}
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
