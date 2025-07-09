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

  const currentYear = new Date().getFullYear();
  
  // Mendapatkan data reservasi per bulan
  const monthlyReservations = await Reservation.aggregate([
    {
      $match: {
        createdAt: {
          $gte: new Date(`${currentYear}-01-01`),
          $lte: new Date(`${currentYear}-12-31`)
        }
      }
    },
    {
      $group: {
        _id: { $month: "$createdAt" },
        count: { $sum: 1 },
        revenue: { $sum: "$totalAmount" }
      }
    },
    { $sort: { _id: 1 } }
  ]);
  
  // Format data untuk chart
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const reservationCounts = Array(12).fill(0);
  const revenueData = Array(12).fill(0);
  
  monthlyReservations.forEach(item => {
    const monthIndex = item._id - 1; // MongoDB bulan dimulai dari 1
    reservationCounts[monthIndex] = item.count;
    revenueData[monthIndex] = item.revenue;
  });

  return NextResponse.json({
    success: true,
    data: {
      labels: months,
      reservationCounts,
      revenueData
    }
  });
}
