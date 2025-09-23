'use server';

import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { headers } from 'next/headers';

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

  const { error } = await supabase.auth.signInWithPassword(formData);

  if (error) {
    return { error: { message: error.message } };
  }

  const { data: { user } } = await supabase.auth.getUser();
  const role = user?.user_metadata.role;

  const redirectTo = role === 'investor' ? '/investor/dashboard' : '/entrepreneur/dashboard';

  return { error: null, redirectTo };
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
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    return { error: { message: error.message }, data: null };
  }
  
  // The user is created, but needs to verify their email.
  // Supabase automatically sends an email with an OTP for verification.
  return { error: null, data: data.user };
}
