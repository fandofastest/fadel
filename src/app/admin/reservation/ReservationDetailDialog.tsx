"use client";
import React, { useState, useEffect } from 'react';
import Badge from "@/components/ui/badge/Badge";
import { Reservation, ReservationStatus } from '@/types/reservation';

interface ReservationDetailDialogProps {
  open: boolean;
  onClose: () => void;
  reservation: Reservation | null;
  onUpdate: () => void;
}

export default function ReservationDetailDialog({
  open,
  onClose,
  reservation,
  onUpdate,
}: ReservationDetailDialogProps) {
  const [status, setStatus] = useState<ReservationStatus | undefined>(reservation?.status);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (reservation) {
      setStatus(reservation.status);
      setError(null); // Reset error when a new reservation is viewed
    }
  }, [reservation]);

  const handleStatusChange = async () => {
    if (!reservation || !status) return;

    setIsUpdating(true);
    setError(null);

    try {
      const response = await fetch(`/api/reservations/${reservation._id}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to update status');
      }

      // Success
      onUpdate(); // Trigger data refresh in parent component
      onClose(); // Close the dialog

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  if (!open || !reservation) return null;

  function getStatusColor(status?: string) {
    switch ((status || "").toUpperCase()) {
      case "PAID": return "success";
      case "UNPAID": return "warning";
      case "CANCELLED": return "error";
      case "CHECKED_IN": return "info";
      case "EXPIRED": return "dark";
      default: return "light";
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg max-w-xs w-full mx-2">
        <div className="p-3">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Detail Reservasi</h3>
            <button
              onClick={onClose}
              className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white"
            >
              <svg aria-hidden="true" className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
              <span className="sr-only">Close modal</span>
            </button>
          </div>
          <div className="space-y-2 text-xs text-gray-700 dark:text-gray-300">
            <div><b>Tanggal:</b> {new Date(reservation.date).toLocaleString("id-ID", { dateStyle: 'short', timeStyle: 'short' })}</div>
            <hr className="border-gray-200 dark:border-gray-700" />
            <div className="grid grid-cols-2 gap-1">
              <div><b>User:</b> {reservation.userId?.name || '-'}</div>
              <div><b>No HP:</b> {reservation.userId?.phone || '-'}</div>
            </div>
            <hr className="border-gray-200 dark:border-gray-700" />
            <div className="grid grid-cols-2 gap-1">
              <div><b>Lapangan:</b> {reservation.courtId?.name || '-'}</div>
              <div><b>Jam:</b> {reservation.slots?.map((j: number) => `${j}:00`).join(", ") || '-'}</div>
            </div>
            <hr className="border-gray-200 dark:border-gray-700" />
            <div className="grid grid-cols-2 gap-1">
              <div><b>Status:</b> <Badge size="sm" color={getStatusColor(reservation.status)}>{reservation.status}</Badge></div>
              <div><b>Total:</b> Rp{reservation.totalAmount?.toLocaleString("id-ID")}</div>
            </div>
          </div>

          {/* Compact Status Update Section */}
          <div className="px-3 pt-2 pb-2 border-t border-gray-200 dark:border-gray-800 mt-2">
            <h4 className="text-xs font-semibold text-gray-800 dark:text-gray-100 mb-2">Update Status</h4>
            <div className="flex flex-wrap gap-1 mb-2">
              {(['UNPAID', 'PAID', 'CHECKED_IN', 'CANCELLED', 'EXPIRED'] as ReservationStatus[]).map((s) => (
                <button 
                  key={s}
                  onClick={() => setStatus(s)}
                  className={`px-2 py-1 text-xs font-medium rounded transition-all duration-200 focus:outline-none ${ 
                    status === s 
                    ? 'bg-cyan-500 text-white' 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}>
                  {s.charAt(0) + s.slice(1).toLowerCase().replace('_', ' ')}
                </button>
              ))}
            </div>
            <button
              onClick={handleStatusChange}
              disabled={isUpdating || status === reservation.status}
              className="w-full px-3 py-1 text-xs font-bold text-white bg-indigo-600 border border-transparent rounded hover:bg-indigo-700 focus:outline-none disabled:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isUpdating ? 'Saving...' : 'Save Changes'}
            </button>
            {error && <p className="mt-1 text-xs text-red-500 dark:text-red-400 text-center">{error}</p>}
          </div>
        </div>
        <div className="flex items-center p-2 space-x-2 border-t border-gray-200 rounded-b dark:border-gray-600">
          <button 
            onClick={onClose} 
            className="w-full text-white bg-blue-700 hover:bg-blue-800 focus:outline-none font-medium rounded text-xs px-4 py-1.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
