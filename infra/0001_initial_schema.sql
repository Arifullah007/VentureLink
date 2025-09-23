-- Initial Schema for VentureLink

-- 1. Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. User Profiles
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY,
    full_name TEXT,
    avatar_url TEXT,
    role TEXT CHECK (role IN ('investor', 'entrepreneur')),
    bio TEXT,
    website_url TEXT,
    linkedin_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Ideas (Pitches)
CREATE TABLE IF NOT EXISTS public.ideas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entrepreneur_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    idea_title TEXT NOT NULL,
    anonymized_summary TEXT, -- The short, public summary
    full_text TEXT, -- The full, detailed description (for subscribed investors)
    sector TEXT,
    investment_required TEXT,
    estimated_returns TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'funded', 'archived')),
    views INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Idea Files
CREATE TABLE IF NOT EXISTS public.idea_files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    idea_id UUID REFERENCES public.ideas(id) ON DELETE CASCADE,
    file_path TEXT NOT NULL,
    file_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    watermarked BOOLEAN DEFAULT false,
    watermarked_path TEXT,
    quarantined BOOLEAN DEFAULT false,
    has_contact_info BOOLEAN DEFAULT false
);

-- 5. Investor Subscriptions
CREATE TABLE IF NOT EXISTS public.investor_subscriptions (
    user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    status TEXT, -- e.g., 'active', 'canceled', 'past_due'
    current_period_end TIMESTAMP WITH TIME ZONE
);

-- 6. Transactions
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    stripe_charge_id TEXT UNIQUE,
    amount BIGINT,
    currency TEXT,
    status TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);


-- 7. Deal Rooms
CREATE TABLE IF NOT EXISTS public.deal_rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    idea_id UUID REFERENCES public.ideas(id),
    investor_id UUID REFERENCES public.profiles(id),
    entrepreneur_id UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(idea_id, investor_id)
);

-- 8. Messages
CREATE TABLE IF NOT EXISTS public.messages (
    id BIGSERIAL PRIMARY KEY,
    deal_room_id UUID REFERENCES public.deal_rooms(id),
    sender_id UUID REFERENCES public.profiles(id),
    content TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. Reports (for moderation)
CREATE TABLE IF NOT EXISTS public.reports (
    id BIGSERIAL PRIMARY KEY,
    report_type TEXT,
    description TEXT,
    related_idea_id UUID,
    related_user_id UUID,
    status TEXT DEFAULT 'pending', -- pending, resolved, dismissed
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. Non-Disclosure Agreements (NDAs)
CREATE TABLE IF NOT EXISTS public.ndas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  idea_id UUID NOT NULL REFERENCES public.ideas(id) ON DELETE CASCADE,
  investor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  signed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  signature TEXT NOT NULL, -- Store the typed name as signature
  UNIQUE(idea_id, investor_id)
);
