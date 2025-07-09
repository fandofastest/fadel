import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { Types } from 'mongoose';
import bcrypt from 'bcryptjs';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    if (!Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid user ID' },
        { status: 400 }
      );
    }
    const user = await User.findById(params.id).select('-passwordHash');
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to fetch user' },
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
        { success: false, message: 'Invalid user ID' },
        { status: 400 }
      );
    }
    const body = await request.json();
    
    // For member profile updates, we may not always update every field
    // Check which fields are required based on what's being updated
    const requiredFields = [];
    
    if (body.name === undefined || body.name === null || body.name.trim() === '') {
      requiredFields.push('name');
    }
    
    if (body.email === undefined || body.email === null || body.email.trim() === '') {
      requiredFields.push('email');
    }
    
    if (body.phone === undefined || body.phone === null || body.phone.trim() === '') {
      requiredFields.push('phone');
    }
    
    // If we're updating role (mainly for admin updates), ensure it's provided
    if (body.role !== undefined && (body.role === null || body.role.trim() === '')) {
      requiredFields.push('role');
    }
    
    if (requiredFields.length > 0) {
      return NextResponse.json(
        { success: false, message: `Missing required fields: ${requiredFields.join(', ')}` },
        { status: 400 }
      );
    }
    
    // Check if we're trying to update email to one that's already taken (by another user)
    const existingUserWithEmail = await User.findOne({ 
      email: body.email,
      _id: { $ne: params.id } // Exclude the current user
    });
    
    if (existingUserWithEmail) {
      return NextResponse.json(
        { success: false, message: 'Email already in use by another account' },
        { status: 409 }
      );
    }
    
    // Define the type to include all possible fields
    interface UpdateData {
      name: string;
      email: string;
      phone: string;
      passwordHash?: string; // Optional passwordHash field
      role?: string; // Make role optional for member profile updates
    }

    // Prepare update data - only include fields that are provided
    const updateData: UpdateData = {
      name: body.name,
      email: body.email,
      phone: body.phone
    };
    
    // Only include role if it's provided (might be omitted in profile updates)
    if (body.role !== undefined) {
      updateData.role = body.role;
    }
    
    // If password is provided, update it
    if (body.password) {
      // The hashing will be handled by the pre-save middleware in the User model
      updateData.passwordHash = body.password;
    }
    
    // Find user first, then update and save to ensure hooks run
    const user = await User.findById(params.id);
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }
    
    // Update user fields
    user.name = updateData.name;
    user.email = updateData.email;
    user.phone = updateData.phone;
    
    if (updateData.role !== undefined) {
      user.role = updateData.role as 'customer' | 'admin';
    }
    
    if (updateData.passwordHash) {
      user.passwordHash = updateData.passwordHash;
    }
    
    // Save to trigger pre-save hooks
    await user.save();
    
    // Get clean user object without passwordHash
    const updatedUser = user.toObject();
    delete updatedUser.passwordHash;
    
    if (!updatedUser) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: updatedUser });
  } catch (error: any) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e: any) => e.message);
      return NextResponse.json(
        { success: false, message: messages.join(', ') },
        { status: 400 }
      );
    }
    console.error('Error updating user:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update user' },
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
        { success: false, message: 'Invalid user ID' },
        { status: 400 }
      );
    }
    
    const deletedUser = await User.findByIdAndDelete(params.id);
    
    if (!deletedUser) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'User deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete user' },
      { status: 500 }
    );
  }
}
