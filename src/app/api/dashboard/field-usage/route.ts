import { NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import { Reservation, Court } from "@/lib/models";

export async function GET() {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== 'admin') {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();
  
  // Mendapatkan semua lapangan
  const courts = await Court.find().select('name').lean();
  
  // Mendapatkan data pemakaian lapangan dalam 7 hari terakhir
  const today = new Date();
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - 6); // Ambil 7 hari termasuk hari ini
  weekStart.setHours(0, 0, 0, 0);
  
  const reservations = await Reservation.aggregate([
    {
      $match: {
        date: { $gte: weekStart },
        status: { $in: ['PAID', 'CHECKED_IN'] }
      }
    },
    {
      $lookup: {
        from: 'courts',
        localField: 'courtId',
        foreignField: '_id',
        as: 'courtData'
      }
    },
    {
      $unwind: '$courtData'
    },
    {
      $project: {
        date: 1,
        courtName: '$courtData.name',
        courtId: 1,
        slots: 1,
        dayOfWeek: { $dayOfWeek: '$date' } // 1 = Minggu, 2 = Senin, ..., 7 = Sabtu
      }
    },
    {
      $group: {
        _id: {
          courtId: '$courtId',
          courtName: '$courtName',
          dayOfWeek: '$dayOfWeek',
          dayDate: {
            $dateToString: { format: '%Y-%m-%d', date: '$date' }
          }
        },
        totalSlots: { $sum: { $size: '$slots' } }
      }
    },
    {
      $sort: { '_id.dayDate': 1, '_id.courtName': 1 }
    }
  ]);

  // Format data untuk chart
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  
  // Generate array of last 7 dates (yyyy-mm-dd)
  const last7Dates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (6 - i));
    return date.toISOString().split('T')[0];
  });
  
  // Prepare series data for each court
  const series = courts.map(court => {
    const data = Array(7).fill(0);
    
    reservations.forEach(res => {
      if (res._id.courtId.toString() === court._id.toString()) {
        // Find index in last7Dates
        const dateIndex = last7Dates.indexOf(res._id.dayDate);
        if (dateIndex !== -1) {
          data[dateIndex] = res.totalSlots;
        }
      }
    });
    
    return {
      name: court.name,
      data
    };
  });

  // Get day names for the last 7 days
  const dayLabels = last7Dates.map(dateString => {
    const date = new Date(dateString);
    const dayIndex = date.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    return days[dayIndex].substring(0, 3); // Abbreviated day name
  });

  return NextResponse.json({
    success: true,
    data: {
      categories: dayLabels,
      series
    }
  });
}
