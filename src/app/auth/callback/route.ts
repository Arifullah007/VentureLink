import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  
  if (code) {
    // In a real app, you'd exchange the code for a session.
    // For this simulation, we'll just redirect based on a role hint.
    const role = searchParams.get('role') || 'entrepreneur';
    const redirectTo = role === 'investor' ? '/investor/dashboard' : '/entrepreneur/dashboard';
    return NextResponse.redirect(`${origin}${redirectTo}`);
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
