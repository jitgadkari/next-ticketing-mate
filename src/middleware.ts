import { NextResponse, NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

export async function middleware(req: NextRequest) {
  // Define public routes that do not require authentication
  const publicRoutes = ['/login', '/signup', '/about', '/contact'];

  // Check if the requested path is a public route
  const isPublicRoute = publicRoutes.some(route => req.nextUrl.pathname.startsWith(route));

  if (isPublicRoute) {
    // Allow access to public routes
    return NextResponse.next();
  }

  // Get the token from the request cookies
  const supabaseToken = req.cookies.get('sb-access-token')?.value;

  if (!supabaseToken) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  try {
    // Verify the session
    const { data: { user }, error } = await supabase.auth.getUser(supabaseToken);

    if (error || !user) {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    // Check user role if needed
    const userRole = user.user_metadata.role;
    const allowedRoles = ["admin", "general_user", "super_user"];
    
    if (!allowedRoles.includes(userRole)) {
      return NextResponse.redirect(new URL('/unauthorized', req.url));
    }

    // Allow the request to proceed if authenticated
    return NextResponse.next();
  } catch (error) {
    // If there's any error in token verification, redirect to login
    return NextResponse.redirect(new URL('/login', req.url));
  }
}

// Define which paths this middleware should apply to
export const config = {
  matcher: [
    '/intrendapp/:path*',
    // Applies to all routes that are not public
  ],
};
