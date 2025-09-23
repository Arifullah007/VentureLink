-- This script is idempotent, so it can be run multiple times without causing errors.

-- 1. Create Profiles Table
-- This table stores public user data.
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
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
-- RLS for profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable by everyone." ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile." ON profiles FOR UPDATE USING (auth.uid() = id);

-- 2. Create Ideas Table
-- Stores the business ideas submitted by entrepreneurs.
CREATE TABLE IF NOT EXISTS ideas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entrepreneur_id UUID REFERENCES auth.users(id),
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
-- RLS for ideas
ALTER TABLE ideas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Ideas are viewable by authenticated users." ON ideas FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Entrepreneurs can insert their own ideas." ON ideas FOR INSERT WITH CHECK (auth.uid() = entrepreneur_id AND (SELECT role FROM profiles WHERE id = auth.uid()) = 'entrepreneur');
CREATE POLICY "Entrepreneurs can update their own ideas." ON ideas FOR UPDATE USING (auth.uid() = entrepreneur_id);

-- 3. Create Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    recipient_id UUID REFERENCES auth.users(id),
    sender_id UUID REFERENCES auth.users(id),
    idea_id UUID REFERENCES ideas(id),
    type TEXT NOT NULL, -- e.g., 'nda_request', 'nda_signed', 'contact_unlock'
    message TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
-- RLS for notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own notifications." ON notifications FOR SELECT USING (auth.uid() = recipient_id);
CREATE POLICY "Users can create notifications." ON notifications FOR INSERT WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "Users can mark their notifications as read." ON notifications FOR UPDATE USING (auth.uid() = recipient_id);


-- 4. Create NDAs Table
-- Tracks Non-Disclosure Agreements signed by investors for specific ideas.
CREATE TABLE IF NOT EXISTS ndas (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    investor_id UUID REFERENCES auth.users(id),
    idea_id UUID REFERENCES ideas(id),
    signed_at TIMESTAMPTZ DEFAULT NOW(),
    signature TEXT NOT NULL,
    UNIQUE(investor_id, idea_id)
);
-- RLS for ndas
ALTER TABLE ndas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Investors can view NDAs they have signed." ON ndas FOR SELECT USING (auth.uid() = investor_id);
CREATE POLICY "Investors can sign NDAs." ON ndas FOR INSERT WITH CHECK (auth.uid() = investor_id AND (SELECT role FROM profiles WHERE id = auth.uid()) = 'investor');


-- 5. Create a function to automatically create a profile for a new user.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'role');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Create a trigger to call the function when a new user signs up.
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- 7. Create a function to automatically delete all user-related data.
CREATE OR REPLACE FUNCTION public.delete_user_data()
RETURNS TRIGGER AS $$
BEGIN
  -- Delete from profiles
  DELETE FROM public.profiles WHERE id = old.id;
  -- Delete from ideas where the user is the entrepreneur
  DELETE FROM public.ideas WHERE entrepreneur_id = old.id;
  -- Delete notifications sent to or from the user
  DELETE FROM public.notifications WHERE recipient_id = old.id OR sender_id = old.id;
  -- Delete NDAs signed by the user
  DELETE FROM public.ndas WHERE investor_id = old.id;
  RETURN old;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Create a trigger to call the cleanup function before a user is deleted.
DROP TRIGGER IF EXISTS on_auth_user_deleted ON auth.users;
CREATE TRIGGER on_auth_user_deleted
  BEFORE DELETE ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.delete_user_data();

