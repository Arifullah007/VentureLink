-- Enable Row Level Security (RLS) on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE pitches ENABLE ROW LEVEL SECURITY;
ALTER TABLE pitch_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE investor_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;


--
-- RLS Policies for `profiles`
--
-- 1. Allow users to view any profile (profiles are considered public).
CREATE POLICY "Authenticated users can view profiles."
  ON profiles FOR SELECT
  USING (auth.role() = 'authenticated');

-- 2. Allow users to update their own profile.
CREATE POLICY "Users can update their own profile."
  ON profiles FOR UPDATE
  USING (auth.uid() = id);


--
-- RLS Policies for `pitches`
--
-- 1. Entrepreneurs can create, view, update, and delete their own pitches.
CREATE POLICY "Entrepreneurs can view their own pitches."
  ON pitches FOR SELECT
  USING (auth.uid() = entrepreneur_id);

CREATE POLICY "Entrepreneurs can create their own pitches."
  ON pitches FOR INSERT
  WITH CHECK (auth.uid() = entrepreneur_id);

CREATE POLICY "Entrepreneurs can update their own pitches."
  ON pitches FOR UPDATE
  USING (auth.uid() = entrepreneur_id);

CREATE POLICY "Entrepreneurs can delete their own pitches."
    ON pitches FOR DELETE
    USING (auth.uid() = entrepreneur_id);

-- 2. Allow investors to view all pitches (anonymized summary is shown by default).
CREATE POLICY "Investors can view all pitches."
  ON pitches FOR SELECT
  TO authenticated -- Change to a specific investor role if needed
  USING (true);


--
-- RLS Policies for `pitch_files`
--
-- 1. Entrepreneurs can manage files for their own pitches.
CREATE POLICY "Entrepreneurs can manage their own pitch files."
  ON pitch_files FOR ALL
  USING (
    (
      SELECT entrepreneur_id
      FROM pitches
      WHERE id = pitch_id
    ) = auth.uid()
  );

-- 2. Allow investors to view pitch files if they have an active subscription
--    (This is a placeholder, you would expand this logic).
CREATE POLICY "Subscribed investors can view pitch files."
    ON pitch_files FOR SELECT
    USING (
        (
            SELECT status
            FROM investor_subscriptions
            WHERE user_id = auth.uid()
        ) = 'active'::text
    );


--
-- RLS Policies for `reports`
--
-- 1. Allow the system (or specific admin roles) to insert reports.
--    This is implicitly handled by the trigger which runs with elevated privileges.
--    No direct user policy is needed for insertion via trigger.

-- 2. Only admins should be able to view reports.
--    (You would create an admin role in Supabase for this).
--    CREATE POLICY "Admins can view reports."
--      ON reports FOR SELECT
--      USING (is_admin(auth.uid())); -- Requires a custom is_admin function


--
-- RLS Policies for `investor_subscriptions` & `transactions`
--
-- 1. Users can only view and manage their own subscriptions and transactions.
CREATE POLICY "Users can view their own subscription."
    ON investor_subscriptions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own transactions."
    ON transactions FOR SELECT
    USING (auth.uid() = user_id);
