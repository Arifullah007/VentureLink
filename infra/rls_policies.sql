-- Enable RLS for all tables
alter table profiles enable row level security;
alter table pitches enable row level security;
alter table pitch_files enable row level security;
alter table investor_subscriptions enable row level security;
alter table deal_rooms enable row level security;
alter table deal_room_participants enable row level security;
alter table messages enable row level security;
alter table ndas enable row level security;
alter table transactions enable row level security;
alter table reports enable row level security;
alter table events enable row level security;

-- Drop existing policies to avoid conflicts
drop policy if exists "Users can view their own profile" on profiles;
drop policy if exists "Users can update their own profile" on profiles;
drop policy if exists "Pitches are visible to everyone" on pitches;
drop policy if exists "Entrepreneurs can create pitches" on pitches;
drop policy if exists "Entrepreneurs can update their own pitches" on pitches;
drop policy if exists "Messages are visible to participants of the deal room" on messages;
drop policy if exists "Users can insert messages in their deal rooms" on messages;

-- PROFILES
create policy "Users can view their own profile" on profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile" on profiles for update
  using (auth.uid() = id);

-- PITCHES
create policy "Pitches are visible to everyone" on pitches for select
  using (true);

create policy "Entrepreneurs can create pitches" on pitches for insert
  with check (auth.uid() = entrepreneur_id and (select 'entrepreneur'::text) = auth.jwt()->>'role');

create policy "Entrepreneurs can update their own pitches" on pitches for update
  using (auth.uid() = entrepreneur_id);

-- MESSAGES
create policy "Messages are visible to participants of the deal room" on messages for select
  using (
    deal_room_id in (
      select deal_room_id from deal_room_participants where user_id = auth.uid()
    )
  );

create policy "Users can insert messages in their deal rooms" on messages for insert
  with check (
    sender_id = auth.uid() and
    deal_room_id in (
      select deal_room_id from deal_room_participants where user_id = auth.uid()
    )
  );

-- You can add more policies for other tables as needed. For example:
-- - Investors can only view full pitch details if they have an active subscription and have signed an NDA.
-- - Only admins can view the `reports` table.
-- - etc.
