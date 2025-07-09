import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code');
  const amount = req.nextUrl.searchParams.get('amount');
  if (!code || !amount) {
    return NextResponse.json({ success: false, message: 'Missing code or amount' }, { status: 400 });
  }
  try {
    const res = await axios.get(`https://tripay.co.id/api-sandbox/merchant/fee-calculator?code=${code}&amount=${amount}`, {
      headers: { 'Authorization': `Bearer ${process.env.TRIPAY_API_KEY}` }
    });
    return NextResponse.json(res.data);
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
