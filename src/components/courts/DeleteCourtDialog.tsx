"use client";
import React from "react";

interface DeleteCourtDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
  courtName?: string;
}

export default function DeleteCourtDialog({
  open,
  onClose,
  onConfirm,
  loading = false,
  courtName,
}: DeleteCourtDialogProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg w-full max-w-sm p-6 relative">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          Delete Court
        </h3>
        <p className="mb-6 text-gray-700 dark:text-gray-300">
          Are you sure you want to delete <b>{courtName || 'this court'}</b>? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-2">
          <button
            className="py-2 px-4 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold hover:bg-gray-300 dark:hover:bg-gray-600"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            className="py-2 px-4 rounded bg-red-600 text-white font-semibold hover:bg-red-700 disabled:opacity-60"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
