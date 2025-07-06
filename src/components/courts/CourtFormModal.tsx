"use client";
import React, { useState, useEffect } from "react";
import MuiTimePicker from "../form/mui-time-picker";

interface Court {
  _id?: string;
  name: string;
  openTime: string;
  closeTime: string;
}

interface CourtFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (court: Court) => void;
  initialCourt?: Court | null;
  loading?: boolean;
}

export default function CourtFormModal({
  open,
  onClose,
  onSubmit,
  initialCourt,
  loading = false,
}: CourtFormModalProps) {
  const [name, setName] = useState("");
  const [openTime, setOpenTime] = useState("");
  const [closeTime, setCloseTime] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialCourt) {
      setName(initialCourt.name);
      setOpenTime(initialCourt.openTime);
      setCloseTime(initialCourt.closeTime);
    } else {
      setName("");
      setOpenTime("");
      setCloseTime("");
    }
    setError(null);
  }, [initialCourt, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !openTime || !closeTime) {
      setError("All fields are required.");
      return;
    }
    setError(null);
    onSubmit({
      _id: initialCourt?._id,
      name,
      openTime,
      closeTime,
    });
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 overflow-y-auto p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg w-full max-w-xl p-4 sm:p-6 relative mx-auto overflow-hidden">
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-800 dark:hover:text-white text-2xl font-bold z-10"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          {initialCourt ? "Edit Court" : "Add Court"}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 dark:text-gray-300 mb-1">Name</label>
            <input
              className="w-full rounded border border-gray-300 dark:border-gray-700 p-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              value={name}
              onChange={e => setName(e.target.value)}
              disabled={loading}
              required
            />
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:gap-2 overflow-x-hidden">
            <div className="flex-1">
              <MuiTimePicker
                label="Open Time"
                value={openTime}
                onChange={setOpenTime}
                disabled={loading}
              />
            </div>
            <div className="flex-1">
              <MuiTimePicker
                label="Close Time"
                value={closeTime}
                onChange={setCloseTime}
                disabled={loading}
              />
            </div>
          </div>
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <div className="flex justify-between items-center mt-4">
            <button 
              type="button" 
              className="py-2 px-4 rounded bg-gray-300 text-gray-800 dark:bg-gray-700 dark:text-white font-semibold hover:bg-gray-400 dark:hover:bg-gray-600 disabled:opacity-60"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="py-2 px-6 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-60"
              disabled={loading}
            >
              {loading ? "Saving..." : initialCourt ? "Update" : "Add"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
