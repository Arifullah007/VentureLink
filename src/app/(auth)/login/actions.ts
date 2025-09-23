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
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single();

    const role = profile?.role;
    
    if (role) {
      const redirectTo = role === 'investor' ? '/investor/dashboard' : '/entrepreneur/dashboard';
      return { error: null, redirectTo };
    }
  }

  // Fallback in case user data or role is not available
  return { error: { message: 'Could not determine user role. Please try again.' } };
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
  
  return { error: null, data: data.user };
}
