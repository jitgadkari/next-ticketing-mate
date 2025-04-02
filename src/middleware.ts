import { NextResponse, NextRequest } from 'next/server';

const rolePermissions = {
  admin: ['*'],
  superuser: [
    '/intrendapp/dashboard',
    '/intrendapp/tickets',
    '/intrendapp/customers',
    '/intrendapp/vendors',
    '/intrendapp/people'
  ],
  general_user: [
    '/intrendapp/customersDashboard'
  ]
};

type UserRole = keyof typeof rolePermissions;

function hasAccess(role: UserRole, path: string): boolean {
  if (role === 'admin') return true;
  const allowedPaths = rolePermissions[role];
  return allowedPaths?.some(route => path.startsWith(route)) ?? false;
}

export async function middleware(req: NextRequest) {
  const token = req.cookies.get('auth-token')?.value || null;
  console.log('Token:', token);
  const userMetadataRaw = req.cookies.get('user-metadata')?.value || null;
  console.log('User Metadata:', userMetadataRaw);
  const path = req.nextUrl.pathname;

  const publicRoutes = ['/login', '/signup', '/about', '/contact', '/api/auth'];
  const isPublicRoute = publicRoutes.some(route => path.startsWith(route));

  if (isPublicRoute) {
    if (token && userMetadataRaw) {
      try {
        const user = JSON.parse(userMetadataRaw);
        const role = user.role as UserRole;
        const redirectPath = role === 'general_user'
          ? '/intrendapp/customersDashboard'
          : '/intrendapp/dashboard';
        return NextResponse.redirect(new URL(redirectPath, req.url));
      } catch (e) {
        console.error('Invalid user metadata format:', e);
      }
    }
    return NextResponse.next();
  }

  if (!token || !userMetadataRaw) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  try {
    const user = JSON.parse(userMetadataRaw);
    const role = (user.role as UserRole) || 'general_user';

    console.log(`[Middleware] Role: ${role} → Path: ${path}`);

    if (!hasAccess(role, path)) {
      const fallback = role === 'general_user'
        ? '/intrendapp/customersDashboard'
        : '/intrendapp/dashboard';
      return NextResponse.redirect(new URL(fallback, req.url));
    }

    const headers = new Headers(req.headers);
    headers.set('Authorization', `Bearer ${token}`);

    return NextResponse.next({
      request: { headers }
    });
  } catch (e) {
    console.error('Failed to parse user-metadata cookie:', e);
    return NextResponse.redirect(new URL('/login', req.url));
  }
}

export const config = {
  matcher: [
    '/intrendapp/:path*',
    '/api/((?!auth).)*'
  ]
};
