import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { email, password, role } = await request.json();

  if (!email || !password || !role) {
    return NextResponse.json(
      { error: 'Email, password, and role are required' },
      { status: 400 }
    );
  }

  const supabase = createClient();

  // First, sign in the user
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

  // Then, verify their role
  const userRole = data.user.user_metadata?.role;

  if (userRole !== role) {
    // If the role doesn't match, sign the user out immediately
    await supabase.auth.signOut();
    return NextResponse.json(
      { error: `This account is not registered as a(n) ${role}.` },
      { status: 403 }
    );
  }

  return NextResponse.json({ message: 'Login successful' }, { status: 200 });
}
