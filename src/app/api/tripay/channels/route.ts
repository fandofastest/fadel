import { NextResponse } from 'next/server';
import axios from 'axios';

export async function GET() {
  try {
    const res = await axios.get('https://tripay.co.id/api-sandbox/merchant/payment-channel', {
      headers: { 'Authorization': `Bearer ${process.env.TRIPAY_API_KEY}` }
    });
    return NextResponse.json(res.data);
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
