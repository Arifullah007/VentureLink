--
-- Toggles Row Level Security (RLS)
--
-- Note: RLS is a security-critical feature. Ensure you have policies
-- in place before enabling it on tables with sensitive data.
--

-- Drop existing policies to avoid conflicts
drop policy if exists "Users can view their own profile." on profiles;
drop policy if exists "Users can update their own profile." on profiles;
drop policy if exists "Investors can view all ideas." on ideas;
drop policy if exists "Entrepreneurs can view their own ideas." on ideas;
drop policy if exists "Entrepreneurs can create ideas." on ideas;
drop policy if exists "Entrepreneurs can update their own ideas." on ideas;
drop policy if exists "Entrepreneurs can delete their own ideas." on ideas;
drop policy if exists "Users can view idea prototypes." on storage.objects;
drop policy if exists "Users can upload idea prototypes." on storage.objects;

-- Drop existing functions to ensure a clean slate
drop function if exists get_user_role(uuid);
drop function if exists execute_sql(text);

--
-- Function: get_user_role(user_id)
--
-- Description: Retrieves the 'role' of a user from their metadata.
-- This is crucial for RLS policies to check if a user is an 'entrepreneur' or 'investor'.
--
create or replace function get_user_role(user_id uuid)
returns text
language sql
security definer
set search_path = public
as $$
  select raw_user_meta_data->>'role' from auth.users where id = user_id
$$;


--
-- Table: profiles
--
-- Description: Stores public user profile information.
--
-- RLS: Enabled
--
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  updated_at timestamp with time zone,
  full_name text,
  avatar_url text,
  website_url text,
  linkedin_url text,
  bio text
);

alter table profiles enable row level security;

-- Policies for profiles
create policy "Users can view their own profile." on profiles
  for select using (auth.uid() = id);

create policy "Users can update their own profile." on profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

--
-- Function: handle_new_user()
--
-- Description: Triggered when a new user signs up in Auth.
-- It creates a corresponding entry in the public.profiles table.
--
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$;

-- Drop existing trigger to avoid conflicts before creating a new one
drop trigger if exists on_auth_user_created on auth.users;

-- Trigger for handle_new_user
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


--
-- Table: ideas
--
-- Description: Stores the business ideas submitted by entrepreneurs.
--
-- RLS: Enabled
--
create table if not exists ideas (
  id uuid primary key default gen_random_uuid(),
  entrepreneur_id uuid references auth.users(id) on delete cascade,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone,
  idea_title text not null,
  anonymized_summary text not null,
  full_text text,
  sector text,
  investment_required text,
  estimated_returns text,
  prototype_url text,
  views integer default 0
);

alter table ideas enable row level security;

-- Policies for ideas
create policy "Investors can view all ideas." on ideas
  for select using (get_user_role(auth.uid()) = 'investor');

create policy "Entrepreneurs can view their own ideas." on ideas
  for select using (auth.uid() = entrepreneur_id);

create policy "Entrepreneurs can create ideas." on ideas
  for insert with check (auth.uid() = entrepreneur_id and get_user_role(auth.uid()) = 'entrepreneur');

create policy "Entrepreneurs can update their own ideas." on ideas
  for update using (auth.uid() = entrepreneur_id) with check (auth.uid() = entrepreneur_id);

create policy "Entrepreneurs can delete their own ideas." on ideas
  for delete using (auth.uid() = entrepreneur_id);

--
-- Storage: idea_prototypes
--
-- Description: Configures policies for the 'idea_prototypes' storage bucket.
--
-- RLS: Enabled on storage.objects
--
insert into storage.buckets (id, name, public)
values ('idea_prototypes', 'idea_prototypes', false)
on conflict (id) do nothing;

create policy "Users can view idea prototypes." on storage.objects
  for select to authenticated using (bucket_id = 'idea_prototypes');

create policy "Users can upload idea prototypes." on storage.objects
  for insert to authenticated with check (bucket_id = 'idea_prototypes');

--
-- Function: execute_sql(sql)
--
-- Description: Allows running arbitrary SQL from a script (e.g., seeding).
-- This should only be callable by the service_role key.
--
create or replace function execute_sql(sql text)
returns void
language plpgsql
as $$
begin
  execute sql;
end;
$$;
