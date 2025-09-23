'use server';

import { type NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  const { email, password, role } = await request.json();

  if (!email || !password || !role) {
    return NextResponse.json(
      { error: 'Email, password, and role are required' },
      { status: 400 }
    );
  }

  // Use the server client for API routes
  const supabase = createClient();

  // Sign in the user
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user) {
    // Manually sign out to clear any partial session state on error
    await supabase.auth.signOut();
    return NextResponse.json(
      { error: error?.message || 'Invalid login credentials' },
      { status: 401 }
    );
  }

  // On successful sign-in, the returned user object contains the metadata
  const userRole = data.user.user_metadata?.role;

  if (userRole !== role) {
    // If the role doesn't match, sign the user out immediately.
    await supabase.auth.signOut();
    return NextResponse.json(
      { error: `This account is not registered as a(n) ${role}. Access denied.` },
      { status: 403 }
    );
  }

  // On success, return a JSON response. The session cookie is automatically
  // handled by the server client when using `signInWithPassword`.
  return NextResponse.json({ message: 'Login successful' });
}
