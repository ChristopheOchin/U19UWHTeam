/**
 * Next.js Middleware
 *
 * Protects /team/* routes with authentication
 */

import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth/session';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow login page
  if (pathname === '/team/login') {
    return NextResponse.next();
  }

  // Protect all /team/* routes
  if (pathname.startsWith('/team')) {
    const authenticated = await isAuthenticated(request);

    if (!authenticated) {
      // Redirect to login
      const loginUrl = new URL('/team/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/team/:path*',
};
