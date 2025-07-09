"use client";
import React, { useEffect, useState } from "react";
import { ArrowDownIcon, ArrowUpIcon, CalenderIcon as CalendarIcon, DollarLineIcon as CurrencyDollarIcon } from "@/icons";
import Badge from "../ui/badge/Badge";

interface MetricsData {
  totalReservations: number;
  reservationChangePercent: number;
  totalRevenue: number;
  revenueChangePercent: number;
}

export const ReservationMetrics = () => {
  const [data, setData] = useState<MetricsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/dashboard/metrics');
        if (!response.ok) {
          throw new Error('Failed to fetch metrics');
        }
        const result = await response.json();
        setData(result.data);
      } catch (error) {
        console.error('Error fetching metrics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Format currency to IDR
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-4">
        {[1, 2].map((i) => (
          <div key={i} className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="animate-pulse">
              <div className="h-12 w-12 rounded-xl bg-gray-200 dark:bg-gray-700"></div>
              <div className="flex items-end justify-between mt-4">
                <div>
                  <div className="h-3 w-20 rounded bg-gray-200 dark:bg-gray-700"></div>
                  <div className="h-5 w-16 mt-2 rounded bg-gray-200 dark:bg-gray-700"></div>
                </div>
                <div className="h-5 w-16 rounded bg-gray-200 dark:bg-gray-700"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-4">
      {/* Reservasi */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-lg dark:bg-gray-800">
          <CalendarIcon className="text-gray-800 size-5 dark:text-white/90" />
        </div>

        <div className="flex items-end justify-between mt-4">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Total Reservasi
            </span>
            <h4 className="mt-1 font-bold text-gray-800 text-lg dark:text-white/90">
              {data?.totalReservations || 0}
            </h4>
          </div>
          {data && (
            <Badge color={data.reservationChangePercent >= 0 ? "success" : "error"}>
              {data.reservationChangePercent >= 0 ? <ArrowUpIcon /> : <ArrowDownIcon />}
              {Math.abs(data.reservationChangePercent)}%
            </Badge>
          )}
        </div>
      </div>
      
      {/* Pendapatan */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-lg dark:bg-gray-800">
          <CurrencyDollarIcon className="text-gray-800 size-5 dark:text-white/90" />
        </div>
        <div className="flex items-end justify-between mt-4">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Total Pendapatan
            </span>
            <h4 className="mt-1 font-bold text-gray-800 text-lg dark:text-white/90">
              {data ? formatCurrency(data.totalRevenue) : 'Rp 0'}
            </h4>
          </div>

          {data && (
            <Badge color={data.revenueChangePercent >= 0 ? "success" : "error"}>
              {data.revenueChangePercent >= 0 ? <ArrowUpIcon /> : <ArrowDownIcon />}
              {Math.abs(data.revenueChangePercent)}%
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
};
