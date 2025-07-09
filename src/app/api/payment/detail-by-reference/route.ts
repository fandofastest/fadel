import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Payment from '@/models/Payment';
import Reservation from '@/models/Reservation';

// GET /api/payment/detail-by-reference?reference=PAY-xxx
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const reference = searchParams.get('reference');
  if (!reference) {
    return NextResponse.json({ success: false, message: 'Missing reference' }, { status: 400 });
  }

  await dbConnect();

  // Cari Payment by reference
  const payment = await Payment.findOne({ reference });
  if (!payment) {
    return NextResponse.json({ success: false, message: 'Payment not found' }, { status: 404 });
  }

  // Cari Reservation yang terkait (by payment._id atau payment.reservationId)
  let reservation = null;
  if (payment.reservationId) {
    reservation = await Reservation.findById(payment.reservationId)
      .populate('courtId')
      .populate('userId');
  }

  // Gabungkan data
  const data = {
    ...payment.toObject(),
    reservation: reservation ? {
      _id: reservation._id,
      courtId: reservation.courtId,
      userId: reservation.userId,
      date: reservation.date,
      slots: reservation.slots,
      status: reservation.status,
    } : undefined,
  };

  return NextResponse.json({ success: true, data });
}
