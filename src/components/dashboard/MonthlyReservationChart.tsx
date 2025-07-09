"use client";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import { MoreDotIcon } from "@/icons";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { useState, useEffect } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";

// Dynamically import the ReactApexChart component
const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

export default function MonthlyReservationChart() {
  const [isOpen, setIsOpen] = useState(false);
  const [chartData, setChartData] = useState({
    labels: [],
    reservationCounts: [],
    revenueData: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/dashboard/monthly-chart');
        if (!response.ok) {
          throw new Error('Failed to fetch chart data');
        }
        const result = await response.json();
        setChartData(result.data);
      } catch (error) {
        console.error('Error fetching chart data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const options: ApexOptions = {
    colors: ["#465fff", "#38bdf8"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "bar",
      height: 160,
      toolbar: {
        show: false,
      },
      stacked: false,
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "40%",
        borderRadius: 4,
        borderRadiusApplication: "end",
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 2,
      colors: ["transparent"],
    },
    xaxis: {
      categories: chartData.labels,
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
    legend: {
      show: true,
      position: "top",
      horizontalAlign: "left",
      fontFamily: "Outfit",
      fontSize: '12px',
      itemMargin: {
        horizontal: 8
      }
    },
    yaxis: [
      {
        title: {
          text: undefined,
        },
        labels: {
          style: {
            fontSize: '10px'
          }
        }
      },
      {
        opposite: true,
        title: {
          text: undefined
        },
        labels: {
          formatter: function (val) {
            return 'Rp' + val.toFixed(0);
          },
          style: {
            fontSize: '10px'
          }
        }
      }
    ],
    grid: {
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
    fill: {
      opacity: 1,
    },
    tooltip: {
      x: {
        show: true,
      },
      y: [
        {
          formatter: function (val) {
            return val + " reservasi";
          }
        },
        {
          formatter: function (val) {
            return new Intl.NumberFormat('id-ID', {
              style: 'currency',
              currency: 'IDR',
              minimumFractionDigits: 0,
            }).format(val);
          }
        }
      ]
    },
  };
  
  const series = [
    {
      name: "Reservasi",
      data: chartData.reservationCounts,
      type: "column"
    },
    {
      name: "Pendapatan",
      data: chartData.revenueData,
      type: "line"
    }
  ];

  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-base dark:text-white/90">
          Grafik Bulanan
        </h3>

        <div className="relative inline-block">
          <button onClick={toggleDropdown} className="dropdown-toggle">
            <MoreDotIcon className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300" />
          </button>
          <Dropdown
            isOpen={isOpen}
            onClose={closeDropdown}
            className="w-36 p-1"
          >
            <DropdownItem
              onItemClick={closeDropdown}
              className="flex w-full font-normal text-xs text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
            >
              Tampilkan Detail
            </DropdownItem>
          </Dropdown>
        </div>
      </div>

      <div className="max-w-full overflow-x-auto custom-scrollbar">
        {loading ? (
          <div className="h-[160px] w-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-brand-500 border-t-transparent"></div>
          </div>
        ) : (
          <div className="-ml-3 min-w-[600px] xl:min-w-full pl-2">
            <ReactApexChart
              options={options}
              series={series}
              type="line"
              height={160}
            />
          </div>
        )}
      </div>
    </div>
  );
}
