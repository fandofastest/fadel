"use client";
import React from "react";

interface DeleteUserDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
  userName?: string;
}

export default function DeleteUserDialog({
  open,
  onClose,
  onConfirm,
  loading,
  userName,
}: DeleteUserDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 overflow-y-auto p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg max-w-md w-full mx-4 p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Hapus Pengguna
        </h2>
        
        <p className="text-gray-700 dark:text-gray-300 mb-6">
          Apakah Anda yakin ingin menghapus pengguna {" "}
          <span className="font-semibold">"{userName || "ini"}"</span>? 
          Tindakan ini tidak dapat dibatalkan.
        </p>
        
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="py-2 px-4 rounded bg-gray-200 text-gray-800 font-semibold hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="py-2 px-4 rounded bg-red-600 text-white font-semibold hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 flex items-center"
          >
            {loading && (
              <div className="h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            )}
            Hapus
          </button>
        </div>
      </div>
    </div>
  );
}
