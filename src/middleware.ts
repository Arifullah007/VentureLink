import { type NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  const { response, supabase } = await updateSession(request);
  const { data: { user } } = await supabase.auth.getUser();

  const url = request.nextUrl.clone();

  // Define public routes that do not require authentication.
  const publicRoutes = ['/', '/login', '/auth/callback', '/verify-otp'];
  const isPublicRoute = publicRoutes.some(path => url.pathname.startsWith(path));
  
  // If the user is not authenticated and the route is not public, redirect to login.
  if (!user && !isPublicRoute) {
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }
  
  // If the user is authenticated, handle redirects from public pages.
  if (user) {
    if (isPublicRoute && url.pathname !== '/') {
        // Fetch user's role from the 'profiles' table.
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
