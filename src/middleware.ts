import { type NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/middleware';

// Define paths for each role
const entrepreneurPaths = ['/entrepreneur/dashboard', '/entrepreneur/ideas', '/entrepreneur/profile', '/entrepreneur/settings', '/entrepreneur/investors', '/entrepreneur/collaborate'];
const investorPaths = ['/investor/dashboard', '/investor/ideas', '/investor/profile', '/investor/settings', '/investor/ai-matcher', '/investor/subscriptions', '/investor/collaborate'];

export async function middleware(request: NextRequest) {
  const { supabase, response } = createClient(request);
  const { pathname } = request.nextUrl;

  // Refresh session
  const { data: { session } } = await supabase.auth.getSession();

  // Determine if the path is protected
  const isEntrepreneurPath = entrepreneurPaths.some(p => pathname.startsWith(p));
  const isInvestorPath = investorPaths.some(p => pathname.startsWith(p));

  if (!isEntrepreneurPath && !isInvestorPath) {
    return response; // Not a protected path
  }

  // If no session, redirect to the appropriate login page
  if (!session) {
    const loginUrl = new URL(isInvestorPath ? '/investor/login' : '/entrepreneur/login', request.url);
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If there is a session, check the role
  const userRole = session.user.user_metadata?.role;

  // If on an entrepreneur path, but the role is not 'entrepreneur', redirect
  if (isEntrepreneurPath && userRole !== 'entrepreneur') {
     await supabase.auth.signOut();
     const loginUrl = new URL('/entrepreneur/login', request.url);
     return NextResponse.redirect(loginUrl);
  }

  // If on an investor path, but the role is not 'investor', redirect
  if (isInvestorPath && userRole !== 'investor') {
     await supabase.auth.signOut();
     const loginUrl = new URL('/investor/login', request.url);
     return NextResponse.redirect(loginUrl);
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
     * - / (the root page)
     * - /api (API routes)
     * - /login and /signup pages themselves
     */
    '/((?!_next/static|_next/image|favicon.ico|api/|entrepreneur/login|entrepreneur/signup|investor/login|investor/signup|entrepreneur/verify-otp|investor/verify-otp|$).*)',
  ],
};
