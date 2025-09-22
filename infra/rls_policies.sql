-- Row-Level Security (RLS) Policies for VentureLink

-- Enable RLS for all relevant tables
alter table profiles enable row level security;
alter table pitches enable row level security;
alter table pitch_files enable row level security;
alter table deal_rooms enable row level security;
alter table deal_room_participants enable row level security;
alter table messages enable row level security;
alter table ndas enable row level security;
alter table investor_subscriptions enable row level security;

-- Drop existing policies to prevent conflicts during re-running
drop policy if exists "Users can view all profiles" on profiles;
drop policy if exists "Users can update their own profile" on profiles;
drop policy if exists "Allow public read access to anonymized pitches" on pitches;
drop policy if exists "Entrepreneurs can create and manage their own pitches" on pitches;
drop policy if exists "Investors can view full pitch after access granted" on pitches;
drop policy if exists "Users can view their own pitch files" on pitch_files;
drop policy if exists "Deal room participants can access room details" on deal_rooms;
drop policy if exists "Users can see their own participation" on deal_room_participants;
drop policy if exists "Participants can manage the deal room" on deal_room_participants;
drop policy if exists "Participants can read messages in their deal room" on messages;
drop policy if exists "Users can write messages in rooms they are part of" on messages;
drop policy if exists "Investors can manage their own subscriptions" on investor_subscriptions;
drop policy if exists "Investors can see their own NDAs" on ndas;
drop policy if exists "Entrepreneurs can see NDAs for their pitches" on ndas;
drop policy if exists "Investors can create NDAs" on ndas;


-- 1. Profiles Policies
create policy "Users can view all profiles" on profiles
for select using (true);

create policy "Users can update their own profile" on profiles
for update using (auth.uid() = id);

-- 2. Pitches Policies
create policy "Allow public read access to anonymized pitches" on pitches
for select using (true);
-- Note: The actual anonymization happens at the query level in the app,
-- where only the `anonymized_summary` column is selected for non-privileged users.

create policy "Entrepreneurs can create and manage their own pitches" on pitches
for all using (auth.uid() = entrepreneur_id);

create policy "Investors can view full pitch after access granted" on pitches
for select using (
  contact_revealed = true OR
  exists (
    select 1
    from deal_room_participants drp
    join deal_rooms dr on dr.id = drp.deal_room_id
    where dr.pitch_id = pitches.id and drp.user_id = auth.uid()
  )
);

-- 3. Pitch Files Policies
create policy "Users can view their own pitch files" on pitch_files
for select using (
    exists (
        select 1 from pitches where pitches.id = pitch_files.pitch_id and pitches.entrepreneur_id = auth.uid()
    )
);

-- 4. Deal Room & Participants Policies
create policy "Deal room participants can access room details" on deal_rooms
for select using (
    exists (
        select 1 from deal_room_participants where deal_room_participants.deal_room_id = deal_rooms.id and deal_room_participants.user_id = auth.uid()
    )
);

create policy "Users can see their own participation" on deal_room_participants
for select using (user_id = auth.uid());

create policy "Participants can manage the deal room" on deal_room_participants
for all using (
    exists (
        select 1 from deal_rooms dr
        join pitches p on p.id = dr.pitch_id
        where dr.id = deal_room_participants.deal_room_id and p.entrepreneur_id = auth.uid()
    )
);

-- 5. Messages Policies
create policy "Participants can read messages in their deal room" on messages
for select using (
    exists (
        select 1 from deal_room_participants where deal_room_participants.deal_room_id = messages.deal_room_id and deal_room_participants.user_id = auth.uid()
    )
);

create policy "Users can write messages in rooms they are part of" on messages
for insert with check (
    exists (
        select 1 from deal_room_participants where deal_room_participants.deal_room_id = messages.deal_room_id and deal_room_participants.user_id = auth.uid()
    )
);

-- 6. Subscriptions Policies
create policy "Investors can manage their own subscriptions" on investor_subscriptions
for all using (auth.uid() = user_id);

-- 7. NDAs Policies
create policy "Investors can see their own NDAs" on ndas
for select using (auth.uid() = investor_id);

create policy "Entrepreneurs can see NDAs for their pitches" on ndas
for select using (
    exists (
        select 1 from pitches where pitches.id = ndas.pitch_id and pitches.entrepreneur_id = auth.uid()
    )
);

create policy "Investors can create NDAs" on ndas
for insert with check (
    (select role from profiles where id = auth.uid()) = 'investor'
);
