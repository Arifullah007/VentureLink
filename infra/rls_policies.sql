-- Enable RLS for all tables that need protection
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.idea_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investor_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;


-- ||||||||||||||||||||||||||||||||||
--           PROFILES
-- ||||||||||||||||||||||||||||||||||

-- 1. Anyone authenticated can see any profile
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone."
  ON public.profiles FOR SELECT
  USING ( auth.role() = 'authenticated' );

-- 2. Users can create their own profile
DROP POLICY IF EXISTS "Users can insert their own profile." ON public.profiles;
CREATE POLICY "Users can insert their own profile."
  ON public.profiles FOR INSERT
  WITH CHECK ( auth.uid() = id );

-- 3. Users can update their own profile
DROP POLICY IF EXISTS "Users can update their own profile." ON public.profiles;
CREATE POLICY "Users can update their own profile."
  ON public.profiles FOR UPDATE
  USING ( auth.uid() = id );


-- ||||||||||||||||||||||||||||||||||
--             IDEAS
-- ||||||||||||||||||||||||||||||||||

-- 1. Entrepreneurs can see their own ideas
DROP POLICY IF EXISTS "Entrepreneurs can view their own ideas." ON public.ideas;
CREATE POLICY "Entrepreneurs can view their own ideas."
    ON public.ideas FOR SELECT
    TO authenticated
    USING (auth.uid() = entrepreneur_id);

-- 2. Investors can see all ideas
DROP POLICY IF EXISTS "Investors can view all ideas." ON public.ideas;
CREATE POLICY "Investors can view all ideas."
    ON public.ideas FOR SELECT
    TO authenticated
    USING (((get_my_claim('role'::text)) = '"investor"'::jsonb));

-- 3. Entrepreneurs can create new ideas
DROP POLICY IF EXISTS "Entrepreneurs can insert their own ideas." ON public.ideas;
CREATE POLICY "Entrepreneurs can insert their own ideas."
    ON public.ideas FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = entrepreneur_id AND (get_my_claim('role'::text)) = '"entrepreneur"'::jsonb);

-- 4. Entrepreneurs can update their own ideas
DROP POLICY IF EXISTS "Entrepreneurs can update their own ideas." ON public.ideas;
CREATE POLICY "Entrepreneurs can update their own ideas."
    ON public.ideas FOR UPDATE
    TO authenticated
    USING (auth.uid() = entrepreneur_id)
    WITH CHECK (auth.uid() = entrepreneur_id);


-- ||||||||||||||||||||||||||||||||||
--           REPORTS
-- ||||||||||||||||||||||||||||||||||

-- Allow automated systems (using service_role) to insert reports
-- No RLS needed for inserts if using service_role key from a trigger.
-- For SELECT, you might want to restrict access to admins, which requires a custom claims setup.
-- For now, no SELECT/UPDATE/DELETE policies are set, so only service_role can access.


-- ||||||||||||||||||||||||||||||||||
--        SUBSCRIPTIONS
-- ||||||||||||||||||||||||||||||||||

-- 1. Investors can view their own subscription
DROP POLICY IF EXISTS "Investors can view their own subscription." ON public.investor_subscriptions;
CREATE POLICY "Investors can view their own subscription."
  ON public.investor_subscriptions FOR SELECT
  USING ( auth.uid() = user_id );

-- Webhooks using service_role key will bypass RLS for inserts/updates.


-- ||||||||||||||||||||||||||||||||||
--        TRANSACTIONS
-- ||||||||||||||||||||||||||||||||||

-- 1. Users can view their own transactions
DROP POLICY IF EXISTS "Users can view their own transactions." ON public.transactions;
CREATE POLICY "Users can view their own transactions."
  ON public.transactions FOR SELECT
  USING ( auth.uid() = user_id );

-- Webhooks using service_role key will bypass RLS for inserts.


-- ||||||||||||||||||||||||||||||||||
--           IDEA_FILES
-- ||||||||||||||||||||||||||||||||||

-- Allow entrepreneurs to insert files for their own ideas
DROP POLICY IF EXISTS "Entrepreneurs can insert idea files." ON public.idea_files;
CREATE POLICY "Entrepreneurs can insert idea files."
    ON public.idea_files FOR INSERT
    WITH CHECK (auth.uid() IN (SELECT entrepreneur_id FROM ideas WHERE id = idea_id));

-- Allow investors who have signed an NDA (logic to be added) to view files.
-- For now, access is restricted.
-- Processing will be handled by Edge Functions with service_role key.
