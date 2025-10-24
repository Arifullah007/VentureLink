'use server';

// Action to persist NDA signature
export async function signNdaAction(ideaId: string) {
    // This server action is a placeholder. In a real app, you would:
    // 1. Get the current user's ID from Supabase auth.
    // 2. Write a record to a `signed_ndas` table: { user_id, idea_id, signed_at }.
    // For the demo, we can't write to localStorage from a server action.
    // The client will handle this optimistically.
    console.log(`User signed NDA for idea: ${ideaId}`);
    // In a real scenario, you might revalidate paths that depend on this data.
    // e.g., revalidatePath(`/investor/ideas/${ideaId}`);
}
