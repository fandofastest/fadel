// Tripay Utility
import crypto from 'crypto';
import axios from 'axios';

const isServer = typeof window === 'undefined';

export const PRIVATE_KEY = process.env.TRIPAY_PRIVATE_KEY!
export const MERCHANT_CODE = process.env.TRIPAY_MERCHANT_CODE!
export const TRIPAY_API_KEY = process.env.TRIPAY_API_KEY!


export function generateTripaySignature(merchant_ref: string, amount: number): string {
  return crypto.createHmac('sha256', PRIVATE_KEY)
    .update(MERCHANT_CODE + merchant_ref + amount)
    .digest('hex');
}

export async function fetchTripayChannels() {
  const res = await axios.get('https://tripay.co.id/api-sandbox/merchant/payment-channel', {
    headers: { 'Authorization': 'Bearer ' + TRIPAY_API_KEY },
    validateStatus: (status) => status < 999
  });
  return res.data;
}


