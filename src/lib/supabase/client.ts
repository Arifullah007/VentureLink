// This file is part of the simulation and is not actively used.
// All data is predefined in /lib/data.ts
import { createBrowserClient } from '@supabase/ssr';

// This function is not used in the static version but is kept for structure.
export function createClient() {
  console.warn("Supabase client created, but app is in static mode. No real database calls will be made.");
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'example-key'
  );
}
