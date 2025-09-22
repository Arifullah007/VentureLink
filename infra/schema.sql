-- VentureLink DB Schema
-- This schema is designed for a platform connecting entrepreneurs and investors.

--
-- Profiles & Authentication
--
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  website_url TEXT,
  linkedin_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Function to create a public profile for each new user.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function upon new user creation in auth.
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


--
-- Pitches (The core "idea" submissions from entrepreneurs)
--
CREATE TABLE IF NOT EXISTS pitches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entrepreneur_id UUID NOT NULL REFERENCES profiles(id),
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
COMMENT ON COLUMN pitches.anonymized_summary IS 'A short, public-safe summary.';
COMMENT ON COLUMN pitches.full_text IS 'The full pitch details, only visible after NDA.';

--
-- Pitch Files (Documents uploaded by entrepreneurs)
--
CREATE TABLE IF NOT EXISTS pitch_files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pitch_id UUID NOT NULL REFERENCES pitches(id) ON DELETE CASCADE,
    file_path TEXT NOT NULL,
    file_name TEXT,
    watermarked_path TEXT,
    watermarked BOOLEAN DEFAULT FALSE,
    quarantined BOOLEAN DEFAULT FALSE,
    has_contact_info BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
COMMENT ON COLUMN pitch_files.watermarked_path IS 'Path to the processed, safe file.';
COMMENT ON COLUMN pitch_files.quarantined IS 'True if the file failed security checks.';


--
-- Investor Subscriptions & Payments
--
CREATE TABLE IF NOT EXISTS investor_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  status TEXT, -- e.g., 'active', 'canceled', 'past_due'
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);
COMMENT ON COLUMN investor_subscriptions.status IS 'Subscription status from Stripe.';

CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  stripe_charge_id TEXT UNIQUE,
  amount INT,
  currency TEXT,
  status TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);


--
-- Deal Rooms & Messaging
--
CREATE TABLE IF NOT EXISTS deal_rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pitch_id UUID NOT NULL REFERENCES pitches(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS deal_room_participants (
  deal_room_id UUID NOT NULL REFERENCES deal_rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (deal_room_id, user_id)
);

CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  deal_room_id UUID NOT NULL REFERENCES deal_rooms(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id),
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

--
-- Legal & Agreements
--
CREATE TABLE IF NOT EXISTS ndas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pitch_id UUID NOT NULL REFERENCES pitches(id),
  investor_id UUID NOT NULL REFERENCES profiles(id),
  signed_at TIMESTAMPTZ DEFAULT NOW(),
  signature_text TEXT,
  UNIQUE(pitch_id, investor_id)
);


--
-- System & Auditing
--
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_type TEXT NOT NULL, -- e.g., 'contact_info_in_summary', 'contact_info_in_file'
  description TEXT,
  related_user_id UUID REFERENCES profiles(id),
  related_pitch_id UUID REFERENCES pitches(id),
  related_message_id UUID REFERENCES messages(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type TEXT NOT NULL, -- e.g., 'nda_signed', 'contact_revealed'
  user_id UUID REFERENCES profiles(id),
  pitch_id UUID REFERENCES pitches(id),
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
