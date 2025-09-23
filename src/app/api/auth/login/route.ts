'use server';

import { type NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/middleware';

export async function POST(request: NextRequest) {
  const { supabase, response } = createClient(request);
  const { email, password, role } = await request.json();

  if (!email || !password || !role) {
    return NextResponse.json(
      { error: 'Email, password, and role are required' },
      { status: 400 }
    );
  }

  // Sign in the user
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user) {
    return NextResponse.json(
      { error: error?.message || 'Invalid login credentials' },
      { status: 401 }
    );
  }

  // Verify their role from the successful sign-in data
  const userRole = data.user.user_metadata?.role;

  if (userRole !== role) {
    // If the role doesn't match, sign the user out immediately.
    await supabase.auth.signOut();
    return NextResponse.json(
      { error: `This account is not registered as a(n) ${role}. Access denied.` },
      { status: 403 }
    );
  }

  // If we are here, the login and role check were successful.
  // The cookie is automatically set on the 'response' object by the Supabase client.
  return response;
}
