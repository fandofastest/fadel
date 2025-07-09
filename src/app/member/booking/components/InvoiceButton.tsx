"use client";

import React, { useState } from 'react';
import { generateInvoicePDF } from '@/lib/generateInvoicePDF';

interface InvoiceButtonProps {
  reservationId: string;
  isDisabled?: boolean;
  className?: string;
}

export default function InvoiceButton({ reservationId, isDisabled = false, className = '' }: InvoiceButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleDownloadInvoice = async () => {
    try {
      setIsLoading(true);

      // Fetch invoice data from API
      const response = await fetch(`/api/invoices/${reservationId}`, {
        credentials: 'include',
        headers: {
          'Cache-Control': 'no-cache'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch invoice data');
      }

      const result = await response.json();
      
      if (!result.success || !result.data) {
        throw new Error(result.message || 'Invalid invoice data received');
      }

      // Debug data pembayaran
      console.log('Invoice data:', result.data);
      if (result.data.reservation.paymentData) {
        console.log('Payment data:', result.data.reservation.paymentData);
        console.log('Tripay reference:', result.data.reservation.paymentData.tripay_reference);
      } else {
        console.log('No payment data found in invoice');
      }

      // Generate PDF from data
      const pdf = generateInvoicePDF(result.data);
      
      // Save the PDF file
      const invoiceNumber = result.data.invoiceNumber || `invoice-${Date.now()}`;
      pdf.save(`${invoiceNumber}.pdf`);
      
    } catch (error: any) {
      console.error('Error downloading invoice:', error);
      alert(`Failed to download invoice: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleDownloadInvoice}
      disabled={isDisabled || isLoading}
      className={`px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-all flex items-center gap-1 ${className} ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {isLoading ? (
        <span className="flex items-center gap-1">
          <svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Loading...</span>
        </span>
      ) : (
        <>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span>Invoice</span>
        </>
      )}
    </button>
  );
}
