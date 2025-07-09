import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Reservation } from '@/types/reservation';

interface InvoiceData {
  invoiceNumber: string;
  date: string;
  reservation: Reservation;
}

// Extend jsPDF type definition untuk menambahkan properti lastAutoTable
declare module 'jspdf' {
  interface jsPDF {
    lastAutoTable: {
      finalY: number;
    };
  }
}

// Format tanggal Indonesia
function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('id-ID', {
    day: 'numeric', 
    month: 'long', 
    year: 'numeric'
  });
}

// Format waktu slots - menampilkan rentang waktu 1 jam untuk setiap slot
function formatSlots(slots: number[]) {
  if (!slots || slots.length === 0) return "-";
  const sortedSlots = [...slots].sort((a, b) => a - b);
  return sortedSlots.map(slot => {
    const startHour = slot.toString().padStart(2, '0');
    const endHour = (slot + 1).toString().padStart(2, '0');
    return `${startHour}:00-${endHour}:00`;
  }).join(', ');
}

// Format harga
function formatCurrency(amount: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount);
}

/**
 * Menghasilkan dokumen PDF untuk invoice reservasi
 * @param data Data invoice dan reservasi
 * @returns Objek jsPDF yang siap diunduh
 */
export function generateInvoicePDF(data: InvoiceData): jsPDF {
  const { invoiceNumber, date, reservation } = data;
  
  // Buat objek PDF dengan orientasi portrait, satuan pt, ukuran A4
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4'
  });
  
  // Ukuran kertas
  const pageWidth = pdf.internal.pageSize.getWidth();
  
  // Header
  pdf.setFontSize(20);
  pdf.setFont('helvetica', 'bold');
  pdf.text('INVOICE', pageWidth / 2, 50, { align: 'center' });
  
  // Logo & Info Bisnis
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Malay Futsal', 40, 80);
  
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Jl. Melur Ujung No.45, Sidomulyo Bar.,', 40, 95);
  pdf.text('Kec. Tampan, Kota Pekanbaru, Riau 28294', 40, 110);
  pdf.text('Telepon: 0852-7409-0702', 40, 125);
  pdf.text('Jam: Buka 24 jam', 40, 140);
  pdf.text('Provinsi: Riau', 40, 155);
  
  // Detail Invoice
  pdf.setFontSize(10);
  pdf.text(`No. Invoice: ${invoiceNumber}`, pageWidth - 40, 80, { align: 'right' });
  pdf.text(`Tanggal: ${formatDate(date)}`, pageWidth - 40, 95, { align: 'right' });
  pdf.text(`Status: ${reservation.status}`, pageWidth - 40, 110, { align: 'right' });
  
  // Garis pembatas
  pdf.setDrawColor(220, 220, 220);
  pdf.line(40, 175, pageWidth - 40, 175);
  
  // Detail Pelanggan
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Detail Pelanggan:', 40, 195);
  
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Nama: ${reservation.userId.name}`, 40, 215);
  pdf.text(`Email: ${reservation.userId.email}`, 40, 230);
  
  // Detail Reservasi
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Detail Reservasi:', 40, 265);
  
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Lapangan: ${reservation.courtId.name}`, 40, 285);
  pdf.text(`Tanggal: ${formatDate(reservation.date)}`, 40, 300);
  pdf.text(`Jam: ${formatSlots(reservation.slots)}`, 40, 315);
  
  // Tabel item
  autoTable(pdf, {
    startY: 345,
    head: [['Deskripsi', 'Jumlah', 'Harga', 'Total']],
    body: [
      [
        `${reservation.courtId.name} (${formatSlots(reservation.slots)})`, 
        `${reservation.slots.length} jam`, 
        formatCurrency(reservation.totalAmount / reservation.slots.length),
        formatCurrency(reservation.totalAmount)
      ],
    ],
    foot: [
      ['', '', 'Total', formatCurrency(reservation.totalAmount)],
    ],
    theme: 'striped',
    headStyles: { fillColor: [66, 139, 202], textColor: [255, 255, 255] },
    footStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: 'bold' },
    margin: { top: 40, right: 40, bottom: 60, left: 40 },
  });
  
  // Detail Pembayaran
  let yPos = pdf.lastAutoTable.finalY + 40;
  
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Detail Pembayaran:', 40, yPos);
  
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  
  if (reservation.paymentData) {
    const payment = reservation.paymentData;
    let methodName = '-';
    
    // Periksa format dari payment method
    if (payment.method) {
      if (typeof payment.method === 'object' && payment.method.name) {
        methodName = payment.method.name;
      } else if (typeof payment.method === 'string') {
        methodName = payment.method;
      }
    }
    
    yPos += 20;
    pdf.text(`Metode Pembayaran: ${payment.tripay_reference?.payment_method || methodName}`, 40, yPos);
    
    yPos += 15;
    pdf.text(`No. Referensi: ${payment.reference || '-'}`, 40, yPos);
    
    yPos += 15;
    pdf.text(`Status Pembayaran: ${payment.status}`, 40, yPos);
    
    yPos += 15;
    pdf.text(`Tanggal Pembayaran: ${payment.tripay_reference?.paid_at ? 
      formatDate(new Date(payment.tripay_reference.paid_at * 1000).toISOString()) : 
      formatDate(payment.createdAt)}`, 40, yPos);
    
    // Tambahkan detail Tripay jika ada
    if (payment.tripay_reference) {
      const tripay = payment.tripay_reference;
      
      yPos += 25;
      pdf.setFont('helvetica', 'bold');
      pdf.text('Detail Transaksi Payment Gateway:', 40, yPos);
      pdf.setFont('helvetica', 'normal');
      
      yPos += 20;
      pdf.text(`Ref ID: ${tripay.reference}`, 40, yPos);
      
      yPos += 15;
      pdf.text(`Merchant Ref: ${tripay.merchant_ref}`, 40, yPos);
      
      yPos += 15;
      pdf.text(`Payment Code: ${tripay.payment_method_code}`, 40, yPos);
      
      yPos += 15;
      pdf.text(`Total Amount: ${formatCurrency(tripay.total_amount)}`, 40, yPos);
      
      if (tripay.fee_merchant > 0) {
        yPos += 15;
        pdf.text(`Fee Merchant: ${formatCurrency(tripay.fee_merchant)}`, 40, yPos);
      }
      
      if (tripay.fee_customer > 0) {
        yPos += 15;
        pdf.text(`Fee Customer: ${formatCurrency(tripay.fee_customer)}`, 40, yPos);
      }
      
      yPos += 15;
      pdf.text(`Amount Received: ${formatCurrency(tripay.amount_received)}`, 40, yPos);
    }
  } else {
    yPos += 20;
    pdf.text('Belum ada data pembayaran', 40, yPos);
  }
  
  // Footer
  yPos = pdf.internal.pageSize.getHeight() - 50;
  pdf.setFontSize(8);
  pdf.text('Terima kasih telah menggunakan layanan kami.', pageWidth / 2, yPos, { align: 'center' });
  pdf.text('Invoice ini berlaku sebagai bukti pembayaran yang sah.', pageWidth / 2, yPos + 15, { align: 'center' });
  
  return pdf;
}
