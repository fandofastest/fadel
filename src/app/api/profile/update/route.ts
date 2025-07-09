import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { nextAuthOptions } from '@/app/api/auth/[...nextauth]/options';
import dbConnect from '@/lib/db';
import mongoose, { Types } from 'mongoose';
import bcrypt from 'bcryptjs';

export async function PUT(request: Request) {
  try {
    // 1. Verifikasi sesi pengguna (harus terautentikasi)
    const session = await getServerSession(nextAuthOptions);
    console.log('Session:', session);
    
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { success: false, message: 'Tidak diizinkan' },
        { status: 401 }
      );
    }
    
    // 2. Mendapatkan ID pengguna dari sesi
    const userId = session.user.id;
    
    if (!Types.ObjectId.isValid(userId)) {
      return NextResponse.json(
        { success: false, message: 'ID pengguna tidak valid' },
        { status: 400 }
      );
    }

    // 3. Menghubungkan ke database
    await dbConnect();
    
    // 4. Mendapatkan data dari body request
    const body = await request.json();
    console.log('Data yang diterima API:', body);
    
    // 5. Validasi field yang diperlukan
    if (!body.name || !body.phone) {
      return NextResponse.json(
        { success: false, message: 'Nama dan nomor telepon wajib diisi' },
        { status: 400 }
      );
    }
    
    // CARA PALING SEDERHANA: Gunakan operasi MongoDB langsung
    // Dapatkan koleksi users
    const db = mongoose.connection.db;
    if (!db) {
      return NextResponse.json(
        { success: false, message: 'Koneksi database tidak tersedia' },
        { status: 500 }
      );
    }
    
    const usersCollection = db.collection('users');
    
    // Update document dengan MongoDB native driver
    const result = await usersCollection.updateOne(
      { _id: new mongoose.Types.ObjectId(userId) },
      { $set: { name: body.name, phone: body.phone } }
    );
    
    console.log('Hasil update MongoDB:', result);
    
    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, message: 'Pengguna tidak ditemukan' },
        { status: 404 }
      );
    }
    
    if (result.modifiedCount === 0) {
      console.log('Tidak ada perubahan yang dideteksi');
    }
    
    // Ambil data user terbaru
    const updatedUser = await usersCollection.findOne(
      { _id: new mongoose.Types.ObjectId(userId) },
      { projection: { passwordHash: 0 } } // Exclude passwordHash
    );
    
    console.log('User setelah update:', updatedUser);
    
    return NextResponse.json({
      success: true,
      message: 'Profil berhasil diperbarui',
      data: updatedUser
    });
    
  } catch (error: any) {
    console.error('Error saat memperbarui profil:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal memperbarui profil: ' + error.message },
      { status: 500 }
    );
  }
}
