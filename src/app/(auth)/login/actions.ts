'use server';

import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

const signupSchema = z.object({
  fullName: z.string(),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(['entrepreneur', 'investor']),
});

export async function login(
  formData: z.infer<typeof loginSchema>
): Promise<{ error: { message: string } | null; redirectTo?: string }> {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithPassword(formData);

  if (error) {
    return { error: { message: error.message } };
  }
  
  if (data.user) {
    const role = data.user.user_metadata.role;
    const redirectTo = role === 'investor' ? '/investor/dashboard' : '/entrepreneur/dashboard';
    return { error: null, redirectTo };
  }

  // Fallback in case user data is not available, though unlikely on success
  return { error: { message: 'Could not determine user role.' } };
}

export async function signup(
  formData: z.infer<typeof signupSchema>
): Promise<{ error: { message: string } | null; data: any }> {
  const supabase = createClient();
  const origin = headers().get('origin');

  const { error, data } = await supabase.auth.signUp({
    email: formData.email,
    password: formData.password,
    options: {
      data: {
        full_name: formData.fullName,
        role: formData.role,
      },
      // Supabase sends an email with a verification link by default.
      // To use OTP, we need to handle it manually after signup.
      // The default behavior is fine for now, user will get an email.
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    return { error: { message: error.message }, data: null };
  }
  
  // The user is created, but needs to verify their email via OTP.
  return { error: null, data: data.user };
}
