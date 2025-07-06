import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Court from '@/models/Court';

export async function GET() {
  try {
    await dbConnect();
    const courts = await Court.find().sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: courts });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to fetch courts' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();
    if (!body.name || !body.openTime || !body.closeTime) {
      return NextResponse.json(
        { success: false, message: 'All fields are required' },
        { status: 400 }
      );
    }
    const court = await Court.create(body);
    return NextResponse.json({ success: true, data: court }, { status: 201 });
  } catch (error: any) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e: any) => e.message);
      return NextResponse.json(
        { success: false, message: messages.join(', ') },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, message: 'Failed to create court' },
      { status: 500 }
    );
  }
}
