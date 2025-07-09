"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { generateInvoicePDF } from "@/lib/generateInvoicePDF";
import { FaArrowLeft, FaDownload, FaSpinner } from "react-icons/fa";

export default function InvoicePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { id } = useParams() as { id: string };
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState("");

  const handleDownloadInvoice = async () => {
    if (downloading) return;
    
    setDownloading(true);
    setLoading(true);
    setError("");
    
    try {
      const response = await fetch(`/api/invoices/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch invoice data");
      }

      const result = await response.json();
      
      if (!result.success || !result.data) {
        throw new Error(result.message || "Invalid invoice data received");
      }

      // Generate PDF from data
      const pdf = generateInvoicePDF(result.data);
      
      // Get filename from the payment reference or use the ID
      const paymentRef = result.data.reservation.paymentData?.reference || id;
      const filename = `Invoice-${paymentRef}.pdf`;
      
      // Download the PDF
      pdf.save(filename);
      
      setLoading(false);
    } catch (err: any) {
      setError(err.message);
      console.error("Error downloading invoice:", err);
    } finally {
      setDownloading(false);
    }
  };

  // Tidak ada useEffect untuk download otomatis

  if (!session?.user) {
    return <div className="p-4 text-center">Unauthorized access</div>;
  }

  return (
    <div className="p-2 md:p-4">
      {/* Back button and title */}
      <div className="flex items-center mb-3">
        <button
          onClick={() => router.back()}
          className="mr-2 bg-gray-200 p-1 rounded-md hover:bg-gray-300"
        >
          <FaArrowLeft size={12} />
        </button>
        <h1 className="text-lg md:text-xl font-bold">Invoice</h1>
      </div>

      <div className="bg-white shadow-sm rounded-md p-3">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-2 py-1 rounded-md mb-3 text-xs">
            {error}
          </div>
        )}

        <div className="text-center p-4">
          {downloading ? (
            <div className="flex flex-col items-center">
              <FaSpinner className="animate-spin text-blue-500 mb-2" size={24} />
              <p className="text-xs">Menyiapkan invoice...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <p className="text-xs mb-3">Silakan klik tombol di bawah untuk mengunduh invoice</p>
              <button
                onClick={handleDownloadInvoice}
                disabled={downloading}
                className="flex items-center gap-1 text-xs bg-blue-500 text-white px-2 py-1 rounded-md hover:bg-blue-600 disabled:bg-gray-400"
              >
                <FaDownload size={12} /> Unduh Invoice
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
