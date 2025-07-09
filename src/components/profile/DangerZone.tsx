"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

interface DangerZoneProps {
  userId: string;
}

export default function DangerZone({ userId }: DangerZoneProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const router = useRouter();

  const handleDeleteRequest = () => {
    setShowConfirmation(true);
  };

  const handleCancelDelete = () => {
    setShowConfirmation(false);
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Akun berhasil dihapus");
        // Redirect to homepage after account deletion
        router.push("/");
      } else {
        toast.error(result.message || "Gagal menghapus akun");
        setShowConfirmation(false);
      }
    } catch (error) {
      toast.error("Terjadi kesalahan saat menghapus akun");
      console.error("Error deleting account:", error);
      setShowConfirmation(false);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="p-6 border-t border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-medium text-red-600 dark:text-red-500 mb-4">Danger Zone</h3>
      
      {!showConfirmation ? (
        <div className="flex items-center justify-between p-4 border border-red-200 dark:border-red-900 rounded-lg bg-red-50 dark:bg-gray-900">
          <div>
            <h4 className="font-medium text-red-800 dark:text-red-500">Hapus Akun</h4>
            <p className="text-sm text-red-600 dark:text-red-400">
              Tindakan ini tidak dapat dibatalkan. Semua data Anda akan dihapus secara permanen.
            </p>
          </div>
          <button
            type="button"
            onClick={handleDeleteRequest}
            className="px-4 py-2 bg-white dark:bg-gray-800 text-red-600 border border-red-600 rounded hover:bg-red-600 hover:text-white dark:hover:bg-red-900 transition-colors"
          >
            Hapus Akun
          </button>
        </div>
      ) : (
        <div className="p-4 border border-red-500 rounded-lg bg-red-50 dark:bg-gray-900">
          <h4 className="font-bold text-red-800 dark:text-red-500 mb-2">Konfirmasi Penghapusan Akun</h4>
          <p className="text-sm text-red-700 dark:text-red-400 mb-4">
            Apakah Anda yakin ingin menghapus akun Anda? Tindakan ini tidak dapat dibatalkan dan semua data Anda akan hilang secara permanen.
          </p>
          <div className="flex gap-4 justify-end">
            <button
              type="button"
              onClick={handleCancelDelete}
              disabled={isDeleting}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isDeleting ? "Menghapus..." : "Ya, Hapus Akun Saya"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
