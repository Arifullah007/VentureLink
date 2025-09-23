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

  const supabase = createClient();

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

  const userRole = data.user.user_metadata?.role;

  if (userRole !== role) {
    await supabase.auth.signOut();
    return NextResponse.json(
      { error: `This account is not registered as a(n) ${role}. Access denied.` },
      { status: 403 }
    );
  }

  return NextResponse.json({ message: 'Login successful' });
}
