--
-- PROFILES TABLE
--

-- 1. Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 2. Create Policies
-- Any authenticated user can view any profile (profiles are public)
CREATE POLICY "Authenticated users can view profiles."
    ON public.profiles FOR SELECT
    USING (auth.role() = 'authenticated');

-- Users can only insert or update their own profile
CREATE POLICY "Users can insert or update their own profile."
    ON public.profiles FOR ALL
    USING (auth.uid() = id);


--
-- PITCHES TABLE
--

-- 1. Enable RLS
ALTER TABLE public.pitches ENABLE ROW LEVEL SECURITY;

-- 2. Create Policies
-- Entrepreneurs can perform all actions on their own pitches
CREATE POLICY "Entrepreneurs can manage their own pitches."
    ON public.pitches FOR ALL
    USING (auth.uid() = entrepreneur_id);

-- Investors can view all pitches (access to full details is controlled by application logic/NDA)
CREATE POLICY "Investors can view all pitches."
    ON public.pitches FOR SELECT
    USING (auth.role() = 'investor');

--
-- PITCH_FILES TABLE
--

-- 1. Enable RLS
ALTER TABLE public.pitch_files ENABLE ROW LEVEL SECURITY;

-- 2. Create Policies
-- Entrepreneurs can manage files related to their own pitches
CREATE POLICY "Entrepreneurs can manage their pitch files."
    ON public.pitch_files FOR ALL
    USING ((SELECT entrepreneur_id FROM pitches WHERE pitches.id = pitch_id) = auth.uid());

-- Investors can view file records (but not access files directly without NDA)
CREATE POLICY "Investors can view pitch file records."
    ON public.pitch_files FOR SELECT
    USING (auth.role() = 'investor');


--
-- REPORTS TABLE
--

-- 1. Enable RLS
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
-- Note: No policies needed for 'reports' for now, as it's an admin/backend-only table.
-- The default-deny nature of RLS means no one can access it unless a policy is defined.


--
-- TRANSACTIONS & SUBSCRIPTIONS
--

-- 1. Enable RLS for transactions
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- 2. Enable RLS for subscriptions
ALTER TABLE public.investor_subscriptions ENABLE ROW LEVEL SECURITY;

-- 3. Create Policies
-- Users can only view their own transactions and subscriptions
CREATE POLICY "Users can view their own financial records."
    ON public.transactions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own subscriptions."
    ON public.investor_subscriptions FOR SELECT
    USING (auth.uid() = user_id);
