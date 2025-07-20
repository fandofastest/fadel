"use client";
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import Badge from "@/components/ui/badge/Badge";
import AlertMessage from "@/components/common/AlertMessage";
import ReservationDetailDialog from "./ReservationDetailDialog";

import InputField from "@/components/form/input/InputField";
import Select from "@/components/form/Select";
import Button from "@/components/ui/button/Button";
import { CalendarIcon, ArrowUpDownIcon } from "lucide-react";
import { DayPicker, DateRange } from 'react-day-picker';
import { Reservation, ReservationStatus } from '@/types/reservation';
import { Court } from '@/types/court';
import { format } from 'date-fns';

const dayPickerClassNames = {
  months: 'flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0',
  month: 'space-y-4',
  caption: 'flex justify-center pt-1 relative items-center',
  caption_label: 'text-lg font-medium text-gray-900 dark:text-gray-50',
  nav: 'space-x-1 flex items-center',
  nav_button: 'h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 text-gray-900 dark:text-gray-50',
  table: 'w-full border-collapse space-y-1',
  head_row: 'flex',
  head_cell: 'w-10 font-normal text-[0.8rem] text-gray-500 dark:text-gray-400',
  row: 'flex w-full mt-2',
  cell: 'h-10 w-10 text-center text-sm p-0 relative first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20',
  day: 'h-10 w-10 p-0 font-normal rounded-md transition-colors hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 aria-selected:opacity-100 dark:text-gray-50 dark:hover:bg-gray-800 dark:hover:text-gray-50',
  day_selected: 'bg-brand-500 text-white hover:bg-brand-600 hover:text-white focus:bg-brand-500 focus:text-white',
  day_today: 'bg-gray-200 text-gray-900 dark:bg-gray-800 dark:text-gray-50',
  day_outside: 'text-gray-500 opacity-50 dark:text-gray-400',
  day_disabled: 'text-gray-500 opacity-50 dark:text-gray-400',
  day_range_middle: 'aria-selected:bg-gray-200 aria-selected:text-gray-900 dark:aria-selected:bg-gray-800 dark:aria-selected:text-gray-50',
  day_hidden: 'invisible',
};

export default function AdminReservationPage() {
  const [data, setData] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Reservation | null>(null);
  const [alert, setAlert] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const alertTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [courts, setCourts] = useState<Court[]>([]);
  const [filters, setFilters] = useState({
    userName: '',
    courtId: '',
    status: '',
    dateRange: undefined as DateRange | undefined,
  });
  const [sortBy, setSortBy] = useState<{ field: string; order: 'asc' | 'desc' }>({ field: 'createdAt', order: 'desc' });
  const [isDatePickerOpen, setDatePickerOpen] = useState(false);
  const [tempDateRange, setTempDateRange] = useState<DateRange | undefined>(filters.dateRange);
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  const handleFilterChange = (filterName: keyof typeof filters, value: any) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
  };

  const handleSort = (field: string) => {
    setSortBy(prev => ({
      field,
      order: prev.field === field && prev.order === 'asc' ? 'desc' : 'asc'
    }));
  };
  
  const toggleAccordion = (id: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const fetchReservations = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    params.append('page', '1');
    params.append('limit', '1000');
    if (filters.userName) params.append('userName', filters.userName);
    if (filters.courtId) params.append('courtId', filters.courtId);
    if (filters.status) params.append('status', filters.status);
    if (filters.dateRange?.from) params.append('startDate', filters.dateRange.from.toISOString());
    if (filters.dateRange?.to) params.append('endDate', filters.dateRange.to.toISOString());
    params.append('sortBy', sortBy.field);
    params.append('sortOrder', sortBy.order);

    fetch(`/api/reservations?${params.toString()}`)
      .then((res) => res.json())
      .then((res) => {
        if (res.success) {
          setData(res.data);
        } else {
          setError(res.message);
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [filters, sortBy]);

  useEffect(() => {
    fetchReservations();
  }, [fetchReservations]);

  useEffect(() => {
    // Fetch courts for the filter dropdown
    fetch('/api/courts')
      .then(res => res.json())
      .then(data => {
        if(data.success) {
          setCourts(data.data);
        }
      });
  }, []);

  const courtOptions = [
    { value: '', label: 'Semua Lapangan' },
    ...courts.map(court => ({ value: court._id, label: court.name }))
  ];

  const statusOptions = [
    { value: '', label: 'Semua Status' },
    ...Object.values(ReservationStatus).map(status => ({ value: status, label: status }))
  ];

  function showAlert(message: string, type: "success" | "error" = "success") {
    setAlert({ message, type });
    if (alertTimeoutRef.current) clearTimeout(alertTimeoutRef.current);
    alertTimeoutRef.current = setTimeout(() => setAlert(null), 3000);
  }

  return (
    <>
      <ReservationDetailDialog 
        open={!!selected}
        onClose={() => setSelected(null)}
        reservation={selected}
        onUpdate={fetchReservations}
      />
      {isDatePickerOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        >
          <div 
            className="bg-white dark:bg-gray-900 rounded-xl shadow-lg w-auto p-6 relative mx-auto border dark:border-gray-700"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Pilih Rentang Tanggal
                </h3>
                <button
                    className="text-gray-400 hover:text-gray-800 dark:hover:text-white text-2xl font-bold"
                    onClick={() => setDatePickerOpen(false)}
                    aria-label="Tutup"
                >
                    &times;
                </button>
            </div>
            <DayPicker
              mode="range"
              defaultMonth={tempDateRange?.from}
              selected={tempDateRange}
              onSelect={setTempDateRange}
              numberOfMonths={2}
              classNames={dayPickerClassNames}
            />
            <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => setDatePickerOpen(false)}>Batal</Button>
                <Button onClick={() => {
                    handleFilterChange('dateRange', tempDateRange);
                    setDatePickerOpen(false);
                }}>Terapkan</Button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto p-4 md:p-8">
        <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Daftar Semua Reservasi</h1>
        {alert && (
          <AlertMessage
            message={alert.message}
            type={alert.type}
            onClose={() => setAlert(null)}
          />
        )}
        <div className="rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] shadow-sm">
          <div className="max-w-full overflow-x-auto">
            <div className="min-w-[1000px] md:block hidden">  {/* Only visible on desktop */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <InputField 
                  placeholder="Cari berdasarkan nama..."
                  value={filters.userName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFilterChange('userName', e.target.value)}
                />
                <Select 
                  options={courtOptions}
                  placeholder="Semua Lapangan"
                  onChange={(value) => handleFilterChange('courtId', value)}
                  defaultValue={filters.courtId}
                />
                <Select 
                  options={statusOptions}
                  placeholder="Semua Status"
                  onChange={(value) => handleFilterChange('status', value)}
                  defaultValue={filters.status}
                />
                <div className="relative">
                  <Button
                    variant={"outline"}
                    onClick={() => {
                      setTempDateRange(filters.dateRange);
                      setDatePickerOpen(true);
                    }}
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.dateRange?.from ? (
                      filters.dateRange.to ? (
                        <>{format(filters.dateRange.from, "LLL dd, y")} - {format(filters.dateRange.to, "LLL dd, y")}</>
                      ) : (
                        format(filters.dateRange.from, "LLL dd, y")
                      )
                    ) : (
                      <span>Pilih tanggal</span>
                    )}
                  </Button>
                  
                </div>
              </div>
              <Table>
                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                  <TableRow>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400 whitespace-nowrap">Tanggal</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400 whitespace-nowrap">User</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400 whitespace-nowrap">Lapangan</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400 whitespace-nowrap">Jam</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400 whitespace-nowrap">Status</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-end text-xs dark:text-gray-400 whitespace-nowrap">
                      <Button variant="outline" onClick={() => handleSort('totalAmount')}>
                        Total
                        <ArrowUpDownIcon className="ml-2 h-4 w-4" />
                      </Button>
                    </TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400 whitespace-nowrap">Aksi</TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {loading ? (
                    <TableRow><TableCell colSpan={7} className="py-8 text-center text-gray-400 dark:text-gray-500">Loading...</TableCell></TableRow>
                  ) : error ? (
                    <TableRow><TableCell colSpan={7} className="py-8 text-center text-red-500">{error}</TableCell></TableRow>
                  ) : data.length === 0 ? (
                    <TableRow><TableCell colSpan={7} className="py-8 text-center text-gray-400 dark:text-gray-500">Tidak ada data reservasi</TableCell></TableRow>
                  ) : (
                    data.map((r) => (
                      <TableRow key={r._id} className="hover:bg-blue-50 dark:hover:bg-white/[0.05] transition-colors">
                        <TableCell className="px-5 py-4 text-start whitespace-nowrap text-gray-700 dark:text-gray-300">{new Date(r.date).toLocaleDateString("id-ID")}</TableCell>
                        <TableCell className="px-5 py-4 text-start whitespace-nowrap font-medium text-gray-800 dark:text-white/90">{typeof r.userId === "object" ? r.userId.name : r.userId}</TableCell>
                        <TableCell className="px-5 py-4 text-start whitespace-nowrap text-gray-700 dark:text-gray-300">{typeof r.courtId === "object" ? r.courtId.name : r.courtId}</TableCell>
                        <TableCell className="px-5 py-4 text-start whitespace-nowrap text-gray-700 dark:text-gray-300">{r.slots && r.slots.length > 0 ? r.slots.map(j => `${j}:00`).join(", ") : '-'}</TableCell>
                        <TableCell className="px-5 py-4 text-start">
                          <Badge size="sm" color={
                            r.status === "PAID" ? "success" :
                            r.status === "UNPAID" ? "warning" :
                            r.status === "CANCELLED" ? "error" :
                            r.status === "CHECKED_IN" ? "info" :
                            r.status === "EXPIRED" ? "dark" : "light"
                          }>
                            {r.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="px-5 py-4 text-end text-gray-700 dark:text-gray-300">Rp{r.totalAmount?.toLocaleString("id-ID")}</TableCell>
                        <TableCell className="px-5 py-4 text-start">
                          <button className="text-blue-600 underline dark:text-blue-400" onClick={() => setSelected(r)}>Detail</button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
        
        {/* Mobile View - Accordion */}
        <div className="block md:hidden px-2">
          <div className="flex flex-col gap-4">
            {loading ? (
              <div className="text-center py-8 bg-white dark:bg-gray-800 rounded-lg shadow">
                <p className="text-gray-500 dark:text-gray-400">Loading...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8 bg-white dark:bg-gray-800 rounded-lg shadow text-red-500">
                <p>{error}</p>
              </div>
            ) : data.length === 0 ? (
              <div className="text-center py-8 bg-white dark:bg-gray-800 rounded-lg shadow">
                <p className="text-gray-500 dark:text-gray-400">Tidak ada data reservasi</p>
              </div>
            ) : (
              data.map((r) => (
                <div key={r._id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
                  {/* Accordion Header - Always visible */}
                  <div 
                    className="p-4 flex items-center justify-between cursor-pointer"
                    onClick={() => toggleAccordion(r._id)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {typeof r.courtId === "object" ? r.courtId.name : r.courtId}
                        </h3>
                        <Badge size="sm" color={
                          r.status === "PAID" ? "success" :
                          r.status === "UNPAID" ? "warning" :
                          r.status === "CANCELLED" ? "error" :
                          r.status === "CHECKED_IN" ? "info" :
                          r.status === "EXPIRED" ? "dark" : "light"
                        }>
                          {r.status}
                        </Badge>
                      </div>
                      <div className="flex justify-between mt-1">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(r.date).toLocaleDateString("id-ID")}
                        </div>
                        <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Rp{r.totalAmount?.toLocaleString("id-ID")}
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray-100 dark:bg-gray-700 rounded-full p-1 ml-3">
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        className={`h-5 w-5 text-gray-500 dark:text-gray-400 transition-transform duration-300 ${expandedItems[r._id] ? 'transform rotate-180' : ''}`} 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                  
                  {/* Accordion Content - Animated */}
                  <div 
                    className={`overflow-hidden transition-all duration-300 ${expandedItems[r._id] ? 'max-h-72' : 'max-h-0'}`}
                  >
                    <div className="p-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500 dark:text-gray-400">User:</span>
                          <span className="text-gray-900 dark:text-white font-medium">{typeof r.userId === "object" ? r.userId.name : r.userId}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500 dark:text-gray-400">Jam:</span>
                          <span className="text-gray-900 dark:text-white font-medium">{r.slots && r.slots.length > 0 ? r.slots.map(j => `${j}:00`).join(", ") : '-'}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500 dark:text-gray-400">Reservation ID:</span>
                          <span className="text-gray-900 dark:text-white text-xs font-mono overflow-hidden text-ellipsis">{r._id}</span>
                        </div>
                        
                        <div className="pt-3 mt-1 border-t border-gray-200 dark:border-gray-600 flex justify-end">
                          <button 
                            className="text-sm bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelected(r);
                            }}
                          >
                            Detail
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}
