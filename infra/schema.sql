-- VentureLink Database Schema
-- This schema defines the core tables for the platform.

-- Profiles table
-- Stores public user profile information, linked to auth.users.
create table if not exists profiles (
  id uuid references auth.users not null primary key,
  updated_at timestamp with time zone,
  full_name text,
  avatar_url text,
  website_url text,
  linkedin_url text,
  bio text,
  role user_role not null -- 'entrepreneur' or 'investor'
);

-- Custom type for user roles
create type user_role as enum ('investor', 'entrepreneur');

-- Pitches table
-- Stores the core details of an entrepreneur's pitch.
create table if not exists pitches (
    id uuid default gen_random_uuid() primary key,
    created_at timestamp with time zone default now() not null,
    entrepreneur_id uuid references public.profiles not null,
    pitch_title text not null,
    anonymized_summary text,
    full_text text, -- Not exposed to investors directly
    sector text,
    investment_required text,
    estimated_returns text,
    contact_revealed boolean default false
);
comment on column pitches.anonymized_summary is 'A version of the pitch summary with contact info stripped, safe for public viewing.';
comment on column pitches.full_text is 'The full, original text of the pitch. Used for internal processing.';

-- Pitch Files table
-- Stores metadata about files uploaded for a pitch.
create table if not exists pitch_files (
    id uuid default gen_random_uuid() primary key,
    pitch_id uuid references public.pitches not null,
    created_at timestamp with time zone default now() not null,
    file_name text not null,
    file_path text not null,
    watermarked_path text,
    watermarked boolean default false,
    quarantined boolean default false,
    has_contact_info boolean default false
);
comment on table pitch_files is 'Links uploaded files to their respective pitches. A DB webhook on this table triggers processing.';

-- Investor Subscriptions table
-- Tracks the subscription status for investors.
create table if not exists investor_subscriptions (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references public.profiles not null,
    stripe_customer_id text unique,
    stripe_subscription_id text unique,
    status text, -- e.g., 'active', 'canceled', 'past_due'
    current_period_end timestamp with time zone
);

-- Deal Rooms table
-- Represents a private space for an investor and entrepreneur to connect.
create table if not exists deal_rooms (
    id uuid default gen_random_uuid() primary key,
    created_at timestamp with time zone default now() not null,
    pitch_id uuid references public.pitches not null,
    nda_signed boolean default false
);

-- Deal Room Participants table
-- Links users (investors/entrepreneurs) to deal rooms.
create table if not exists deal_room_participants (
    id uuid default gen_random_uuid() primary key,
    deal_room_id uuid references public.deal_rooms not null,
    user_id uuid references public.profiles not null,
    unique(deal_room_id, user_id)
);

-- Messages table
-- Stores chat messages within a deal room.
create table if not exists messages (
    id uuid default gen_random_uuid() primary key,
    created_at timestamp with time zone default now() not null,
    sender_id uuid references public.profiles not null,
    deal_room_id uuid references public.deal_rooms not null,
    body text
);

-- NDAs (Non-Disclosure Agreements) table
-- Records when an investor signs an NDA for a specific pitch.
create table if not exists ndas (
    id uuid default gen_random_uuid() primary key,
    pitch_id uuid references public.pitches not null,
    investor_id uuid references public.profiles not null,
    signed_at timestamp with time zone default now() not null,
    signature text, -- Could be the typed name of the investor
    unique(pitch_id, investor_id)
);

-- Transactions table
-- Logs all financial transactions, e.g., from Stripe.
create table if not exists transactions (
    id uuid default gen_random_uuid() primary key,
    created_at timestamp with time zone default now() not null,
    user_id uuid references public.profiles not null,
    stripe_charge_id text unique,
    amount integer,
    currency text,
    status text
);

-- Reports table
-- Logs violations, such as attempts to share contact info.
create table if not exists reports (
    id uuid default gen_random_uuid() primary key,
    created_at timestamp with time zone default now() not null,
    reporter_id uuid references public.profiles, -- The user who triggered the report
    report_type text not null, -- e.g., 'contact_info_blocked'
    description text,
    related_pitch_id uuid references public.pitches,
    related_message_id uuid references public.messages
);

-- Events table
-- Generic table for logging significant application events.
create table if not exists events (
    id uuid default gen_random_uuid() primary key,
    created_at timestamp with time zone default now() not null,
    user_id uuid references public.profiles,
    event_type text not null, -- e.g., 'user_login', 'pitch_created'
    details jsonb
);

-- Automatically create a profile for new users
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, role)
  values (new.id, new.raw_user_meta_data->>'role');
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Setup Storage buckets
insert into storage.buckets (id, name, public)
values 
    ('pitch-uploads', 'pitch-uploads', false),
    ('watermarked-files', 'watermarked-files', false),
    ('quarantined-files', 'quarantined-files', false)
on conflict (id) do nothing;
