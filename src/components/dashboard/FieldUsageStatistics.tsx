"use client";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import ChartTab from "../common/ChartTab";

// Dynamically import the ReactApexChart component
const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

interface ChartData {
  categories: string[];
  series: Array<{
    name: string;
    data: number[];
  }>;
}

export default function FieldUsageStatistics() {
  const [chartData, setChartData] = useState<ChartData>({
    categories: [],
    series: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/dashboard/field-usage');
        if (!response.ok) {
          throw new Error('Failed to fetch field usage data');
        }
        const result = await response.json();
        setChartData(result.data);
      } catch (error) {
        console.error('Error fetching field usage data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const options: ApexOptions = {
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "bar",
      height: 150,
      stacked: true,
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "60%",
        borderRadius: 2,
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 1,
      colors: ["transparent"],
    },
    xaxis: {
      categories: chartData.categories,
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
      labels: {
        style: {
          fontSize: '10px'
        }
      }
    },
    yaxis: {
      title: {
        text: undefined,
      },
      labels: {
        formatter: function (val) {
          return val.toFixed(0) + ' jam';
        },
        style: {
          fontSize: '10px'
        }
      },
    },
    colors: ['#465FFF', '#38BDF8', '#22C55E', '#F59E0B', '#EF4444'],
    legend: {
      position: 'top',
      horizontalAlign: 'left',
      fontSize: '12px',
      fontWeight: 500,
      markers: {
        size: 8
      },
      itemMargin: {
        horizontal: 5,
        vertical: 0
      }
    },
    grid: {
      padding: {
        top: 0
      }
    },
    tooltip: {
      y: {
        formatter: function(val) {
          return val + " jam";
        }
      }
    }
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between mb-4">
        <h3 className="text-base font-semibold text-gray-800 dark:text-white/90">
          Statistik Penggunaan Lapangan
        </h3>
        <div className="flex items-center text-xs">
          <ChartTab />
        </div>
      </div>

      {loading ? (
        <div className="h-[150px] w-full flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-brand-500 border-t-transparent"></div>
        </div>
      ) : (
        <div className="max-w-full overflow-x-auto custom-scrollbar">
          <div className="min-w-[500px] xl:min-w-full">
            <ReactApexChart
              options={options}
              series={chartData.series}
              type="bar"
              height={150}
            />
          </div>
        </div>
      )}

      <div className="mt-2 p-1 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-500 dark:text-gray-400">
        <p>Total jam penggunaan lapangan dalam 7 hari terakhir</p>
      </div>
    </div>
  );
}
