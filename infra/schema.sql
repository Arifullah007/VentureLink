-- Extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES Table
-- Stores public-facing profile information for users.
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT CHECK (role IN ('entrepreneur', 'investor')),
    full_name TEXT,
    bio TEXT,
    website_url TEXT,
    linkedin_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
COMMENT ON TABLE profiles IS 'Public user profiles, linked to authentication.';

-- Function to create a profile for a new user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, role, full_name)
  VALUES (new.id, new.raw_user_meta_data->>'role', new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function upon new user creation in auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- 2. PITCHES Table
-- Stores all startup pitches from entrepreneurs.
CREATE TABLE IF NOT EXISTS pitches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entrepreneur_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    pitch_title TEXT NOT NULL,
    anonymized_summary TEXT NOT NULL,
    full_text TEXT,
    sector TEXT,
    investment_required TEXT,
    estimated_returns TEXT,
    contact_revealed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
COMMENT ON TABLE pitches IS 'Startup pitches submitted by entrepreneurs.';


-- 3. PITCH_FILES Table
-- Associates uploaded files with pitches.
CREATE TABLE IF NOT EXISTS pitch_files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pitch_id UUID NOT NULL REFERENCES pitches(id) ON DELETE CASCADE,
    file_path TEXT NOT NULL,
    file_name TEXT,
    watermarked BOOLEAN DEFAULT FALSE,
    watermarked_path TEXT,
    quarantined BOOLEAN DEFAULT FALSE,
    has_contact_info BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
COMMENT ON TABLE pitch_files IS 'Files associated with a pitch, including processing status.';

-- 4. INVESTOR_SUBSCRIPTIONS Table
-- Manages investor subscription status.
CREATE TABLE IF NOT EXISTS investor_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    status TEXT, -- e.g., 'active', 'canceled', 'past_due'
    current_period_end TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
COMMENT ON TABLE investor_subscriptions IS 'Manages investor subscription status via Stripe.';

-- 5. DEAL_ROOMS Table
-- Represents a private space for an investor and entrepreneur to communicate.
CREATE TABLE IF NOT EXISTS deal_rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pitch_id UUID NOT NULL REFERENCES pitches(id) ON DELETE CASCADE,
    created_at TIMESTPTZ DEFAULT NOW()
);
COMMENT ON TABLE deal_rooms IS 'Private communication channel for a pitch.';

-- 6. DEAL_ROOM_PARTICIPANTS Table
-- Links users to deal rooms.
CREATE TABLE IF NOT EXISTS deal_room_participants (
    deal_room_id UUID NOT NULL REFERENCES deal_rooms(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    PRIMARY KEY (deal_room_id, user_id)
);
COMMENT ON TABLE deal_room_participants IS 'Users who are part of a deal room.';

-- 7. MESSAGES Table
-- Stores chat messages within deal rooms.
CREATE TABLE IF NOT EXISTS messages (
    id BIGSERIAL PRIMARY KEY,
    deal_room_id UUID NOT NULL REFERENCES deal_rooms(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    body TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
COMMENT ON TABLE messages IS 'Messages within a deal room.';
-- Enable realtime on messages
ALTER TABLE messages REPLICA IDENTITY FULL;
-- create publication for messages
DROP PUBLICATION IF EXISTS supabase_realtime;
CREATE PUBLICATION supabase_realtime FOR TABLE messages;


-- 8. NDAS (Non-Disclosure Agreements) Table
-- Records when an investor signs an NDA for a pitch.
CREATE TABLE IF NOT EXISTS ndas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pitch_id UUID NOT NULL REFERENCES pitches(id) ON DELETE CASCADE,
    investor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    signed_at TIMESTAMPTZ DEFAULT NOW(),
    signature TEXT, -- Store digital signature or name
    UNIQUE (pitch_id, investor_id)
);
COMMENT ON TABLE ndas IS 'Record of signed NDAs between investors and entrepreneurs.';

-- 9. TRANSACTIONS Table
-- Logs all financial transactions.
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    stripe_charge_id TEXT UNIQUE,
    amount BIGINT,
    currency TEXT,
    status TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
COMMENT ON TABLE transactions IS 'Records all Stripe payments and transactions.';

-- 10. REPORTS Table
-- Logs violations or other reportable events.
CREATE TABLE IF NOT EXISTS reports (
    id BIGSERIAL PRIMARY KEY,
    report_type TEXT NOT NULL,
    description TEXT,
    related_pitch_id UUID REFERENCES pitches(id) ON DELETE SET NULL,
    related_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
COMMENT ON TABLE reports IS 'Logs system-generated reports, like content violations.';

-- 11. EVENTS Table
-- Generic table for logging significant user or system actions.
CREATE TABLE IF NOT EXISTS events (
    id BIGSERIAL PRIMARY KEY,
    event_type TEXT NOT NULL,
    user_id UUID REFERENCES profiles(id),
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
COMMENT ON TABLE events IS 'A log of significant events for analytics or auditing.';
