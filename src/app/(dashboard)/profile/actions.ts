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

// This function will return a mock profile for the demo
export async function getProfileAction(): Promise<{ data: Profile | null; error: Error | null; }> {
  // In a real app, you would fetch this from the database based on the logged-in user.
  // For this demo, we return a hardcoded profile.
  const mockProfile: Profile = {
      id: '5a99a46a-31b3-4798-8224-74ce3585d41c', // Rohan Kumar from seed data
      full_name: 'Rohan Kumar (Demo)',
      bio: 'Passionate entrepreneur working on the next big thing in sustainable tech. Always open to new ideas and collaboration.',
      website_url: 'https://example.com',
      linkedin_url: 'https://linkedin.com/in/rohankumar-demo'
  };

  return Promise.resolve({ data: mockProfile, error: null });
}

type UpdateProfilePayload = {
    fullName?: string;
    bio?: string;
    websiteUrl?: string;
    linkedinUrl?: string;
}

export async function updateProfileAction(payload: UpdateProfilePayload): Promise<{ error: Error | null; }> {
    // In a real app, this would update the database.
    // For this demo, we will log the action and return success.
    console.log('DEMO MODE: Profile update called with payload:', payload);
    
    // We can revalidate paths to simulate a real update if needed
    revalidatePath('/entrepreneur/profile');
    revalidatePath('/investor/profile');

    return { error: null };
}
