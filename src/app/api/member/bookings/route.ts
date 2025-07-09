import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { nextAuthOptions } from '../../auth/[...nextauth]/options';
import dbConnect from '@/lib/db';
import { Reservation, Payment, Court } from '@/lib/models';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(nextAuthOptions);

    // Cek otentikasi
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Cek role
    if (session.user.role !== 'customer') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Ambil filter dari query parameters
    const url = new URL(req.url);
    const status = url.searchParams.get('status');
    const courtId = url.searchParams.get('courtId');
    const search = url.searchParams.get('search');
    
    // Default pagination
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Connect ke database
    await dbConnect();

    // Buat filter query
    const query: any = { 
      user: session.user.id 
    };
    
    // Filter berdasarkan status
    if (status && status !== 'all') {
      query.status = status;
    }
    
    // Filter berdasarkan lapangan
    if (courtId && courtId !== 'all') {
      query.court = courtId;
    }
    
    // Filter berdasarkan pencarian (pada ID reservasi)
    if (search) {
      query.$or = [
        { _id: { $regex: search, $options: 'i' } },
        { 'courtDetails.name': { $regex: search, $options: 'i' } }
      ];
    }

    // Ambil total data untuk pagination
    const total = await Reservation.countDocuments(query);
    
    // Ambil data reservasi
    const reservations = await Reservation.find(query)
      .populate('court', 'name type')
      .populate('payment', 'method amount status')
      .sort({ date: -1, startTime: -1 })
      .skip(skip)
      .limit(limit);
      
    // Format data untuk respons
    const formattedReservations = reservations.map((reservation: any) => {
      // Format tanggal
      const date = new Date(reservation.date);
      const formattedDate = date.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
      
      // Format waktu
      const slots = reservation.timeSlots;
      const startTime = slots[0];
      const endTime = slots[slots.length - 1] + 1;
      const formattedTime = `${String(startTime).padStart(2, '0')}:00-${String(endTime).padStart(2, '0')}:00`;
      
      return {
        id: reservation._id.toString(),
        courtName: reservation.court ? `${reservation.court.name} - ${reservation.court.type}` : 'Lapangan tidak tersedia',
        date: formattedDate,
        time: formattedTime,
        price: reservation.payment ? reservation.payment.amount : 0,
        status: reservation.status,
        paymentMethod: reservation.payment ? reservation.payment.method : 'Belum ada pembayaran',
        createdAt: reservation.createdAt
      };
    });
    
    // Total halaman
    const totalPages = Math.ceil(total / limit);
    
    return NextResponse.json({
      bookings: formattedReservations,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      }
    });
    
  } catch (error) {
    console.error('Error getting member bookings:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
