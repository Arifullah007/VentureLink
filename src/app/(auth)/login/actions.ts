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
  fullName: z.string().min(2, 'Please enter your full name.'),
  pan: z
    .preprocess(
      (val) => String(val).toUpperCase(),
      z
        .string()
        .length(10, 'PAN must be 10 characters.')
        .regex(/^[A-Z]{5}[0-9]{4}[A-Z]$/, 'Please enter a valid PAN format (e.g., ABCDE1234F).')
    ),
  email: z.string().email('Please enter a valid email address.'),
  password: z.string().min(8, 'Password must be at least 8 characters.'),
  role: z.enum(['entrepreneur', 'investor']),
});

export async function login(
  formData: z.infer<typeof loginSchema>
): Promise<{ error: { message: string } | null; }> {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithPassword(formData);

  if (error) {
    return { error: { message: error.message } };
  }
  
  if (data.user) {
    // After successful login, get the user's role from the profiles table.
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single();

    const role = profile?.role;
    
    // Determine the redirect path based on the role.
    if (role) {
      const redirectTo = role === 'investor' ? '/investor/dashboard' : '/entrepreneur/dashboard';
      // Use the built-in redirect function for a robust server-side redirect.
      return redirect(redirectTo);
    }
  }

  // Fallback in case user data or role is not available after login.
  return { error: { message: 'Could not determine user role. Please try again.' } };
}

export async function signup(
  formData: z.infer<typeof signupSchema>
): Promise<{ error: { message: string } | null; requiresOtp: boolean; email?: string, role?: string }> {
  const supabase = createClient();
  
  // We use OTP for email verification. The emailRedirectTo is not needed here.
  const { data, error } = await supabase.auth.signUp({
    email: formData.email,
    password: formData.password,
    options: {
      data: {
        full_name: formData.fullName,
        role: formData.role,
        pan_number: formData.pan,
      },
    },
  });

  if (error) {
    return { error: { message: error.message }, requiresOtp: false };
  }

  // If signup is successful and the user is not yet confirmed, they need to verify with OTP.
  if (data.user && !data.user.email_confirmed_at) {
    return { error: null, requiresOtp: true, email: data.user.email, role: formData.role };
  }
  
  return { error: null, requiresOtp: false };
}
