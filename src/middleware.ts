import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { withAuth } from 'next-auth/middleware';

// Middleware sederhana yang hanya melindungi rute admin
export default withAuth(
  // Fungsi middleware dijalankan setelah otentikasi berhasil
  function middleware(req) {
    // Log untuk debugging
    console.log('Middleware running for path:', req.nextUrl.pathname);
    return NextResponse.next();
  },
  {
    callbacks: {
      // Hanya izinkan akses jika pengguna memiliki token dan token memiliki role admin
      authorized: ({ token, req }) => {
        console.log('Token in middleware:', token); // Log the token for debugging
        
        // Cek token & role, tetapi lebih permisif dengan konsole log detail
        const isAuthorized = !!token && token.role === 'admin';
        console.log('Is authorized:', isAuthorized, 'Role:', token?.role);
        
        return isAuthorized;
      }
    },
    pages: {
      // Jika tidak terautentikasi, redirect ke halaman signin
      signIn: '/signin',
    },
  }
);

// Hanya terapkan middleware ini ke rute admin
export const config = {
  matcher: ['/admin/:path*'],
};