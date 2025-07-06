import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { nextAuthOptions } from '../../auth/[...nextauth]/options';
import dbConnect from '@/lib/db';
import Reservation from '@/models/Reservation';
import mongoose from 'mongoose';

// Helper untuk validasi ObjectId
const isValidObjectId = (id: string) => mongoose.Types.ObjectId.isValid(id);

// Helper untuk memeriksa apakah user memiliki akses ke reservasi
async function hasAccessToReservation(session: any, reservationId: string) {
  if (!session || !session.user) return false;
  
  const reservation = await Reservation.findById(reservationId);
  if (!reservation) return false;
  
  // Admin memiliki akses ke semua reservasi
  if (session.user.role === 'admin') return true;
  
  // Customer hanya memiliki akses ke reservasinya sendiri
  return session.user.role === 'customer' && 
         session.user.id && 
         reservation.userId.toString() === session.user.id;
}

// GET /api/reservations/[id] - Mendapatkan detail reservasi tertentu
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(nextAuthOptions);
    
    // Cek autentikasi
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { id } = params;
    
    // Validasi ID
    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid reservation ID' },
        { status: 400 }
      );
    }
    
    await dbConnect();
    
    // Cek akses
    if (!await hasAccessToReservation(session, id)) {
      return NextResponse.json(
        { success: false, message: 'Access denied' },
        { status: 403 }
      );
    }
    
    const reservation = await Reservation.findById(id)
      .populate('userId', 'name email')
      .populate('courtId', 'name type price')
      .populate('paymentId');
    
    if (!reservation) {
      return NextResponse.json(
        { success: false, message: 'Reservation not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: reservation });
  } catch (error: any) {
    console.error('Error fetching reservation:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to fetch reservation' },
      { status: 500 }
    );
  }
}

// PATCH /api/reservations/[id] - Update status reservasi
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(nextAuthOptions);
    
    // Cek autentikasi
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { id } = params;
    
    // Validasi ID
    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid reservation ID' },
        { status: 400 }
      );
    }
    
    await dbConnect();
    
    // Cek akses
    if (!await hasAccessToReservation(session, id)) {
      return NextResponse.json(
        { success: false, message: 'Access denied' },
        { status: 403 }
      );
    }
    
    const body = await request.json();
    const { status, paymentId, qrCodeId } = body;
    
    // Validasi status
    if (status && !['UNPAID', 'PAID', 'EXPIRED', 'CHECKED_IN', 'CANCELLED'].includes(status)) {
      return NextResponse.json(
        { success: false, message: 'Invalid status value' },
        { status: 400 }
      );
    }
    
    // Buat objek update
    const updateData: any = {};
    if (status) updateData.status = status;
    if (paymentId && isValidObjectId(paymentId)) updateData.paymentId = paymentId;
    if (qrCodeId && isValidObjectId(qrCodeId)) updateData.qrCodeId = qrCodeId;
    
    // Batasi user non-admin untuk mengubah status
    if (session.user.role !== 'admin') {
      // Customer hanya boleh membatalkan reservasi yang belum dibayar
      if (status && status !== 'CANCELLED') {
        const reservation = await Reservation.findById(id);
        if (!reservation || reservation.status !== 'UNPAID') {
          return NextResponse.json(
            { success: false, message: 'You can only cancel unpaid reservations' },
            { status: 403 }
          );
        }
      }
    }
    
    const updatedReservation = await Reservation.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );
    
    if (!updatedReservation) {
      return NextResponse.json(
        { success: false, message: 'Reservation not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: updatedReservation });
  } catch (error: any) {
    console.error('Error updating reservation:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to update reservation' },
      { status: 500 }
    );
  }
}

// DELETE /api/reservations/[id] - Menghapus reservasi (soft delete dengan status CANCELLED)
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(nextAuthOptions);
    
    // Cek autentikasi
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { id } = params;
    
    // Validasi ID
    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid reservation ID' },
        { status: 400 }
      );
    }
    
    await dbConnect();
    
    // Cek akses
    if (!await hasAccessToReservation(session, id)) {
      return NextResponse.json(
        { success: false, message: 'Access denied' },
        { status: 403 }
      );
    }
    
    const reservation = await Reservation.findById(id);
    
    if (!reservation) {
      return NextResponse.json(
        { success: false, message: 'Reservation not found' },
        { status: 404 }
      );
    }
    
    // Customer hanya boleh membatalkan reservasi yang belum dibayar
    if (session.user.role === 'customer' && reservation.status !== 'UNPAID') {
      return NextResponse.json(
        { success: false, message: 'You can only cancel unpaid reservations' },
        { status: 403 }
      );
    }
    
    // Soft delete dengan mengubah status menjadi CANCELLED
    reservation.status = 'CANCELLED';
    await reservation.save();
    
    return NextResponse.json({ 
      success: true, 
      message: 'Reservation cancelled successfully' 
    });
  } catch (error: any) {
    console.error('Error cancelling reservation:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to cancel reservation' },
      { status: 500 }
    );
  }
}
