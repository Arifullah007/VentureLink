
-- 1. Create Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT,
    full_name TEXT,
    bio TEXT,
    website_url TEXT,
    linkedin_url TEXT,
    avatar_url TEXT,
    updated_at TIMESTAMPTZ
);

-- 2. Create Ideas Table
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
    views INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Helper Functions & Triggers

-- Function to get the user's role from their metadata
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
DECLARE
    user_role TEXT;
BEGIN
    SELECT auth.jwt()->>'user_role' INTO user_role;
    RETURN user_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create a profile for a new user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, role, full_name)
    VALUES (new.id, new.raw_user_meta_data->>'role', new.raw_user_meta_data->>'full_name');
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call handle_new_user on new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function for seeding script to bypass RLS
CREATE OR REPLACE FUNCTION execute_sql(sql text)
RETURNS void AS $$
BEGIN
    EXECUTE sql;
END;
$$ LANGUAGE plpgsql;


-- 4. Row Level Security (RLS)

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ideas ENABLE ROW LEVEL SECURITY;

-- 5. Security Policies

-- Profiles Policies
DROP POLICY IF EXISTS "Users can view their own profile." ON public.profiles;
CREATE POLICY "Users can view their own profile."
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile." ON public.profiles;
CREATE POLICY "Users can update their own profile."
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Ideas Policies
DROP POLICY IF EXISTS "Entrepreneurs can create ideas." ON public.ideas;
CREATE POLICY "Entrepreneurs can create ideas."
    ON public.ideas FOR INSERT
    WITH CHECK (get_user_role() = 'entrepreneur' AND auth.uid() = entrepreneur_id);

DROP POLICY IF EXISTS "Entrepreneurs can view their own ideas." ON public.ideas;
CREATE POLICY "Entrepreneurs can view their own ideas."
    ON public.ideas FOR SELECT
    USING (get_user_role() = 'entrepreneur' AND auth.uid() = entrepreneur_id);

DROP POLICY IF EXISTS "Investors can view all ideas." ON public.ideas;
CREATE POLICY "Investors can view all ideas."
    ON public.ideas FOR SELECT
    USING (get_user_role() = 'investor');

DROP POLICY IF EXISTS "Entrepreneurs can update their own ideas." ON public.ideas;
CREATE POLICY "Entrepreneurs can update their own ideas."
    ON public.ideas FOR UPDATE
    USING (get_user_role() = 'entrepreneur' AND auth.uid() = entrepreneur_id)
    WITH CHECK (get_user_role() = 'entrepreneur' AND auth.uid() = entrepreneur_id);

DROP POLICY IF EXISTS "Entrepreneurs can delete their own ideas." ON public.ideas;
CREATE POLICY "Entrepreneurs can delete their own ideas."
    ON public.ideas FOR DELETE
    USING (get_user_role() = 'entrepreneur' AND auth.uid() = entrepreneur_id);

-- 6. Storage Buckets & Policies
-- These policies ensure users can only access files in their own folder.

-- Create a bucket for idea prototypes with public read access turned OFF
INSERT INTO storage.buckets (id, name, public)
VALUES ('idea_prototypes', 'idea_prototypes', false)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload to the idea_prototypes bucket
DROP POLICY IF EXISTS "Authenticated users can upload files." ON storage.objects;
CREATE POLICY "Authenticated users can upload files."
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'idea_prototypes');

-- Allow users to view files only within their own folder in the bucket
DROP POLICY IF EXISTS "Users can read their own files." ON storage.objects;
CREATE POLICY "Users can read their own files."
    ON storage.objects FOR SELECT
    TO authenticated
    USING (bucket_id = 'idea_prototypes' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Allow investors to view any file in the bucket (as they need to see entrepreneur prototypes)
DROP POLICY IF EXISTS "Investors can read all files." ON storage.objects;
CREATE POLICY "Investors can read all files."
    ON storage.objects FOR SELECT
    TO authenticated
    USING (bucket_id = 'idea_prototypes' AND get_user_role() = 'investor');
