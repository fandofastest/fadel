import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { nextAuthOptions } from '../../auth/[...nextauth]/options';
import dbConnect from '@/lib/db';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { Session } from 'next-auth';

// Import models from central registry
import { Court, Payment, Reservation } from '@/lib/models';

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
// Fungsi untuk mendapatkan session dari token Bearer
async function getSessionFromBearerToken(request: Request): Promise<Session | null> {
  const authHeader = request.headers.get('Authorization');
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7); // Hapus 'Bearer ' dari string
    try {
      // Untuk debugging - tampilkan informasi token
      console.log('Token received:', token.substring(0, 20) + '...');
      console.log('NEXTAUTH_SECRET:', process.env.NEXTAUTH_SECRET ? 'Defined' : 'Undefined');
      
      let decoded: any;
      try {
        // Coba verifikasi dengan NEXTAUTH_SECRET
        decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET as string);
      } catch (verifyErr: any) {
        // Jika verifikasi gagal, coba parse token tanpa verifikasi untuk debugging
        console.error('Strict verification failed, trying to decode token:', verifyErr.message);
        
        // Parse token tanpa verifikasi (hanya untuk debugging)
        const parts = token.split('.');
        if (parts.length === 3) {
          try {
            const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
            console.log('Token payload (unverified):', payload);
            
            // Gunakan token tanpa verifikasi hanya jika diperlukan (development mode)
            if (process.env.NODE_ENV === 'development') {
              decoded = payload;
            }
          } catch (parseErr) {
            console.error('Failed to parse token payload:', parseErr);
          }
        }
      }
      
      // Konversi ke format Session yang diharapkan NextAuth
      if (decoded) {
        const session: Session = {
          expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tambahkan expires 24 jam dari sekarang
          user: {
            id: decoded.id || decoded.sub,
            name: decoded.name,
            email: decoded.email,
            role: decoded.role,
            phone: decoded.phone,
            image: decoded.image
          }
        };
        return session;
      }
      return null;
    } catch (err) {
      console.error('Token processing failed:', err);
      return null;
    }
  }
  return null;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    // Coba dapatkan session dari cookie (NextAuth default)
    let session = await getServerSession(nextAuthOptions);
    
    // Jika tidak ada session dari cookie, coba dari Authorization header
    if (!session || !session.user) {
      session = await getSessionFromBearerToken(request);
    }
    
    // Cek autentikasi
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Await params jika itu adalah Promise
    const resolvedParams = ('then' in params) ? await params : params;
    const { id } = resolvedParams;
    
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
    
    // Temukan reservasi tanpa populate payment dulu
    const reservation = await Reservation.findById(id)
      .populate('userId', 'name email')
      .populate('courtId', 'name type price');
      
    // Jika paymentId ada, ambil secara manual
    if (reservation && reservation.paymentId) {
      try {
        // Use imported Payment model directly
        const paymentData = await Payment.findById(reservation.paymentId);
        
        // Tambahkan data payment ke response
        if (paymentData) {
          const resObject = reservation.toObject();
          resObject.paymentData = paymentData;
          return NextResponse.json({ success: true, data: resObject });
        }
      } catch (paymentError) {
        console.error('Error fetching payment data:', paymentError);
        // Lanjutkan dengan data reservasi tanpa payment
      }
    }
    
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
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    // Coba dapatkan session dari cookie (NextAuth default)
    let session = await getServerSession(nextAuthOptions);
    
    // Jika tidak ada session dari cookie, coba dari Authorization header
    if (!session || !session.user) {
      session = await getSessionFromBearerToken(request);
    }
    
    // Cek autentikasi
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Await params jika itu adalah Promise
    const resolvedParams = ('then' in params) ? await params : params;
    const { id } = resolvedParams;
    
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
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    // Coba dapatkan session dari cookie (NextAuth default)
    let session = await getServerSession(nextAuthOptions);
    
    // Jika tidak ada session dari cookie, coba dari Authorization header
    if (!session || !session.user) {
      session = await getSessionFromBearerToken(request);
    }
    
    // Cek autentikasi
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Await params jika itu adalah Promise
    const resolvedParams = ('then' in params) ? await params : params;
    const { id } = resolvedParams;
    
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
