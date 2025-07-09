import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Reservation from '@/models/Reservation';
import Court from '@/models/Court';

// GET /api/reservations/availability - Mengecek ketersediaan lapangan pada tanggal tertentu
export async function GET(request: Request) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get('date');
    const courtId = searchParams.get('courtId');
    
    // Validasi parameter
    if (!dateParam) {
      return NextResponse.json(
        { success: false, message: 'Date parameter is required' },
        { status: 400 }
      );
    }
    
    // Parse tanggal
    const date = new Date(dateParam);
    if (isNaN(date.getTime())) {
      return NextResponse.json(
        { success: false, message: 'Invalid date format' },
        { status: 400 }
      );
    }

    // Konfigurasi jam operasional lapangan (misalnya 8:00 - 22:00)
    const operatingHours = {
      start: 8, // 8:00 AM
      end: 22   // 10:00 PM
    };
    
    // Ambil semua lapangan jika courtId tidak dispesifikasi
    let courts;
    if (courtId) {
      courts = await Court.find({ _id: courtId });
    } else {
      courts = await Court.find({ isActive: true });
    }
    
    if (courts.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No courts found' },
        { status: 404 }
      );
    }
    
    // Ambil semua reservasi untuk tanggal tersebut yang tidak dibatalkan atau expired
    const startOfDay = new Date(date.setHours(0, 0, 0, 0));
    const endOfDay = new Date(date.setHours(23, 59, 59, 999));
    
    // Hanya status UNPAID, PAID, CHECKED_IN yang membuat slot tidak tersedia
    const reservations = await Reservation.find({
      date: { $gte: startOfDay, $lte: endOfDay },
      status: { $in: ['UNPAID', 'PAID', 'CHECKED_IN'] },
      courtId: { $in: courts.map(court => court._id) }
    });

    // Mengelompokkan reservasi berdasarkan lapangan
    const reservationsByCourtId: { [key: string]: any[] } = {};
    reservations.forEach(res => {
      const cId = res.courtId.toString();
      if (!reservationsByCourtId[cId]) {
        reservationsByCourtId[cId] = [];
      }
      reservationsByCourtId[cId].push({
        slots: res.slots, // Gunakan slots dari reservation
        status: res.status
      });
    });

    // Buat data ketersediaan untuk setiap lapangan
    const availability = courts.map(court => {
      const courtId = court._id.toString();
      const bookedSlots = reservationsByCourtId[courtId] || [];
      
      // Buat slot ketersediaan dari jam operasional
      const slots = [];
      for (let hour = operatingHours.start; hour < operatingHours.end; hour++) {
        // Periksa apakah slot ini tersedia (tidak ada di array slots reservasi)
        const isAvailable = !bookedSlots.some(
          reservation => reservation.slots.includes(hour)
        );
        
        slots.push({
          hour,
          isAvailable
        });
      }
      
      return {
        courtId: courtId,
        name: court.name,
        type: court.type,
        price: court.price,
        slots: slots
      };
    });
    
    return NextResponse.json({
      success: true,
      date: dateParam,
      operatingHours,
      availability
    });
  } catch (error: any) {
    console.error('Error checking availability:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to check availability' },
      { status: 500 }
    );
  }
}
