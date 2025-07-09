import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Court from '@/models/Court';
import PricingRule from '@/models/PricingRule';
import Reservation from '@/models/Reservation';
import { Types } from 'mongoose';

// GET /api/courts/[id]/availability?date=YYYY-MM-DD
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Pastikan params sudah diawait sebelum digunakan
    const courtId = params.id;
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');

    if (!date) {
      return NextResponse.json(
        { success: false, message: 'Parameter "date" wajib diisi (YYYY-MM-DD)' },
        { status: 400 }
      );
    }

    // Connect to database
    await dbConnect();

    // Validate courtId
    if (!Types.ObjectId.isValid(courtId)) {
      return NextResponse.json({ success: false, message: 'Invalid court ID' }, { status: 400 });
    }

    // Fetch court
    const court = await Court.findById(courtId);
    if (!court) {
      return NextResponse.json({ success: false, message: 'Court not found' }, { status: 404 });
    }

    // Parse date and get day of week
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      return NextResponse.json({ success: false, message: 'Invalid date format' }, { status: 400 });
    }
    const dayOfWeek = dateObj.getDay(); // 0=Sunday ... 6=Saturday

    // Fetch pricing rules for this court and day
    const pricingRules = await PricingRule.find({
      courtId: court._id,
      startDayOfWeek: { $lte: dayOfWeek },
      endDayOfWeek: { $gte: dayOfWeek }
    }).lean();

    // Pendekatan lebih sederhana: gunakan tanggal yang sama langsung dari input
    // Format tanggal dari parameter: YYYY-MM-DD (misal 2025-07-07)
    
    // 1. Simpan string tanggal untuk keperluan query mongoDB
    const dateYMD = date; // contoh: 2025-07-07
    
    // 2. Buat string untuk logging yang lebih mudah dibaca
    const formattedDateStart = `${dateYMD}T00:00:00+07:00`;
    const formattedDateEnd = `${dateYMD}T23:59:59+07:00`;
    
    console.log('Tanggal yang dicari:', { 
      tanggal: dateYMD,
      rentang: `${formattedDateStart} sampai ${formattedDateEnd}`,
      courtId: court._id.toString() 
    });


    

    // Gunakan regex untuk mencari tanggal yang tepat
    // Ini akan mencari field 'date' yang tanggalnya sama persis dengan parameter tanggal
    const targetDateRegex = new RegExp(`^${dateYMD}`);
    
    // Fetch all reservations for this court and date with status UNPAID/PAID/CHECKED_IN
    const reservations = await Reservation.find({
      courtId: court._id,
      // Ubah query date menjadi lebih tepat dengan regex dan konversi ke string
      $expr: { 
        $regexMatch: {
          input: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
          regex: targetDateRegex
        }
      },
      status: { $in: ['UNPAID', 'PAID', 'CHECKED_IN'] } // Hanya status ini yang membuat slot tidak tersedia
    }).lean();
    
    // Debug log untuk reservasi yang ditemukan
    console.log('Found reservations:', JSON.stringify(reservations, null, 2));

    // Build slots for each hour (0-23)
    const slots = Array.from({ length: 24 }, (_, hour) => {
      // Find the best matching pricing rule for this hour
      const rule = pricingRules.find(rule => hour >= rule.startHour && hour < rule.endHour);
      const rate = rule ? rule.rate : 0;
      if (rate === 0) {
        return { hour, available: false, rate };
      }
      // Check if this hour is booked in any reservation (using slots array)
      const isBooked = reservations.some(res => {
        // Debug untuk slot tertentu
        if (hour === 19) {
          console.log(`Checking hour 19 against reservation:`, {
            id: res._id?.toString(),
            slots: res.slots,
            hasSlot: res.slots && Array.isArray(res.slots) && res.slots.includes(19),
            status: res.status
          });
        }
        return res.slots && Array.isArray(res.slots) && res.slots.includes(hour);
      });
      return {
        hour,
        available: !isBooked,
        rate
      };
    });

    return NextResponse.json({
      success: true,
      courtId,
      date,
      slots
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to get availability' },
      { status: 500 }
    );
  }
}
