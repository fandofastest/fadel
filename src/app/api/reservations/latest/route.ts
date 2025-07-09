import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { nextAuthOptions } from '../../auth/[...nextauth]/options';
import dbConnect from '@/lib/db';
import mongoose from 'mongoose';
import Reservation from '@/models/Reservation';
import Court from '@/models/Court';
import { cookies } from 'next/headers';

// Helper function untuk mendapatkan reservasi terbaru bulan ini milik userId tertentu
async function getLatestReservationsThisMonth(reservations: any[], userId: string | null = null) {
  try {
    // Dapatkan awal bulan dan akhir bulan
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    console.log(`Mencari reservasi dari ${firstDayOfMonth.toISOString()} sampai ${lastDayOfMonth.toISOString()}`);
    
    // Filter reservasi bulan ini dan milik user yang sedang login (jika userId tersedia)
    const thisMonthReservations = reservations.filter(res => {
      const resDate = new Date(res.createdAt);
      const dateMatch = resDate >= firstDayOfMonth && resDate <= lastDayOfMonth;
      
      // Jika userId tersedia, filter berdasarkan userId
      if (userId) {
        const resUserId = res.userId?.toString();
        console.log(`Membandingkan userId session: ${userId} dengan userId reservasi: ${resUserId}`);
        return dateMatch && resUserId === userId;
      }
      
      // Jika tidak ada userId, hanya filter berdasarkan tanggal
      return dateMatch;
    });
    
    // Urutkan berdasarkan createdAt secara descending (terbaru dulu)
    const sortedReservations = thisMonthReservations.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    // Ambil hingga 5 reservasi terbaru
    const latestReservations = sortedReservations.slice(0, 5);
    
    console.log(`Mengembalikan ${latestReservations.length} reservasi terbaru bulan ini`);
    
    // Lakukan populate untuk semua reservasi
    const populatedReservations = await Promise.all(latestReservations.map(async (res) => {
      try {
        const court = await Court.findById(res.courtId);
        return {
          ...res.toObject(),
          courtId: court
        };
      } catch (error) {
        console.error('Error populating court for reservation', res._id, ':', error);
        return res.toObject(); // Kembalikan tanpa populate jika error
      }
    }));
    
    return NextResponse.json({
      success: true,
      data: populatedReservations
    });
  } catch (error) {
    console.error('Error getting latest reservations:', error);
    return NextResponse.json({
      success: false,
      message: 'Error getting latest reservations'
    }, { status: 500 });
  }
}

// GET /api/reservations/latest - Mengambil reservasi terbaru bulan ini untuk user yang login
export async function GET(request: Request) {
  try {
    await dbConnect();
    
    // Parse query parameters
    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    const courtId = url.searchParams.get('courtId');
    const search = url.searchParams.get('search');
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    
    console.log('Query params:', { status, courtId, search, page, limit });
    
    // Periksa autentikasi (tapi jangan langsung kembalikan error)
    const session = await getServerSession(nextAuthOptions);
    let userId = session?.user?.id;
    
    // Buat query dasar
    let query: any = {};
    
    // Tambahkan filter userId jika ada
    if (userId) {
      try {
        // Coba dengan userId sebagai ObjectId
        query.userId = new mongoose.Types.ObjectId(userId);
      } catch (error) {
        // Jika gagal, gunakan userId sebagai string
        query.userId = userId;
      }
    }
    
    // Tambahkan filter status jika ada
    if (status && status !== 'all') {
      query.status = status;
    }
    
    // Tambahkan filter courtId jika ada
    if (courtId && courtId !== 'all') {
      try {
        // Coba dengan courtId sebagai ObjectId
        query.courtId = new mongoose.Types.ObjectId(courtId);
      } catch (error) {
        // Jika gagal, gunakan courtId sebagai string
        query.courtId = courtId;
      }
    }
    
    console.log('Query filter:', JSON.stringify(query));
    
    // Hitung total data yang sesuai filter
    const total = await Reservation.countDocuments(query);
    const totalPages = Math.ceil(total / limit);
    
    // Query database dengan filter dan pagination
    let userReservations = await Reservation.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('courtId');
    
    console.log(`Ditemukan ${userReservations.length} reservasi sesuai filter`);
    
    // Kembalikan response dengan data dan metadata pagination
    return NextResponse.json({
      success: true,
      data: userReservations,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
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
