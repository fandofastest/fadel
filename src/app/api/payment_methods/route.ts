import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import PaymentMethod from '@/models/PaymentMethod';

export async function GET() {
  try {
    await dbConnect();
    const methods = await PaymentMethod.find().sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: methods });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to fetch payment methods' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();
    if (!body.name) {
      return NextResponse.json(
        { success: false, message: 'Name is required' },
        { status: 400 }
      );
    }
    // Check if payment method already exists
    const existing = await PaymentMethod.findOne({ name: body.name });
    if (existing) {
      return NextResponse.json(
        { success: false, message: 'Payment method already exists' },
        { status: 409 }
      );
    }
    const method = await PaymentMethod.create({
  name: body.name,
  code: body.code || '',
  keterangan: body.keterangan || ''
});
    return NextResponse.json({ success: true, data: method }, { status: 201 });
  } catch (error: any) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e: any) => e.message);
      return NextResponse.json(
        { success: false, message: messages.join(', ') },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, message: 'Failed to create payment method' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    await dbConnect();
    const { id, name, code, keterangan } = await request.json();
    if (!id || !name) {
      return NextResponse.json(
        { success: false, message: 'ID and name are required' },
        { status: 400 }
      );
    }
    const updateFields: any = { name };
    if (code !== undefined) updateFields.code = code;
    if (keterangan !== undefined) updateFields.keterangan = keterangan;
    const updated = await PaymentMethod.findByIdAndUpdate(
      id,
      updateFields,
      { new: true, runValidators: true }
    );
    if (!updated) {
      return NextResponse.json(
        { success: false, message: 'Payment method not found' },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e: any) => e.message);
      return NextResponse.json(
        { success: false, message: messages.join(', ') },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, message: 'Failed to update payment method' },
      { status: 500 }
    );
  }
}

