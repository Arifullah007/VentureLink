-- Create Profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    role TEXT CHECK (role IN ('investor', 'entrepreneur')),
    bio TEXT,
    preferred_sector TEXT,
    investment_range TEXT,
    expected_returns TEXT,
    website_url TEXT,
    linkedin_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Ideas table
CREATE TABLE IF NOT EXISTS public.ideas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entrepreneur_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    idea_title TEXT NOT NULL,
    anonymized_summary TEXT NOT NULL,
    full_text TEXT,
    sector TEXT,
    investment_required TEXT,
    estimated_returns TEXT,
    prototype_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    idea_id UUID REFERENCES public.ideas(id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- e.g., 'nda_request', 'nda_accepted', 'message'
    message TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create NDAs table to track agreements
CREATE TABLE IF NOT EXISTS public.ndas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    idea_id UUID REFERENCES public.ideas(id) ON DELETE CASCADE,
    investor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    signed_at TIMESTAMPTZ DEFAULT NOW(),
    signature TEXT NOT NULL,
    UNIQUE(idea_id, investor_id) -- An investor only needs to sign once per idea
);

-- Function to handle new user and create a profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'role'
  );
  RETURN new;
END;
$$;

-- Trigger to call the function when a new user signs up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- Function to automatically delete a user's public data when their auth entry is deleted.
CREATE OR REPLACE FUNCTION public.delete_user_data()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- This function is now a placeholder. 
  -- The ON DELETE CASCADE on the tables referencing auth.users(id) handles the cleanup.
  -- You could add more complex logic here if needed, like logging or cleanup in other schemas.
  RAISE NOTICE 'User data for % is being deleted due to ON DELETE CASCADE.', old.id;
  RETURN old;
END;
$$;

-- Trigger to call the user data deletion function
DROP TRIGGER IF EXISTS on_auth_user_deleted ON auth.users;
CREATE TRIGGER on_auth_user_deleted
  AFTER DELETE ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.delete_user_data();

-- RLS Policies

-- Enable RLS for all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ndas ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
DROP POLICY IF EXISTS "Allow authenticated users to read any profile" ON public.profiles;
CREATE POLICY "Allow authenticated users to read any profile"
  ON public.profiles FOR SELECT
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can create their own profile" ON public.profiles;
CREATE POLICY "Users can create their own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Ideas Policies
DROP POLICY IF EXISTS "Allow authenticated users to read ideas" ON public.ideas;
CREATE POLICY "Allow authenticated users to read ideas"
    ON public.ideas FOR SELECT
    USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Entrepreneurs can create ideas" ON public.ideas;
CREATE POLICY "Entrepreneurs can create ideas"
    ON public.ideas FOR INSERT
    WITH CHECK (
      auth.uid() = entrepreneur_id AND
      (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'entrepreneur'
    );

DROP POLICY IF EXISTS "Entrepreneurs can update their own ideas" ON public.ideas;
CREATE POLICY "Entrepreneurs can update their own ideas"
    ON public.ideas FOR UPDATE
    USING (auth.uid() = entrepreneur_id)
    WITH CHECK (auth.uid() = entrepreneur_id);

DROP POLICY IF EXISTS "Entrepreneurs can delete their own ideas" ON public.ideas;
CREATE POLICY "Entrepreneurs can delete their own ideas"
    ON public.ideas FOR DELETE
    USING (auth.uid() = entrepreneur_id);

-- Notifications Policies
DROP POLICY IF EXISTS "Users can read their own notifications" ON public.notifications;
CREATE POLICY "Users can read their own notifications"
    ON public.notifications FOR SELECT
    USING (auth.uid() = recipient_id);

DROP POLICY IF EXISTS "Users can create notifications for others" ON public.notifications;
CREATE POLICY "Users can create notifications for others"
    ON public.notifications FOR INSERT
    WITH CHECK (auth.uid() = sender_id);

-- NDAs Policies
DROP POLICY IF EXISTS "Investors can see NDAs they have signed" ON public.ndas;
CREATE POLICY "Investors can see NDAs they have signed"
    ON public.ndas FOR SELECT
    USING (auth.uid() = investor_id);

DROP POLICY IF EXISTS "Entrepreneurs can see NDAs for their ideas" ON public.ndas;
CREATE POLICY "Entrepreneurs can see NDAs for their ideas"
    ON public.ndas FOR SELECT
    USING (EXISTS (
        SELECT 1
        FROM public.ideas
        WHERE ideas.id = ndas.idea_id AND ideas.entrepreneur_id = auth.uid()
    ));

DROP POLICY IF EXISTS "Investors can sign an NDA" ON public.ndas;
CREATE POLICY "Investors can sign an NDA"
    ON public.ndas FOR INSERT
    WITH CHECK (
        auth.uid() = investor_id AND
        (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'investor'
    );
