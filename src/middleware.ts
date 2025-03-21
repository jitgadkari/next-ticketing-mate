import { NextResponse, NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const publicRoutes = ['/login', '/signup', '/about', '/contact', '/api/auth'];
  const isPublicRoute = publicRoutes.some(route => req.nextUrl.pathname.startsWith(route));

  if (isPublicRoute) {
    return NextResponse.next();
  }

  const token = req.cookies.get('access_token')?.value;

  if (!token) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/intrendapp/:path*',
    '/api/((?!auth).)*'  // Protect all API routes except /api/auth/*
  ],
};


