'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export type Profile = {
  id: string;
  full_name: string | null;
  bio: string | null;
  website_url: string | null;
  linkedin_url: string | null;
};

export async function getProfileAction(): Promise<{ data: Profile | null; error: Error | null; }> {
  const supabase = createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { data: null, error: new Error('User not authenticated.') };
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();
  
  if (error) {
    return { data: null, error: new Error(error.message) };
  }

  return { data, error: null };
}

type UpdateProfilePayload = {
    fullName?: string;
    bio?: string;
    websiteUrl?: string;
    linkedinUrl?: string;
}

export async function updateProfileAction(payload: UpdateProfilePayload): Promise<{ error: Error | null; }> {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return { error: new Error('User not authenticated.') };
    }
    
    const { error } = await supabase
        .from('profiles')
        .update({
            full_name: payload.fullName,
            bio: payload.bio,
            website_url: payload.websiteUrl,
            linkedin_url: payload.linkedinUrl,
            updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

    if (error) {
        return { error: new Error(error.message) };
    }
    
    // Revalidate the profile pages to show the new data
    revalidatePath('/entrepreneur/profile');
    revalidatePath('/investor/profile');

    return { error: null };
}
