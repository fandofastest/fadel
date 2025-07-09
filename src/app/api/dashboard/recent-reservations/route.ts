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
  
  // Mendapatkan 5 reservasi terbaru
  const recentReservations = await Reservation.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .populate('userId', 'name email')
    .populate('courtId', 'name')
    .lean();

  return NextResponse.json({
    success: true,
    data: recentReservations
  });
}
