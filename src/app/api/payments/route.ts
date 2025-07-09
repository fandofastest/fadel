import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { nextAuthOptions } from '../auth/[...nextauth]/options';
import dbConnect from '@/lib/db';
import mongoose from 'mongoose';
import { Court, Payment, Reservation } from '@/lib/models';

export async function GET(request: Request) {
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

    // Connect to database
    await dbConnect();

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    // Build the query
    let query: any = {};
    
    if (status) {
      query.status = status;
    }

    if (search) {
      // Mencari berdasarkan reference payment atau nama pengguna
      const reservationsWithNameMatch = await Reservation.find({
        'userId.name': { $regex: search, $options: 'i' }
      }).select('_id').lean();

      const reservationIds = reservationsWithNameMatch.map(res => res._id);

      query.$or = [
        { reference: { $regex: search, $options: 'i' } },
        { reservationId: { $in: reservationIds } }
      ];
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get total count for pagination
    const total = await Payment.countDocuments(query);

    // Execute the query with pagination and sort by most recent
    const payments = await Payment.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate({
        path: 'reservationId',
        populate: [
          { path: 'userId', select: 'name email' },
          { path: 'courtId', select: 'name' }
        ]
      })
      .populate('method', 'name')
      .lean();

    // Return the results
    return NextResponse.json({
      success: true,
      data: {
        payments,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error: any) {
    console.error('Error in GET /api/payments:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
