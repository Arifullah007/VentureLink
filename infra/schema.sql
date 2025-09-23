--
-- Create a table for public profiles
--
create table if not exists profiles (
  id uuid references auth.users not null primary key,
  updated_at timestamp with time zone,
  full_name text,
  avatar_url text,
  website_url text,
  linkedin_url text,
  bio text,
  -- The role of the user, can be 'investor' or 'entrepreneur'
  "role" text not null
);

--
-- Create a table for startup ideas
--
create table if not exists ideas (
  id uuid default gen_random_uuid() primary key,
  entrepreneur_id uuid references auth.users not null,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone,
  idea_title text not null,
  anonymized_summary text not null,
  full_text text,
  sector text not null,
  investment_required text not null,
  estimated_returns text not null,
  prototype_url text,
  views integer default 0,
  -- Add other relevant fields for an idea
  constraint title_length check (char_length(idea_title) >= 5)
);

--
-- Create a table for investment interests
--
create table if not exists investment_interests (
  id uuid default gen_random_uuid() primary key,
  investor_id uuid references auth.users not null,
  idea_id uuid references ideas not null,
  created_at timestamp with time zone default now() not null,
  status text default 'pending' -- e.g., pending, accepted, rejected
);


--
-- Set up Row Level Security (RLS)
--
-- This is the most important part of the schema. It ensures that users can only
-- access their own data.
--
-- For more information, see:
-- https://supabase.com/docs/guides/auth/row-level-security

-- 1. Enable RLS for all relevant tables
alter table profiles enable row level security;
alter table ideas enable row level security;
alter table investment_interests enable row level security;

-- 2. Create policies for the 'profiles' table
drop policy if exists "Public profiles are viewable by everyone." on profiles;
create policy "Public profiles are viewable by everyone." on profiles
  for select using (true);

drop policy if exists "Users can insert their own profile." on profiles;
create policy "Users can insert their own profile." on profiles
  for insert with check (auth.uid() = id);

drop policy if exists "Users can update their own profile." on profiles;
create policy "Users can update their own profile." on profiles
  for update using (auth.uid() = id);

-- 3. Create policies for the 'ideas' table
drop policy if exists "Ideas are viewable by investors." on ideas;
create policy "Ideas are viewable by investors." on ideas
  for select to authenticated
  using (
    (get_user_role(auth.uid()) = 'investor')
  );

drop policy if exists "Entrepreneurs can view their own ideas." on ideas;
create policy "Entrepreneurs can view their own ideas." on ideas
  for select to authenticated
  using (
    (get_user_role(auth.uid()) = 'entrepreneur' and auth.uid() = entrepreneur_id)
  );

drop policy if exists "Entrepreneurs can insert their own ideas." on ideas;
create policy "Entrepreneurs can insert their own ideas." on ideas
  for insert to authenticated
  with check (
    (get_user_role(auth.uid()) = 'entrepreneur' and auth.uid() = entrepreneur_id)
  );

drop policy if exists "Entrepreneurs can update their own ideas." on ideas;
create policy "Entrepreneurs can update their own ideas." on ideas
  for update to authenticated
  using (
    (get_user_role(auth.uid()) = 'entrepreneur' and auth.uid() = entrepreneur_id)
  );
  
drop policy if exists "Ideas can be deleted by their owners." on ideas;
create policy "Ideas can be deleted by their owners." on ideas
  for delete to authenticated
  using (
    (get_user_role(auth.uid()) = 'entrepreneur' and auth.uid() = entrepreneur_id)
  );


-- 4. Create policies for 'investment_interests'
drop policy if exists "Investors can manage their interests." on investment_interests;
create policy "Investors can manage their interests." on investment_interests
  for all to authenticated
  using ( (get_user_role(auth.uid()) = 'investor' and auth.uid() = investor_id) );
  
drop policy if exists "Entrepreneurs can view interests in their ideas." on investment_interests;
create policy "Entrepreneurs can view interests in their ideas." on investment_interests
  for select to authenticated
  using (
    (get_user_role(auth.uid()) = 'entrepreneur' and exists (
      select 1 from ideas where ideas.id = investment_interests.idea_id and ideas.entrepreneur_id = auth.uid()
    ))
  );


--
-- Set up Storage
--
insert into storage.buckets (id, name, public)
values ('idea_prototypes', 'idea_prototypes', true)
on conflict (id) do nothing;

-- Create policies for storage
drop policy if exists "Prototype images are publicly accessible." on storage.objects;
create policy "Prototype images are publicly accessible." on storage.objects
  for select using (bucket_id = 'idea_prototypes');

drop policy if exists "Anyone can upload a prototype." on storage.objects;
create policy "Anyone can upload a prototype." on storage.objects
  for insert with check (bucket_id = 'idea_prototypes');
  
drop policy if exists "Owner can update their prototype." on storage.objects;
create policy "Owner can update their prototype." on storage.objects
    for update using (
        auth.uid() = owner and bucket_id = 'idea_prototypes'
    );

drop policy if exists "Owner can delete their prototype." on storage.objects;
create policy "Owner can delete their prototype." on storage.objects
    for delete using (
        auth.uid() = owner and bucket_id = 'idea_prototypes'
    );


--
-- Helper Functions
--

-- Function to get user role from metadata
create or replace function get_user_role(user_id uuid)
returns text as $$
declare
  user_role text;
begin
  select raw_user_meta_data->>'role'
  into user_role
  from auth.users
  where id = user_id;
  return user_role;
end;
$$ language plpgsql stable;

--
-- This trigger automatically creates a profile entry when a new user signs up.
--
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, role)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'role');
  return new;
end;
$$ language plpgsql security definer;

-- Drop trigger if it exists, then create it
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


--
-- RPC for seeding script
--
-- This function allows the seeding script to bypass RLS to insert demo data.
-- It should only be callable by the service_role key.
--
create or replace function execute_sql(sql text)
returns void as $$
begin
  execute sql;
end;
$$ language plpgsql;
