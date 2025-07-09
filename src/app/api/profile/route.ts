import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { nextAuthOptions } from '@/app/api/auth/[...nextauth]/options';
import dbConnect from '@/lib/db';
import { User } from '@/lib/models';
import bcrypt from 'bcryptjs';

// GET /api/profile - Mendapatkan data profil user yang login
export async function GET() {
  try {
    // Cek session
    const session = await getServerSession(nextAuthOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    await dbConnect();

    // Ambil data lengkap user (kecuali password)
    const userId = session.user.id;
    const user = await User.findById(userId).select('-passwordHash');

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: user
    });
  } catch (error: any) {
    console.error('Error getting profile:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/profile - Update data profil user
export async function PATCH(request: Request) {
  try {
    // Cek session
    const session = await getServerSession(nextAuthOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    await dbConnect();
    const userId = session.user.id;
    const user = await User.findById(userId);

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { name, email, phone, currentPassword, newPassword } = body;

    // Validasi data
    const updates: any = {};

    if (name) updates.name = name;
    if (phone) updates.phone = phone;

    // Jika update email, pastikan tidak ada user lain dengan email sama
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return NextResponse.json(
          { success: false, message: 'Email already in use' },
          { status: 400 }
        );
      }
      updates.email = email;
    }

    // Jika update password
    if (newPassword) {
      // Verifikasi password lama
      if (!currentPassword) {
        return NextResponse.json(
          { success: false, message: 'Current password is required' },
          { status: 400 }
        );
      }

      const isPasswordMatch = await user.comparePassword(currentPassword);
      if (!isPasswordMatch) {
        return NextResponse.json(
          { success: false, message: 'Current password is incorrect' },
          { status: 400 }
        );
      }

      // Hash password baru
      const salt = await bcrypt.genSalt(10);
      updates.passwordHash = await bcrypt.hash(newPassword, salt);
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true }
    ).select('-passwordHash');

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedUser
    });
  } catch (error: any) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
