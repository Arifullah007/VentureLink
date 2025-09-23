'use server';

import { createClient } from '@/lib/supabase/server';
import { type OtpType } from '@supabase/supabase-js';

export async function verifyOtp(payload: { email: string; otp: string; type: OtpType }): Promise<{ error: string | null }> {
  const supabase = createClient();

  const { error } = await supabase.auth.verifyOtp({
    email: payload.email,
    token: payload.otp,
    type: payload.type,
  });

  if (error) {
    return { error: error.message };
  }

  return { error: null };
}
