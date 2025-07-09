import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { nextAuthOptions } from '../../auth/[...nextauth]/options';
import dbConnect from '@/lib/db';
import mongoose from 'mongoose';
import { Court, Payment, Reservation } from '@/lib/models';

// Helper untuk validasi ObjectId
const isValidObjectId = (id: string) => mongoose.Types.ObjectId.isValid(id);

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Autentikasi
    const session = await getServerSession(nextAuthOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verifikasi role admin
    if (session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const { id } = params;

    // Validasi ID
    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid payment ID format' },
        { status: 400 }
      );
    }

    // Connect to database
    await dbConnect();

    // Cari payment dengan ID yang diberikan
    const payment = await Payment.findById(id)
      .populate({
        path: 'reservationId',
        populate: [
          { path: 'userId', select: 'name email phone' },
          { path: 'courtId', select: 'name' }
        ]
      })
      .populate('method', 'name')
      .lean();

    if (!payment) {
      return NextResponse.json(
        { success: false, message: 'Payment not found' },
        { status: 404 }
      );
    }

    // Return the payment details
    return NextResponse.json({
      success: true,
      data: payment
    });
  } catch (error: any) {
    console.error(`Error in GET /api/payments/${params.id}:`, error);
    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
