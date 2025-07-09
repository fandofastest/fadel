import axios from 'axios';

// Fungsi untuk mendapatkan detail payment berdasarkan reference (merchant_ref)
export async function getPaymentByReference(reference: string) {
  try {
    // Gunakan URL absolut agar server-side rendering berjalan dengan benar
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    const res = await axios.get(`${baseUrl}/payment/detail-by-reference?reference=${reference}`);
    return res.data;
  } catch (error) {
    console.error('Error fetching payment by reference:', error);
    return { success: false, message: 'Gagal mendapatkan data pembayaran', error };
  }
}
