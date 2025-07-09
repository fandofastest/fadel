"use client";
import React, { useState } from "react";
import Button from "../ui/button/Button";

interface PricingRuleEditorProps {
  courtId: string;
  onRuleCreated: () => void;
}

interface RuleFormData {
  startDayOfWeek: number;
  endDayOfWeek: number;
  startHour: number;
  endHour: number;
  rate: number;
}

export default function PricingRuleEditor({ courtId, onRuleCreated }: PricingRuleEditorProps) {
  const [formData, setFormData] = useState<RuleFormData>({
    startDayOfWeek: 0,
    endDayOfWeek: 6,
    startHour: 8,
    endHour: 22,
    rate: 100000,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "rate" ? Number(value) : parseInt(value, 10),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Validate form data
      if (formData.endHour <= formData.startHour) {
        throw new Error("Jam akhir harus lebih besar dari jam mulai");
      }

      // Check if courtId is in a valid format
      if (!/^[0-9a-fA-F]{24}$/.test(courtId)) {
        throw new Error("ID lapangan tidak valid");
      }

      console.log("Submitting data:", {
        ...formData,
        courtId,
      });

      const response = await fetch("/api/pricing_rules", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          courtId,
        }),
      });

      const responseData = await response.json();
      console.log("API response:", responseData);

      if (!response.ok) {
        // Get more detailed error
        throw new Error(responseData.error || "Gagal menambahkan aturan harga");
      }

      // Reset form
      setFormData({
        startDayOfWeek: 0,
        endDayOfWeek: 6,
        startHour: 8,
        endHour: 22,
        rate: 100000,
      });
      
      onRuleCreated();
    } catch (err) {
      console.error("Error adding price rule:", err);
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="border border-gray-300 dark:border-gray-700 rounded-lg p-4 mb-4 bg-white dark:bg-gray-800">
      <h3 className="text-md font-medium mb-3 text-gray-900 dark:text-white">Tambah Aturan Harga Baru</h3>
      
      {error && (
        <div className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 p-2 rounded mb-3 text-sm">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Hari</label>
            <div className="flex gap-2">
              <select 
                name="startDayOfWeek"
                value={formData.startDayOfWeek}
                onChange={handleChange}
                className="rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 p-2 text-sm w-full text-gray-900 dark:text-white"
              >
                {days.map((day, i) => (
                  <option key={i} value={i}>{day}</option>
                ))}
              </select>
              <span className="self-center text-gray-600 dark:text-gray-300">s/d</span>
              <select 
                name="endDayOfWeek"
                value={formData.endDayOfWeek}
                onChange={handleChange}
                className="rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 p-2 text-sm w-full text-gray-900 dark:text-white"
              >
                {days.map((day, i) => (
                  <option key={i} value={i}>{day}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Waktu</label>
            <div className="flex gap-2">
              <select 
                name="startHour"
                value={formData.startHour}
                onChange={handleChange}
                className="rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 p-2 text-sm w-full text-gray-900 dark:text-white"
              >
                {Array.from({length: 24}, (_, i) => (
                  <option key={i} value={i}>{i}:00</option>
                ))}
              </select>
              <span className="self-center text-gray-600 dark:text-gray-300">s/d</span>
              <select 
                name="endHour"
                value={formData.endHour}
                onChange={handleChange}
                className="rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 p-2 text-sm w-full text-gray-900 dark:text-white"
              >
                {Array.from({length: 24}, (_, i) => (
                  <option key={i} value={i}>{i}:00</option>
                ))}
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Harga (Rp)</label>
            <input 
              type="number" 
              name="rate"
              value={formData.rate}
              onChange={handleChange}
              className="rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 p-2 text-sm w-full text-gray-900 dark:text-white" 
              placeholder="100000"
              min="0"
              step="10000" 
            />
          </div>
          
          <div className="flex items-end">
            <Button 
              variant="primary" 
              size="md" 
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Menambahkan..." : "Tambah Aturan"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
