import { NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import { Reservation } from "@/lib/models";

export async function GET() {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== 'admin') {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();

  // Mendapatkan total reservasi
  const totalReservations = await Reservation.countDocuments();
  
  // Mendapatkan total reservasi bulan lalu untuk perbandingan persentase
  const today = new Date();
  const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const twoMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 2, 1);
  
  const lastMonthReservations = await Reservation.countDocuments({
    createdAt: { $gte: lastMonth, $lt: today }
  });
  
  const twoMonthsAgoReservations = await Reservation.countDocuments({
    createdAt: { $gte: twoMonthsAgo, $lt: lastMonth }
  });
  
  // Hitung persentase perubahan
  const reservationChangePercent = twoMonthsAgoReservations > 0 
    ? ((lastMonthReservations - twoMonthsAgoReservations) / twoMonthsAgoReservations) * 100 
    : 0;

  // Mendapatkan total pendapatan
  const totalRevenue = await Reservation.aggregate([
    { $match: { status: { $in: ['PAID', 'CHECKED_IN'] } } },
    { $group: { _id: null, total: { $sum: '$totalAmount' } } }
  ]);
  
  // Pendapatan bulan lalu dan dua bulan lalu
  const lastMonthRevenue = await Reservation.aggregate([
    { 
      $match: { 
        status: { $in: ['PAID', 'CHECKED_IN'] },
        createdAt: { $gte: lastMonth, $lt: today }
      } 
    },
    { $group: { _id: null, total: { $sum: '$totalAmount' } } }
  ]);
  
  const twoMonthsAgoRevenue = await Reservation.aggregate([
    { 
      $match: { 
        status: { $in: ['PAID', 'CHECKED_IN'] },
        createdAt: { $gte: twoMonthsAgo, $lt: lastMonth }
      } 
    },
    { $group: { _id: null, total: { $sum: '$totalAmount' } } }
  ]);
  
  // Hitung persentase perubahan pendapatan
  const lastMonthTotal = lastMonthRevenue.length > 0 ? lastMonthRevenue[0].total : 0;
  const twoMonthsAgoTotal = twoMonthsAgoRevenue.length > 0 ? twoMonthsAgoRevenue[0].total : 0;
  
  const revenueChangePercent = twoMonthsAgoTotal > 0 
    ? ((lastMonthTotal - twoMonthsAgoTotal) / twoMonthsAgoTotal) * 100 
    : 0;

  return NextResponse.json({ 
    success: true, 
    data: {
      totalReservations,
      reservationChangePercent: parseFloat(reservationChangePercent.toFixed(2)),
      totalRevenue: totalRevenue.length > 0 ? totalRevenue[0].total : 0,
      revenueChangePercent: parseFloat(revenueChangePercent.toFixed(2))
    }
  });
}
