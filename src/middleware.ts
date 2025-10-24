import { type NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  const { response, supabase } = await updateSession(request);
  const { data: { user } } = await supabase.auth.getUser();

  const url = request.nextUrl.clone();

  // Define routes that are part of the public-facing site or authentication flow
  const publicRoutes = ['/', '/login', '/verify-otp'];
  
  // Check if the current route is one of the public routes
  const isPublicRoute = publicRoutes.includes(url.pathname) || url.pathname.startsWith('/auth/callback');

  // If the user is authenticated
  if (user) {
    // And they are trying to access a public route (like the landing or login page)
    if (publicRoutes.includes(url.pathname)) {
      // Redirect them to their appropriate dashboard
      const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
      
      const role = profile?.role;
      const redirectTo = role === 'investor' ? '/investor/dashboard' : '/entrepreneur/dashboard';
      url.pathname = redirectTo;
      return NextResponse.redirect(url);
    }
  } 
  // If the user is NOT authenticated
  else {
    // And they are trying to access a route that is NOT public
    if (!isPublicRoute) {
      // Redirect them to the login page
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }
  }

  // If none of the above conditions are met, continue with the request as is.
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
