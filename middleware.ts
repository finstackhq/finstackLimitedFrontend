import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect user dashboard routes using access_token cookie
  if (pathname.startsWith('/dashboard')) {
    const accessToken = request.cookies.get('access_token');
    if (!accessToken || !accessToken.value) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // If accessing login while authenticated, redirect to dashboard
  if (pathname === '/login') {
    const accessToken = request.cookies.get('access_token');
    if (accessToken && accessToken.value) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // Admin protection (existing behavior)
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    const adminSession = request.cookies.get('admin_session');
    if (!adminSession || adminSession.value !== 'authenticated') {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  // If accessing admin login while already authenticated, redirect to admin dashboard
  if (pathname === '/admin/login') {
    const adminSession = request.cookies.get('admin_session');
    if (adminSession && adminSession.value === 'authenticated') {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/dashboard/:path*',
    '/login',
  ],
};