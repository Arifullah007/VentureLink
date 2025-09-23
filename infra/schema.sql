--
-- Create a table for public profiles
--
CREATE TABLE
  IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
    updated_at TIMESTAMPTZ,
    full_name TEXT,
    avatar_url TEXT,
    website_url TEXT,
    linkedin_url TEXT,
    role TEXT NOT NULL CHECK (role IN ('entrepreneur', 'investor')),
    -- Investor-specific fields
    bio TEXT,
    preferred_sector TEXT,
    investment_range TEXT,
    expected_returns TEXT
  );

--
-- Create a table for ideas
--
CREATE TABLE
  IF NOT EXISTS ideas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    entrepreneur_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
    idea_title TEXT NOT NULL,
    anonymized_summary TEXT NOT NULL,
    full_text TEXT,
    sector TEXT,
    investment_required TEXT,
    estimated_returns TEXT,
    prototype_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ
  );

--
-- Create a table for notifications
--
CREATE TABLE
  IF NOT EXISTS notifications (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    recipient_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
    sender_id UUID REFERENCES auth.users (id) ON DELETE CASCADE, -- Can be null for system notifications
    idea_id UUID REFERENCES ideas (id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- e.g., 'nda_request', 'nda_accepted', 'group_invite'
    content JSONB,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
  );

--
-- Create a table for NDA records
--
CREATE TABLE
  IF NOT EXISTS nda_signatures (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    idea_id UUID NOT NULL REFERENCES ideas (id) ON DELETE CASCADE,
    investor_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
    signature TEXT NOT NULL,
    signed_at TIMESTAMPTZ DEFAULT NOW(),
    access_logs JSONB,
    UNIQUE (idea_id, investor_id) -- An investor can only sign an NDA for an idea once
  );

--
-- HELPER FUNCTION: Get user role
--
CREATE OR REPLACE FUNCTION get_user_role (user_id UUID) RETURNS TEXT AS $$
DECLARE
    role_name TEXT;
BEGIN
    SELECT role INTO role_name FROM profiles WHERE id = user_id;
    RETURN role_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


--
-- AUTH: Set up Row Level Security (RLS)
--
-- 1. Enable RLS for all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE nda_signatures ENABLE ROW LEVEL SECURITY;

--
-- RLS POLICIES: PROFILES
--
DROP POLICY IF EXISTS "Profiles are viewable by everyone." ON profiles;
CREATE POLICY "Profiles are viewable by everyone." ON profiles FOR
SELECT
  USING (TRUE);

DROP POLICY IF EXISTS "Users can create their own profile." ON profiles;
CREATE POLICY "Users can create their own profile." ON profiles FOR INSERT
WITH
  CHECK (auth.uid () = id);

DROP POLICY IF EXISTS "Users can update their own profile." ON profiles;
CREATE POLICY "Users can update their own profile." ON profiles FOR
UPDATE
  USING (auth.uid () = id)
  WITH
  CHECK (auth.uid () = id);

--
-- RLS POLICIES: IDEAS
--
DROP POLICY IF EXISTS "Ideas are visible to investors." ON ideas;
CREATE POLICY "Ideas are visible to investors." ON ideas FOR
SELECT
  USING (get_user_role(auth.uid()) = 'investor');

DROP POLICY IF EXISTS "Entrepreneurs can view their own ideas." ON ideas;
CREATE POLICY "Entrepreneurs can view their own ideas." ON ideas FOR
SELECT
  USING (auth.uid () = entrepreneur_id);

DROP POLICY IF EXISTS "Entrepreneurs can create ideas." ON ideas;
CREATE POLICY "Entrepreneurs can create ideas." ON ideas FOR INSERT
WITH
  CHECK (
    auth.uid () = entrepreneur_id
    AND get_user_role(auth.uid()) = 'entrepreneur'
  );

DROP POLICY IF EXISTS "Entrepreneurs can update their own ideas." ON ideas;
CREATE POLICY "Entrepreneurs can update their own ideas." ON ideas FOR
UPDATE
  USING (auth.uid () = entrepreneur_id)
  WITH
  CHECK (auth.uid () = entrepreneur_id);

DROP POLICY IF EXISTS "Entrepreneurs can delete their own ideas." ON ideas;
CREATE POLICY "Entrepreneurs can delete their own ideas." ON ideas FOR DELETE USING (auth.uid () = entrepreneur_id);

--
-- RLS POLICIES: NOTIFICATIONS
--
DROP POLICY IF EXISTS "Users can view their own notifications." ON notifications;
CREATE POLICY "Users can view their own notifications." ON notifications FOR
SELECT
  USING (auth.uid () = recipient_id);

DROP POLICY IF EXISTS "Users can create notifications for others." ON notifications;
CREATE POLICY "Users can create notifications for others." ON notifications FOR INSERT
WITH
  CHECK (auth.uid () = sender_id);

DROP POLICY IF EXISTS "Users can mark their notifications as read." ON notifications;
CREATE POLICY "Users can mark their notifications as read." ON notifications FOR
UPDATE
  USING (auth.uid () = recipient_id)
  WITH
  CHECK (auth.uid () = recipient_id);

--
-- RLS POLICIES: NDA SIGNATURES
--
DROP POLICY IF EXISTS "Investors can see their own signed NDAs." ON nda_signatures;
CREATE POLICY "Investors can see their own signed NDAs." ON nda_signatures FOR
SELECT
  USING (auth.uid () = investor_id);

DROP POLICY IF EXISTS "Entrepreneurs can see who signed NDAs for their ideas." ON nda_signatures;
CREATE POLICY "Entrepreneurs can see who signed NDAs for their ideas." ON nda_signatures FOR
SELECT
  USING (
    EXISTS (
      SELECT
        1
      FROM
        ideas
      WHERE
        ideas.id = nda_signatures.idea_id
        AND ideas.entrepreneur_id = auth.uid ()
    )
  );

DROP POLICY IF EXISTS "Investors can sign an NDA." ON nda_signatures;
CREATE POLICY "Investors can sign an NDA." ON nda_signatures FOR INSERT
WITH
  CHECK (
    auth.uid () = investor_id
    AND get_user_role(auth.uid()) = 'investor'
  );

--
-- DB TRIGGERS: Create a profile for new users
--
CREATE OR REPLACE FUNCTION public.handle_new_user () RETURNS TRIGGER AS $$
DECLARE
    user_role TEXT;
BEGIN
    -- Extract the role from the user's metadata
    user_role := NEW.raw_user_meta_data ->> 'role';

    -- Create a corresponding profile
    INSERT INTO public.profiles (id, full_name, role)
    VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name', user_role);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

--
-- Trigger to execute the function after a new user is created
--
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user ();
