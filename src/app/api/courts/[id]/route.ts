import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Court from '@/models/Court';
import { Types } from 'mongoose';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    if (!Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid court ID' },
        { status: 400 }
      );
    }
    const court = await Court.findById(params.id);
    if (!court) {
      return NextResponse.json(
        { success: false, message: 'Court not found' },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: court });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to fetch court' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    if (!Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid court ID' },
        { status: 400 }
      );
    }
    const body = await request.json();
    if (!body.name || !body.openTime || !body.closeTime) {
      return NextResponse.json(
        { success: false, message: 'All fields are required' },
        { status: 400 }
      );
    }
    const updatedCourt = await Court.findByIdAndUpdate(
      params.id,
      body,
      { new: true, runValidators: true }
    );
    if (!updatedCourt) {
      return NextResponse.json(
        { success: false, message: 'Court not found' },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: updatedCourt });
  } catch (error: any) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e: any) => e.message);
      return NextResponse.json(
        { success: false, message: messages.join(', ') },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, message: 'Failed to update court' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    if (!Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid court ID' },
        { status: 400 }
      );
    }
    const deletedCourt = await Court.findByIdAndDelete(params.id);
    if (!deletedCourt) {
      return NextResponse.json(
        { success: false, message: 'Court not found' },
        { status: 404 }
      );
    }
    return NextResponse.json({ 
      success: true, 
      message: 'Court deleted successfully' 
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to delete court' },
      { status: 500 }
    );
  }
}
