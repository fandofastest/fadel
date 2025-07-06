"use client";
import React from "react";

interface AlertMessageProps {
  message: string;
  type?: "success" | "error";
  onClose?: () => void;
}

export default function AlertMessage({ message, type = "success", onClose }: AlertMessageProps) {
  return (
    <div className={`fixed top-6 right-6 z-[100] px-5 py-3 rounded shadow-lg flex items-center gap-2 transition-all
      ${type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"}
    `}>
      <span>{message}</span>
      {onClose && (
        <button
          className="ml-2 text-white/80 hover:text-white text-lg font-bold"
          onClick={onClose}
          aria-label="Close alert"
        >
          ×
        </button>
      )}
    </div>
  );
}
