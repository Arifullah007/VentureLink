-- Enable RLS for the ideas table if it's not already enabled.
ALTER TABLE public.ideas ENABLE ROW LEVEL SECURITY;

-- Drop the policy if it already exists to avoid errors on re-running.
DROP POLICY IF EXISTS "Allow authenticated users to read ideas" ON public.ideas;

-- Create a policy that allows any authenticated user to SELECT from the ideas table.
CREATE POLICY "Allow authenticated users to read ideas"
ON public.ideas
FOR SELECT
TO authenticated
USING (true);

-- Drop the policy if it already exists to avoid errors on re-running.
DROP POLICY IF EXISTS "Allow authenticated users to read user profiles" ON auth.users;

-- Create a policy that allows any authenticated user to SELECT from the auth.users table.
-- This is necessary to join ideas with user information (like name and avatar).
CREATE POLICY "Allow authenticated users to read user profiles"
ON auth.users
FOR SELECT
TO authenticated
USING (true);
