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
    
    if (!body.name || !body.email || !body.role) {
      return NextResponse.json(
        { success: false, message: 'Name, email, and role are required' },
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
    
    // Prepare update data
    const updateData = {
      name: body.name,
      email: body.email,
      role: body.role
    };
    
    // If password is provided, update it
    if (body.password) {
      // The hashing will be handled by the pre-save middleware in the User model
      updateData.passwordHash = body.password;
    }
    
    // Use findOneAndUpdate with runValidators to ensure validation runs
    // set new: true to return the updated document
    const updatedUser = await User.findByIdAndUpdate(
      params.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-passwordHash');
    
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
