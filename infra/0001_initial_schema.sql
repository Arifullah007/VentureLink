
-- =================================================================
--  1. Users & Profiles
-- =================================================================
-- Create a table for public profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  updated_at timestamp with time zone,
  full_name text,
  avatar_url text,
  bio text,
  website_url text,
  linkedin_url text,
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT name_length CHECK (char_length(full_name) >= 2)
);

-- =================================================================
--  2. Ideas (Pitches)
-- =================================================================
CREATE TABLE IF NOT EXISTS public.ideas (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    entrepreneur_id uuid NOT NULL,
    idea_title text NOT NULL,
    anonymized_summary text NOT NULL,
    full_text text,
    sector text,
    investment_required text,
    estimated_returns text,
    views integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone,
    CONSTRAINT ideas_pkey PRIMARY KEY (id),
    CONSTRAINT ideas_entrepreneur_id_fkey FOREIGN KEY (entrepreneur_id) REFERENCES public.profiles(id) ON DELETE CASCADE
);

-- =================================================================
--  3. File Uploads & Processing
-- =================================================================
CREATE TABLE IF NOT EXISTS public.idea_files (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    idea_id uuid NOT NULL,
    file_path text NOT NULL,
    file_name text,
    watermarked boolean DEFAULT false,
    watermarked_path text,
    quarantined boolean DEFAULT false,
    has_contact_info boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT idea_files_pkey PRIMARY KEY (id),
    CONSTRAINT idea_files_idea_id_fkey FOREIGN KEY (idea_id) REFERENCES public.ideas(id) ON DELETE CASCADE
);

-- =================================================================
--  4. Investor Subscriptions & Transactions
-- =================================================================
CREATE TABLE IF NOT EXISTS public.investor_subscriptions (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    user_id uuid NOT NULL UNIQUE,
    stripe_customer_id text,
    stripe_subscription_id text,
    status text,
    current_period_end timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone,
    CONSTRAINT investor_subscriptions_pkey PRIMARY KEY (id),
    CONSTRAINT investor_subscriptions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS public.transactions (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    user_id uuid NOT NULL,
    stripe_charge_id text,
    amount integer,
    currency text,
    status text,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT transactions_pkey PRIMARY KEY (id),
    CONSTRAINT transactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE
);

-- =================================================================
--  5. Deal Rooms & Messaging
-- =================================================================
CREATE TABLE IF NOT EXISTS public.deal_rooms (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    idea_id uuid NOT NULL,
    investor_id uuid NOT NULL,
    nda_signed boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT deal_rooms_pkey PRIMARY KEY (id),
    CONSTRAINT deal_rooms_idea_id_fkey FOREIGN KEY (idea_id) REFERENCES public.ideas(id) ON DELETE CASCADE,
    CONSTRAINT deal_rooms_investor_id_fkey FOREIGN KEY (investor_id) REFERENCES public.profiles(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS public.messages (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    deal_room_id uuid NOT NULL,
    sender_id uuid NOT NULL,
    content text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT messages_pkey PRIMARY KEY (id),
    CONSTRAINT messages_deal_room_id_fkey FOREIGN KEY (deal_room_id) REFERENCES public.deal_rooms(id) ON DELETE CASCADE,
    CONSTRAINT messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.profiles(id) ON DELETE CASCADE
);

-- =================================================================
--  6. Reports & Violations
-- =================================_================================
CREATE TABLE IF NOT EXISTS public.reports (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    report_type text,
    description text,
    related_idea_id uuid,
    related_user_id uuid,
    created_at timestamp with time zone DEFAULT now(),
    resolved_at timestamp with time zone,
    CONSTRAINT reports_pkey PRIMARY KEY (id)
);
