'use server';

import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

const passwordSchema = z.object({
  currentPassword: z.string(),
  newPassword: z.string().min(8, 'New password must be at least 8 characters.'),
});

export async function updatePasswordAction(payload: z.infer<typeof passwordSchema>): Promise<{ error: Error | null }> {
  try {
    const supabase = createClient();
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
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            throw new Error('User not authenticated.');
        }

        // For user deletion, we need to use the admin client.
        // These are now read from .env.local
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !supabaseServiceKey) {
            throw new Error('Supabase admin credentials are not configured. Make sure SUPABASE_SERVICE_ROLE_KEY is set in your .env.local file.');
        }
    
        const supabaseAdmin = createAdminClient(supabaseUrl, supabaseServiceKey);

        // The database trigger `on_auth_user_deleted` will now handle cleaning up
        // all associated data in profiles, ideas, etc.
        // So we can just delete the user directly.
        const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id);
        
        if (deleteError) {
            throw deleteError;
        }

        revalidatePath('/');
        return { error: null };
    } catch (error: any) {
        return { error: new Error(error.message || 'Failed to delete account.') };
    }
}
