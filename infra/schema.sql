-- VentureLink DB Schema
-- This script is idempotent and can be run multiple times.

-- -----------------------------------------------------------------------------
-- 1. Create a function to execute arbitrary SQL.
--    This is used by the seed script to run seed.sql.
-- -----------------------------------------------------------------------------
create or replace function execute_sql(sql text)
returns void
language plpgsql
as $$
begin
  execute sql;
end;
$$;


-- -----------------------------------------------------------------------------
-- 2. Create the main tables for the application.
-- -----------------------------------------------------------------------------

-- Create profiles table to store public user data
create table if not exists profiles (
  id uuid references auth.users on delete cascade not null primary key,
  updated_at timestamp with time zone,
  full_name text,
  avatar_url text,
  website_url text,
  linkedin_url text,
  bio text,
  role text
);
-- Comment on table and columns
comment on table profiles is 'Public profile information for each user.';
comment on column profiles.id is 'References the internal Supabase auth user.';
comment on column profiles.role is 'Can be ''investor'' or ''entrepreneur''.';


-- Create ideas table for entrepreneurs to submit their ventures
create table if not exists ideas (
  id uuid primary key default gen_random_uuid(),
  entrepreneur_id uuid references public.profiles not null,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone,
  idea_title text,
  anonymized_summary text,
  full_text text,
  sector text,
  investment_required text,
  estimated_returns text,
  views integer default 0
);
-- Comment on table and columns
comment on table ideas is 'Stores the business ideas submitted by entrepreneurs.';
comment on column ideas.anonymized_summary is 'A short, public-facing summary without sensitive details.';
comment on column ideas.full_text is 'The full, detailed description of the idea, accessible after NDA.';


-- Create idea_files table to link ideas to their stored documents
create table if not exists idea_files (
    id uuid primary key default gen_random_uuid(),
    idea_id uuid references public.ideas on delete cascade not null,
    created_at timestamp with time zone default now() not null,
    file_path text not null,
    file_name text,
    processed boolean default false,
    watermarked_url text
);
-- Comment on table and columns
comment on table idea_files is 'Tracks files associated with an idea, e.g., prototypes, business plans.';
comment on column idea_files.processed is 'Indicates if the file has been processed (e.g., watermarked).';


-- -----------------------------------------------------------------------------
-- 3. Create a function to automatically create a public profile for new users.
-- -----------------------------------------------------------------------------
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

-- Drop the trigger if it already exists, then create it
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- -----------------------------------------------------------------------------
-- 4. Set up Storage buckets and policies.
-- -----------------------------------------------------------------------------

-- Create a bucket for 'avatars' with public read access
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- Create a bucket for 'prototypes' (private by default)
insert into storage.buckets (id, name, public)
values ('prototypes', 'prototypes', false)
on conflict (id) do nothing;


-- -----------------------------------------------------------------------------
-- 5. Set up Row-Level Security (RLS) policies for all tables.
--    This is crucial for securing user data.
-- -----------------------------------------------------------------------------

-- Enable RLS for all tables
alter table profiles enable row level security;
alter table ideas enable row level security;
alter table idea_files enable row level security;

-- Drop existing policies to ensure a clean slate
drop policy if exists "Public profiles are viewable by everyone." on profiles;
drop policy if exists "Users can insert their own profile." on profiles;
drop policy if exists "Users can update own profile." on profiles;
drop policy if exists "Ideas are public and viewable by everyone" on ideas;
drop policy if exists "Entrepreneurs can insert their own ideas." on ideas;
drop policy if exists "Entrepreneurs can update their own ideas." on ideas;
drop policy if exists "Idea files are visible to the owner and subscribed investors" on idea_files;
drop policy if exists "Owners can insert their own idea files" on idea_files;


-- Policies for 'profiles' table
create policy "Public profiles are viewable by everyone." on profiles
  for select using (true);

create policy "Users can insert their own profile." on profiles
  for insert with check (auth.uid() = id);

create policy "Users can update own profile." on profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);


-- Policies for 'ideas' table
create policy "Ideas are public and viewable by everyone" on ideas
  for select using (true);

create policy "Entrepreneurs can insert their own ideas." on ideas
  for insert with check (auth.uid() = entrepreneur_id);

create policy "Entrepreneurs can update their own ideas." on ideas
  for update using (auth.uid() = entrepreneur_id) with check (auth.uid() = entrepreneur_id);


-- Policies for 'idea_files' table
create policy "Idea files are visible to the owner and subscribed investors" on idea_files
  for select using (auth.uid() = (select entrepreneur_id from ideas where id = idea_id)); -- Placeholder, needs subscription logic

create policy "Owners can insert their own idea files" on idea_files
  for insert with check (auth.uid() = (select entrepreneur_id from ideas where id = idea_id));


-- -----------------------------------------------------------------------------
-- 6. Set up Storage security policies.
-- -----------------------------------------------------------------------------

-- Drop existing policies to ensure a clean slate
drop policy if exists "Avatar images are publicly accessible." on storage.objects;
drop policy if exists "Anyone can upload an avatar." on storage.objects;
drop policy if exists "Allow authenticated read access" on storage.objects;
drop policy if exists "Allow idea owner to upload to their folder" on storage.objects;
drop policy if exists "Allow idea owner to update their own files" on storage.objects;


-- Policies for 'avatars' bucket
create policy "Avatar images are publicly accessible."
  on storage.objects for select
  using ( bucket_id = 'avatars' );

create policy "Anyone can upload an avatar."
  on storage.objects for insert
  with check ( bucket_id = 'avatars' );


-- Policies for 'prototypes' bucket
create policy "Allow authenticated read access"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'prototypes');

-- Allow idea owner to upload to their folder
create policy "Allow idea owner to upload to their folder"
  on storage.objects for insert
  with check (
    bucket_id = 'prototypes' and
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow idea owner to update their own files
create policy "Allow idea owner to update their files"
  on storage.objects for update
  using (
    bucket_id = 'prototypes' and
    auth.uid()::text = (storage.foldername(name))[1]
  );
