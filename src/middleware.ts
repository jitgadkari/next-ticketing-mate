import { NextResponse, NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function middleware(req: NextRequest) {

  const publicRoutes = ['/login', '/signup', '/about', '/contact', '/api/auth'];
  const isPublicRoute = publicRoutes.some(route => req.nextUrl.pathname.startsWith(route));

  if (isPublicRoute) {
    return NextResponse.next();
  }

  const supabaseToken = req.cookies.get('sb-access-token')?.value;

  if (!supabaseToken) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  try {
    const { data: { user }, error } = await supabase.auth.getUser(supabaseToken);

    if (error || !user) {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    return NextResponse.next();
  } catch (error) {
    return NextResponse.redirect(new URL('/login', req.url));
  }
}

export const config = {
  matcher: [
    '/intrendapp/:path*',
    '/api/((?!auth).)*'  // Protect all API routes except /api/auth/*
  ],
};


