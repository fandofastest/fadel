"use client";
import React from "react";

export function StatusBadge({ status }: { status?: string }) {
  if (!status) return <span className="text-xs text-gray-400 italic">Belum tersedia</span>;
  let color = "bg-gray-200 text-gray-700";
  let label = status;
  switch (status.toUpperCase()) {
    case "PAID":
      color = "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300";
      label = "Lunas";
      break;
    case "UNPAID":
      color = "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      label = "Belum Bayar";
      break;
    case "CANCELLED":
      color = "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300";
      label = "Dibatalkan";
      break;
    case "CHECKED_IN":
      color = "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300";
      label = "Check-in";
      break;
    case "EXPIRED":
      color = "bg-gray-300 text-gray-600 dark:bg-gray-700 dark:text-gray-300";
      label = "Expired";
      break;
    default:
      color = "bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
      label = status;
  }
  return (
    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${color}`}>{label}</span>
  );
}
