-- infra/schema.sql

-- Drop existing tables if they exist
DROP TABLE IF EXISTS "events", "reports", "transactions", "ndas", "messages", "deal_room_participants", "deal_rooms", "investor_subscriptions", "pitch_files", "pitches", "profiles" CASCADE;

-- User Profiles
-- Stores public-facing profile information for both entrepreneurs and investors.
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('entrepreneur', 'investor')),
    full_name TEXT,
    bio TEXT,
    avatar_url TEXT,
    website_url TEXT,
    linkedin_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
COMMENT ON TABLE profiles IS 'Stores public profile information linked to authenticated users.';

-- Pitches
-- Core table for storing entrepreneur ideas.
CREATE TABLE pitches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entrepreneur_id UUID NOT NULL REFERENCES profiles(id),
    pitch_title TEXT NOT NULL,
    anonymized_summary TEXT NOT NULL,
    full_text TEXT, -- For internal analysis and future use
    sector TEXT,
    investment_required TEXT,
    estimated_returns TEXT,
    views INT DEFAULT 0,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'funded', 'archived')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
COMMENT ON TABLE pitches IS 'Stores the core details of startup pitches from entrepreneurs.';

-- Pitch Files
-- Tracks files associated with a pitch, like prototypes or business plans.
CREATE TABLE pitch_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pitch_id UUID NOT NULL REFERENCES pitches(id) ON DELETE CASCADE,
    file_path TEXT NOT NULL,
    file_name TEXT NOT NULL,
    watermarked BOOLEAN DEFAULT FALSE,
    watermarked_path TEXT,
    quarantined BOOLEAN DEFAULT FALSE,
    has_contact_info BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
COMMENT ON TABLE pitch_files IS 'Tracks files associated with pitches, including their processing status.';


-- Investor Subscriptions
-- Manages subscription status for investors, linking to Stripe.
CREATE TABLE investor_subscriptions (
    user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT UNIQUE,
    status TEXT, -- e.g., 'active', 'canceled'
    current_period_end TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
COMMENT ON TABLE investor_subscriptions IS 'Manages investor subscription status and Stripe details.';

-- Deal Rooms
-- Represents a private space for an investor and entrepreneur to communicate.
CREATE TABLE deal_rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pitch_id UUID NOT NULL REFERENCES pitches(id),
    created_by_investor_id UUID NOT NULL REFERENCES profiles(id),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'closed')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
COMMENT ON TABLE deal_rooms IS 'Private communication channels between an investor and an entrepreneur.';

-- Deal Room Participants
-- Junction table to link users (investors, entrepreneurs) to deal rooms.
CREATE TABLE deal_room_participants (
    deal_room_id UUID NOT NULL REFERENCES deal_rooms(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    PRIMARY KEY (deal_room_id, user_id)
);
COMMENT ON TABLE deal_room_participants IS 'Links users to their respective deal rooms.';

-- Messages
-- Stores chat messages within a deal room.
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    deal_room_id UUID NOT NULL REFERENCES deal_rooms(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES profiles(id),
    body TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
COMMENT ON TABLE messages IS 'Stores individual chat messages for deal rooms.';

-- NDAs (Non-Disclosure Agreements)
-- Records when an investor signs an NDA for a specific pitch.
CREATE TABLE ndas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pitch_id UUID NOT NULL REFERENCES pitches(id),
    investor_id UUID NOT NULL REFERENCES profiles(id),
    signed_at TIMESTAMPTZ DEFAULT NOW(),
    signature TEXT NOT NULL, -- Store the typed name as signature
    UNIQUE (pitch_id, investor_id)
);
COMMENT ON TABLE ndas IS 'Records signed Non-Disclosure Agreements between investors and pitches.';

-- Transactions
-- Logs all payment transactions, primarily from Stripe.
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id),
    stripe_charge_id TEXT UNIQUE,
    amount BIGINT,
    currency TEXT,
    status TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
COMMENT ON TABLE transactions IS 'Logs financial transactions, typically from Stripe.';

-- Reports
-- For internal monitoring, logs violations like sharing contact info.
CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_type TEXT NOT NULL,
    description TEXT,
    related_user_id UUID REFERENCES profiles(id) NULL,
    related_pitch_id UUID REFERENCES pitches(id) NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
COMMENT ON TABLE reports IS 'Internal log for policy violations or system events.';


-- Events
-- Generic table for tracking significant user actions for analytics.
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id),
    event_type TEXT NOT NULL,
    properties JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
COMMENT ON TABLE events IS 'Tracks user actions and system events for analytics.';

-- Function to create a profile for a new user.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_role TEXT;
BEGIN
  -- Extract the role from the user's metadata
  user_role := NEW.raw_user_meta_data->>'role';

  -- If the role is either 'entrepreneur' or 'investor', insert into profiles
  IF user_role IN ('entrepreneur', 'investor') THEN
    INSERT INTO public.profiles (id, role, full_name, email)
    VALUES (
      NEW.id,
      user_role,
      NEW.raw_user_meta_data->>'full_name',
      NEW.email
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Trigger to call the function when a new user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

    