import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { nextAuthOptions } from '../../auth/[...nextauth]/options';
import dbConnect from '@/lib/db';
import mongoose from 'mongoose';
import { Court, Payment, Reservation, PaymentMethod } from '@/lib/models';

// Helper untuk validasi ObjectId
const isValidObjectId = (id: string) => mongoose.Types.ObjectId.isValid(id);

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    // Coba dapatkan session dari cookie (NextAuth default)
    let session = await getServerSession(nextAuthOptions);
    
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
        { success: false, message: 'Invalid ID format' },
        { status: 400 }
      );
    }
    
    await dbConnect();
    
    let reservation: any = null;
    let paymentData: any = null;
    
    // Cek apakah ID adalah payment ID atau reservation ID
    // Pertama coba cari payment dengan ID tersebut
    const payment = await Payment.findById(id).lean();
    
    if (payment) {
      console.log('ID adalah payment ID, mencari reservasi terkait');
      // Ini adalah payment ID, ambil reservationId dari payment
      const reservationIdStr = payment.reservationId ? 
        (typeof payment.reservationId === 'object' ? 
          payment.reservationId.toString() : payment.reservationId)
        : null;
          
      if (!reservationIdStr || !isValidObjectId(reservationIdStr)) {
        return NextResponse.json(
          { success: false, message: 'Payment found but has invalid reservation ID' },
          { status: 400 }
        );
      }
      
      // Ambil reservasi berdasarkan ID di payment
      // Konversi ObjectId ke string jika perlu
      const reservationId = typeof payment.reservationId === 'object' ? 
        payment.reservationId.toString() : payment.reservationId;
        
      reservation = await Reservation.findById(reservationId)
        .populate('userId', 'name email phone')
        .populate('courtId', 'name type surface price')
        .lean();
      
      // Simpan data payment untuk invoice
      paymentData = payment;
      
      // Ambil data payment method jika ada
      if (payment.method) {
        try {
          const paymentMethodData = await PaymentMethod.findById(payment.method).lean();
          if (paymentMethodData) {
            paymentData.method = paymentMethodData;
          }
        } catch (methodError) {
          console.error('Error fetching payment method:', methodError);
        }
      }
    } else {
      // Jika bukan payment ID, coba cari sebagai reservation ID langsung
      console.log('Mencari sebagai reservation ID');
      reservation = await Reservation.findById(id)
        .populate('userId', 'name email phone')
        .populate('courtId', 'name type surface price')
        .lean();
        
      // Jika reservasi memiliki paymentId, ambil data pembayaran
      if (reservation && reservation.paymentId) {
        paymentData = await Payment.findById(reservation.paymentId).lean();
        
        // Ambil data payment method jika ada
        if (paymentData && paymentData.method) {
          try {
            const paymentMethodData = await PaymentMethod.findById(paymentData.method).lean();
            if (paymentMethodData) {
              paymentData.method = paymentMethodData;
            }
          } catch (methodError) {
            console.error('Error fetching payment method:', methodError);
          }
        }
      }
    }
    
    // Pastikan reservation ada
    if (!reservation) {
      return NextResponse.json(
        { success: false, message: 'Reservation not found' },
        { status: 404 }
      );
    }
    
    // Type assertion untuk memudahkan TypeScript
    const typedReservation = reservation as any;
    
    // Cek apakah user memiliki akses
    if (session.user.role !== 'admin' && 
        session.user.id !== (typedReservation.userId._id ? typedReservation.userId._id.toString() : typedReservation.userId)) {
      return NextResponse.json(
        { success: false, message: 'Forbidden: You do not have access to this reservation' },
        { status: 403 }
      );
    }
    
    // Jika paymentData sudah ada dari flow payment ID, gunakan itu
    // Jika tidak dan reservation memiliki paymentId tapi belum diambil datanya, ambil
    if (!paymentData && typedReservation.paymentId && !typedReservation.paymentData) {
      try {
        paymentData = await Payment.findById(typedReservation.paymentId).lean();
        
        if (paymentData && paymentData.method) {
          try {
            const paymentMethodData = await PaymentMethod.findById(paymentData.method).lean();
            if (paymentMethodData) {
              paymentData.method = paymentMethodData as any;
            }
          } catch (methodError) {
            console.error('Error fetching payment method:', methodError);
          }
        }
      } catch (paymentError) {
        console.error('Error fetching payment data for invoice:', paymentError);
      }
    }
    
    // Jika ada payment data, tambahkan ke reservation
    if (paymentData) {
      typedReservation.paymentData = paymentData;
      console.log('Payment data attached to reservation for invoice');
    }
    
    // Format data untuk invoice
    const invoiceData = {
      invoiceNumber: `INV-${typedReservation._id.toString().substr(-8)}`,
      date: new Date().toISOString(),
      reservation: {
        ...typedReservation,
        date: new Date(typedReservation.date).toISOString(),
        createdAt: new Date(typedReservation.createdAt).toISOString(),
        updatedAt: new Date(typedReservation.updatedAt).toISOString(),
      }
    };
    
    return NextResponse.json({
      success: true,
      data: invoiceData
    });
    
  } catch (error: any) {
    console.error('Error generating invoice:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to generate invoice' },
      { status: 500 }
    );
  }
}
