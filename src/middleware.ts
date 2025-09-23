
import { type NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

const PROTECTED_ROUTES = {
  ENTREPRENEUR: '/entrepreneur',
  INVESTOR: '/investor',
};
const PUBLIC_ROUTES = ['/login', '/verify-otp', '/'];

export async function middleware(request: NextRequest) {
  // This will refresh the session and make it available to all Supabase server clients.
  const { response, supabase, user } = await updateSession(request);

  const { pathname } = request.nextUrl;

  // If no user and trying to access a protected route, redirect to login
  if (!user && (pathname.startsWith(PROTECTED_ROUTES.ENTREPRENEUR) || pathname.startsWith(PROTECTED_ROUTES.INVESTOR))) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // If the route is public, let them pass
  if (PUBLIC_ROUTES.includes(pathname) || pathname.startsWith('/auth/callback')) {
     // But if they are logged in and trying to access login, redirect them away
    if (user && pathname === '/login') {
      const role = user.user_metadata.role;
      const redirectTo = role === 'investor' ? PROTECTED_ROUTES.INVESTOR + '/dashboard' : PROTECTED_ROUTES.ENTREPRENEUR + '/dashboard';
      return NextResponse.redirect(new URL(redirectTo, request.url));
    }
    return response;
  }
  
  if (user) {
    const role = user.user_metadata.role;

    // If user is logged in, and tries to go to home, redirect to their dashboard
    if (pathname === '/') {
      const redirectTo = role === 'investor' ? PROTECTED_ROUTES.INVESTOR + '/dashboard' : PROTECTED_ROUTES.ENTREPRENEUR + '/dashboard';
      return NextResponse.redirect(new URL(redirectTo, request.url));
    }

    // If user is trying to access a role-specific route, but has the wrong role, redirect
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
