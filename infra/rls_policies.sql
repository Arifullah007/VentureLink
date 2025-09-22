-- Enable Row Level Security (RLS) for all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE pitches ENABLE ROW LEVEL SECURITY;
ALTER TABLE pitch_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE investor_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_room_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE ndas ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Clear existing policies to prevent duplicates during re-deployment
DROP POLICY IF EXISTS "Users can view their own profile." ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile." ON profiles;
DROP POLICY IF EXISTS "Entrepreneurs can create pitches." ON pitches;
DROP POLICY IF EXISTS "Entrepreneurs can view their own pitches." ON pitches;
DROP POLICY IF EXISTS "Investors can view anonymized pitches." ON pitches;
DROP POLICY IF EXISTS "Entrepreneurs can edit their own pitches." ON pitches;
DROP POLICY IF EXISTS "Entrepreneurs can manage their own pitch files." ON pitch_files;
DROP POLICY IF EXISTS "Investors can view their own subscriptions." ON investor_subscriptions;
DROP POLICY IF EXISTS "Users can view deal rooms they are part of." ON deal_rooms;
DROP POLICY IF EXISTS "Users can view participants of their own deal rooms." ON deal_room_participants;
DROP POLICY IF EXISTS "Participants can view messages in their own deal rooms." ON messages;
DROP POLICY IF EXISTS "Participants can send messages in their own deal rooms." ON messages;
DROP POLICY IF EXISTS "Users can manage their own NDAs." ON ndas;
DROP POLICY IF EXISTS "Investors can view their own transactions." ON transactions;

-- RLS Policies for `profiles` table
CREATE POLICY "Users can view their own profile." ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile." ON profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- RLS Policies for `pitches` table
CREATE POLICY "Entrepreneurs can create pitches." ON pitches
  FOR INSERT WITH CHECK (auth.uid() = entrepreneur_id AND (SELECT role FROM profiles WHERE id = auth.uid()) = 'entrepreneur');

CREATE POLICY "Entrepreneurs can view their own pitches." ON pitches
  FOR SELECT USING (auth.uid() = entrepreneur_id);

CREATE POLICY "Investors can view anonymized pitches." ON pitches
  FOR SELECT USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'investor');

CREATE POLICY "Entrepreneurs can edit their own pitches." ON pitches
  FOR UPDATE USING (auth.uid() = entrepreneur_id)
  WITH CHECK (auth.uid() = entrepreneur_id);

-- RLS Policies for `pitch_files` table
CREATE POLICY "Entrepreneurs can manage their own pitch files." ON pitch_files
  FOR ALL USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'entrepreneur' AND
    pitch_id IN (SELECT id FROM pitches WHERE entrepreneur_id = auth.uid())
  );

-- RLS Policies for `investor_subscriptions` table
CREATE POLICY "Investors can view their own subscriptions." ON investor_subscriptions
  FOR SELECT USING (auth.uid() = user_id AND (SELECT role FROM profiles WHERE id = auth.uid()) = 'investor');

-- RLS Policies for `deal_rooms` and `deal_room_participants`
CREATE POLICY "Users can view deal rooms they are part of." ON deal_rooms
  FOR SELECT USING (id IN (
    SELECT room_id FROM deal_room_participants WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can view participants of their own deal rooms." ON deal_room_participants
  FOR SELECT USING (room_id IN (
    SELECT room_id FROM deal_room_participants WHERE user_id = auth.uid()
  ));

-- RLS Policies for `messages` table
CREATE POLICY "Participants can view messages in their own deal rooms." ON messages
  FOR SELECT USING (room_id IN (
    SELECT room_id FROM deal_room_participants WHERE user_id = auth.uid()
  ));

CREATE POLICY "Participants can send messages in their own deal rooms." ON messages
  FOR INSERT WITH CHECK (room_id IN (
    SELECT room_id FROM deal_room_participants WHERE user_id = auth.uid()
  ));

-- RLS Policies for `ndas` table
CREATE POLICY "Users can manage their own NDAs." ON ndas
  FOR ALL USING (investor_id = auth.uid() OR entrepreneur_id = auth.uid());

-- RLS Policies for `transactions` table
CREATE POLICY "Investors can view their own transactions." ON transactions
  FOR SELECT USING (user_id = auth.uid() AND (SELECT role FROM profiles WHERE id = auth.uid()) = 'investor');

-- Note: Policies for `reports` and `events` are intentionally omitted.
-- These tables should likely only be accessible by a service role key from the backend.
