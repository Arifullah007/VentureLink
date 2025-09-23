
import { type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/middleware';

export async function POST(request: NextRequest) {
  const { email, password, role } = await request.json();
  const { supabase, response } = createClient(request);

  if (!email || !password || !role) {
    response.status = 400;
    response.statusText = JSON.stringify({ error: 'Email, password, and role are required' });
    return response;
  }

  // Sign in the user
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user) {
    response.status = 401;
    response.statusText = JSON.stringify({ error: error?.message || 'Invalid login credentials' });
    return response;
  }

  // Verify their role from the successful sign-in data
  const userRole = data.user.user_metadata?.role;

  if (userRole !== role) {
    // If the role doesn't match, sign the user out immediately.
    // Importantly, we still need to pass the response object along.
    await supabase.auth.signOut();
    const errorResponse = createClient(request).response;
    errorResponse.status = 403;
    errorResponse.statusText = JSON.stringify({ error: `This account is not registered as a(n) ${role}. Access denied.` });
    return errorResponse;
  }

  // If we are here, the login and role check were successful.
  // The cookie is automatically set on the 'response' object by the Supabase client.
  return response;
}
