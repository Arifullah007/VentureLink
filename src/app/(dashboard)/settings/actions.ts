'use server';

import { supabase } from '@/lib/supabase';
import { z } from 'zod';

const passwordSchema = z.object({
  currentPassword: z.string(),
  newPassword: z.string().min(8, 'New password must be at least 8 characters.'),
});

export async function updatePasswordAction(payload: z.infer<typeof passwordSchema>): Promise<{ error: Error | null }> {
  try {
    const { data, error } = passwordSchema.safeParse(payload);
    if (!error) {
      // First, check if the current password is correct by trying to sign in with it.
      // Supabase doesn't have a direct "check password" method.
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) {
          throw new Error('User not found.');
      }
      
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: data.currentPassword,
      });

      if (signInError) {
        return { error: new Error('Your current password is not correct.') };
      }
      
      // If sign-in is successful, update the password.
      const { error: updateError } = await supabase.auth.updateUser({
        password: data.newPassword,
      });

      if (updateError) {
        throw updateError;
      }
    }
    return { error: null };
  } catch (error: any) {
    return { error: new Error(error.message || 'An unexpected error occurred.') };
  }
}

export async function deleteAccountAction(): Promise<{ error: Error | null }> {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            throw new Error('User not authenticated.');
        }

        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id);
        
        if (deleteError) {
            throw deleteError;
        }

        return { error: null };
    } catch (error: any) {
        return { error: new Error(error.message || 'Failed to delete account.') };
    }
}

// We need to import createClient here because this is a server action
// and we need the admin client for account deletion.
import { createClient } from '@supabase/supabase-js';
