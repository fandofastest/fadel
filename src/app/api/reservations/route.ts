import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { nextAuthOptions } from '../auth/[...nextauth]/options';
import dbConnect from '@/lib/db';
import mongoose from 'mongoose';

// Import models from central registry
import { Court, Payment, Reservation, PricingRule } from '@/lib/models';

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
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '100', 10);
    const skip = (page - 1) * limit;

    // Filter and Sort parameters
    const status = searchParams.get('status');
    const courtId = searchParams.get('courtId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const userName = searchParams.get('userName');
    const sortBy = searchParams.get('sortBy');
    const sortOrder = searchParams.get('sortOrder') === 'desc' ? -1 : 1;

    // Filter berdasarkan role
    let pipeline: any[] = [];
    const matchStage: any = {};
    if (session.user.role === 'customer') {
      // Customer hanya bisa melihat reservasinya sendiri
      matchStage.userId = session.user.id;
    } else if (session.user.role === 'admin') {
      // Admin dapat melihat semua atau filter berdasarkan userId
      const userId = searchParams.get('userId');
      if (userId) matchStage.userId = userId;
    } else {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 403 }
      );
    }

    if (status) matchStage.status = status;
    if (courtId) matchStage.courtId = new mongoose.Types.ObjectId(courtId);
    if (startDate && endDate) {
      matchStage.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    // Initial match for reservation fields
    if (Object.keys(matchStage).length > 0) {
      pipeline.push({ $match: matchStage });
    }

    // 2. Lookup user
    pipeline.push({
      $lookup: {
        from: 'users',
        localField: 'userId',
        foreignField: '_id',
        as: 'userData'
      }
    });
    pipeline.push({ $unwind: '$userData' });

    // 3. Match by user name if provided
    if (userName) {
      pipeline.push({ 
        $match: { 'userData.name': { $regex: userName, $options: 'i' } }
      });
    }

    // 4. Lookup court
    pipeline.push({
      $lookup: {
        from: 'courts',
        localField: 'courtId',
        foreignField: '_id',
        as: 'courtData'
      }
    });
    pipeline.push({ $unwind: '$courtData' });

    // 5. Lookup payment
    pipeline.push({
      $lookup: {
        from: 'payments',
        localField: 'paymentId',
        foreignField: '_id',
        as: 'paymentInfo'
      }
    });
    // Use $unwind with preserveNullAndEmptyArrays to keep reservations without payments
    pipeline.push({ $unwind: { path: '$paymentInfo', preserveNullAndEmptyArrays: true } });

    // 6. Project to reshape the data
    pipeline.push({
      $project: {
        _id: 1,
        date: 1,
        slots: 1,
        status: 1,
        totalAmount: 1,
        createdAt: 1,
        userId: {
          _id: '$userData._id',
          name: '$userData.name',
          email: '$userData.email',
          phone: '$userData.phone',
        },
        courtId: {
          _id: '$courtData._id',
          name: '$courtData.name',
          type: '$courtData.type',
          price: '$courtData.price',
        },
        paymentData: '$paymentInfo'
      }
    });

    // 7. Sort stage
    const sortStage: any = {};
    if (sortBy) {
      sortStage[sortBy] = sortOrder;
    } else {
      sortStage.createdAt = -1; // Default sort
    }
    pipeline.push({ $sort: sortStage });

    // 8. Pagination stages
    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: limit });

    // To get the total count for pagination, we need a separate pipeline without pagination stages
    let countPipeline = [...pipeline];
    countPipeline.pop(); // remove limit
    countPipeline.pop(); // remove skip
    countPipeline.push({ $count: 'total' });

    const totalResult = await Reservation.aggregate(countPipeline);
    const totalReservations = totalResult.length > 0 ? totalResult[0].total : 0;

    const reservations = await Reservation.aggregate(pipeline);

    return NextResponse.json({
      success: true,
      data: reservations,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(totalReservations / limit),
        totalRecords: totalReservations,
      },
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
    const { courtId, date, slots, paymentMethodId } = body;

    if (!courtId || !date || !Array.isArray(slots) || slots.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Court ID, date, dan slots (array jam) wajib diisi' },
        { status: 400 }
      );
    }
    
    // Validasi metode pembayaran
    if (!paymentMethodId) {
      return NextResponse.json(
        { success: false, message: 'Metode pembayaran wajib dipilih' },
        { status: 400 }
      );
    }

    // Validasi waktu operasional (misal, 8:00-22:00)
    if (slots.some((h: number) => h < 8 || h > 21)) {
      return NextResponse.json(
        { success: false, message: 'Jam reservasi di luar jam operasional (08:00-22:00)' },
        { status: 400 }
      );
    }

    // Cek apakah lapangan tersedia (overlap sudah dicek di pre-save, tapi bisa cek manual juga)
    const reservationDate = new Date(date);
    
    // Use imported Court model directly
    const court = await Court.findById(courtId);
    
    if (!court) {
      return NextResponse.json(
        { success: false, message: 'Court not found' },
        { status: 404 }
      );
    }

    // Hitung total harga berdasarkan PricingRule
    const dayOfWeek = reservationDate.getDay();
    
    // Use imported PricingRule model directly
    
    const rules = await PricingRule.find({
      courtId,
      startDayOfWeek: { $lte: dayOfWeek },
      endDayOfWeek: { $gte: dayOfWeek }
    }).lean();
    if (!rules || rules.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Tidak ada aturan harga (PricingRule) untuk lapangan dan hari ini.' },
        { status: 400 }
      );
    }
    let totalAmount = 0;
    for (const hour of slots) {
      const rule = rules.find(r => hour >= r.startHour && hour < r.endHour);
      if (!rule) {
        return NextResponse.json(
          { success: false, message: `Tidak ada aturan harga untuk jam ${hour}:00. Silakan cek PricingRule.` },
          { status: 400 }
        );
      }
      totalAmount += rule.rate;
    }
    console.log('Total harga berdasarkan PricingRule:', totalAmount);

    try {
      // 1. Buat reservasi baru tanpa transaksi
      const newReservation = await Reservation.create({
        userId: session.user.id,
        courtId,
        date: reservationDate,
        slots,
        status: 'UNPAID',
        totalAmount
      });
      
      // 2. Buat payment record - use imported Payment model
      const reference = `PAY-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      
      const payment = await Payment.create({
        reservationId: newReservation._id,
        amount: totalAmount,
        status: 'PENDING',
        method: paymentMethodId,
        reference: reference,
      });
      
      // 3. Update reservasi dengan paymentId
      await Reservation.findByIdAndUpdate(
        newReservation._id,
        { paymentId: payment._id }
      );
      
      // Populate data untuk response
      const populatedReservation = await Reservation.findById(newReservation._id)
        .populate('courtId', 'name type price');
      
      // Manually add payment data
      const populatedData = populatedReservation.toObject();
      populatedData.paymentData = payment;
        
      return NextResponse.json(
        { success: true, data: populatedData },
        { status: 201 }
      );
    } catch (error) {
      // Tangani error tanpa rollback transaksi
      console.error('Error dalam pembuatan reservasi:', error);
      throw error;
    }
  } catch (error: any) {
    console.error('Error creating reservation:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to create reservation' },
      { status: 500 }
    );
  }
}
