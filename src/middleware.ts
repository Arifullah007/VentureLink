import { type NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  const { response, supabase } = await updateSession(request);
  const { data: { user } } = await supabase.auth.getUser();

  const url = request.nextUrl.clone();

  const publicRoutes = ['/', '/login', '/auth/callback', '/verify-otp'];
  const isPublicRoute = publicRoutes.some(path => url.pathname === path);
  
  if (!user && !isPublicRoute) {
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }
  
  if (user) {
    if (isPublicRoute && url.pathname !== '/') {
        const role = user.user_metadata.role;
        const redirectTo = role === 'investor' ? '/investor/dashboard' : '/entrepreneur/dashboard';
        url.pathname = redirectTo;
        return NextResponse.redirect(url);
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
