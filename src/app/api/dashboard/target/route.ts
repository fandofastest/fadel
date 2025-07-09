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
  
  // Mendapatkan data bulan ini
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  
  // Target default (akan diganti dengan data dari database jika sudah ada model Target)
  const targetAmount = 10000000; // Rp 10 juta default
  
  // Mendapatkan pendapatan bulan ini
  const startOfMonth = new Date(currentYear, currentMonth - 1, 1);
  const endOfMonth = new Date(currentYear, currentMonth, 0);
  
  const monthlyRevenue = await Reservation.aggregate([
    {
      $match: {
        status: { $in: ['PAID', 'CHECKED_IN'] },
        createdAt: {
          $gte: startOfMonth,
          $lte: endOfMonth
        }
      }
    },
    {
      $group: {
        _id: null,
        total: { $sum: "$totalAmount" }
      }
    }
  ]);
  
  const currentRevenue = monthlyRevenue.length > 0 ? monthlyRevenue[0].total : 0;
  const percentage = (currentRevenue / targetAmount) * 100;

  return NextResponse.json({
    success: true,
    data: {
      targetAmount,
      currentRevenue,
      percentage: parseFloat(percentage.toFixed(2)),
      remainingDays: endOfMonth.getDate() - new Date().getDate() + 1
    }
  });
}
