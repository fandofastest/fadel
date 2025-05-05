import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // List of public routes that don't require authentication
  const publicRoutes = ['/signin', '/signup'];

  // Get accessToken from localStorage through a cookie
  const accessToken = request.cookies.get('accessToken')?.value;

  console.log('Middleware - Path:', pathname);
  console.log('Middleware - Access Token:', accessToken ? '***' : 'none');

  // If accessing a non-public route without token, redirect to signin
  if (!publicRoutes.includes(pathname) && !accessToken) {
    console.log('Middleware - Redirecting to signin');
    const signInUrl = new URL('/signin', request.url);
    signInUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(signInUrl);
  }

  // If authenticated and trying to access auth pages, redirect to admin dashboard
  if (accessToken && publicRoutes.includes(pathname)) {
    console.log('Middleware - Redirecting to admin dashboard');
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  // If trying to access root path, redirect to admin dashboard
  if (pathname === '/') {
    console.log('Middleware - Redirecting root to admin dashboard');
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  // For authenticated users, allow the request to proceed even if the page doesn't exist
  // This ensures the session remains valid
  if (accessToken) {
    console.log('Middleware - Allowing access to:', pathname);
    return NextResponse.next();
  }

  console.log('Middleware - Allowing access to:', pathname);
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}; 