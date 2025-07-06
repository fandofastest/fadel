import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { withAuth } from 'next-auth/middleware';

export default withAuth(
  function middleware(req) {
    console.log('Middleware running for path:', req.nextUrl.pathname);
    const path = req.nextUrl.pathname;
    const token = req.nextauth?.token;

    // Handle routes based on path and user role
    if (path.startsWith('/admin')) {
      // Only admins can access /admin routes
      if (token?.role !== 'admin') {
        // If user is customer, redirect them to member page
        if (token?.role === 'customer') {
          return NextResponse.redirect(new URL('/member', req.url));
        }
        // Otherwise redirect to login
        return NextResponse.redirect(new URL('/signin', req.url));
      }
    } 
    else if (path.startsWith('/member')) {
      // Only customers can access /member routes
      if (token?.role !== 'customer') {
        // If user is admin, redirect them to admin dashboard
        if (token?.role === 'admin') {
          return NextResponse.redirect(new URL('/admin', req.url));
        }
        // Otherwise redirect to login
        return NextResponse.redirect(new URL('/signin', req.url));
      }
    }
    
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        console.log('Token in middleware:', token);
        
        const path = req.nextUrl.pathname;
        
        // For /admin routes, only allow admin users
        if (path.startsWith('/admin')) {
          const isAuthorized = !!token && token.role === 'admin';
          console.log('Admin route - Is authorized:', isAuthorized, 'Role:', token?.role);
          return isAuthorized;
        }
        
        // For /member routes, only allow customer users
        if (path.startsWith('/member')) {
          const isAuthorized = !!token && token.role === 'customer';
          console.log('Member route - Is authorized:', isAuthorized, 'Role:', token?.role);
          return isAuthorized;
        }
        
        // For other routes, allow access as long as there is a token
        return !!token;
      }
    },
    pages: {
      signIn: '/signin',
    },
  }
);

// Apply this middleware to both admin and member routes
export const config = {
  matcher: ["/admin/:path*", "/member/:path*"]
};