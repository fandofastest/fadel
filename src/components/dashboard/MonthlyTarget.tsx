"use client";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import { formatCurrency } from "@/lib/utils";

// Dynamically import the ReactApexChart component
const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

interface TargetData {
  targetAmount: number;
  currentRevenue: number;
  percentage: number;
  remainingDays: number;
}

export default function MonthlyTarget() {
  const [targetData, setTargetData] = useState<TargetData>({
    targetAmount: 0,
    currentRevenue: 0,
    percentage: 0,
    remainingDays: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/dashboard/target");
        if (!response.ok) {
          throw new Error("Failed to fetch target data");
        }
        const result = await response.json();
        setTargetData(result.data);
      } catch (error) {
        console.error("Error fetching target data:", error);
        setError("Gagal memuat data target");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const series = [targetData.percentage];
  const options: ApexOptions = {
    chart: {
      height: 180,
      type: "radialBar",
      offsetY: -10,
      sparkline: {
        enabled: true,
      },
    },
    grid: {
      padding: {
        top: -10,
      },
    },
    plotOptions: {
      radialBar: {
        startAngle: -90,
        endAngle: 90,
        track: {
          background: "#e7e7e7",
          strokeWidth: "97%",
          margin: 0,
          dropShadow: {
            enabled: false,
          },
        },
        dataLabels: {
          name: {
            show: false,
          },
          value: {
            offsetY: -2,
            fontSize: "16px",
            fontWeight: "600",
            formatter: function (val) {
              return val.toFixed(0) + "%";
            },
          },
        },
        hollow: {
          size: "50%",
        },
      },
    },
    colors: ["#465FFF"],
    labels: ["Progress"],
  };

  const currentMonth = new Date().toLocaleDateString("id-ID", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-gray-800 dark:text-white/90">
          Target Pendapatan {currentMonth}
        </h3>
      </div>

      {loading ? (
        <div className="h-[180px] w-full flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-brand-500 border-t-transparent"></div>
        </div>
      ) : error ? (
        <div className="h-[180px] w-full flex items-center justify-center text-xs text-red-500">
          {error}
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <div className="mt-1 h-[180px] w-full">
            <ReactApexChart
              options={options}
              series={series}
              type="radialBar"
              height={180}
            />
          </div>
          <div className="mt-[-40px] text-center">
            <div className="flex justify-center items-center gap-1 text-xs">
              <span className="font-medium text-gray-600 dark:text-gray-400">
                {formatCurrency(targetData.currentRevenue)}
              </span>
              <span className="text-gray-400 dark:text-gray-500">dari</span>
              <span className="font-medium text-gray-600 dark:text-gray-400">
                {formatCurrency(targetData.targetAmount)}
              </span>
            </div>
            <div className="mt-1 text-xs text-gray-500">
              {targetData.remainingDays} hari tersisa
            </div>
          </div>
          
          <div className="mt-3 grid grid-cols-2 gap-2 w-full">
            <div className="flex flex-col items-center justify-center rounded-lg bg-gray-50 p-2 dark:bg-white/[0.02]">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Pendapatan
              </span>
              <span className="text-sm font-semibold text-gray-700 dark:text-white/90">
                {formatCurrency(targetData.currentRevenue)}
              </span>
            </div>
            <div className="flex flex-col items-center justify-center rounded-lg bg-gray-50 p-2 dark:bg-white/[0.02]">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Target
              </span>
              <span className="text-sm font-semibold text-gray-700 dark:text-white/90">
                {formatCurrency(targetData.targetAmount)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
