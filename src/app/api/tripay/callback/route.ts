import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Payment from '@/models/Payment';
import Reservation from '@/models/Reservation';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const data = await req.json();
    const { merchant_ref, status } = data;
    if (!merchant_ref) {
      return NextResponse.json({ success: false, message: 'Missing merchant_ref' }, { status: 400 });
    }

    // Temukan payment berdasarkan merchant_ref
    const payment = await Payment.findOne({ reference: merchant_ref });
    if (!payment) {
      return NextResponse.json({ success: false, message: 'Payment not found' }, { status: 404 });
    }

    // Simpan seluruh data callback Tripay
    payment.tripay_reference = data;

    // Update status payment
    if (status === 'PAID') {
      payment.status = 'COMPLETED';
    } else if (status === 'FAILED') {
      payment.status = 'FAILED';
    } else if (status === 'REFUND') {
      payment.status = 'REFUNDED';
    }
    await payment.save();

    // Update status reservasi terkait
    if (payment.reservationId) {
      const reservation = await Reservation.findById(payment.reservationId);
      if (reservation) {
        if (status === 'PAID') {
          reservation.status = 'PAID';
        } else if (status === 'FAILED') {
          reservation.status = 'EXPIRED';
        } else if (status === 'REFUND') {
          reservation.status = 'CANCELLED';
        }
        await reservation.save();
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
