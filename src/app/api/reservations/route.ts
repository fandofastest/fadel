import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { nextAuthOptions } from '../auth/[...nextauth]/options';
import dbConnect from '@/lib/db';
import Reservation from '@/models/Reservation';
import Court from '@/models/Court';

// GET /api/reservations - Mengambil daftar reservasi
export async function GET(request: Request) {
  try {
    // Periksa autentikasi
    const session = await getServerSession(nextAuthOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const courtId = searchParams.get('courtId');
    const date = searchParams.get('date');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const query: any = {};

    // Filter berdasarkan role
    if (session.user.role === 'customer') {
      // Customer hanya bisa melihat reservasinya sendiri
      query.userId = session.user.id;
    } else if (session.user.role === 'admin') {
      // Admin dapat melihat semua atau filter berdasarkan userId
      if (userId) query.userId = userId;
    } else {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Filter tambahan
    if (courtId) query.courtId = courtId;
    if (date) {
      const dateObj = new Date(date);
      query.date = {
        $gte: new Date(dateObj.setHours(0, 0, 0, 0)),
        $lt: new Date(dateObj.setHours(23, 59, 59, 999))
      };
    }
    if (status) query.status = status;

    // Hitung total untuk pagination
    const total = await Reservation.countDocuments(query);

    // Ambil reservasi dengan pagination
    const reservations = await Reservation.find(query)
      .populate('courtId', 'name type price')
      .sort({ date: -1, startHour: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return NextResponse.json({
      success: true,
      data: reservations,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error: any) {
    console.error('Error fetching reservations:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to fetch reservations' },
      { status: 500 }
    );
  }
}

// POST /api/reservations - Membuat reservasi baru
export async function POST(request: Request) {
  try {
    // Periksa autentikasi
    const session = await getServerSession(nextAuthOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Hanya customer yang boleh membuat reservasi
    if (session.user.role !== 'customer') {
      return NextResponse.json(
        { success: false, message: 'Only customers can create reservations' },
        { status: 403 }
      );
    }

    await dbConnect();
    const body = await request.json();

    // Validasi input
    const { courtId, date, startHour, endHour } = body;

    if (!courtId || !date || startHour === undefined || endHour === undefined) {
      return NextResponse.json(
        { success: false, message: 'Court ID, date, start hour, and end hour are required' },
        { status: 400 }
      );
    }

    // Validasi waktu operasional (misalnya, 8:00 - 22:00)
    if (startHour < 8 || endHour > 22 || startHour >= endHour) {
      return NextResponse.json(
        { success: false, message: 'Invalid time range. Operating hours are 08:00-22:00' },
        { status: 400 }
      );
    }

    // Cek apakah lapangan tersedia
    const reservationDate = new Date(date);
    const existingReservation = await Reservation.findOne({
      courtId,
      date: {
        $gte: new Date(reservationDate.setHours(0, 0, 0, 0)),
        $lt: new Date(reservationDate.setHours(23, 59, 59, 999))
      },
      status: { $nin: ['CANCELLED', 'EXPIRED'] },
      $or: [
        // Cek apakah ada reservasi yang overlap
        { startHour: { $lt: endHour, $gte: startHour } },
        { endHour: { $gt: startHour, $lte: endHour } },
        { $and: [{ startHour: { $lte: startHour } }, { endHour: { $gte: endHour } }] }
      ]
    });

    if (existingReservation) {
      return NextResponse.json(
        { success: false, message: 'Court is already booked for this time slot' },
        { status: 409 }
      );
    }

    // Hitung total harga
    const court = await Court.findById(courtId);
    if (!court) {
      return NextResponse.json(
        { success: false, message: 'Court not found' },
        { status: 404 }
      );
    }

    // Hitung durasi dan total harga
    const duration = endHour - startHour;
    const totalAmount = court.price * duration;

    // Buat reservasi baru
    const newReservation = await Reservation.create({
      userId: session.user.id,
      courtId,
      date: reservationDate,
      startHour,
      endHour,
      status: 'UNPAID',
      totalAmount
    });

    return NextResponse.json(
      { success: true, data: newReservation },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating reservation:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to create reservation' },
      { status: 500 }
    );
  }
}
