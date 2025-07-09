import axios from 'axios';

// Fetch detail pembayaran dan reservasi berdasarkan reference (merchant_ref) dari API backend
export async function fetchPaymentDetail(merchant_ref: string) {
  // Ganti endpoint sesuai kebutuhan, misal: /api/payment/detail-by-reference?reference=xxx
  // Asumsi endpoint sudah ada dan mengembalikan detail reservasi dan pembayaran
  // Gunakan URL absolut agar SSR Next.js tidak error
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  const res = await axios.get(`${baseUrl}/api/payment/detail-by-reference?reference=${merchant_ref}`);
  return res.data;
}
