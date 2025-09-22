-- VentureLink DB Schema

-- Profiles Table
-- Stores public user information linked to the auth.users table.
create table if not exists profiles (
  id uuid references auth.users not null primary key,
  updated_at timestamp with time zone,
  full_name text,
  avatar_url text,
  bio text,
  website_url text,
  linkedin_url text,
  role text -- 'entrepreneur' or 'investor'
);

-- Pitches Table
-- Stores the core information about an entrepreneur's idea.
create table if not exists pitches (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  entrepreneur_id uuid references profiles not null,
  pitch_title text not null,
  anonymized_summary text not null,
  full_text text, -- For internal processing, may be redacted.
  sector text,
  investment_required text,
  estimated_returns text,
  contact_revealed boolean default false
);

-- Ideas Table
-- This table is a simplified, public-facing view of pitches.
create table if not exists ideas (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  title text not null,
  summary text not null,
  field text not null,
  required_investment text not null,
  estimated_returns text not null,
  prototype_url text,
  entrepreneur_id uuid references profiles not null
);

-- Pitch Files Table
-- Tracks files associated with a pitch, like prototypes or documents.
create table if not exists pitch_files (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  pitch_id uuid references pitches not null,
  file_path text not null,
  file_name text,
  watermarked boolean default false,
  watermarked_path text,
  quarantined boolean default false,
  has_contact_info boolean default false
);

-- Investor Subscriptions Table
-- Manages investor subscription status with Stripe.
create table if not exists investor_subscriptions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles not null unique,
  stripe_customer_id text,
  stripe_subscription_id text,
  status text, -- e.g., 'active', 'canceled', 'past_due'
  current_period_end timestamp with time zone
);

-- Deal Rooms Table
-- A dedicated space for an investor and entrepreneur to communicate.
create table if not exists deal_rooms (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  pitch_id uuid references pitches not null
);

-- Deal Room Participants Table
-- Links users (investors/entrepreneurs) to deal rooms.
create table if not exists deal_room_participants (
  id uuid default gen_random_uuid() primary key,
  deal_room_id uuid references deal_rooms not null,
  user_id uuid references profiles not null,
  unique(deal_room_id, user_id)
);

-- Messages Table
-- Stores messages exchanged within a deal room.
create table if not exists messages (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  deal_room_id uuid references deal_rooms not null,
  sender_id uuid references profiles not null,
  body text not null
);

-- NDAs (Non-Disclosure Agreements) Table
-- Records when an investor agrees to an NDA for a specific pitch.
create table if not exists ndas (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  pitch_id uuid references pitches not null,
  investor_id uuid references profiles not null,
  signed_at timestamp with time zone,
  unique(pitch_id, investor_id)
);

-- Transactions Table
-- Logs payments and transactions, primarily from Stripe.
create table if not exists transactions (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references profiles not null,
  stripe_charge_id text unique,
  amount integer,
  currency text,
  status text
);

-- Reports Table
-- Logs violations or other reportable events on the platform.
create table if not exists reports (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  report_type text, -- e.g., 'pii_violation', 'spam'
  description text,
  related_user_id uuid references profiles,
  related_pitch_id uuid references pitches,
  resolved boolean default false
);

-- Events Table
-- A generic table for logging significant user actions or system events.
create table if not exists events (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  event_type text,
  user_id uuid references profiles,
  details jsonb
);

-- Function to create a profile for a new user
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'role');
  return new;
end;
$$;

-- Trigger to create a profile when a new user signs up
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
