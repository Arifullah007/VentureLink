import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = createClient()
    const { error, data: { user } } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
        const role = user?.user_metadata.role;
        const redirectTo = role === 'investor' ? '/investor/dashboard' : '/entrepreneur/dashboard';
        return NextResponse.redirect(`${origin}${redirectTo}`);
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
