"use client";

import { useState, useEffect, useRef } from 'react';
import { Html5Qrcode, Html5QrcodeScanType, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import React from 'react';

export default function QRCodeScannerPage() {
  const [scanResult, setScanResult] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [reservationData, setReservationData] = useState<any>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const checkReservationExpired = (reservation: any) => {
    if (!reservation || !reservation.date || !reservation.slots || reservation.slots.length === 0) {
      return false;
    }
    
    const reservationDate = new Date(reservation.date);
    const lastSlot = Math.max(...reservation.slots);
    
    reservationDate.setHours(lastSlot + 1, 0, 0, 0);
    
    const now = new Date();
    return now > reservationDate;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("id-ID", { 
      dateStyle: 'full', 
      timeStyle: 'short' 
    });
  };

  const onScanSuccess = async (decodedText: string) => {
    stopScanner();
    setScanResult(decodedText);
    
    if (decodedText) {
      try {
        setIsLoading(true);
        
        let reservationId = decodedText;
        if (decodedText.startsWith('reservation:')) {
          reservationId = decodedText.split(':')[1];
        }
        
        const response = await fetch(`/api/reservations/${reservationId}`);
        
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        const responseData = await response.json();
        
        // Ekstrak data reservasi dari property 'data' dalam respons API
        if (responseData.success && responseData.data) {
          const reservationData = responseData.data;
          
          // Cek apakah reservasi sudah expired
          const isExpired = checkReservationExpired(reservationData);
          if (isExpired && reservationData.status !== 'EXPIRED') {
            reservationData._isTimeExpired = true;
          }
          
          // Set data reservasi yang sudah diekstrak
          setReservationData(reservationData);
        } else {
          // Jika tidak ada data.data, kembalikan error
          throw new Error(responseData.message || 'Format data reservasi tidak valid');
        }
        setIsLoading(false);
      } catch (err: any) {
        console.error("Error fetching reservation:", err);
        setError(`Gagal mengambil data reservasi: ${err.message}`);
        setIsLoading(false);
      }
    }
  };

  const onScanFailure = (error: string) => {
    // We don't want to spam the console for every failed scan
    // console.warn(`QR scan error: ${error}`);
  };

  const stopScanner = async () => {
    try {
      if (scannerRef.current) {
        // Periksa apakah scanner sedang berjalan
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop();
        }
        scannerRef.current = null;
      }
      setIsScanning(false);
      return true;
    } catch (error) {
      console.error("Failed to stop scanner", error);
      return false;
    }
  };

  const startScanner = async () => {
    try {
      setError('');
      setScanResult('');
      setReservationData(null);
      
      // Pastikan scanner sebelumnya sudah dibersihkan
      await stopScanner();
      
      // Set isScanning ke true sehingga div qr-reader akan dirender
      setIsScanning(true);
    } catch (error: any) {
      console.error("Error in startScanner:", error);
      setError(`Gagal memulai scanner: ${error.toString()}`);
      setIsScanning(false);
    }
  };
  
  // Gunakan useEffect untuk menginisialisasi scanner setelah div qr-reader ada di DOM
  useEffect(() => {
    // Hanya jalankan efek ini ketika isScanning berubah menjadi true
    if (!isScanning) return;
    
    // Berikan waktu untuk DOM dirender sebelum mencoba akses elemen
    const initializeScanner = async () => {
      try {
        // Periksa apakah elemen sudah ada di DOM
        const qrReaderElement = document.getElementById("qr-reader");
        
        if (!qrReaderElement) {
          throw new Error("Element with id=qr-reader not found");
        }
        
        // Inisialisasi scanner dengan ID elemen
        const html5QrCode = new Html5Qrcode("qr-reader");
        scannerRef.current = html5QrCode;
        
        // Mulai scanning dengan kamera
        const cameras = await Html5Qrcode.getCameras();
        if (cameras && cameras.length > 0) {
          // Pilih kamera belakang jika ada beberapa kamera
          let cameraId;
          
          // Kamera belakang biasanya adalah kamera terakhir dalam daftar atau memiliki 'back' dalam namanya
          if (cameras.length > 1) {
            // Coba temukan kamera yang memiliki 'back' dalam namanya (atau variasinya)
            const backCamera = cameras.find(camera => 
              camera.label.toLowerCase().includes('back') ||
              camera.label.toLowerCase().includes('rear') ||
              camera.label.toLowerCase().includes('belakang')
            );
            
            // Jika ditemukan, gunakan itu, jika tidak gunakan kamera terakhir dalam daftar
            if (backCamera) {
              cameraId = backCamera.id;
            } else {
              cameraId = cameras[cameras.length - 1].id; // Biasanya kamera belakang
            }
          } else {
            // Hanya ada satu kamera
            cameraId = cameras[0].id;
          }
          
          await html5QrCode.start(
            cameraId, 
            {
              fps: 10,
              qrbox: { width: 250, height: 250 },
              aspectRatio: 1.0
            },
            (decodedText) => {
              onScanSuccess(decodedText);
            },
            (errorMessage) => {
              // Kita tidak perlu memproses error pemindaian di sini
              onScanFailure(errorMessage);
            }
          );
        } else {
          setError("Tidak dapat menemukan kamera. Pastikan Anda memberikan izin akses kamera.");
          setIsScanning(false);
        }
      } catch (error: any) {
        console.error("Error initializing scanner:", error);
        setError(`Gagal menginisialisasi scanner: ${error.toString()}`);
        setIsScanning(false);
      }
    };
    
    // Jalankan dalam setTimeout untuk memastikan DOM sudah dirender
    const timerId = setTimeout(initializeScanner, 500);
    
    // Cleanup jika komponen di-unmount atau isScanning berubah
    return () => {
      clearTimeout(timerId);
    };
  }, [isScanning]);

  const checkIn = async () => {
    if (!reservationData || !reservationData._id) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`/api/reservations/${reservationData._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'CHECKED_IN' }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Gagal mengubah status ke CHECKED_IN');
      }
      
      const updatedResponse = await fetch(`/api/reservations/${reservationData._id}`, {
        credentials: 'include', // Mengirim cookies autentikasi
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      const responseData = await updatedResponse.json();
      
      // Ekstrak data reservasi dari property 'data' dalam respons API
      if (responseData.success && responseData.data) {
        setReservationData(responseData.data);
      } else {
        throw new Error(responseData.message || 'Format data reservasi tidak valid');
      }
      setIsLoading(false);
    } catch (err: any) {
      console.error("Error updating reservation:", err);
      setError(`Gagal check-in: ${err.message}`);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        try {
          if (scannerRef.current.isScanning) {
            scannerRef.current.stop();
          }
        } catch (error) {
          console.error("Error stopping scanner:", error);
        }
      }
    };
  }, []);

  return (
    <div className="max-w-md mx-auto p-3">
      <h1 className="text-xl font-bold mb-3">Scan QR Reservasi</h1>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-3 mb-4">
        <div className="mb-3">
          <h2 className="text-base font-medium mb-1">Petunjuk:</h2>
          <p className="text-xs text-gray-600 dark:text-gray-300 mb-2">
            Scan kode QR dari reservasi pelanggan untuk check-in atau melihat detail reservasi.
          </p>
        </div>

        {!isScanning && (
          <button
            onClick={startScanner}
            className="w-full py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md"
          >
            Mulai Scan QR Code
          </button>
        )}

        {isScanning && (
          <>
            <div id="qr-reader" className="w-full aspect-square overflow-hidden"></div>
            <button
              onClick={stopScanner}
              className="mt-2 w-full py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-md"
            >
              Berhenti Scan
            </button>
          </>
        )}

        {error && (
          <div className="mt-4 p-3 bg-red-100 text-red-800 rounded-md">
            <p className="font-medium">Error:</p>
            <p>{error}</p>
          </div>
        )}

        {isLoading && (
          <div className="flex justify-center my-4">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        )}

        {reservationData && (
          <div className="mt-4 bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
            <h2 className="text-base font-semibold mb-2">Detail Reservasi</h2>
            
            <div className="grid grid-cols-2 gap-1 mb-3">
              <div className="space-y-2 col-span-2">
                <div className="flex justify-between">
                  <span className="font-medium">Status:</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    reservationData.status === 'PAID' ? 'bg-green-100 text-green-800' :
                    reservationData.status === 'UNPAID' ? 'bg-yellow-100 text-yellow-800' :
                    reservationData.status === 'CHECKED_IN' ? 'bg-blue-100 text-blue-800' :
                    reservationData.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {reservationData.status}
                  </span>
                </div>

                <div className="space-y-1 pt-1 border-t border-gray-200 dark:border-gray-600 text-xs">
                  <div><span className="font-medium">Tanggal:</span> {formatDate(reservationData.date)}</div>
                  <div><span className="font-medium">Pengguna:</span> {reservationData.userId?.name || '-'}</div>
                  <div><span className="font-medium">Lapangan:</span> {reservationData.courtId?.name || '-'}</div>
                  <div><span className="font-medium">Jam:</span> {reservationData.slots?.map((j: number) => `${j}:00`).join(", ") || '-'}</div>
                  <div className="font-medium">Total: Rp{reservationData.totalAmount?.toLocaleString("id-ID")}</div>
                </div>
              </div>
            </div>

            {/* Status sudah dibayar & masih dalam waktu reservasi */}
            {reservationData.status === 'PAID' && !reservationData._isTimeExpired && (
              <button
                onClick={checkIn}
                disabled={isLoading}
                className="w-full py-1.5 text-sm bg-green-600 hover:bg-green-700 text-white font-medium rounded-md disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Proses...' : 'Check-in Pengunjung'}
              </button>
            )}

            {/* Status sudah dibayar tapi waktu sudah lewat */}
            {reservationData.status === 'PAID' && reservationData._isTimeExpired && (
              <div className="w-full py-1.5 bg-red-100 text-red-800 text-center text-xs font-medium rounded-md">
                Waktu reservasi sudah lewat
              </div>
            )}

            {/* Status sudah check-in */}
            {reservationData.status === 'CHECKED_IN' && (
              <div className="w-full py-1.5 bg-blue-100 text-blue-800 text-center text-xs font-medium rounded-md">
                Pengunjung sudah check-in
              </div>
            )}

            {/* Status selain PAID dan CHECKED_IN */}
            {(reservationData.status !== 'PAID' && reservationData.status !== 'CHECKED_IN') && (
              <div className="w-full py-1.5 bg-yellow-100 text-yellow-800 text-center text-xs font-medium rounded-md">
                Status: {reservationData.status?.toLowerCase() || '-'} - tidak dapat check-in
              </div>
            )}

            <button
              onClick={() => {
                setReservationData(null);
                setScanResult('');
              }}
              className="w-full mt-2 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm font-medium rounded-md"
            >
              Scan QR Code Lain
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
