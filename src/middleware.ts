import { type NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  const { response, supabase } = await updateSession(request);
  const { data: { user } } = await supabase.auth.getUser();

  const url = request.nextUrl.clone();

  // Define public routes that do not require authentication.
  const publicRoutes = ['/', '/login', '/auth/callback', '/verify-otp'];
  
  // The root path '/' is always public.
  // Other public paths must be an exact match.
  const isPublicRoute = url.pathname === '/' || publicRoutes.includes(url.pathname);

  // If the user is not authenticated and the route is not public, redirect to login.
  if (!user && !isPublicRoute) {
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }
  
  // If the user is authenticated and trying to access a public page that is NOT the root page,
  // redirect them to their appropriate dashboard.
  if (user && isPublicRoute && url.pathname !== '/') {
    // Fetch user's role from the 'profiles' table to determine the dashboard.
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
    
    const role = profile?.role;
    
    // Redirect to the correct dashboard based on the role.
    if (role) {
        const redirectTo = role === 'investor' ? '/investor/dashboard' : '/entrepreneur/dashboard';
        url.pathname = redirectTo;
        return NextResponse.redirect(url);
    }
  }

  // Continue with the request if no redirection is needed.
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
