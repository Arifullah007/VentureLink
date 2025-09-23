
-- 1. Create Tables
-- Note: Supabase automatically created a 'profiles' table with the old Auth system.
-- We will drop it if it exists to ensure a clean slate, then create our own.
drop table if exists public.profiles;
create table public.profiles (
  id uuid references auth.users(id) on delete cascade not null primary key,
  updated_at timestamp with time zone,
  full_name text,
  avatar_url text,
  website_url text,
  linkedin_url text,
  bio text
);

create table public.ideas (
  id uuid default gen_random_uuid() not null primary key,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone,
  entrepreneur_id uuid references public.profiles(id) on delete cascade not null,
  idea_title text not null,
  anonymized_summary text not null,
  full_text text,
  sector text not null,
  investment_required text not null,
  estimated_returns text not null,
  prototype_url text
);


-- 2. Helper Functions & Triggers
-- This function will be triggered every time a new user signs up.
create or replace function public.handle_new_user()
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

-- This trigger calls the function when a user is created.
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- Utility function to get a user's role from their metadata.
create or replace function get_user_role()
returns text
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    return 'anon';
  else
    return (select raw_user_meta_data->>'role' from auth.users where id = auth.uid())::text;
  end if;
end;
$$;

-- Function to allow running raw SQL for seeding.
create or replace function execute_sql(sql text)
returns void as $$
begin
  execute sql;
end;
$$ language plpgsql;


-- 3. Row Level Security (RLS) Policies
-- Enable RLS for all tables.
alter table public.profiles enable row level security;
alter table public.ideas enable row level security;

-- Drop existing policies to ensure a clean state
drop policy if exists "Users can see all profiles" on public.profiles;
drop policy if exists "Users can insert their own profile." on public.profiles;
drop policy if exists "Users can update own profile." on public.profiles;
drop policy if exists "Investors can view all ideas" on public.ideas;
drop policy if exists "Entrepreneurs can view their own ideas" on public.ideas;
drop policy if exists "Entrepreneurs can insert their own ideas" on public.ideas;
drop policy if exists "Entrepreneurs can update their own ideas" on public.ideas;
drop policy if exists "Users can delete their own ideas" on public.ideas;


-- Create policies for the 'profiles' table
create policy "Users can see all profiles"
  on public.profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on public.profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on public.profiles for update
  using ( auth.uid() = id );


-- Create policies for the 'ideas' table
create policy "Investors can view all ideas"
  on public.ideas for select
  to authenticated
  using ( get_user_role() = 'investor' );

create policy "Entrepreneurs can view their own ideas"
  on public.ideas for select
  to authenticated
  using ( get_user_role() = 'entrepreneur' and auth.uid() = entrepreneur_id );

create policy "Entrepreneurs can insert their own ideas"
  on public.ideas for insert
  to authenticated
  with check ( get_user_role() = 'entrepreneur' and auth.uid() = entrepreneur_id );

create policy "Entrepreneurs can update their own ideas"
  on public.ideas for update
  to authenticated
  using ( get_user_role() = 'entrepreneur' and auth.uid() = entrepreneur_id );

create policy "Users can delete their own ideas"
  on public.ideas for delete
  to authenticated
  using ( auth.uid() = entrepreneur_id );


-- 4. Storage Bucket Policies
-- Create a bucket for idea prototypes
insert into storage.buckets (id, name, public)
values ('idea_prototypes', 'idea_prototypes', false)
on conflict (id) do nothing;

-- Drop existing policies to ensure a clean state
drop policy if exists "Allow entrepreneurs to upload to their own folder" on storage.objects;
drop policy if exists "Allow authenticated users to view files" on storage.objects;

-- Create policies for the 'idea_prototypes' bucket
create policy "Allow entrepreneurs to upload to their own folder"
  on storage.objects for insert to authenticated
  with check ( bucket_id = 'idea_prototypes' and (storage.foldername(name))[1] = auth.uid()::text );

create policy "Allow authenticated users to view files"
  on storage.objects for select to authenticated
  using ( bucket_id = 'idea_prototypes' );
