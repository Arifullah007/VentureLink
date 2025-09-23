import { type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

const PROTECTED_ROUTES = {
  ENTREPRENEUR: '/entrepreneur',
  INVESTOR: '/investor',
};
const PUBLIC_ROUTES = ['/login', '/verify-otp', '/'];

export async function middleware(request: NextRequest) {
  // This is the first step, to refresh the session and make it available to all Supabase server clients.
  const { response, supabase } = await updateSession(request);

  const { pathname } = request.nextUrl;

  // If the route is public, let them pass
  if (PUBLIC_ROUTES.some(route => pathname.startsWith(route)) && pathname !== '/') {
    return response;
  }
  
  const { data: { user } } = await supabase.auth.getUser();
  const role = user?.user_metadata.role;

  // If no user and trying to access a protected route, redirect to login
  if (!user && (pathname.startsWith(PROTECTED_ROUTES.ENTREPRENEUR) || pathname.startsWith(PROTECTED_ROUTES.INVESTOR))) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // If user is logged in, and tries to go to home, redirect to their dashboard
  if (user && pathname === '/') {
    const redirectTo = role === 'investor' ? PROTECTED_ROUTES.INVESTOR + '/dashboard' : PROTECTED_ROUTES.ENTREPRENEUR + '/dashboard';
    return NextResponse.redirect(new URL(redirectTo, request.url));
  }

  // If user is trying to access a role-specific route
  if (user) {
    if (pathname.startsWith(PROTECTED_ROUTES.ENTREPRENEUR) && role !== 'entrepreneur') {
      return NextResponse.redirect(new URL('/investor/dashboard', request.url));
    }
    if (pathname.startsWith(PROTECTED_ROUTES.INVESTOR) && role !== 'investor') {
      return NextResponse.redirect(new URL('/entrepreneur/dashboard', request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
