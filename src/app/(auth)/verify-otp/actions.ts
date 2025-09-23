'use server';

import { createClient } from '@/lib/supabase/server';
import { type OtpType } from '@supabase/supabase-js';

export async function verifyOtp(payload: { email: string; otp: string }): Promise<{ error: string | null }> {
  const supabase = createClient();

  const { error } = await supabase.auth.verifyOtp({
    email: payload.email,
    token: payload.otp,
    type: 'signup', // Use 'signup' for email verification OTP
  });

  if (error) {
    return { error: error.message };
  }

  return { error: null };
}
