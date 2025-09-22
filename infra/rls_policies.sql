-- Enable Row Level Security (RLS) on all sensitive tables
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

-- Clear existing policies to prevent conflicts
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Entrepreneurs can manage their own pitches" ON pitches;
DROP POLICY IF EXISTS "Users can view anonymized pitches" ON pitches;
DROP POLICY IF EXISTS "Authenticated users can manage their own files" ON pitch_files;
DROP POLICY IF EXISTS "Investors can manage their own subscriptions" ON investor_subscriptions;
DROP policy IF EXISTS "Participants can view their own deal rooms" ON deal_rooms;
DROP policy IF EXISTS "Participants can manage their own participation" ON deal_room_participants;
DROP POLICY IF EXISTS "Participants can view messages in their deal rooms" ON messages;
DROP POLICY IF EXISTS "Users can only insert messages in their deal rooms" ON messages;
DROP POLICY IF EXISTS "Users can view and manage their own NDAs" ON ndas;
DROP POLICY IF EXISTS "Users can view their own transactions" ON transactions;
DROP POLICY IF EXISTS "Admins can manage all reports (placeholder)" ON reports;
DROP POLICY IF EXISTS "Admins can manage all events (placeholder)" ON events;

-- 1. PROFILES Table Policies
CREATE POLICY "Users can view their own profile"
ON profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id);

-- 2. PITCHES Table Policies
CREATE POLICY "Entrepreneurs can manage their own pitches"
ON pitches FOR ALL
USING (auth.uid() = entrepreneur_id);

CREATE POLICY "Users can view anonymized pitches"
ON pitches FOR SELECT
USING (true); -- This is intentionally public, but the view/RPC function will select only anonymized columns.

-- 3. PITCH_FILES Table Policies
CREATE POLICY "Authenticated users can manage their own files"
ON pitch_files FOR ALL
USING (EXISTS (SELECT 1 FROM pitches WHERE pitches.id = pitch_files.pitch_id AND pitches.entrepreneur_id = auth.uid()));

-- 4. INVESTOR_SUBSCRIPTIONS Table Policies
CREATE POLICY "Investors can manage their own subscriptions"
ON investor_subscriptions FOR ALL
USING (auth.uid() = user_id);

-- 5. DEAL_ROOMS & PARTICIPANTS Table Policies
CREATE POLICY "Participants can view their own deal rooms"
ON deal_rooms FOR SELECT
USING (id IN (SELECT deal_room_id FROM deal_room_participants WHERE user_id = auth.uid()));

CREATE POLICY "Participants can manage their own participation"
ON deal_room_participants FOR ALL
USING (user_id = auth.uid());

-- 6. MESSAGES Table Policies
CREATE POLICY "Participants can view messages in their deal rooms"
ON messages FOR SELECT
USING (deal_room_id IN (SELECT deal_room_id FROM deal_room_participants WHERE user_id = auth.uid()));

CREATE POLICY "Users can only insert messages in their deal rooms"
ON messages FOR INSERT
WITH CHECK (deal_room_id IN (SELECT deal_room_id FROM deal_room_participants WHERE user_id = auth.uid()));

-- 7. NDAS Table Policies
CREATE POLICY "Users can view and manage their own NDAs"
ON ndas FOR ALL
USING (investor_id = auth.uid() OR EXISTS (SELECT 1 FROM pitches WHERE pitches.id = ndas.pitch_id AND pitches.entrepreneur_id = auth.uid()));

-- 8. TRANSACTIONS Table Policies
CREATE POLICY "Users can view their own transactions"
ON transactions FOR SELECT
USING (user_id = auth.uid());

-- 9 & 10. REPORTS and EVENTS (Admin-only, placeholder for now)
-- For now, no one can access these directly. In a real app, you'd have an 'admin' role.
CREATE POLICY "Admins can manage all reports (placeholder)"
ON reports FOR ALL
USING (false);

CREATE POLICY "Admins can manage all events (placeholder)"
ON events FOR ALL
USING (false);
