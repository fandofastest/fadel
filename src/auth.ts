import { getServerSession } from 'next-auth/next';
import type { NextAuthOptions } from 'next-auth';
import { nextAuthOptions } from './app/api/auth/[...nextauth]/options';

// Helper function untuk mendapatkan session dari NextAuth
export const auth = async () => {
  // Pass the authOptions explicitly to ensure consistent configuration
  return await getServerSession(nextAuthOptions);
};
