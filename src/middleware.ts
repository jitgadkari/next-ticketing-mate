// middleware.ts

import { NextResponse, NextRequest } from 'next/server';
import PocketBase from 'pocketbase';

const pb = new PocketBase('https://completely-area.pockethost.io');

export async function middleware(req: NextRequest) {
  const authCookie = req.cookies.get('pb_auth');
  const authCookieValue = authCookie ? authCookie.value : '';

  // Load auth data from cookie
  pb.authStore.loadFromCookie(authCookieValue);

  // Define public routes that do not require authentication
  const publicRoutes = ['/login', '/signup','/about','/contact'];

  // Check if the requested path is a public route
  const isPublicRoute = publicRoutes.some(route => req.nextUrl.pathname.startsWith(route));

  if (isPublicRoute) {
    // Allow access to public routes
    return NextResponse.next();
  }

  // Redirect to login page if authentication is invalid or not present
  if (!pb.authStore.isValid) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // Allow the request to proceed if authenticated
  return NextResponse.next();
}

// Define which paths this middleware should apply to
export const config = {
  matcher: [
    '/intrendapp/:path*',
   // Applies to all routes that are not public
  ],
};
