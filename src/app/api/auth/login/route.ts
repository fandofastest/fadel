import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { generateToken } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    await dbConnect();
    
    const { email, password } = await request.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await User.findOne({ email }).select('+passwordHash');
    
    if (!user) {
      // Use the same message for security (don't reveal if user exists)
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = generateToken(user);

    // Return user data (excluding password) and token
    const { passwordHash, ...userWithoutPassword } = user.toObject();

    return NextResponse.json({
      user: userWithoutPassword,
      token
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { 
        message: 'Login failed',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined 
      },
      { status: 500 }
    );
  }
}
