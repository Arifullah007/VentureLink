import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Get the redirect URL from the environment variable, or default to a common dev port
// This ensures that all auth redirects work correctly in the development environment.
const redirectUrl = process.env.NEXT_PUBLIC_VERCEL_URL
  ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
  : 'http://localhost:9002';


export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        redirectTo: redirectUrl,
    }
})
