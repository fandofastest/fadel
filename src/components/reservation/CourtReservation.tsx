'use client';

import React, { useState } from 'react';
import { useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './CourtReservation.css';
import useUserName from './useUserName';
import useUserPhone from './useUserPhone';

// Tipe court
interface Court {
  _id: string;
  name: string;
  type?: string;
  surface?: string;
}



// Format currency to Indonesian Rupiah
const formatRupiah = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const CourtReservation: React.FC = () => {
  const userName = useUserName();
  const userPhone = useUserPhone();
  
  // Debugging log untuk memeriksa data telepon
  console.log('userName di CourtReservation:', userName);
  console.log('userPhone di CourtReservation:', userPhone);
  const [courts, setCourts] = useState<Court[]>([]);
  const [selectedCourt, setSelectedCourt] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [slots, setSlots] = useState<any[]>([]);
  const [selectedSlots, setSelectedSlots] = useState<number[]>([]);
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch courts on mount
  useEffect(() => {
    const fetchCourts = async () => {
      try {
        const res = await fetch('/api/courts');
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          setCourts(data.data);
        } else {
          setError('Gagal mengambil data lapangan');
        }
      } catch (e: any) {
        setError('Gagal mengambil data lapangan');
      }
    };
    fetchCourts();
  }, []);

  // Fetch slots from API when court or date changes
  const fetchSlots = async (courtId: string, date: Date) => {
    setLoading(true);
    setError(null);
    setSlots([]);
    setSelectedSlots([]);
    setTotalPrice(0);
    try {
      // Format tanggal menjadi YYYY-MM-DD
      const dateStr = date.toISOString().split('T')[0];
      const res = await fetch(`/api/courts/${courtId}/availability?date=${dateStr}`);
      if (!res.ok) throw new Error('Gagal mengambil data slot');
      const data = await res.json();
      if (data.success && Array.isArray(data.slots)) {
        setSlots(data.slots);
      } else {
        setError('Data slot tidak valid');
      }
    } catch (e: any) {
      setError(e.message || 'Gagal mengambil data slot');
    } finally {
      setLoading(false);
    }
  };

  const handleCourtSelect = (courtId: string) => {
    setSelectedCourt(courtId);
    fetchSlots(courtId, selectedDate);
  };

  const handleDateChange = (date: Date | null) => {
    if (!date) return;
    setSelectedDate(date);
    if (selectedCourt) {
      fetchSlots(selectedCourt, date);
    }
  };

  const handleSlotClick = (hourIndex: number) => {
    const slot = slots[hourIndex];
    // Slot harus available DAN rate > 0
    if (!slot?.available || slot.rate <= 0) return;
    
    if (selectedSlots.includes(hourIndex)) {
      setSelectedSlots(selectedSlots.filter(hour => hour !== hourIndex));
      setTotalPrice(prevTotal => prevTotal - slot.rate);
    } else {
      setSelectedSlots([...selectedSlots, hourIndex]);
      setTotalPrice(prevTotal => prevTotal + slot.rate);
    }
  };

  // Format time display (0 => '00:00', 13 => '13:00')
  const formatTime = (hour: number) => {
    return `${hour.toString().padStart(2, '0')}:00`;
  };

  const isConsecutive = (arr: number[]) => {
    if (arr.length <= 1) return true;
    
    const sorted = [...arr].sort((a, b) => a - b);
    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i] - sorted[i-1] !== 1) return false;
    }
    return true;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
        Pilih Lapangan dan Waktu
      </h2>

      {/* Step 1: Select Court */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
          Pilih Lapangan
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {courts.length === 0 && (
            <div className="col-span-full text-gray-500 dark:text-gray-400">Tidak ada data lapangan.</div>
          )}
          {courts.map(court => (
            <button
              key={court._id}
              onClick={() => handleCourtSelect(court._id)}
              className={`
                p-4 rounded-lg border-2 transition-all
                ${selectedCourt === court._id 
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30' 
                  : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700'}
              `}
            >
              <h4 className="font-medium text-gray-900 dark:text-white">
                {court.name}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {(court.type || '-') + (court.surface ? ` • ${court.surface}` : '')}
              </p>
            </button>
          ))}
        </div>
      </div>

      {selectedCourt && (
        <>
          {/* Step 2: Select Date */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
              Pilih Tanggal
            </h3>
            <div className="date-input-wrapper">
              <DatePicker
                selected={selectedDate}
                onChange={handleDateChange}
                minDate={new Date()}
                dateFormat="dd MMMM yyyy"
                className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                placeholderText="Pilih tanggal reservasi"
                showPopperArrow={false}
                wrapperClassName="w-full"
                popperClassName="date-picker-popper"
                monthsShown={1}
                todayButton="Hari Ini"
              />
            </div>
          </div>

          {/* Step 3: Select Time Slots */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
              Pilih Slot Waktu
            </h3>
            
            {/* Time slots with responsive design: grid for desktop, list for mobile */}
            <div className="mb-4">
              <div className="py-4 mb-6 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm font-medium text-gray-500 dark:text-gray-300 text-center shadow-sm">
                Jam Operasional (24 Jam)
              </div>
              
              {/* Desktop view: Grid */}
              <div className="hidden sm:grid grid-cols-6 md:grid-cols-8 lg:grid-cols-12 gap-2 mb-4">
                {slots.map((slot, index) => (
                  <button
                    key={`desktop-${index}`}
                    onClick={() => handleSlotClick(index)}
                    disabled={!slot.available || slot.rate <= 0}
                    className={`time-slot-button
                      ${(slot.available && slot.rate > 0)
                        ? selectedSlots.includes(index)
                          ? 'bg-blue-500 text-white shadow-md hover:bg-blue-600 active:bg-blue-700' 
                          : 'bg-green-100 hover:bg-green-200 text-green-800 dark:bg-green-900/60 dark:text-green-100 dark:hover:bg-green-800'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200 cursor-not-allowed opacity-70'
                      }
                    `}
                  >
                    <div>
                      <div className="text-sm font-medium">
                        {formatTime(slot.hour)}
                      </div>
                      <div className="text-xs font-medium mt-1">
                        {formatRupiah(slot.rate)}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              
              {/* Mobile view: List */}
              <div className="sm:hidden space-y-2">
                {slots.map((slot, index) => (
                  <button
                    key={`mobile-${index}`}
                    onClick={() => handleSlotClick(index)}
                    disabled={!slot.available || slot.rate <= 0}
                    className={`w-full flex justify-between items-center p-3 rounded-lg transition-all
                      ${(slot.available && slot.rate > 0)
                        ? selectedSlots.includes(index)
                          ? 'bg-blue-500 text-white shadow-sm hover:bg-blue-600 active:bg-blue-700' 
                          : 'bg-white hover:bg-gray-50 text-gray-900 dark:bg-gray-800 dark:text-white border border-gray-200 dark:border-gray-700'
                        : 'bg-red-50 text-red-800 dark:bg-red-900/30 dark:text-red-200 cursor-not-allowed opacity-70 border border-red-100 dark:border-red-900/50'
                      }
                    `}
                  >
                    <div className="font-medium">{formatTime(slot.hour)}</div>
                    <div className="flex items-center">
                      <div className="font-medium mr-2">{formatRupiah(slot.rate)}</div>
                      {slot.available ? (
                        selectedSlots.includes(index) ? (
                          <span className="text-white text-xs font-bold bg-blue-700 px-2 py-1 rounded-full">Dipilih</span>
                        ) : (
                          <span className="text-green-700 dark:text-green-300 text-xs font-medium">Tersedia</span>
                        )
                      ) : (
                        <span className="text-red-500 text-xs font-medium">Penuh</span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
              
              <div className="flex flex-wrap justify-center gap-4 text-sm">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-green-100 dark:bg-green-900 rounded mr-2"></div>
                  <span className="text-gray-700 dark:text-gray-300">Tersedia</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-blue-500 rounded mr-2"></div>
                  <span className="text-gray-700 dark:text-gray-300">Dipilih</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-red-100 dark:bg-red-900/50 rounded mr-2"></div>
                  <span className="text-gray-700 dark:text-gray-300">Tidak Tersedia</span>
                </div>
              </div>
            </div>
          </div>

          {/* Selected Slots Summary */}
          {selectedSlots.length > 0 && (
            <div className="mb-6">
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                  Ringkasan Pemesanan
                </h3>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Pemesan:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {userName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Nomor HP:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {userPhone || "-"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Lapangan:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {courts.find(court => court._id === selectedCourt)?.name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Tanggal:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {selectedDate.toLocaleDateString('id-ID', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Waktu:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {selectedSlots
                        .sort((a, b) => a - b)
                        .map(hour => formatTime(hour))
                        .join(', ')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Durasi:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {selectedSlots.length} jam
                    </span>
                  </div>
                </div>
                
                {!isConsecutive(selectedSlots) && (
                  <div className="bg-yellow-100 dark:bg-yellow-900/30 border-l-4 border-yellow-500 p-3 mb-4">
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                      Peringatan: Anda memilih slot waktu yang tidak berurutan. Pastikan bahwa Anda memang ingin memesan jam-jam yang terpisah.
                    </p>
                  </div>
                )}

                <div className="border-t border-gray-200 dark:border-gray-600 my-2 pt-2">
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-900 dark:text-white">Total:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {formatRupiah(totalPrice)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex justify-end">
            <button 
              type="button"
              disabled={selectedSlots.length === 0}
              className={`
                px-6 py-3 rounded-lg shadow-md transition-all font-semibold
                ${selectedSlots.length > 0 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                  : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'}
              `}
              onClick={() => {
                if (selectedSlots.length === 0) return;
                // Simpan data reservasi ke localStorage sementara
                const summary = {
                  userName,
                  userPhone, // Tambahkan nomor telepon pengguna
                  court: courts.find(court => court._id === selectedCourt)?.name,
                  courtId: selectedCourt,
                  date: selectedDate,
                  slots: selectedSlots,
                  totalPrice,
                };
                localStorage.setItem('reservation_summary', JSON.stringify(summary));
                window.location.href = '/member/checkout';
              }}
            >
              Konfirmasi & Lanjut ke Pembayaran
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default CourtReservation;
