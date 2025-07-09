import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { generateTripaySignature, MERCHANT_CODE } from '@/utils/tripaySignature';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      method,
      merchant_ref,
      amount,
      customer_name,
      customer_email,
      customer_phone,
      order_items,
      return_url
    } = body;

    const apiKey = process.env.TRIPAY_API_KEY!;
    // expired_time: 24 jam dari sekarang (detik UTC)
    const expiry = Math.floor(Date.now() / 1000) + (0 * 0 * 15);//15 detik
    const signature = generateTripaySignature(merchant_ref, Number(amount));

    // DEBUG LOG
    console.log('[Tripay] Signature generated at:', new Date().toISOString());
    console.log({
      merchant_code: MERCHANT_CODE,
      merchant_ref,
      amount: Number(amount),
      signature,
      payload: {
        method,
        merchant_ref,
        amount,
        customer_name,
        customer_email,
        customer_phone,
        order_items,
        return_url: `${process.env.TRIPAY_BASE_CALLBACK_URL}/member/returnurl/${merchant_ref}`,
        expired_time: expiry,
        signature
      }
    });

    const payload = {
      method,
      merchant_ref,
      amount,
      customer_name,
      customer_email,
      customer_phone,
      order_items,
      return_url: `${process.env.TRIPAY_BASE_CALLBACK_URL}/member/returnurl/${merchant_ref}`,
      expired_time: expiry,
      signature
    };

    const res = await axios.post('https://tripay.co.id/api-sandbox/transaction/create', payload, {
      headers: { 'Authorization': 'Bearer ' + apiKey },
      validateStatus: status => status < 999
    });
    return NextResponse.json(res.data);
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message, detail: err.response?.data }, { status: 500 });
  }
}
